import express from 'express';
import {
  getProfile,
  updateProfile,
  toggleSavePost,
  getSavedPosts,
  getUserComments,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/saved', protect, getSavedPosts);
router.patch('/me', protect, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateProfile);
router.post('/saved/:postId', protect, toggleSavePost);
router.get('/:username', getProfile);
router.get('/:username/comments', getUserComments);

export default router;
