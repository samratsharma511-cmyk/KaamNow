const prisma = require('../config/prisma');

async function createReview(req, res, next) {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and star rating (1 to 5) are required.',
      });
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars.',
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: { review: true },
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
        message: 'Only the customer associated with this booking can submit a review.',
      });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'You can only review a booking after the job is marked COMPLETED.',
      });
    }

    if (!booking.workerProfileId) {
      return res.status(400).json({
        success: false,
        message: 'No worker was assigned to this booking.',
      });
    }

    if (booking.review) {
      return res.status(409).json({
        success: false,
        message: 'A review has already been submitted for this booking.',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          bookingId: booking.id,
          customerId: req.user.id,
          workerProfileId: booking.workerProfileId,
          rating: numericRating,
          comment: comment ? String(comment).trim() : null,
        },
        include: {
          customer: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      });

      const aggregate = await tx.review.aggregate({
        where: { workerProfileId: booking.workerProfileId },
        _avg: { rating: true },
        _count: { id: true },
      });

      const newAvg = Number((aggregate._avg.rating || numericRating).toFixed(2));
      const newCount = aggregate._count.id || 1;

      await tx.workerProfile.update({
        where: { id: booking.workerProfileId },
        data: {
          averageRating: newAvg,
          totalReviews: newCount,
        },
      });

      return { review, averageRating: newAvg, totalReviews: newCount };
    });

    const io = req.app.get('io');
    if (io) {
      const workerProfile = await prisma.workerProfile.findUnique({
        where: { id: booking.workerProfileId },
      });
      if (workerProfile) {
        io.to(`user:${workerProfile.userId}`).emit('review:created', result);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      review: result.review,
      workerStats: {
        averageRating: result.averageRating,
        totalReviews: result.totalReviews,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getWorkerReviews(req, res, next) {
  try {
    const workerId = Number(req.params.id);
    if (Number.isNaN(workerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID.',
      });
    }

    const reviews = await prisma.review.findMany({
      where: { workerProfileId: workerId },
      include: {
        customer: {
          select: { id: true, name: true, avatarUrl: true },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            service: { select: { name: true } },
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReview,
  getWorkerReviews,
};
