import "reflect-metadata";
import type { CreateCacheOptions } from "cache-manager";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { container } from "tsyringe";
import { Cache, CacheConfiguration } from "../../index";

type CacheStore = NonNullable<CreateCacheOptions["stores"]>[number];

class ObservingStore {
	readonly values = new Map<string, unknown>();
	readonly writes: Array<{ key: string; ttl: number | undefined }> = [];

	async get(key: string) {
		return this.values.get(key);
	}

	async set(key: string, value: unknown, ttl?: number) {
		this.writes.push({ key, ttl });
		this.values.set(key, value);
		return true;
	}

	async delete(key: string) {
		return this.values.delete(key);
	}

	async clear() {
		this.values.clear();
	}
}

describe("CacheConfiguration", () => {
	beforeEach(() => {
		container.reset();
	});

	it("lets cache-manager apply the configured default TTL", async () => {
		const store = new ObservingStore();
		new CacheConfiguration({
			ttl: 4_321,
			stores: [store as unknown as CacheStore],
		});

		class Provider {
			@Cache()
			async load() {
				return "loaded";
			}
		}

		await new Provider().load();

		expect(store.writes).toHaveLength(1);
		expect(store.writes[0].ttl).toBe(4_321);
	});

	it("generates keys that begin with an instance identifier and have no legacy prefix", async () => {
		const store = new ObservingStore();
		new CacheConfiguration({
			ttl: 60_000,
			stores: [store as unknown as CacheStore],
		});

		class Provider {
			@Cache()
			async first(value: string) {
				return `first:${value}`;
			}

			@Cache()
			async second(value: string) {
				return `second:${value}`;
			}
		}

		const firstInstance = new Provider();
		const secondInstance = new Provider();
		await firstInstance.first("value");
		await firstInstance.second("value");
		await secondInstance.first("value");

		const [firstMethodKey, secondMethodKey, secondInstanceKey] = store.writes.map(({ key }) => key);
		const firstInstanceIdentifier = firstMethodKey.split(":", 1)[0];
		const secondInstanceIdentifier = secondInstanceKey.split(":", 1)[0];

		expect(firstInstanceIdentifier).not.toBe("");
		expect(secondMethodKey.startsWith(`${firstInstanceIdentifier}:`)).toBe(true);
		expect(secondInstanceIdentifier).not.toBe(firstInstanceIdentifier);
		expect(store.writes.every(({ key }) => !key.startsWith("cache:v1:"))).toBe(true);
	});

});
