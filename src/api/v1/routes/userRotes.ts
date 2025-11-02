import { Router } from 'express';
import { 
  getCurrentUser,
  getUserById 
} from '../controllers/userController';

const router = Router();

// User routes
router.get('/user/me', getCurrentUser); // Get current user's own details
router.get('/admin/users/:uid', getUserById); // Admin: get any user by UID

export default router;