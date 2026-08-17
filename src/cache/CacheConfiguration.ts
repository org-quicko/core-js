import { createCache, type Cache as CacheManager, type CreateCacheOptions } from "cache-manager";
import { container, type InjectionToken } from "tsyringe";

/** Runtime dependency-injection token for the shared cache-manager instance. */
export const CACHE_INJECTION_TOKEN: InjectionToken<CacheManager> = Symbol.for("@org-quicko/core/CACHE_INJECTION_TOKEN");

/**
 * Creates the cache-manager instance used by `@Cache()`. Construct once during application bootstrap.
 * Generated keys are Node.js runtime-local and must not be shared with another process or persisted across restarts.
 */
export class CacheConfiguration {
	constructor(options: CreateCacheOptions = {}) {
		if ((options.ttl ?? 0) === 0) {
			return;
		}

		container.registerInstance<CacheManager>(CACHE_INJECTION_TOKEN, createCache(options));
	}
}
