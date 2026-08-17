import { serialize } from "node:v8";

/**
 * Resolves keys for process-local method caching.
 *
 * Argument graphs are serialized with Node.js V8 serialization. Keys are valid
 * only for the lifetime and Node.js runtime of the process-local cache.
 */
export class CacheKeyResolver {
	public static resolve(
		instanceIdentifier: string,
		target: object,
		propertyName: string | symbol,
		methodArguments: readonly unknown[],
	): string {
		if (typeof propertyName !== "string") {
			throw new TypeError("@Cache() supports string method names only.");
		}

		const className = target.constructor.name;
		const serializedArguments = serialize(methodArguments).toString("base64url");

		return `${instanceIdentifier}:${className}.${propertyName}:${serializedArguments}`;
	}
}
