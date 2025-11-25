import winston from "winston";
import { TransformableInfo } from "logform";

/**
 * Winston log format for handling Error objects with cause chains.
 *
 * @description
 * ES2022 supports adding a `cause` property to Error objects for better error context.
 * While `console.log(err)` prints the entire cause chain automatically, Winston only logs
 * the top-level error, losing the cause chain context.
 *
 * This format ensures that error cause chains are fully serialized and included in log output,
 * preserving the complete error context for better debugging and error tracking.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause | MDN: Error.cause}
 * @see {@link https://github.com/winstonjs/winston/issues/2533 | Winston Issue #2533}
 *
 * @param {TransformableInfo} info - The log entry information from Winston
 * @returns {TransformableInfo} The formatted log entry with serialized error chains
 *
 * @example
 * ```typescript
 * const logger = winston.createLogger({
 *   format: winston.format.combine(
 *     ErrorFormat,
 *     winston.format.json()
 *   ),
 *   transports: [new winston.transports.Console()]
 * });
 *
 * try {
 *   throw new Error("Original error");
 * } catch (err) {
 *   throw new Error("Wrapper error", { cause: err });
 * }
 * ```
 */
export const ErrorFormat = winston.format((info: TransformableInfo) => {
  // If the log entry itself is an error
  if (info instanceof Error) {
    const serialized = deepSerialize(info);

    // Preserve Winston semantics by setting standard error properties
    info.message = serialized.message;
    info.stack = serialized.stack;
    info.cause = serialized.cause;

    // Copy all other enumerable properties from serialized error
    for (const key of Object.keys(serialized)) {
      if (!["message", "stack", "name", "cause"].includes(key)) {
        info[key] = serialized[key];
      }
    }

    return info;
  }

  // For normal log entries, serialize any nested error fields
  for (const key of Object.keys(info)) {
    info[key] = deepSerialize(info[key]);
  }

  return info;
});


/**
 * Recursively serializes values that may contain Error objects.
 *
 * @description
 * Handles all types of values including Error instances, nested objects, arrays,
 * and primitives. Ensures that Error objects are fully serialized with their
 * stack traces, messages, and cause chains preserved.
 *
 * @param {any} value - The value to serialize. Can be any type (Error, object, array, primitive)
 * @returns {any} The serialized value with all Error objects converted to plain objects
 *
 * @example
 * ```typescript
 * const error = new Error("Test");
 * const serialized = deepSerialize(error);
 * // Returns: { message: "Test", name: "Error", stack: "...", cause: undefined }
 * ```
 */
function deepSerialize(value: any): any {
  // 1. Direct Error instance - convert to serializable object
  if (value instanceof Error) {
    const serialized: any = {
      message: value.message,
      name: value.name,
      stack: value.stack,
      cause: value.cause instanceof Error ? deepSerialize(value.cause) : value.cause,
    };

    // Copy enumerable custom properties (e.g., error.code, error.statusCode)
    for (const key of Object.keys(value)) {
      if (!(key in serialized)) {
        serialized[key] = deepSerialize(value[key]);
      }
    }

    return serialized;
  }

  // 2. Array - recursively serialize each element
  if (Array.isArray(value)) {
    return value.map((v) => deepSerialize(v));
  }

  // 3. Object - recursively serialize property values
  if (value && typeof value === "object") {
    const result: any = {};
    for (const key of Object.keys(value)) {
      result[key] = deepSerialize(value[key]);
    }
    return result;
  }

  // 4. Primitive value - return as-is
  return value;
}