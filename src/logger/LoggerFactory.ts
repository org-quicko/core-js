import winston, { Logger, LoggerOptions } from "winston";
import { BaseException } from "../exceptions";
import { ErrorFormat } from "./format/ErrorFormat";
import { LoggingLevel } from "../types";

/**
 * Factory class for creating and managing Winston logger instances.
 *
 * @description
 * Provides a factory for creating Winston logger instances with consistent configuration.
 * Supports custom logging levels, formats, and transports with a default format pipeline
 * that includes timestamp, error handling with cause chains, and JSON formatting.
 *
 * @example
 * ```typescript
 * // Create a logger with custom configuration
 * const logger = LoggerFactory.createLogger({
 *   level: 'info',
 *   transports: [new winston.transports.Console()]
 * });
 *
 * // Create another logger and add a label to it
 * const apiLogger = LoggerFactory.getLogger('api-service');
 * apiLogger.info('Server started');
 * ```
 */
export class LoggerFactory {
  /**
   * Base logger instance used by the factory.
   *
   * @description
   * Currently stores a single base logger instance per execution context.
   * This design can be extended in the future to support multiple base loggers
   * by replacing this single instance with a Map-based container (similar to Winston's Container API)
   * to manage multiple named logger configurations.
   *
   * @type {winston.Logger}
   * @private
   */
  private static logger: winston.Logger;

  /**
   * Creates and initializes a new logger instance with the provided configuration.
   *
   * @description
   * Creates a new Winston logger with a consistent default format pipeline that includes
   * timestamp, error handling with stack traces and cause chains, custom error formatting,
   * and JSON output. Custom formats are combined with the defaults. If no transports are
   * specified, defaults to Console transport.
   *
   * @param {LoggerOptions} [options] - Optional Winston logger configuration options
   * @param {LoggingLevel} [options.level='info'] - Logging level (error, warn, info, http, debug, verbose, silly)
   * @param {winston.LogFormat} [options.format] - Additional custom format to combine with defaults
   * @param {object} [options.defaultMeta] - Default metadata to include in all log entries from this logger
   * @param {winston.transport[]} [options.transports] - Transport instances (defaults to Console)
   *
   * @returns {winston.Logger} Configured logger instance
   *
   * @throws {BaseException} If logger initialization fails
   *
   * @example
   * ```typescript
   * // Create a logger with custom configuration
   * const logger = LoggerFactory.createLogger({
   *   level: 'debug',
   *   defaultMeta: { service: 'api' },
   *   transports: [
   *     new winston.transports.Console(),
   *     new winston.transports.File({ filename: 'combined.log' })
   *   ]
   * });
   * ```
   */
  static createLogger(options?: LoggerOptions): winston.Logger {
    try {
      const defaultFormat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true, cause: true }),
        ErrorFormat(),
        winston.format.json()
      );

      LoggerFactory.logger = winston.createLogger({
        level: options?.level ?? LoggingLevel.info,
        format: options?.format
          ? winston.format.combine(options.format, defaultFormat)
          : defaultFormat,
        defaultMeta: options?.defaultMeta,
        transports: options?.transports
          ? options.transports
          : [new winston.transports.Console()],
      });

      return LoggerFactory.logger;
    } catch (error) {
      throw new BaseException(`Error creating logger`, error, 500);
    }
  }

  /**
   * Gets a logger instance with a label added to the metadata.
   *
   * @description
   * Returns a logger instance that is a child of the base logger with the provided label
   * added as metadata. Each call creates a new child logger with the specified label.
   * This is useful for identifying the source of log messages by module or service name.
   *
   * @param {string} label - Unique identifier for the logger to include in metadata (e.g., module name, service name)
   *
   * @returns {winston.Logger} Child logger instance with the label in metadata
   *
   * @example
   * ```typescript
   * // Create a logger with a label for the UserService module
   * const logger = LoggerFactory.getLogger('UserService');
   *
   * // Another module can create its own labeled logger
   * const apiLogger = LoggerFactory.getLogger('APIHandler');
   *
   * logger.info('Processing user request'); // Log includes { label: 'UserService' }
   * ```
   */
  static getLogger(label: string): winston.Logger {
    let baseLogger: winston.Logger;
    if (LoggerFactory.logger) {
      baseLogger = LoggerFactory.logger!;
    } else {
      baseLogger = LoggerFactory.createLogger();
    }

    return baseLogger.child({ label });
  }
  
}
