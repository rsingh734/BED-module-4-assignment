import { Request, Response, NextFunction } from 'express';
import { authenticateFirebaseToken } from '../src/api/v1/middleware/authenticate';
import { auth } from '../src/config/firebaseConfig';
import { UnauthorizedError, ForbiddenError } from '../src/api/v1/errors/error';

// Mock Firebase Admin SDK
jest.mock('../src/config/firebaseConfig', () => ({
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

const mockedAuth = auth as jest.Mocked<typeof auth>;

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('Valid Token Processing', () => {
    it('should correctly process valid tokens and attach user to request', async () => {
      const validDecodedToken = {
        uid: 'test-uid-123',
        email: 'user@loanapp.com',
        email_verified: true,
        role: 'officer',
        auth_time: 1609459200,
        iat: 1609459200,
        exp: 1609462800
      };

      mockedAuth.verifyIdToken.mockResolvedValue(validDecodedToken as any);
      mockRequest.headers = { authorization: 'Bearer valid-token-here' };

      await authenticateFirebaseToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockedAuth.verifyIdToken).toHaveBeenCalledWith('valid-token-here');
      expect(mockRequest.user).toEqual({
        uid: 'test-uid-123',
        email: 'user@loanapp.com',
        emailVerified: true,
        role: 'officer',
        authTime: 1609459200,
        issuedAt: 1609459200,
        expiresAt: 1609462800
      });
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Missing Token Handling', () => {
    it('should call next with UnauthorizedError when no authorization header is present', async () => {
      mockRequest.headers = {};

      await authenticateFirebaseToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockedAuth.verifyIdToken).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with UnauthorizedError when authorization header is malformed', async () => {
      mockRequest.headers = { authorization: 'InvalidFormat' };

      await authenticateFirebaseToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockedAuth.verifyIdToken).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('Invalid Token Handling', () => {
    it('should call next with UnauthorizedError for expired tokens', async () => {
      const expiredError = new Error('Token expired');
      (expiredError as any).code = 'auth/id-token-expired';

      mockedAuth.verifyIdToken.mockRejectedValue(expiredError);
      mockRequest.headers = { authorization: 'Bearer expired-token' };

      await authenticateFirebaseToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockedAuth.verifyIdToken).toHaveBeenCalledWith('expired-token');
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with UnauthorizedError for invalid tokens', async () => {
      const invalidError = new Error('Invalid token');
      (invalidError as any).code = 'auth/argument-error';

      mockedAuth.verifyIdToken.mockRejectedValue(invalidError);
      mockRequest.headers = { authorization: 'Bearer invalid-token' };

      await authenticateFirebaseToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockedAuth.verifyIdToken).toHaveBeenCalledWith('invalid-token');
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with ForbiddenError for user-disabled errors', async () => {
      const disabledError = new Error('User disabled');
      (disabledError as any).code = 'auth/user-disabled';

      mockedAuth.verifyIdToken.mockRejectedValue(disabledError);
      mockRequest.headers = { authorization: 'Bearer valid-token-disabled-user' };

      await authenticateFirebaseToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockedAuth.verifyIdToken).toHaveBeenCalledWith('valid-token-disabled-user');
      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });
});