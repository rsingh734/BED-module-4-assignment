import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import app from '../src/app';

// Mock the authentication middleware
jest.mock('../src/api/v1/middleware/authenticate', () => ({
  authenticateFirebaseToken: jest.fn((req: Request, res: Response, next: NextFunction) => {
    // Mock user based on test context or default to user role
    req.user = {
      uid: 'test-user-123',
      email: 'test@loanapp.com',
      emailVerified: true,
      role: 'user',
      authTime: Date.now(),
      issuedAt: Date.now(),
      expiresAt: Date.now() + 3600000
    };
    next();
  }),
  requireRole: jest.fn((roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    // For tests, allow all role checks to pass
    next();
  })
}));

describe('Loan Application API Endpoints', () => {
  describe('POST /api/v1/loans', () => {
    it('should create a new loan application', async () => {
      const response = await request(app)
        .post('/api/v1/loans')
        .send({})
        .expect(201);

      expect(response.body).toEqual({
        message: 'Loan application submitted successfully',
        data: {
          id: expect.any(Number),
          applicantName: 'John Doe',
          amount: 50000,
          status: 'submitted',
          createdAt: expect.any(String)
        }
      });
    });
  });

  describe('GET /api/v1/loans', () => {
    it('should return all loan applications', async () => {
      const response = await request(app)
        .get('/api/v1/loans')
        .expect(200);

      expect(response.body).toEqual({
        message: 'All loan applications retrieved',
        data: expect.any(Array)
      });
    });
  });

  describe('PUT /api/v1/loans/:id/review', () => {
    it('should review a loan application', async () => {
      const response = await request(app)
        .put('/api/v1/loans/1/review')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Loan application 1 reviewed by officer',
        data: {
          id: 1,
          status: 'under_review',
          reviewedBy: 'loan_officer',
          reviewedAt: expect.any(String)
        }
      });
    });
  });

  describe('PUT /api/v1/loans/:id/approve', () => {
    it('should approve a loan application', async () => {
      const response = await request(app)
        .put('/api/v1/loans/1/approve')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Loan application 1 approved by manager',
        data: {
          id: 1,
          status: 'approved',
          approvedBy: 'loan_manager',
          approvedAt: expect.any(String)
        }
      });
    });
  });
});
