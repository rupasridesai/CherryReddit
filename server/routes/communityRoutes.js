import express from 'express';
import {
  createCommunity,
  listCommunities,
  getCommunity,
  updateCommunity,
  joinCommunity,
  addModerator,
  getTrendingCommunities,
} from '../controllers/communityController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', optionalAuth, listCommunities);
router.get('/trending', getTrendingCommunities);
router.post('/', protect, createCommunity);
router.get('/:name', optionalAuth, getCommunity);
router.patch('/:name', protect, upload.single('icon'), updateCommunity);
router.post('/:name/join', protect, joinCommunity);
router.post('/:name/moderators', protect, addModerator);

export default router;
