import { Router } from 'express';
import {
  setUserRole,
  getAllUsers
} from '../controllers/adminController';
import { getUserById } from '../controllers/userController';
import { authenticateFirebaseToken } from '../middleware/authenticate';
import { requireAdmin, requireOfficerOrAbove } from '../middleware/authMiddleware';

const router = Router();

// Admin routes for user management - require admin role
router.put('/admin/users/:uid/role',
  authenticateFirebaseToken,
  requireAdmin(),
  setUserRole
); // Set user role (custom claims) - requires manager role

router.get('/admin/users/:uid',
  authenticateFirebaseToken,
  requireOfficerOrAbove(),
  getUserById
); // Get specific user by UID - requires officer or manager role

router.get('/admin/users',
  authenticateFirebaseToken,
  requireAdmin(),
  getAllUsers
); // Get all users - requires manager role

export default router;
