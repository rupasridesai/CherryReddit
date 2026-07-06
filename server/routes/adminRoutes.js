import express from 'express';
import {
  getStats,
  listUsers,
  updateUserRole,
  banUser,
  unbanUser,
  createReport,
  listReports,
  resolveReport,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Reports can be filed by any authenticated user
router.post('/reports', protect, createReport);

// Everything else is admin/moderator only
router.use(protect, restrictTo('admin', 'moderator'));

router.get('/stats', restrictTo('admin'), getStats);
router.get('/users', restrictTo('admin'), listUsers);
router.patch('/users/:id/role', restrictTo('admin'), updateUserRole);
router.patch('/users/:id/ban', restrictTo('admin'), banUser);
router.patch('/users/:id/unban', restrictTo('admin'), unbanUser);

router.get('/reports', listReports);
router.patch('/reports/:id', resolveReport);

export default router;
