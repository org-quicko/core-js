import winston from "winston";
import { ClientException } from "../exceptions/ClientException.js";
import { LoggingLevel } from "../types/LoggingLevel.js";

/**
 * A factory class for managing logger instances.
 * Provides methods to retrieve and store loggers in a shared storage.
 */
export const loggers: Map<string, winston.Logger> = new Map<string, winston.Logger>();

export class LoggerFactory {
  /**
   * Retrieves a logger instance by its name.
   *
   * @param name The name of the logger to retrieve.
   * @returns The logger instance if found, otherwise `undefined`.
   */
  static createLogger(
    name: string,
    level: LoggingLevel = LoggingLevel.info
  ): winston.Logger | undefined {

    const label = typeof name === "string" ? name : "Unknown";

    if (loggers.has(label)) {
      return loggers.get(label);
    }

    try {
      const logger = winston.createLogger({
        level: level,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        defaultMeta: { label },
        transports: [new winston.transports.Console()],
      });

      loggers.set(label, logger);

      return logger;
    } catch (error) {
      throw new ClientException(`Error creating logger`, error, 500);
    }
  }
}
