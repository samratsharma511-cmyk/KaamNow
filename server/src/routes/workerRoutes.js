const express = require('express');
const {
  getWorkers,
  getWorkerById,
  upsertWorkerProfile,
  toggleAvailability,
  updateWorkerLocation,
  getWorkerDashboardStats,
} = require('../controllers/workerController');
const { getWorkerReviews } = require('../controllers/reviewController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', getWorkers);
router.get('/me/stats', authenticate, authorizeRoles('WORKER'), getWorkerDashboardStats);
router.post('/profile', authenticate, authorizeRoles('WORKER'), upsertWorkerProfile);
router.put('/profile', authenticate, authorizeRoles('WORKER'), upsertWorkerProfile);
router.patch('/availability', authenticate, authorizeRoles('WORKER'), toggleAvailability);
router.patch('/location', authenticate, authorizeRoles('WORKER'), updateWorkerLocation);
router.get('/:id/reviews', getWorkerReviews);
router.get('/:id', getWorkerById);

module.exports = router;
