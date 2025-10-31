import { Router } from 'express';
import { 
  createLoanApplication,
  reviewLoanApplication,
  getAllLoans,
  approveLoanApplication
} from '../controllers/loanController';

const router = Router();

// Define routes and connect to controllers
router.post('/loans', createLoanApplication);
router.put('/loans/:id/review', reviewLoanApplication);
router.get('/loans', getAllLoans);
router.put('/loans/:id/approve', approveLoanApplication);

export default router;