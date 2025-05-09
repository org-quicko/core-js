import { HTTPException } from './HTTPException';

/**
 * Exception thrown for client-side errors.
 * Typically used for HTTP 4xx errors.
 */
export class ClientException extends HTTPException {

    constructor(message: string, cause?: unknown, code: number = 500) {
        super(message, cause, code);
    }
}

