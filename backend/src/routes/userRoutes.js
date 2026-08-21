const express = require('express');
const { getProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/:id', protect, getProfile);

module.exports = router;
