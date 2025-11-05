import { HTTP_STATUS_CODES } from "../../../constants/httpStatusCode";


export class AppError extends Error {
    /**
     * Creates a new AppError instance.
     * @param {string} message - The error message.
     * @param {string} code - The error code.
     * @param {number} statusCode - The http response code.
     */
    constructor(
        public message: string,
        public code: string,
        public statusCode: number
    ) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(
        message: string = "Bad Request",
        code: string = "BAD_REQUEST"
    ) {
        super(message, code, HTTP_STATUS_CODES.BAD_REQUEST);
    }
}

export class UnauthorizedError extends AppError {
    constructor(
        message: string = "Unauthorized",
        code: string = "UNAUTHORIZED"
    ) {
        super(message, code, HTTP_STATUS_CODES.UNAUTHORIZED);
    }
}

export class ForbiddenError extends AppError {
    constructor(
        message: string = "Forbidden",
        code: string = "FORBIDDEN"
    ) {
        super(message, code, HTTP_STATUS_CODES.FORBIDDEN);
    }
}

export class NotFoundError extends AppError {
    constructor(
        message: string = "Not Found",
        code: string = "NOT_FOUND"
    ) {
        super(message, code, HTTP_STATUS_CODES.NOT_FOUND);
    }
}

export class ConflictError extends AppError {
    constructor(
        message: string = "Conflict",
        code: string = "CONFLICT"
    ) {
        super(message, code, HTTP_STATUS_CODES.CONFLICT);
    }
}

export class InternalServerError extends AppError {
    constructor(
        message: string = "Internal Server Error",
        code: string = "INTERNAL_SERVER_ERROR"
    ) {
        super(message, code, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
}