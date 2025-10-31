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
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(
            errorResponse("An unexpected error occurred", "UNKNOWN_ERROR")
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
        res.status(err.statusCode).json(errorResponse(err.message, err.code, err.statusCode));
    } else {
        // Handle unexpected errors (programming errors, third-party library errors, etc.)
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(
            errorResponse("An unexpected error occurred", "UNKNOWN_ERROR", HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        );
    }
};

export default errorHandler;

export const asyncErrorHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};