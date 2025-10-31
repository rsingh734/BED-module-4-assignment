import { AppError } from '../errors/AppErrors';

/**
 * Extracts error message from unknown error types
 * @param error - The error object
 * @returns The error message as a string
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};

/**
 * Extracts error code from Firebase or other errors
 * @param error - The error object
 * @returns The error code as a string
 */
export const getErrorCode = (error: unknown): string => {
    if (error instanceof Error) {
        // Firebase errors often have a 'code' property
        const firebaseError = error as any;
        return firebaseError.code || "UNKNOWN_ERROR";
    }
    return "UNKNOWN_ERROR";
};

/**
 * Creates a standardized error response format
 * @param message - The error message
 * @param code - The error code
 * @param path - The request path (optional)
 * @returns Standardized error response object
 */
export const createErrorResponse = (
    message: string,
    code: string,
    path?: string
) => {
    return {
        success: false,
        error: {
            code,
            message,
            timestamp: new Date().toISOString(),
            ...(path && { path })
        }
    };
};

/**
 * Checks if error is an operational error (AppError instance)
 * @param error - The error object
 * @returns boolean indicating if it's an operational error
 */
export const isOperationalError = (error: unknown): boolean => {
    return error instanceof AppError;
};