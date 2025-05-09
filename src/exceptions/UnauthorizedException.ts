import { HTTPException } from './HTTPException';

/**
 * Exception thrown when a request is unauthorized.
 * Typically used for HTTP 401 errors.
 */
export class UnauthorizedException extends HTTPException {

    constructor(message: string, cause?: unknown) {
        super(message, cause, 401);
    }
}

