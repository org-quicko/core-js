import { HTTPException } from './HTTPException.js';

/**
 * Exception thrown when a bad request is made to the server.
 * Typically used for HTTP 400 errors.
 */
export class BadRequestException extends HTTPException {

    constructor(message: string, cause?: unknown, code: number = 400) {
        super(message, cause, code)
    }
}
