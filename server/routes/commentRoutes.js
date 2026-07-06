import express from 'express';
import {
  createComment,
  getCommentsForPost,
  voteComment,
  updateComment,
  deleteComment,
  moderateComment,
} from '../controllers/commentController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createComment);
router.get('/post/:postId', optionalAuth, getCommentsForPost);
router.post('/:id/vote', protect, voteComment);
router.patch('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.patch('/:id/moderate', protect, moderateComment);

export default router;
