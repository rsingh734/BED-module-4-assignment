import { Router } from 'express';
import { 
  setUserRole,
  getAllUsers 
} from '../controllers/adminController';

const router = Router();

// Admin routes for user management
router.put('/admin/users/:uid/role', setUserRole); // Set user role (custom claims)
router.get('/admin/users', getAllUsers); // Get all users

export default router;