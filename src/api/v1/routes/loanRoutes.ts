import { Router } from 'express';
import {
  createLoanApplication,
  reviewLoanApplication,
  getAllLoans,
  approveLoanApplication
} from '../controllers/loanController';
import { asyncErrorHandler } from '../middleware/errorHandler';
import {
  authenticateFirebaseToken,
  requireRole
} from '../middleware/authenticate';

const router = Router();

// Apply authentication to all loan routes
router.use(authenticateFirebaseToken);

// Define routes with role-based authorization
router.post('/loans',
  requireRole(['user']), // Only users can create loan applications
  asyncErrorHandler(createLoanApplication)
);

router.put('/loans/:id/review',
  requireRole(['officer', 'manager']), // Officers and managers can review
  asyncErrorHandler(reviewLoanApplication)
);

router.get('/loans',
  requireRole(['officer', 'manager']), // Officers and managers can view all loans
  asyncErrorHandler(getAllLoans)
);

router.put('/loans/:id/approve',
  requireRole(['manager']), // Only managers can approve loans
  asyncErrorHandler(approveLoanApplication)
);

// Test error handling routes (keep these for now)
router.get('/test/error', () => {
  throw new Error('This is a test error');
});

router.get('/test/app-error', () => {
  const { NotFoundError } = require('../errors/AppErrors');
  throw new NotFoundError('Test loan not found');
});

export default router;