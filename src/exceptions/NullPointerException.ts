import { BaseException } from "./BaseException.js";

/**
 * Exception thrown when an operation is attempted on a `null` or `undefined` value.
 */
export class NullPointerException extends BaseException {

    constructor(message: string, cause?: unknown) {
        super(message, cause, 500);
    }
}

