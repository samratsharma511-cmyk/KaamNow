const prisma = require('../config/prisma');
const { generateBookingNumber, calculateDistanceKm } = require('../utils/geo');
const {
  dispatchNextWorker,
  clearAssignmentTimer,
} = require('../services/assignmentService');

const VALID_WORKER_TRANSITIONS = {
  ACCEPTED: ['ON_THE_WAY'],
  ON_THE_WAY: ['ARRIVED'],
  ARRIVED: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
};

const bookingInclude = {
  service: {
    include: {
      category: true,
    },
  },
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      address: true,
    },
  },
  workerProfile: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          avatarUrl: true,
        },
      },
      location: true,
    },
  },
  currentCandidateWorker: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      location: true,
    },
  },
  statusHistory: {
    orderBy: { createdAt: 'asc' },
  },
  review: true,
};

async function createBooking(req, res, next) {
  try {
    const {
      serviceId,
      problemDescription,
      serviceAddress,
      latitude,
      longitude,
      scheduledAt,
      isImmediate = true,
      problemPhotoUrl,
      preferredWorkerId,
    } = req.body;

    if (!serviceId || !problemDescription || !serviceAddress) {
      return res.status(400).json({
        success: false,
        message: 'Service, problem description, and service address are required.',
      });
    }

    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId) },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Selected service does not exist.',
      });
    }

    const lat = latitude !== undefined && latitude !== '' ? Number(latitude) : 12.9716;
    const lng = longitude !== undefined && longitude !== '' ? Number(longitude) : 77.6412;

    const bookingDate = scheduledAt ? new Date(scheduledAt) : new Date();
    const bookingNumber = generateBookingNumber();

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: req.user.id,
        serviceId: service.id,
        status: 'SEARCHING',
        problemDescription: String(problemDescription).trim(),
        problemPhotoUrl: problemPhotoUrl || null,
        serviceAddress: String(serviceAddress).trim(),
        latitude: lat,
        longitude: lng,
        scheduledAt: bookingDate,
        isImmediate: Boolean(isImmediate),
        visitCharge: service.basePrice,
        statusHistory: {
          create: {
            status: 'SEARCHING',
            changedByUserId: req.user.id,
            note: isImmediate
              ? 'Immediate service requested. Searching for nearest online KaamSaathi...'
              : `Scheduled service requested for ${bookingDate.toLocaleString()}. Searching for eligible KaamSaathi...`,
          },
        },
      },
    });

    const io = req.app.get('io');
    const dispatchedBooking = await dispatchNextWorker(
      booking.id,
      io,
      preferredWorkerId ? Number(preferredWorkerId) : null
    );

    return res.status(201).json({
      success: true,
      message: 'Service booking created and worker dispatch initiated.',
      booking: dispatchedBooking || booking,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyBookings(req, res, next) {
  try {
    const { status } = req.query;

    if (req.user.role === 'CUSTOMER') {
      const where = { customerId: req.user.id };
      if (status && status !== 'ALL') {
        where.status = status;
      }

      const bookings = await prisma.booking.findMany({
        where,
        include: bookingInclude,
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        bookings,
      });
    }

    // Worker role
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!workerProfile) {
      return res.json({
        success: true,
        bookings: [],
        pendingRequests: [],
      });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { workerProfileId: workerProfile.id },
          {
            currentCandidateWorkerId: workerProfile.id,
            status: 'REQUESTED',
          },
        ],
      },
      include: bookingInclude,
      orderBy: { updatedAt: 'desc' },
    });

    const enriched = bookings.map((b) => {
      const workerLat = workerProfile.location?.latitude ?? req.user.latitude;
      const workerLng = workerProfile.location?.longitude ?? req.user.longitude;
      const distanceKm = calculateDistanceKm(
        b.latitude,
        b.longitude,
        workerLat,
        workerLng
      );
      return {
        ...b,
        distanceKm,
      };
    });

    return res.json({
      success: true,
      bookings: enriched,
    });
  } catch (error) {
    next(error);
  }
}

async function getBookingById(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    if (Number.isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID.',
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: bookingInclude,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const workerProfileId = req.user.workerProfile?.id;
    const isOwnerCustomer = booking.customerId === req.user.id;
    const isAssignedWorker =
      workerProfileId && booking.workerProfileId === workerProfileId;
    const isCandidateWorker =
      workerProfileId && booking.currentCandidateWorkerId === workerProfileId;

    if (!isOwnerCustomer && !isAssignedWorker && !isCandidateWorker) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking.',
      });
    }

    return res.json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
}

async function acceptBooking(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const workerProfile = req.user.workerProfile;

    if (!workerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Worker profile is required to accept jobs.',
      });
    }

    clearAssignmentTimer(bookingId);

    // Atomic transaction preventing two workers from accepting the same booking
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const current = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!current) {
        const err = new Error('Booking not found.');
        err.statusCode = 404;
        throw err;
      }

      if (current.workerProfileId !== null) {
        const err = new Error('This booking has already been assigned to another worker.');
        err.statusCode = 409;
        throw err;
      }

      if (!['REQUESTED', 'SEARCHING'].includes(current.status)) {
        const err = new Error(`Cannot accept a booking with status ${current.status}.`);
        err.statusCode = 400;
        throw err;
      }

      if (
        current.currentCandidateWorkerId &&
        current.currentCandidateWorkerId !== workerProfile.id
      ) {
        const err = new Error('This job request is currently assigned to another candidate worker.');
        err.statusCode = 403;
        throw err;
      }

      const atomicUpdate = await tx.booking.updateMany({
        where: {
          id: bookingId,
          workerProfileId: null,
          status: { in: ['REQUESTED', 'SEARCHING'] },
        },
        data: {
          workerProfileId: workerProfile.id,
          currentCandidateWorkerId: null,
          requestExpiresAt: null,
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          visitCharge: workerProfile.visitCharge || current.visitCharge,
        },
      });

      if (atomicUpdate.count === 0) {
        const err = new Error('Booking was already accepted or modified concurrently.');
        err.statusCode = 409;
        throw err;
      }

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          status: 'ACCEPTED',
          changedByUserId: req.user.id,
          note: `${req.user.name} (${workerProfile.profession}) accepted the service request.`,
        },
      });

      return tx.booking.findUnique({
        where: { id: bookingId },
        include: bookingInclude,
      });
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${bookingId}`).emit('booking:updated', updatedBooking);
      io.to(`user:${updatedBooking.customerId}`).emit('booking:accepted', updatedBooking);
      io.to(`user:${updatedBooking.customerId}`).emit('booking:updated', updatedBooking);
    }

    return res.json({
      success: true,
      message: 'Job accepted! You can now navigate to the customer location.',
      booking: updatedBooking,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

async function rejectBooking(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const workerProfile = req.user.workerProfile;

    if (!workerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Worker profile required.',
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (
      booking.status !== 'REQUESTED' ||
      booking.currentCandidateWorkerId !== workerProfile.id
    ) {
      return res.status(400).json({
        success: false,
        message: 'This job request is no longer active for your account.',
      });
    }

    clearAssignmentTimer(bookingId);

    const updatedRejected = Array.from(
      new Set([...(booking.rejectedWorkerIds || []), workerProfile.id])
    );

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        rejectedWorkerIds: updatedRejected,
        currentCandidateWorkerId: null,
        requestExpiresAt: null,
        status: 'SEARCHING',
        statusHistory: {
          create: {
            status: 'SEARCHING',
            changedByUserId: req.user.id,
            note: `${req.user.name} declined the request. Reassigning to next nearest KaamSaathi...`,
          },
        },
      },
    });

    const io = req.app.get('io');
    const nextBookingState = await dispatchNextWorker(bookingId, io);

    return res.json({
      success: true,
      message: 'Job request declined. Searching next available worker.',
      booking: nextBookingState,
    });
  } catch (error) {
    next(error);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const { status: nextStatus, note, finalAmount } = req.body;
    const workerProfile = req.user.workerProfile;

    if (!workerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only assigned workers can update job progress status.',
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.workerProfileId !== workerProfile.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not the assigned worker for this booking.',
      });
    }

    const allowedNext = VALID_WORKER_TRANSITIONS[booking.status] || [];
    if (!allowedNext.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${booking.status} to ${nextStatus}. Allowed next status: ${
          allowedNext.join(', ') || 'None'
        }.`,
      });
    }

    const now = new Date();
    const timestampData = {};
    let defaultNote = note;

    if (nextStatus === 'ON_THE_WAY') {
      timestampData.onTheWayAt = now;
      defaultNote = defaultNote || `${req.user.name} is on the way to your location.`;
    } else if (nextStatus === 'ARRIVED') {
      timestampData.arrivedAt = now;
      defaultNote = defaultNote || `${req.user.name} has arrived at the service location.`;
    } else if (nextStatus === 'IN_PROGRESS') {
      timestampData.startedAt = now;
      defaultNote = defaultNote || 'Service work has started.';
    } else if (nextStatus === 'COMPLETED') {
      timestampData.completedAt = now;
      timestampData.finalAmount =
        finalAmount !== undefined && finalAmount !== ''
          ? Number(finalAmount)
          : booking.visitCharge;
      defaultNote = defaultNote || 'Service completed successfully.';
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: nextStatus,
          ...timestampData,
          statusHistory: {
            create: {
              status: nextStatus,
              changedByUserId: req.user.id,
              note: defaultNote,
            },
          },
        },
        include: bookingInclude,
      });

      if (nextStatus === 'COMPLETED') {
        const earned = updated.finalAmount || updated.visitCharge || 0;
        await tx.workerProfile.update({
          where: { id: workerProfile.id },
          data: {
            completedJobsCount: { increment: 1 },
            totalEarnings: { increment: earned },
          },
        });
      }

      return updated;
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${bookingId}`).emit('booking:updated', updatedBooking);
      io.to(`user:${updatedBooking.customerId}`).emit('booking:updated', updatedBooking);

      if (nextStatus === 'COMPLETED') {
        io.to(`booking:${bookingId}`).emit('booking:tracking:stopped', {
          bookingId,
          reason: 'COMPLETED',
        });
      }
    }

    return res.json({
      success: true,
      message: `Booking status updated to ${nextStatus}.`,
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const workerProfileId = req.user.workerProfile?.id;
    const isCustomer = booking.customerId === req.user.id;
    const isAssignedWorker =
      workerProfileId && booking.workerProfileId === workerProfileId;

    if (!isCustomer && !isAssignedWorker) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking.',
      });
    }

    const cancellableStatuses = [
      'SEARCHING',
      'REQUESTED',
      'ACCEPTED',
      'ON_THE_WAY',
      'NO_WORKER_FOUND',
    ];

    if (!cancellableStatuses.includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Bookings in ${booking.status} state cannot be cancelled.`,
      });
    }

    clearAssignmentTimer(bookingId);

    const cancelNote =
      reason ||
      (isCustomer
        ? 'Booking cancelled by customer.'
        : 'Booking cancelled by assigned worker.');

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: cancelNote,
        currentCandidateWorkerId: null,
        requestExpiresAt: null,
        statusHistory: {
          create: {
            status: 'CANCELLED',
            changedByUserId: req.user.id,
            note: cancelNote,
          },
        },
      },
      include: bookingInclude,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${bookingId}`).emit('booking:updated', updatedBooking);
      io.to(`booking:${bookingId}`).emit('booking:tracking:stopped', {
        bookingId,
        reason: 'CANCELLED',
      });
      io.to(`user:${booking.customerId}`).emit('booking:updated', updatedBooking);
      if (booking.workerProfileId && updatedBooking.workerProfile?.user?.id) {
        io.to(`user:${updatedBooking.workerProfile.user.id}`).emit(
          'booking:updated',
          updatedBooking
        );
      }
    }

    return res.json({
      success: true,
      message: 'Booking has been cancelled.',
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
}

async function retryBookingSearch(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the customer who created this booking can retry assignment.',
      });
    }

    if (!['NO_WORKER_FOUND', 'SEARCHING'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking is already active or completed.',
      });
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'SEARCHING',
        rejectedWorkerIds: [],
        currentCandidateWorkerId: null,
        statusHistory: {
          create: {
            status: 'SEARCHING',
            changedByUserId: req.user.id,
            note: 'Customer re-initiated search for nearby online KaamSaathis.',
          },
        },
      },
    });

    const io = req.app.get('io');
    const dispatched = await dispatchNextWorker(bookingId, io);

    return res.json({
      success: true,
      message: 'Searching again for nearby online workers.',
      booking: dispatched,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  updateBookingStatus,
  cancelBooking,
  retryBookingSearch,
};
