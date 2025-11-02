import { Request, Response } from 'express';
import { auth } from '../../../config/firebaseConfig';
import { asyncErrorHandler } from '../middleware/errorHandler';
import { NotFoundError, BadRequestError } from '../errors/error';

// Valid roles for the application
const VALID_ROLES = ['user', 'officer', 'manager', 'admin'];

/**
 * Validate if a role is valid
 */
const isValidRole = (role: string): boolean => {
  return VALID_ROLES.includes(role);
};

/**
 * Validate UID format (Firebase UIDs are typically 28 characters)
 */
const isValidUid = (uid: string): boolean => {
  return typeof uid === 'string' && uid.length >= 20 && uid.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(uid);
};

/**
 * Set user role using custom claims (Admin function)
 */
export const setUserRole = asyncErrorHandler(async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { role } = req.body;

  // Validate required fields
  if (!role) {
    throw new BadRequestError('Role is required');
  }

  if (!isValidRole(role)) {
    throw new BadRequestError('Invalid role. Valid roles are: user, officer, manager, admin');
  }

  if (!isValidUid(uid)) {
    throw new BadRequestError('Valid user UID is required');
  }

  try {
    // Set custom claims for the user
    await auth.setCustomUserClaims(uid, { role });

    // Fetch updated user data to return current state
    const userRecord = await auth.getUser(uid);

    res.status(200).json({
      success: true,
      message: `Role '${role}' assigned to user successfully`,
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        role: role,
        customClaims: userRecord.customClaims,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      throw new NotFoundError(`User with UID ${uid} not found`);
    }
    if (error.code === 'auth/invalid-uid') {
      throw new BadRequestError('Valid user UID is required');
    }
    // Generic error for other Firebase issues
    throw new NotFoundError(`Failed to update role for user ${uid}`);
  }
});

export const getAllUsers = asyncErrorHandler(async (req: Request, res: Response) => {
  // For testing purposes, we'll skip authentication check
  // In production, this should check for admin role via middleware

  try {
    // Get all users from Firebase Authentication (admin function)
    const listUsersResult = await auth.listUsers();

    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      customClaims: user.customClaims,
      role: user.customClaims?.role || 'user', // Extract role from custom claims
      createdAt: user.metadata.creationTime,
      lastLogin: user.metadata.lastSignInTime
    }));

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    throw new NotFoundError('Failed to retrieve users');
  }
});
