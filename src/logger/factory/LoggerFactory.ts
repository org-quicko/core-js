import winston, { Logger } from 'winston';

/**
 * A factory class for managing logger instances.
 * Provides methods to retrieve and store loggers in a shared storage.
 */
export const LoggerStorage: Map<string, winston.Logger> = new Map<string, winston.Logger>();

export class LoggerFactory {

    /**
     * Retrieves a logger instance by its name.
     * 
     * @param loggerName The name of the logger to retrieve.
     * @returns The logger instance if found, otherwise `undefined`.
     */
    static getLogger(loggerName: string): winston.Logger | undefined {
        return LoggerStorage.get(loggerName);
    }

    /**
     * Stores a logger instance with the specified name.
     * 
     * @param loggerName The name to associate with the logger.
     * @param logger The logger instance to store.
     */
    static setLogger(loggerName: string, logger: Logger) {
        LoggerStorage.set(loggerName, logger);
    }
}