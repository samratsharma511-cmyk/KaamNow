const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  updateBookingStatus,
  cancelBooking,
  retryBookingSearch,
} = require('../controllers/bookingController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, authorizeRoles('CUSTOMER'), createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);
router.post('/:id/accept', authenticate, authorizeRoles('WORKER'), acceptBooking);
router.post('/:id/reject', authenticate, authorizeRoles('WORKER'), rejectBooking);
router.patch('/:id/status', authenticate, authorizeRoles('WORKER'), updateBookingStatus);
router.patch('/:id/cancel', authenticate, cancelBooking);
router.post('/:id/retry', authenticate, authorizeRoles('CUSTOMER'), retryBookingSearch);

module.exports = router;
