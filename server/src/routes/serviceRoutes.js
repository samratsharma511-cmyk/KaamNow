const express = require('express');
const {
  getCategories,
  getServices,
} = require('../controllers/serviceController');

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getServices);

module.exports = router;
