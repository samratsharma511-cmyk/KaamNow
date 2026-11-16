const prisma = require('../config/prisma');
const { calculateDistanceKm } = require('../utils/geo');

const activeTimers = new Map();
const REQUEST_TIMEOUT_MS = (Number(process.env.REQUEST_TIMEOUT_SECONDS) || 45) * 1000;

function clearAssignmentTimer(bookingId) {
  const existing = activeTimers.get(bookingId);
  if (existing) {
    clearTimeout(existing);
    activeTimers.delete(bookingId);
  }
}

/**
 * Finds online, eligible workers who provide the booking's service (or profession),
 * are within their configured serviceRadiusKm, and have not already rejected/timed-out.
 * Sorted by nearest distance first, then highest rating.
 */
async function findEligibleWorkersForBooking(booking, preferredWorkerId = null) {
  const serviceWithCategory = await prisma.service.findUnique({
    where: { id: booking.serviceId },
    include: { category: true },
  });

  if (!serviceWithCategory) return [];

  const rejectedSet = new Set(booking.rejectedWorkerIds || []);

  // Find online workers who either explicitly linked this service OR match the category profession
  const onlineWorkers = await prisma.workerProfile.findMany({
    where: {
      isOnline: true,
      id: {
        notIn: Array.from(rejectedSet),
      },
      OR: [
        {
          workerServices: {
            some: {
              serviceId: booking.serviceId,
            },
          },
        },
        {
          profession: {
            equals: serviceWithCategory.category.name,
            mode: 'insensitive',
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          avatarUrl: true,
          latitude: true,
          longitude: true,
          address: true,
        },
      },
      location: true,
      workerServices: {
        where: { serviceId: booking.serviceId },
      },
    },
  });

  const eligibleWithDistance = [];

  for (const worker of onlineWorkers) {
    const workerLat = worker.location?.latitude ?? worker.user?.latitude;
    const workerLng = worker.location?.longitude ?? worker.user?.longitude;

    let distanceKm = calculateDistanceKm(
      booking.latitude,
      booking.longitude,
      workerLat,
      workerLng
    );

    // If coordinates are missing, default to 3.5 km within city
    if (distanceKm === null) {
      distanceKm = 3.5;
    }

    const maxRadius = worker.serviceRadiusKm || 20;
    if (distanceKm <= maxRadius) {
      eligibleWithDistance.push({
        worker,
        distanceKm,
      });
    }
  }

  eligibleWithDistance.sort((a, b) => {
    if (preferredWorkerId) {
      if (a.worker.id === Number(preferredWorkerId)) return -1;
      if (b.worker.id === Number(preferredWorkerId)) return 1;
    }
    if (a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }
    return (b.worker.averageRating || 0) - (a.worker.averageRating || 0);
  });

  return eligibleWithDistance;
}

/**
 * Dispatches a booking request to the next nearest eligible worker.
 * Sets a timeout so if the worker does not respond within REQUEST_TIMEOUT_MS,
 * the system automatically moves to the next candidate.
 */
async function dispatchNextWorker(bookingId, io, preferredWorkerId = null) {
  clearAssignmentTimer(bookingId);

  const booking = await prisma.booking.findUnique({
    where: { id: Number(bookingId) },
    include: {
      service: { include: { category: true } },
      customer: {
        select: { id: true, name: true, phone: true, avatarUrl: true },
      },
    },
  });

  if (!booking) return null;

  // Do not dispatch if already assigned, cancelled, or completed
  if (
    booking.workerProfileId ||
    !['SEARCHING', 'REQUESTED'].includes(booking.status)
  ) {
    return booking;
  }

  const candidates = await findEligibleWorkersForBooking(booking, preferredWorkerId);

  if (candidates.length === 0) {
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'NO_WORKER_FOUND',
        currentCandidateWorkerId: null,
        requestExpiresAt: null,
        statusHistory: {
          create: {
            status: 'NO_WORKER_FOUND',
            note: 'No available nearby KaamSaathi accepted the request within the service radius.',
          },
        },
      },
      include: {
        service: { include: { category: true } },
        customer: { select: { id: true, name: true, phone: true, avatarUrl: true } },
        workerProfile: {
          include: {
            user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
            location: true,
          },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (io) {
      io.to(`booking:${booking.id}`).emit('booking:updated', updatedBooking);
      io.to(`user:${booking.customerId}`).emit('booking:updated', updatedBooking);
    }

    return updatedBooking;
  }

  const chosen = candidates[0];
  const expiresAt = new Date(Date.now() + REQUEST_TIMEOUT_MS);

  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'REQUESTED',
      currentCandidateWorkerId: chosen.worker.id,
      requestExpiresAt: expiresAt,
      statusHistory: {
        create: {
          status: 'REQUESTED',
          note: `Dispatched job request to ${chosen.worker.user.name} (${chosen.distanceKm} km away).`,
        },
      },
    },
    include: {
      service: { include: { category: true } },
      customer: { select: { id: true, name: true, phone: true, avatarUrl: true } },
      currentCandidateWorker: {
        include: {
          user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
          location: true,
        },
      },
      workerProfile: {
        include: {
          user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
          location: true,
        },
      },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (io) {
    // Notify the target worker immediately
    io.to(`user:${chosen.worker.user.id}`).emit('job:request', {
      booking: updatedBooking,
      distanceKm: chosen.distanceKm,
      expiresAt,
    });

    // Notify customer & booking room of candidate progress
    io.to(`booking:${booking.id}`).emit('booking:updated', updatedBooking);
    io.to(`user:${booking.customerId}`).emit('booking:updated', updatedBooking);
  }

  // Schedule automatic fallback if worker does not respond in time
  const timer = setTimeout(async () => {
    try {
      const fresh = await prisma.booking.findUnique({
        where: { id: booking.id },
      });

      if (
        fresh &&
        fresh.status === 'REQUESTED' &&
        fresh.currentCandidateWorkerId === chosen.worker.id &&
        !fresh.workerProfileId
      ) {
        const updatedRejected = Array.from(
          new Set([...(fresh.rejectedWorkerIds || []), chosen.worker.id])
        );

        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            rejectedWorkerIds: updatedRejected,
            currentCandidateWorkerId: null,
            requestExpiresAt: null,
            status: 'SEARCHING',
            statusHistory: {
              create: {
                status: 'SEARCHING',
                note: `Request to ${chosen.worker.user.name} timed out. Searching next nearest KaamSaathi...`,
              },
            },
          },
        });

        if (io) {
          io.to(`user:${chosen.worker.user.id}`).emit('job:request:expired', {
            bookingId: booking.id,
          });
        }

        await dispatchNextWorker(booking.id, io);
      }
    } catch (err) {
      console.error('Error in worker assignment timeout handler:', err);
    }
  }, REQUEST_TIMEOUT_MS);

  activeTimers.set(booking.id, timer);
  return updatedBooking;
}

module.exports = {
  findEligibleWorkersForBooking,
  dispatchNextWorker,
  clearAssignmentTimer,
};
