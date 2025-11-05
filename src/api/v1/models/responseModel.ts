export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
    timestamp: string;
}

export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code: string;
        statusCode?: number;
        timestamp?: string;
    };
    timestamp: string;
}

export const errorResponse = (
    message: string, 
    code: string, 
    statusCode?: number
): ErrorResponse => ({
    success: false,
    error: {
        message,
        code,
        ...(statusCode && { statusCode })
    },
    timestamp: new Date().toISOString(),
});

export const successResponse = <T = unknown>(data: T): SuccessResponse<T> => ({
    success: true,
    data,
    timestamp: new Date().toISOString(),
});