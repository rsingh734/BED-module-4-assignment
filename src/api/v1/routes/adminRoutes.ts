import { Router } from 'express';
import {
  setUserRole,
  getAllUsers
} from '../controllers/adminController';
import { authenticateFirebaseToken, requireRole } from '../middleware/authenticate';

const router = Router();

// Admin routes for user management - require admin role
router.put('/admin/users/:uid/role',
  authenticateFirebaseToken,
  requireRole(['admin']),
  setUserRole
); // Set user role (custom claims)

router.get('/admin/users',
  authenticateFirebaseToken,
  requireRole(['admin']),
  getAllUsers
); // Get all users

export default router;
