import { BaseException } from './BaseException';

/**
 * Exception thrown when an illegal or inappropriate argument is passed.
 */
export class IllegalArgumentException extends BaseException {

    constructor(message: string, cause?: unknown) {
        super(message, cause, 500);
    }
}

