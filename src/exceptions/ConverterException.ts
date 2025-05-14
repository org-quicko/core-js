import { BaseException } from "./BaseException.js";

/**
 * Exception thrown when a conversion operation fails.
 */
export class ConverterException extends BaseException {

    constructor(message: string, cause?: unknown) {
        super(message, cause, 500);
    }
}

