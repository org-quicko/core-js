import winston from 'winston';

/**
 * Interface for creating logger instances.
 * Provides a method to create a logger with optional configuration.
 */
export interface LoggerProvider {
    /**
     * Creates a logger instance.
     * @param config Optional configuration for the logger.
     * @returns A promise that resolves to a Winston logger instance.
     */
    createLogger(config?: unknown): Promise<winston.Logger>;
}
