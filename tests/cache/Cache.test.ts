import "reflect-metadata";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { container } from "tsyringe";
import { Cache, CacheConfiguration } from "../../index";
import { AliasedProvider as FirstAliasedProvider } from "./fixtures/FirstAliasedProvider";
import { AliasedProvider as SecondAliasedProvider } from "./fixtures/SecondAliasedProvider";

describe("Cache", () => {
	beforeEach(() => {
		jest.useRealTimers();
		container.reset();
	});

	it("reuses a result for the same instance, method, and arguments", async () => {
		new CacheConfiguration({ ttl: 60_000 });

		class Provider {
			private calls = 0;

			@Cache()
			async load(value: string) {
				this.calls += 1;
				return `${value}:${this.calls}`;
			}
		}

		const provider = new Provider();

		await expect(provider.load("same")).resolves.toBe("same:1");
		await expect(provider.load("same")).resolves.toBe("same:1");
	});

	it("reuses nested object and array arguments with the same data and insertion order", async () => {
		new CacheConfiguration({ ttl: 60_000 });

		class Provider {
			private calls = 0;

			@Cache()
			async load(
				filter: { customer: { identifier: string }; statuses: string[] },
				sort: Array<{ field: string; direction: "ascending" | "descending" }>,
			) {
				this.calls += 1;
				return `${filter.customer.identifier}:${sort[0].field}:${this.calls}`;
			}
		}

		const provider = new Provider();

		await expect(
			provider.load(
				{ customer: { identifier: "customer-1" }, statuses: ["active", "pending"] },
				[{ field: "createdAt", direction: "descending" }],
			),
		).resolves.toBe("customer-1:createdAt:1");
		await expect(
			provider.load(
				{ customer: { identifier: "customer-1" }, statuses: ["active", "pending"] },
				[{ field: "createdAt", direction: "descending" }],
			),
		).resolves.toBe("customer-1:createdAt:1");
	});

	it("does not collide distinct nested object and array arguments", async () => {
		new CacheConfiguration({ ttl: 60_000 });

		class Provider {
			private calls = 0;

			@Cache()
			async load(filter: { customer: { identifier: string } }, statuses: string[]) {
				this.calls += 1;
				return this.calls;
			}
		}

		const provider = new Provider();
		const firstFilter = { customer: { identifier: "customer-1" } };
		const secondFilter = { customer: { identifier: "customer-2" } };

		await expect(provider.load(firstFilter, ["active"])).resolves.toBe(1);
		await expect(provider.load(secondFilter, ["active"])).resolves.toBe(2);
		await expect(provider.load(firstFilter, ["pending"])).resolves.toBe(3);
		await expect(provider.load(firstFilter, ["active"])).resolves.toBe(1);
		await expect(provider.load(secondFilter, ["active"])).resolves.toBe(2);
		await expect(provider.load(firstFilter, ["pending"])).resolves.toBe(3);
	});

	it("rejects unsupported arguments before invoking the decorated method", async () => {
		new CacheConfiguration({ ttl: 60_000 });

		class Provider {
			public invocations = 0;

			@Cache()
			async load(callback: () => string) {
				this.invocations += 1;
				return callback();
			}
		}

		const provider = new Provider();

		await expect(provider.load(() => "value")).rejects.toThrow();
		expect(provider.invocations).toBe(0);
	});

	it("coalesces simultaneous calls for the same instance, method, and arguments", async () => {
		new CacheConfiguration({ ttl: 60_000 });
		let signalStarted!: () => void;
		let releaseLoad!: () => void;
		const started = new Promise<void>((resolve) => {
			signalStarted = resolve;
		});
		const loadGate = new Promise<void>((resolve) => {
			releaseLoad = resolve;
		});

		class Provider {
			public invocations = 0;

			@Cache()
			async load(value: string) {
				this.invocations += 1;
				signalStarted();
				await loadGate;
				return `${value}:${this.invocations}`;
			}
		}

		const provider = new Provider();
		const firstCall = provider.load("same");
		await started;
		const simultaneousCall = provider.load("same");
		releaseLoad();

		await expect(Promise.all([firstCall, simultaneousCall])).resolves.toEqual(["same:1", "same:1"]);
		expect(provider.invocations).toBe(1);
	});

	it("does not collide values from different argument lists", async () => {
		new CacheConfiguration({ ttl: 60_000 });

		class Provider {
			private calls = 0;

			@Cache()
			async load(value: unknown) {
				this.calls += 1;
				return this.calls;
			}
		}

		const provider = new Provider();

		await expect(provider.load("first")).resolves.toBe(1);
		await expect(provider.load("second")).resolves.toBe(2);
		await expect(provider.load("first")).resolves.toBe(1);
		await expect(provider.load("second")).resolves.toBe(2);
	});

	it("does not collide methods on the same instance", async () => {
		new CacheConfiguration({ ttl: 60_000 });

		class Provider {
			@Cache()
			async loadCustomer(identifier: string) {
				return `customer:${identifier}`;
			}

			@Cache()
			async loadCoupon(identifier: string) {
				return `coupon:${identifier}`;
			}
		}

		const provider = new Provider();

		await expect(provider.loadCustomer("shared-id")).resolves.toBe("customer:shared-id");
		await expect(provider.loadCoupon("shared-id")).resolves.toBe("coupon:shared-id");
	});

	it("does not collide separate instances", async () => {
		new CacheConfiguration({ ttl: 60_000 });

		class Provider {
			private calls = 0;

			constructor(private readonly source: string) {}

			@Cache()
			async load(identifier: string) {
				this.calls += 1;
				return `${this.source}:${identifier}:${this.calls}`;
			}
		}

		const first = new Provider("first");
		const second = new Provider("second");

		await expect(first.load("shared-id")).resolves.toBe("first:shared-id:1");
		await expect(second.load("shared-id")).resolves.toBe("second:shared-id:1");
		await expect(first.load("shared-id")).resolves.toBe("first:shared-id:1");
		await expect(second.load("shared-id")).resolves.toBe("second:shared-id:1");
	});

	it("does not collide classes with identical declared names and methods imported under aliases", async () => {
		new CacheConfiguration({ ttl: 60_000 });
		const first = new FirstAliasedProvider();
		const second = new SecondAliasedProvider();

		await expect(first.load("shared-id")).resolves.toBe("first:shared-id:1");
		await expect(second.load("shared-id")).resolves.toBe("second:shared-id:1");
		await expect(first.load("shared-id")).resolves.toBe("first:shared-id:1");
		await expect(second.load("shared-id")).resolves.toBe("second:shared-id:1");
	});

	it("keeps undefined, null, strings, and numbers as distinct arguments", async () => {
		new CacheConfiguration({ ttl: 60_000 });

		class Provider {
			private calls = 0;

			@Cache()
			async load(value: unknown) {
				this.calls += 1;
				return this.calls;
			}
		}

		const provider = new Provider();

		await expect(provider.load(undefined)).resolves.toBe(1);
		await expect(provider.load(null)).resolves.toBe(2);
		await expect(provider.load("1")).resolves.toBe(3);
		await expect(provider.load(1)).resolves.toBe(4);
		await expect(provider.load(undefined)).resolves.toBe(1);
		await expect(provider.load(null)).resolves.toBe(2);
		await expect(provider.load("1")).resolves.toBe(3);
		await expect(provider.load(1)).resolves.toBe(4);
	});

	it("reloads a value after the configured default TTL expires", async () => {
		jest.useFakeTimers();
		new CacheConfiguration({ ttl: 50 });

		class Provider {
			private calls = 0;

			@Cache()
			async load() {
				this.calls += 1;
				return this.calls;
			}
		}

		const provider = new Provider();
		await expect(provider.load()).resolves.toBe(1);
		await expect(provider.load()).resolves.toBe(1);

		await jest.advanceTimersByTimeAsync(51);

		await expect(provider.load()).resolves.toBe(2);
	});

	it("uses the decorator TTL instead of the configured default TTL", async () => {
		jest.useFakeTimers();
		new CacheConfiguration({ ttl: 10_000 });

		class Provider {
			private calls = 0;

			@Cache({ ttl: 50 })
			async load() {
				this.calls += 1;
				return this.calls;
			}
		}

		const provider = new Provider();
		await expect(provider.load()).resolves.toBe(1);
		await expect(provider.load()).resolves.toBe(1);

		await jest.advanceTimersByTimeAsync(51);

		await expect(provider.load()).resolves.toBe(2);
	});

	it("uses the latest positive TTL when cache configuration is replaced", async () => {
		jest.useFakeTimers();
		new CacheConfiguration({ ttl: 10_000 });
		new CacheConfiguration({ ttl: 50 });

		class Provider {
			private calls = 0;

			@Cache()
			async load() {
				this.calls += 1;
				return this.calls;
			}
		}

		const provider = new Provider();
		await expect(provider.load()).resolves.toBe(1);
		await jest.advanceTimersByTimeAsync(51);
		await expect(provider.load()).resolves.toBe(2);
	});

	it("safely bypasses caching when no cache has been configured", async () => {
		class Provider {
			private calls = 0;

			@Cache()
			async load() {
				this.calls += 1;
				return this.calls;
			}
		}

		const provider = new Provider();

		await expect(provider.load()).resolves.toBe(1);
		await expect(provider.load()).resolves.toBe(2);
	});

	it("surfaces the native JavaScript error for a non-extensible instance", async () => {
		new CacheConfiguration({ ttl: 60_000 });
		let invocations = 0;

		class Provider {
			@Cache()
			async load() {
				invocations += 1;
				return invocations;
			}
		}

		const provider = Object.preventExtensions(new Provider());

		await expect(provider.load()).rejects.toBeInstanceOf(TypeError);
		expect(invocations).toBe(0);
	});

	it.each([
		["omitted", {}],
		["zero", { ttl: 0 }],
	])("safely bypasses caching for a %s default TTL", async (_description, options) => {
		new CacheConfiguration(options);

		class Provider {
			private calls = 0;

			@Cache()
			async load() {
				this.calls += 1;
				return this.calls;
			}
		}

		const provider = new Provider();

		await expect(provider.load()).resolves.toBe(1);
		await expect(provider.load()).resolves.toBe(2);
	});

	it("does not cache rejected calls", async () => {
		new CacheConfiguration({ ttl: 60_000 });

		class Provider {
			private calls = 0;

			@Cache()
			async load() {
				this.calls += 1;
				if (this.calls === 1) {
					throw new Error("temporarily unavailable");
				}
				return this.calls;
			}
		}

		const provider = new Provider();

		await expect(provider.load()).rejects.toThrow("temporarily unavailable");
		await expect(provider.load()).resolves.toBe(2);
		await expect(provider.load()).resolves.toBe(2);
	});
});
