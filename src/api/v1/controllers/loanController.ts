import { Request, Response } from 'express';

// Temporary in-memory storage for demonstration
let loanApplications: any[] = [];
let loanIdCounter = 1;

export const createLoanApplication = (req: Request, res: Response) => {
  const newLoan = {
    id: loanIdCounter++,
    applicantName: 'John Doe',
    amount: 50000,
    status: 'submitted',
    createdAt: new Date().toISOString()
  };
  loanApplications.push(newLoan);
  
  res.status(201).json({
    message: 'Loan application submitted successfully',
    data: newLoan
  });
};

export const reviewLoanApplication = (req: Request, res: Response) => {
  const { id } = req.params;
  
  res.status(200).json({
    message: `Loan application ${id} reviewed by officer`,
    data: { 
      id: parseInt(id), 
      status: 'under_review',
      reviewedBy: 'loan_officer',
      reviewedAt: new Date().toISOString()
    }
  });
};

export const getAllLoans = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'All loan applications retrieved',
    data: loanApplications
  });
};

export const approveLoanApplication = (req: Request, res: Response) => {
  const { id } = req.params;
  
  res.status(200).json({
    message: `Loan application ${id} approved by manager`,
    data: { 
      id: parseInt(id), 
      status: 'approved',
      approvedBy: 'loan_manager',
      approvedAt: new Date().toISOString()
    }
  });
};