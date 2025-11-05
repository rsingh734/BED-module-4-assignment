import request from 'supertest';
import express from 'express';
import { authenticateFirebaseToken, requireRole, AuthorizationOptions } from '../src/api/v1/middleware/authenticate';
import errorHandler from '../src/api/v1/middleware/errorHandler';

// Mock Firebase Admin SDK
jest.mock('../src/config/firebaseConfig', () => ({
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

import { auth } from '../src/config/firebaseConfig';
const mockedAuth = auth as jest.Mocked<typeof auth>;

describe('Authorization Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requireRole with string array (backward compatibility)', () => {
    it('should allow access with proper role', async () => {
      // Mock authenticated user with admin role
      const mockDecodedToken = {
        uid: 'admin-uid-123',
        email: 'admin@test.com',
        role: 'admin',
        auth_time: Date.now() / 1000,
        iat: Date.now() / 1000,
        exp: (Date.now() / 1000) + 3600
      };
      mockedAuth.verifyIdToken.mockResolvedValue(mockDecodedToken as any);

      app.get('/protected',
        authenticateFirebaseToken,
        requireRole(['admin']),
        (req, res) => res.json({ message: 'Access granted' })
      );
      app.use(errorHandler);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.message).toBe('Access granted');
    });

    it('should deny access with insufficient role', async () => {
      // Mock authenticated user with user role
      const mockDecodedToken = {
        uid: 'user-uid-123',
        email: 'user@test.com',
        role: 'user',
        auth_time: Date.now() / 1000,
        iat: Date.now() / 1000,
        exp: (Date.now() / 1000) + 3600
      };
      mockedAuth.verifyIdToken.mockResolvedValue(mockDecodedToken as any);

      app.get('/protected',
        authenticateFirebaseToken,
        requireRole(['admin']),
        (req, res) => res.json({ message: 'Access granted' })
      );
      app.use(errorHandler);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);

      expect(response.body.error.message).toBe('Insufficient permissions to access this resource.');
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should deny access when not authenticated', async () => {
      app.get('/protected',
        authenticateFirebaseToken,
        requireRole(['admin']),
        (req, res) => res.json({ message: 'Access granted' })
      );
      app.use(errorHandler);

      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.error.message).toBe('Access denied. No authentication token provided.');
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('requireRole with AuthorizationOptions', () => {
    it('should allow access with multiple allowed roles', async () => {
      const mockDecodedToken = {
        uid: 'officer-uid-123',
        email: 'officer@test.com',
        role: 'officer',
        auth_time: Date.now() / 1000,
        iat: Date.now() / 1000,
        exp: (Date.now() / 1000) + 3600
      };
      mockedAuth.verifyIdToken.mockResolvedValue(mockDecodedToken as any);

      const authOptions: AuthorizationOptions = {
        allowedRoles: ['officer', 'manager', 'admin']
      };

      app.get('/protected',
        authenticateFirebaseToken,
        requireRole(authOptions),
        (req, res) => res.json({ message: 'Access granted' })
      );
      app.use(errorHandler);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.message).toBe('Access granted');
    });

    it('should allow same-user access when allowSameUser is true', async () => {
      const mockDecodedToken = {
        uid: 'user-uid-123',
        email: 'user@test.com',
        role: 'user',
        auth_time: Date.now() / 1000,
        iat: Date.now() / 1000,
        exp: (Date.now() / 1000) + 3600
      };
      mockedAuth.verifyIdToken.mockResolvedValue(mockDecodedToken as any);

      const authOptions: AuthorizationOptions = {
        allowedRoles: ['admin'],
        allowSameUser: true
      };

      app.get('/protected/:uid',
        authenticateFirebaseToken,
        requireRole(authOptions),
        (req, res) => res.json({ message: 'Access granted' })
      );
      app.use(errorHandler);

      const response = await request(app)
        .get('/protected/user-uid-123')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.message).toBe('Access granted');
    });

    it('should deny same-user access when user ID does not match', async () => {
      const mockDecodedToken = {
        uid: 'user-uid-123',
        email: 'user@test.com',
        role: 'user',
        auth_time: Date.now() / 1000,
        iat: Date.now() / 1000,
        exp: (Date.now() / 1000) + 3600
      };
      mockedAuth.verifyIdToken.mockResolvedValue(mockDecodedToken as any);

      const authOptions: AuthorizationOptions = {
        allowedRoles: ['admin'],
        allowSameUser: true
      };

      app.get('/protected/:uid',
        authenticateFirebaseToken,
        requireRole(authOptions),
        (req, res) => res.json({ message: 'Access granted' })
      );
      app.use(errorHandler);

      const response = await request(app)
        .get('/protected/different-uid-456')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);

      expect(response.body.error.message).toBe('Insufficient permissions to access this resource.');
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should use custom authorization function', async () => {
      const mockDecodedToken = {
        uid: 'user-uid-123',
        email: 'user@test.com',
        role: 'user',
        auth_time: Date.now() / 1000,
        iat: Date.now() / 1000,
        exp: (Date.now() / 1000) + 3600
      };
      mockedAuth.verifyIdToken.mockResolvedValue(mockDecodedToken as any);

      const authOptions: AuthorizationOptions = {
        customAuth: (req) => req.query.allow === 'true'
      };

      app.get('/protected',
        authenticateFirebaseToken,
        requireRole(authOptions),
        (req, res) => res.json({ message: 'Access granted' })
      );
      app.use(errorHandler);

      // Should allow when custom auth passes
      const response1 = await request(app)
        .get('/protected?allow=true')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);
      expect(response1.body.message).toBe('Access granted');

      // Should deny when custom auth fails
      const response2 = await request(app)
        .get('/protected?allow=false')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);
      expect(response2.body.error.message).toBe('Access denied by custom authorization logic.');
    });
  });
});
