import winston from 'winston';
import { ClientException } from '../../exceptions';
import { LoggingLevel } from '../../types';
import { MDC } from '../MDC';
import { LoggerProvider } from './LoggerProvider';

const addMdcDataFormat = winston.format((info) => {
    info.path = MDC.get('path');
    info.transaction_id = MDC.get('x-api-transaction-id');
    return info;
});

/**
 * Implementation of the `LoggerProvider` interface that creates
 * a Winston logger configured to log to the console.
 */
export class ConsoleLoggerProvider implements LoggerProvider {

    /**
     * Creates a Winston logger instance configured for console logging.
     * The logger includes MDC (Mapped Diagnostic Context) data, timestamps,
     * and JSON formatting.
     *
     * @returns A promise that resolves to a Winston logger instance.
     * @throws ClientException If an error occurs while creating the logger.
     */
    async createLogger(): Promise<winston.Logger> {
        try {
            const logLevel = LoggingLevel[(process.env.LOG_LEVEL || 'info').trim().toLowerCase()];
            const logger = winston.createLogger({
                level: logLevel.toLowerCase(),
                format: winston.format.combine(
                    addMdcDataFormat(),
                    winston.format.timestamp(),
                    winston.format.json()
                ),
                transports: [new winston.transports.Console()]
            });
            return logger;
        } catch (error) {
            throw new ClientException(`Error creating logger`, error, 500);
        }
    }
}