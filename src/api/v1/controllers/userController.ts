import { Request, Response } from 'express';
import { auth } from '../../../config/firebaseConfig';
import { asyncErrorHandler } from '../middleware/errorHandler';
import { UnauthorizedError, NotFoundError } from '../errors/error';

/**
 * Get current user details using Firebase Authentication
 */
export const getCurrentUser = asyncErrorHandler(async (req: Request, res: Response) => {
  // This will be properly implemented after we add authentication middleware
  // For now, this is a placeholder that shows the intended Firebase Auth usage
  const userId = req.user?.uid; // This will be set by auth middleware later

  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  try {
    // Get user from Firebase Authentication
    const userRecord = await auth.getUser(userId);

    res.status(200).json({
      message: 'User details retrieved successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        customClaims: userRecord.customClaims,
        createdAt: userRecord.metadata.creationTime,
        lastLogin: userRecord.metadata.lastSignInTime
      }
    });
  } catch (error) {
    throw new NotFoundError('User not found');
  }
});

/**
 * Get user details by UID using Firebase Authentication (Admin function)
 */
export const getUserById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    // Get user from Firebase Authentication
    const userRecord = await auth.getUser(uid);

    res.status(200).json({
      message: 'User details retrieved successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        customClaims: userRecord.customClaims,
        createdAt: userRecord.metadata.creationTime,
        lastLogin: userRecord.metadata.lastSignInTime
      }
    });
  } catch (error) {
    throw new NotFoundError(`User with UID ${uid} not found`);
  }
});
