import request from 'supertest';
import express from 'express';
import { auth } from '../src/config/firebaseConfig';
import { setUserRole, getAllUsers } from '../src/api/v1/controllers/adminController';
import { asyncErrorHandler } from '../src/api/v1/middleware/errorHandler';
import errorHandler from '../src/api/v1/middleware/errorHandler';

// Mock Firebase Admin SDK
jest.mock('../src/config/firebaseConfig', () => ({
  auth: {
    setCustomUserClaims: jest.fn(),
    getUser: jest.fn(),
    listUsers: jest.fn(),
  },
}));

const mockedAuth = auth as jest.Mocked<typeof auth>;

describe('Custom Claims - Role-Based Access Control', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    jest.clearAllMocks();
  });

  describe('POST /api/v1/admin/users/:uid/role - Set Custom Claims', () => {
    it('should set custom claims correctly for valid user and role', async () => {
      const validUid = 'test-uid-123456789012345678';
      // Mock successful Firebase operations
      const mockUserRecord = {
        uid: validUid,
        email: 'officer@loanapp.com',
        emailVerified: true,
        displayName: 'Test Officer',
        customClaims: { role: 'officer' },
        metadata: {
          creationTime: '2024-01-01T00:00:00Z',
          lastSignInTime: '2024-01-15T00:00:00Z'
        }
      };

      mockedAuth.setCustomUserClaims.mockResolvedValue(undefined);
      mockedAuth.getUser.mockResolvedValue(mockUserRecord as any);

      app.put('/api/v1/admin/users/:uid/role', asyncErrorHandler(setUserRole));
      app.use(errorHandler);

      const response = await request(app)
        .put(`/api/v1/admin/users/${validUid}/role`)
        .send({ role: 'officer' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "Role 'officer' assigned to user successfully",
        data: {
          uid: validUid,
          email: 'officer@loanapp.com',
          role: 'officer',
          customClaims: { role: 'officer' },
          updatedAt: expect.any(String)
        }
      });

      // Verify Firebase was called correctly
      expect(mockedAuth.setCustomUserClaims).toHaveBeenCalledWith(validUid, { role: 'officer' });
      expect(mockedAuth.getUser).toHaveBeenCalledWith(validUid);
    });

    it('should retrieve custom claims correctly from user record', async () => {
      const validUid = 'test-uid-45678901234567890123456789';
      const mockUserRecord = {
        uid: validUid,
        email: 'manager@loanapp.com',
        emailVerified: true,
        customClaims: { role: 'manager', department: 'loans' },
        metadata: {
          creationTime: '2024-01-01T00:00:00Z',
          lastSignInTime: '2024-01-15T00:00:00Z'
        }
      };

      mockedAuth.setCustomUserClaims.mockResolvedValue(undefined);
      mockedAuth.getUser.mockResolvedValue(mockUserRecord as any);

      app.put('/api/v1/admin/users/:uid/role', asyncErrorHandler(setUserRole));
      app.use(errorHandler);

      const response = await request(app)
        .put(`/api/v1/admin/users/${validUid}/role`)
        .send({ role: 'manager' })
        .expect(200);

      // Verify custom claims are properly retrieved and returned
      expect(response.body.data.customClaims).toEqual({ role: 'manager', department: 'loans' });
      expect(response.body.data.role).toBe('manager');
    });

    it('should handle errors when setting claims fails - user not found', async () => {
      // Mock Firebase user not found error
      const firebaseError = new Error('User not found');
      (firebaseError as any).code = 'auth/user-not-found';

      mockedAuth.setCustomUserClaims.mockRejectedValue(firebaseError);

      app.put('/api/v1/admin/users/:uid/role', asyncErrorHandler(setUserRole));
      app.use(errorHandler);

      const response = await request(app)
        .put('/api/v1/admin/users/invalid-uid-12345678901234567890/role')
        .send({ role: 'officer' })
        .expect(404);

      expect(response.body.error.message).toBe('User with UID invalid-uid-12345678901234567890 not found');
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle errors when setting claims fails - invalid role', async () => {
      app.put('/api/v1/admin/users/:uid/role', asyncErrorHandler(setUserRole));
      app.use(errorHandler);

      const response = await request(app)
        .put('/api/v1/admin/users/test-uid/role')
        .send({ role: 'invalid-role' })
        .expect(400);

      expect(response.body.error.message).toContain('Invalid role');
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    it('should handle errors when setting claims fails - missing role', async () => {
      app.put('/api/v1/admin/users/:uid/role', asyncErrorHandler(setUserRole));
      app.use(errorHandler);

      const response = await request(app)
        .put('/api/v1/admin/users/test-uid/role')
        .send({})
        .expect(400);

      expect(response.body.error.message).toBe('Role is required');
    });

    it('should handle errors when setting claims fails - invalid UID', async () => {
      app.put('/api/v1/admin/users/:uid/role', asyncErrorHandler(setUserRole));
      app.use(errorHandler);

      const response = await request(app)
        .put('/api/v1/admin/users/123/role') // Too short UID
        .send({ role: 'officer' })
        .expect(400);

      expect(response.body.error.message).toBe('Valid user UID is required');
    });
  });

  describe('GET /api/v1/admin/users - Retrieve Users with Custom Claims', () => {
    it('should retrieve all users with their custom claims', async () => {
      const mockUsers = [
        {
          uid: 'uid1',
          email: 'user1@loanapp.com',
          emailVerified: true,
          displayName: 'User One',
          customClaims: { role: 'user' },
          metadata: {
            creationTime: '2024-01-01T00:00:00Z',
            lastSignInTime: '2024-01-15T00:00:00Z'
          }
        },
        {
          uid: 'uid2', 
          email: 'officer1@loanapp.com',
          emailVerified: true,
          displayName: 'Officer One',
          customClaims: { role: 'officer' },
          metadata: {
            creationTime: '2024-01-02T00:00:00Z',
            lastSignInTime: '2024-01-16T00:00:00Z'
          }
        }
      ];

      mockedAuth.listUsers.mockResolvedValue({
        users: mockUsers as any[],
        pageToken: undefined
      });

      app.get('/api/v1/admin/users', asyncErrorHandler(getAllUsers));
      app.use(errorHandler);

      const response = await request(app)
        .get('/api/v1/admin/users')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].role).toBe('user');
      expect(response.body.data[1].role).toBe('officer');
      expect(response.body.message).toBe('Users retrieved successfully');
    });
  });
});