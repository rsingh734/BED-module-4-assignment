import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/error';
import { asyncErrorHandler } from './errorHandler';

// ... keep the existing authenticateFirebaseToken function ...

/**
 * Interface for authorization options
 * Supports multiple roles, resource ownership checks, and custom validation
 */
export interface AuthorizationOptions {
  allowedRoles: string[];
  checkOwnership?: boolean;
  ownerIdField?: string; // Field in request params/body that contains owner ID
  resourceType?: string; // Type of resource for error messages
  customValidator?: (req: Request, user: any) => boolean;
}

/**
 * Enhanced authorization middleware with flexible access control
 * Integrates with error handling system for consistent responses
 */
export const authorize = (options: AuthorizationOptions) => {
  return asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    // Check if user is authenticated
    if (!user) {
      throw new UnauthorizedError('Authentication required for this resource.');
    }

    // Check role-based access
    const hasRoleAccess = options.allowedRoles.includes(user.role);
    
    // Check ownership if required
    let hasOwnershipAccess = true;
    if (options.checkOwnership && options.ownerIdField) {
      const ownerId = getOwnerIdFromRequest(req, options.ownerIdField);
      if (ownerId) {
        hasOwnershipAccess = user.uid === ownerId;
      }
    }

    // Check custom validation if provided
    let hasCustomAccess = true;
    if (options.customValidator) {
      hasCustomAccess = options.customValidator(req, user);
    }

    // Determine final access decision
    const hasAccess = hasRoleAccess || hasOwnershipAccess || hasCustomAccess;

    if (!hasAccess) {
      // Provide detailed error message based on failure reason
      let errorMessage = 'Insufficient permissions to access this resource.';
      
      if (options.resourceType) {
        errorMessage = `Access denied for ${options.resourceType}. `;
        
        if (!hasRoleAccess) {
          errorMessage += `Required roles: ${options.allowedRoles.join(', ')}.`        } else if (!hasOwnershipAccess) {
          errorMessage += 'You can only access your own resources.';
        }
      }
      
      throw new ForbiddenError(errorMessage);
    }

    next();
  });
};

/**
 * Helper function to extract owner ID from request based on field name
 */
const getOwnerIdFromRequest = (req: Request, ownerIdField: string): string | null => {
  // Check params first (e.g., /users/:userId)
  if (req.params[ownerIdField]) {
    return req.params[ownerIdField];
  }
  
  // Check body (e.g., { ownerId: '123' })
  if (req.body && req.body[ownerIdField]) {
    return req.body[ownerIdField];
  }
  
  // Check query (e.g., ?ownerId=123)
  if (req.query && req.query[ownerIdField]) {
    return req.query[ownerIdField] as string;
  }
  
  return null;
};

/**
 * Convenience authorization middleware for specific roles
 * Maintains backward compatibility with existing requireRole function
 */
export const requireRole = (allowedRoles: string[]) => {
  return authorize({
    allowedRoles,
    resourceType: 'this resource'
  });
};

/**
 * Authorization for resource ownership - user can only access their own resources
 */
export const requireOwnership = (ownerIdField: string = 'userId', resourceType: string = 'resource') => {
  return authorize({
    allowedRoles: ['user', 'officer', 'manager'], // All roles can access their own resources
    checkOwnership: true,
    ownerIdField,
    resourceType
  });
};

/**
 * Authorization for admin-only access
 */
export const requireAdmin = () => {
  return authorize({
    allowedRoles: ['manager'],
    resourceType: 'admin resources'
  });
};

/**
 * Authorization for officer or manager access
 */
export const requireOfficerOrAbove = () => {
  return authorize({
    allowedRoles: ['officer', 'manager'],
    resourceType: 'officer-level resources'
  });
};
