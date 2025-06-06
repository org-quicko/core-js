import { HTTPException } from './HTTPException';

/**
 * Exception thrown when access to a resource is forbidden.
 * Typically used for HTTP 403 errors.
 */
export class ForbiddenAccessException extends HTTPException {

    constructor(message: string, cause?: unknown) {
        super(message, cause, 403);
    }
}

