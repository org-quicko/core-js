/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Base class for all custom exceptions in the application.
 * Provides support for error codes and chained exceptions.
 */
export class BaseException extends Error {
    code?: number;
    cause?: unknown;

    constructor(message: string, cause?: unknown, code?: number) {
        super(message);
        this.cause = cause;
        this.code = code;
        this.name = this.constructor.name;
    }

    /**
     * Retrieves the full stack trace of the exception, including causes.
     * @returns A string representation of the stack trace.
     */
    getStackTrace() {
        let stackTrace = `[${this.code}] ${this.stack}\n`;
        let currentCause: unknown = this.cause;
        while (currentCause) {
            if (currentCause instanceof Error) {
                stackTrace += `Caused by: ${currentCause.stack || currentCause.message || String(currentCause)}\n`;
                currentCause = (currentCause as any).cause;
            } else {
                stackTrace += `Caused by: ${String(currentCause)}\n`;
                currentCause = undefined;
            }
        }
        return stackTrace;
    }
}