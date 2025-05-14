import { BaseException } from './BaseException.js';

/**
 * Base class for HTTP-related exceptions.
 * Provides support for HTTP status codes.
 */
export abstract class HTTPException extends BaseException {

    constructor(message: string, cause?: unknown, code: number = 500) {
        super(message, cause, code);
    }

}