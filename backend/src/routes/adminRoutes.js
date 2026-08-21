const express = require('express');
const {
  listUsers,
  createAuthority,
  updateUser,
  listPosts,
  getStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', listUsers);
router.post('/authorities', createAuthority);
router.patch('/users/:id', updateUser);
router.get('/posts', listPosts);
router.get('/stats', getStats);

module.exports = router;
