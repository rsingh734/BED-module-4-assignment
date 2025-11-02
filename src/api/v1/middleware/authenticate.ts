import { Request, Response, NextFunction } from 'express';
import { auth } from '../../../config/firebaseConfig';
import { UnauthorizedError, ForbiddenError } from '../errors/error';
import { getErrorMessage } from '../utilis/errorUtilis';

/**
 * Authentication middleware that verifies Firebase ID tokens
 * Extracts user information and attaches to request for downstream use
 */
export const authenticateFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // Handle missing token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Access denied. No authentication token provided.'));
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  // Handle empty token
  if (!idToken) {
    next(new UnauthorizedError('Access denied. Malformed authentication token.'));
    return;
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Extract user information from decoded token
    const userInfo = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified || false,
      role: decodedToken.role || 'user', // Custom claims for role-based access
      authTime: decodedToken.auth_time,
      issuedAt: decodedToken.iat,
      expiresAt: decodedToken.exp
    };

    // Attach user information to request for downstream middleware
    req.user = userInfo;

    // Proceed to next middleware
    next();
  } catch (error: any) {
    // Handle various Firebase authentication errors
    console.error('Firebase authentication error:', error);

    // Categorize different types of authentication failures
    switch (error.code) {
      case 'auth/id-token-expired':
        next(new UnauthorizedError('Authentication token has expired. Please log in again.'));
        return;

      case 'auth/argument-error':
      case 'auth/invalid-id-token':
        next(new UnauthorizedError('Invalid authentication token.'));
        return;

      case 'auth/user-disabled':
        next(new ForbiddenError('User account has been disabled.'));
        return;

      case 'auth/user-not-found':
        next(new UnauthorizedError('User not found.'));
        return;

      default:
        next(new UnauthorizedError(`Authentication failed: ${getErrorMessage(error)}`));
        return;
    }
  }
};

/**
 * Optional: Role-based authorization middleware
 * Use after authenticateFirebaseToken to restrict access by roles
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions to access this resource.');
    }

    next();
  };
};