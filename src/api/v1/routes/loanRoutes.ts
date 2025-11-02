import { Router } from 'express';
import {
  createLoanApplication,
  reviewLoanApplication,
  getAllLoans,
  approveLoanApplication
} from '../controllers/loanController';
import { asyncErrorHandler } from '../middleware/errorHandler';
import { NotFoundError } from '../errors/error';
import { authenticateFirebaseToken, requireRole } from '../middleware/authenticate';


const router = Router();

// Define routes and connect to controllers with authentication and authorization
router.post('/loans',
  authenticateFirebaseToken,
  asyncErrorHandler(createLoanApplication)
); // Any authenticated user can create loan

router.put('/loans/:id/review',
  authenticateFirebaseToken,
  requireRole(['officer', 'manager', 'admin']),
  asyncErrorHandler(reviewLoanApplication)
); // Officers, managers, admins can review

router.get('/loans',
  authenticateFirebaseToken,
  requireRole(['officer', 'manager', 'admin']),
  asyncErrorHandler(getAllLoans)
); // Officers, managers, admins can view all loans

router.put('/loans/:id/approve',
  authenticateFirebaseToken,
  requireRole(['manager', 'admin']),
  asyncErrorHandler(approveLoanApplication)
); // Only managers and admins can approve

// Test error handling routes
router.get('/test/error', () => {
  throw new Error('This is a test error');
});

router.get('/test/app-error', () => {
  throw new NotFoundError('Test loan not found');
});

export default router;
