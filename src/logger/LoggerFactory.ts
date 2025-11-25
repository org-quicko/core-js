import winston, { LoggerOptions } from "winston";
import { BaseException } from "../exceptions";
import { ErrorFormat } from "./format/ErrorFormat";

/**
 * Factory class for creating and managing Winston logger instances.
 *
 * @description
 * Provides centralized management of logger instances with consistent configuration.
 * Supports custom logging levels, formats, and transports while maintaining a shared
 * logger instance for the application.
 *
 * @example
 * ```typescript
 * const logger = LoggerFactory.createLogger({
 *   level: 'info',
 *   transports: [new winston.transports.Console()]
 * });
 *
 * const childLogger = LoggerFactory.getLogger('MyModule');
 * childLogger.info('Application started');
 * ```
 */
export class LoggerFactory {
  /** @type {winston.Logger} Shared logger instance managed by the factory */
  static logger: winston.Logger;

  /**
   * Creates and initializes a logger instance with the provided configuration.
   *
   * @description
   * Initializes a new Winston logger with combined default and custom formats.
   * Default format includes timestamp, error formatting with cause chains,
   * error handling, JSON formatting, and pretty printing.
   *
   * @param {LoggerOptions} options - Winston logger configuration options
   * @param {string} [options.level='info'] - Logging level (error, warn, info, http, debug, verbose, silly)
   * @param {winston.LogFormat} [options.format] - Additional custom format to combine with defaults
   * @param {object} [options.defaultMeta] - Default metadata to add to all log entries
   * @param {winston.transport[]} [options.transports] - Transport instances (defaults to Console)
   *
   * @returns {winston.Logger} Configured logger instance
   *
   * @throws {BaseException} If logger initialization fails
   *
   * @example
   * ```typescript
   * const logger = LoggerFactory.createLogger({
   *   level: 'debug',
   *   defaultMeta: { service: 'api-service' },
   *   transports: [
   *     new winston.transports.Console(),
   *     new winston.transports.File({ filename: 'combined.log' })
   *   ]
   * });
   * ```
   *
   * @note
   * **Known Issue**: Static logger is overwritten every time `createLogger()` is called.
   * If another part of your program calls `createLogger()` again, all modules will switch
   * to the new logger configuration unexpectedly. Consider initializing the logger once
   * during application startup and reusing it via `getLogger()`.
   */
  static createLogger(
    options: LoggerOptions
  ): winston.Logger {
    LoggerFactory.logger = LoggerFactory.init(options);

    return LoggerFactory.logger;
  }

  /**
   * Initializes a Winston logger with default and custom format configurations.
   *
   * @description
   * Internal method that sets up the logger with a standard format pipeline:
   * 1. Timestamp - adds ISO timestamp to all log entries
   * 2. ErrorFormat - serializes error cause chains for complete error context
   * 3. Error handling - captures stack traces and cause information
   * 4. JSON formatting - converts logs to JSON structure
   * 5. Pretty printing - formats output for readability
   *
   * Custom formats are combined with the default pipeline for flexibility.
   *
   * @param {LoggerOptions} options - Logger configuration options
   *
   * @returns {winston.Logger} Initialized logger instance
   *
   * @throws {BaseException} Wraps any initialization errors with context
   *
   * @private
   */
  private static init(
    options: LoggerOptions
  ) {
    try {
      const defaultFormat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true, cause: true }),
        ErrorFormat(),
        winston.format.json()
      );

      const logger = winston.createLogger({
        level: options.level,
        format: options.format
          ? winston.format.combine(
              defaultFormat,
              options.format
            )
          : defaultFormat,
        defaultMeta: options.defaultMeta,
        transports: options.transports
          ? options.transports
          : [new winston.transports.Console()],
      });

      return logger;
    } catch (error) {
      throw new BaseException(`Error creating logger`, error, 500);
    }
  }

  /**
   * Retrieves a child logger instance with additional context metadata.
   *
   * @description
   * Creates a child logger from the shared logger instance that inherits all configuration
   * but adds a label and optional metadata for request-specific or module-specific logging.
   * Child loggers are useful for tracking logs by module, request ID, user ID, etc.
   *
   * @param {string} label - Identifier for the logger (typically module or request name)
   * @param {object} [options] - Additional metadata to include in all logs from this logger
   *
   * @returns {winston.Logger} Child logger instance with combined metadata
   *
   * @throws {BaseException} If no shared logger has been initialized via createLogger()
   *
   * @example
   * ```typescript
   * const moduleLogger = LoggerFactory.getLogger('UserService', {
   *   requestId: '12345',
   *   userId: 'user-789'
   * });
   *
   * moduleLogger.info('User authenticated'); // Includes label and additional metadata
   * ```
   */
  static getLogger(
    label: string,
    options?: object
  ): winston.Logger {
    if (LoggerFactory.logger) {
      return LoggerFactory.logger.child({ label, ...options });
    } else {
      throw new BaseException(`Logger not found`, 500);
    }
  }
}
