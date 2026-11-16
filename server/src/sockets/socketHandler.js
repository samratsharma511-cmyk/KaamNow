const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET } = require('../middleware/auth');

function initializeSockets(io) {
  // Authenticate every Socket.IO connection using JWT
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          workerProfile: true,
        },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    // Join personal private notification channel
    socket.join(`user:${user.id}`);

    // Join a private booking room after strict ownership verification
    socket.on('booking:join', async ({ bookingId }, callback) => {
      try {
        const id = Number(bookingId);
        if (Number.isNaN(id)) {
          if (callback) callback({ success: false, message: 'Invalid booking ID' });
          return;
        }

        const booking = await prisma.booking.findUnique({
          where: { id },
          include: {
            workerProfile: {
              include: { location: true },
            },
          },
        });

        if (!booking) {
          if (callback) callback({ success: false, message: 'Booking not found' });
          return;
        }

        const workerProfileId = user.workerProfile?.id;
        const isCustomer = booking.customerId === user.id;
        const isAssignedWorker =
          workerProfileId && booking.workerProfileId === workerProfileId;
        const isCandidateWorker =
          workerProfileId && booking.currentCandidateWorkerId === workerProfileId;

        if (!isCustomer && !isAssignedWorker && !isCandidateWorker) {
          if (callback) {
            callback({
              success: false,
              message: 'Unauthorized to join this private booking room',
            });
          }
          return;
        }

        const roomName = `booking:${booking.id}`;
        socket.join(roomName);

        // Immediately send latest worker location if available
        if (booking.workerProfile?.location) {
          socket.emit('booking:location', {
            bookingId: booking.id,
            workerProfileId: booking.workerProfile.id,
            latitude: booking.workerProfile.location.latitude,
            longitude: booking.workerProfile.location.longitude,
            heading: booking.workerProfile.location.heading,
            speed: booking.workerProfile.location.speed,
            updatedAt: booking.workerProfile.location.updatedAt,
          });
        }

        if (callback) {
          callback({
            success: true,
            room: roomName,
            status: booking.status,
          });
        }
      } catch (err) {
        if (callback) callback({ success: false, message: 'Failed to join room' });
      }
    });

    socket.on('booking:leave', ({ bookingId }) => {
      if (bookingId) {
        socket.leave(`booking:${Number(bookingId)}`);
      }
    });

    // Authorized live location update from assigned worker
    socket.on('worker:location:update', async (payload, callback) => {
      try {
        if (user.role !== 'WORKER' || !user.workerProfile) {
          if (callback) {
            callback({
              success: false,
              message: 'Only authenticated workers can publish live locations',
            });
          }
          return;
        }

        const { bookingId, latitude, longitude, heading, speed } = payload || {};
        const lat = Number(latitude);
        const lng = Number(longitude);

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          if (callback) {
            callback({ success: false, message: 'Valid GPS coordinates required' });
          }
          return;
        }

        const workerProfileId = user.workerProfile.id;

        // Store only the latest worker location in the database
        const savedLocation = await prisma.workerLocation.upsert({
          where: { workerProfileId },
          update: {
            latitude: lat,
            longitude: lng,
            heading: heading !== undefined && heading !== null ? Number(heading) : null,
            speed: speed !== undefined && speed !== null ? Number(speed) : null,
          },
          create: {
            workerProfileId,
            latitude: lat,
            longitude: lng,
            heading: heading !== undefined && heading !== null ? Number(heading) : null,
            speed: speed !== undefined && speed !== null ? Number(speed) : null,
          },
        });

        // If tied to a specific booking, verify ownership and active status before emitting to private booking room
        if (bookingId) {
          const booking = await prisma.booking.findUnique({
            where: { id: Number(bookingId) },
          });

          if (!booking || booking.workerProfileId !== workerProfileId) {
            if (callback) {
              callback({
                success: false,
                message: 'Not authorized to broadcast location for this booking',
              });
            }
            return;
          }

          const trackableStatuses = ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'];
          if (!trackableStatuses.includes(booking.status)) {
            if (callback) {
              callback({
                success: false,
                message: `Location sharing is stopped because booking is ${booking.status}`,
              });
            }
            return;
          }

          const locationEvent = {
            bookingId: booking.id,
            workerProfileId,
            latitude: savedLocation.latitude,
            longitude: savedLocation.longitude,
            heading: savedLocation.heading,
            speed: savedLocation.speed,
            updatedAt: savedLocation.updatedAt,
          };

          // Emit strictly to the private booking room and the authorized customer
          io.to(`booking:${booking.id}`).emit('booking:location', locationEvent);
          io.to(`user:${booking.customerId}`).emit('booking:location', locationEvent);
        }

        if (callback) {
          callback({
            success: true,
            location: savedLocation,
          });
        }
      } catch (err) {
        if (callback) {
          callback({ success: false, message: 'Failed to update location' });
        }
      }
    });
  });
}

module.exports = {
  initializeSockets,
};
