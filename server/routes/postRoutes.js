import express from 'express';
import {
  createPost,
  getFeed,
  getPost,
  votePost,
  updatePost,
  deletePost,
  moderatePost,
  searchPosts,
} from '../controllers/postController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', optionalAuth, getFeed);
router.get('/search', optionalAuth, searchPosts);
router.post('/', protect, upload.array('images', 6), createPost);
router.get('/:id', optionalAuth, getPost);
router.patch('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/vote', protect, votePost);
router.patch('/:id/moderate', protect, moderatePost);

export default router;
