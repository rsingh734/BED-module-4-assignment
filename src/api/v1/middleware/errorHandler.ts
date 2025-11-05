import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/error";
import { HTTP_STATUS_CODES } from "../../../constants/httpStatusCode";
import { errorResponse } from "../models/responseModel";

const errorHandler = (
    err: Error | null,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (!err) {
        console.error("Error: null or undefined error received");
        res.status(HTTP_STATUS_CODES.NOT_FOUND).json(
            errorResponse("An unexpected error occurred", "NOT_FOUND", HTTP_STATUS_CODES.NOT_FOUND)
        );
        return;
    }

    // Log the error message for debugging
    console.error(`Error: ${err.message}`);

    // Log stack trace for non-production environments
    if (process.env.NODE_ENV !== "production") {
        console.error(`Stack: ${err.stack}`);
    }

    if (err instanceof AppError) {
        // Handle our custom application errors with their specific status codes
        const response = errorResponse(err.message, err.code, err.statusCode);
        response.error.timestamp = new Date().toISOString();
        res.status(err.statusCode).json(response);
    } else {
        // Handle unexpected errors (programming errors, third-party library errors, etc.)
        const response = errorResponse("An unexpected error occurred", "UNKNOWN_ERROR", HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        response.error.timestamp = new Date().toISOString();
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(response);
    }
};

export default errorHandler;

export const asyncErrorHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};