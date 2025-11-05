import { Router } from 'express';
import {
  getCurrentUser
} from '../controllers/userController';
import { authenticateFirebaseToken } from '../middleware/authenticate';

const router = Router();

// User routes
router.get('/user/me',
  authenticateFirebaseToken,
  getCurrentUser
); // Get current user's own details - any authenticated user

export default router;
