import "reflect-metadata";
import type { Cache as CacheManager } from "cache-manager";
import { randomUUID } from "node:crypto";
import { container } from "tsyringe";
import { CACHE_INJECTION_TOKEN } from "./CacheConfiguration";
import { CacheKeyResolver } from "./CacheKeyResolver";

const CACHE_INSTANCE_IDENTIFIER = Symbol.for("@org-quicko/core/cache/instanceIdentifier");

export interface CacheOptions {
	/** Method-level TTL in milliseconds. Overrides the cache-manager default TTL when provided. */
	ttl?: number;
}

function getInstanceIdentifier(instance: object): string {
	const existingIdentifier = Reflect.get(instance, CACHE_INSTANCE_IDENTIFIER) as unknown;
	if (typeof existingIdentifier === "string") {
		return existingIdentifier;
	}

	const instanceIdentifier = randomUUID();
	Object.defineProperty(instance, CACHE_INSTANCE_IDENTIFIER, {
		value: instanceIdentifier,
		enumerable: false,
		writable: false,
		configurable: false,
	});

	return instanceIdentifier;
}

/**
 * Caches an asynchronous Node.js method with the centrally configured cache-manager TTL.
 * A method-level TTL can override the configured default.
 * Cache keys are resolved automatically from the active instance, method, and data-only arguments.
 * See the package README for the V8 serialization contract and limitations.
 */
export function Cache(options: CacheOptions = {}) {
	return function (target: object, propertyName: string | symbol, descriptor: PropertyDescriptor): void {
		const originalMethod = descriptor.value as (this: object, ...methodArguments: unknown[]) => Promise<unknown>;

			descriptor.value = async function (this: object, ...methodArguments: unknown[]): Promise<unknown> {
			if (!container.isRegistered(CACHE_INJECTION_TOKEN)) {
				return originalMethod.apply(this, methodArguments);
			}

			const cacheManager = container.resolve<CacheManager>(CACHE_INJECTION_TOKEN);
			const instanceIdentifier = getInstanceIdentifier(this);
			const cacheKey = CacheKeyResolver.resolve(
				instanceIdentifier,
				target,
				propertyName,
				methodArguments,
			);

			return cacheManager.wrap(cacheKey, () => originalMethod.apply(this, methodArguments), options.ttl);
		};
	};
}
