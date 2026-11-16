const express = require('express');
const {
  createReview,
  getWorkerReviews,
} = require('../controllers/reviewController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, authorizeRoles('CUSTOMER'), createReview);
router.get('/worker/:id', getWorkerReviews);

module.exports = router;
