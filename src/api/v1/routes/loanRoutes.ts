import { Router } from 'express';
import { 
  createLoanApplication,
  reviewLoanApplication,
  getAllLoans,
  approveLoanApplication
} from '../controllers/loanController';
import { asyncErrorHandler } from '../middleware/errorHandler';
import { NotFoundError } from '../errors/error';


const router = Router();

// Define routes and connect to controllers
router.post('/loans', asyncErrorHandler(createLoanApplication));
router.put('/loans/:id/review', asyncErrorHandler(reviewLoanApplication));
router.get('/loans', asyncErrorHandler(getAllLoans));
router.put('/loans/:id/approve', asyncErrorHandler(approveLoanApplication));

// Test error handling routes
router.get('/test/error', () => {
  throw new Error('This is a test error');
});

router.get('/test/app-error', () => {
  throw new NotFoundError('Test loan not found');
});

export default router;