const express = require('express');
const {
  createPost,
  getFeed,
  getPost,
  upvotePost,
  getDashboard,
  claimPost,
  resolvePost,
  getMyPosts,
} = require('../controllers/postController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.use(protect);

router.get('/feed', getFeed);
router.get('/dashboard', authorize('authority', 'admin'), getDashboard);
router.get('/mine', getMyPosts);
router.post('/', authorize('civilian'), upload.single('image'), createPost);
router.get('/:id', getPost);
router.post('/:id/upvote', authorize('civilian'), upvotePost);
router.patch('/:id/claim', authorize('authority', 'admin'), claimPost);
router.post(
  '/:id/resolve',
  authorize('authority', 'admin'),
  upload.array('proofs', 5),
  resolvePost
);

module.exports = router;
