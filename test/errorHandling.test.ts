import request from 'supertest';
import express from 'express';
import errorHandler from '../src/api/v1/middleware/errorHandler';
import { 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError,
  InternalServerError 
} from '../src/api/v1/errors/error';
import { errorResponse } from '../src/api/v1/models/responseModel';

describe('Error Handling Architecture', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
  });

  describe('Custom Error Classes', () => {
    it('should create BadRequestError with correct status code', () => {
      const error = new BadRequestError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('BAD_REQUEST');
    });

    it('should create UnauthorizedError with correct status code', () => {
      const error = new UnauthorizedError('Authentication required');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create ForbiddenError with correct status code', () => {
      const error = new ForbiddenError('Insufficient permissions');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Insufficient permissions');
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should create NotFoundError with correct status code', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create InternalServerError with correct status code', () => {
      const error = new InternalServerError('Server error');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Server error');
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('Error Handler Middleware', () => {
    it('should handle AppError instances with correct status code', async () => {
      app.get('/test-app-error', (req, res, next) => {
        next(new NotFoundError('Test resource not found'));
      });
      app.use(errorHandler);

      const response = await request(app).get('/test-app-error');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: {
          message: 'Test resource not found',
          code: 'NOT_FOUND',
          statusCode: 404
        },
        timestamp: expect.any(String)
      });
    });

    it('should handle generic Error instances with 500 status', async () => {
      app.get('/test-generic-error', (req, res, next) => {
        next(new Error('An unexpected error occurred'));
      });
      app.use(errorHandler);

      const response = await request(app).get('/test-generic-error');
      
      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('UNKNOWN_ERROR');
      expect(response.body.error.message).toBe('An unexpected error occurred');
    });

    it('should handle null/undefined errors gracefully', async () => {
      app.get('/test-null-error', (req, res, next) => {
        errorHandler(null, req, res, next);
      });

      const response = await request(app).get('/test-null-error');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('An unexpected error occurred');
    });
  });

  describe('Error Response Format', () => {
    it('should create standardized error response', () => {
      const response = errorResponse('Test error', 'TEST_ERROR', 400);
      
      expect(response).toEqual({
        success: false,
        error: {
          message: 'Test error',
          code: 'TEST_ERROR',
          statusCode: 400
        },
        timestamp: expect.any(String)
      });
    });
  });
});