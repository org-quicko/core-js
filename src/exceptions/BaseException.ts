/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Base class for all custom exceptions in the application.
 * Provides support for error codes and chained exceptions.
 */
export class BaseException extends Error {
    code?: number;

    constructor(message: string, cause?: unknown, code?: number) {
        super(message,{ cause });
        this.code = code;
        this.name = this.constructor.name;
    }
}