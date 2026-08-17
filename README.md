# @org-quicko/core

Foundational TypeScript library used across Quicko for shared beans, types, utilities, logger helpers, and exceptions.

## Installation

```bash
npm install @org-quicko/core
```

## Local Development

```bash
npm ci
npm run lint
npm run build
npm run test
```

## Node.js method cache

The `@Cache()` decorator is available only in Node.js. Configure its TTL once during application bootstrap, then add the zero-argument decorator to asynchronous read methods:

```typescript
new CacheConfiguration({ ttl: 60_000 });

class CustomerClient {
	@Cache()
	public async fetchCustomer(organizationId: string, customerId: string) {
		// Fetch the customer.
	}

	@Cache({ ttl: 10_000 })
	public async fetchRecentCustomers(organizationId: string) {
		// This method overrides the globally configured TTL.
	}
}
```

Cache keys include the client instance, method, and complete argument list. Arguments use Node.js `v8.serialize()` and Base64URL encoding. Use data-only arguments whose relevant state is visible to V8 serialization, such as primitives, plain objects, arrays, `Date`, `Map`, `Set`, `BigInt`, and cyclic data graphs.

Do not use custom class behavior, symbol-keyed properties, or non-enumerable properties to determine the result of a cached method. V8 does not include those details in its serialized representation. Unsupported values, such as functions, symbols, promises, `WeakMap`, and `WeakSet`, reject the call before the decorated method runs.

Serialization is order-sensitive. Objects, maps, or sets built in a different insertion order can use different cache entries, even when their data is otherwise equal. This can cause an additional method call, but it does not merge those differently serialized entries.

The generated keys are for a process-local cache. Do not persist them or share them across processes, deployments, or Node.js versions.

## Release Flow

This repo uses GitHub Actions for:

- pull request validation
- release drafting on `main`
- npm publish when a GitHub release is published

PR titles are used in release notes, and labels (`major`, `minor`, `patch`) drive the draft version bump.

## Publishing

1. Update `package.json` version.
2. Merge the change into `main`.
3. Review the draft release on GitHub.
4. Publish the release with a tag that matches the package version.

Example:

- `package.json`: `2.0.5`
- release tag: `v2.0.5`

When the release is published, GitHub Actions will:

- run install, tests, and build
- skip publish if that version already exists on npm
- publish to npm with provenance enabled

## Requirements

- GitHub Actions secret: `NPM_TOKEN`
- correct `package.json` metadata:
  - `repository.url`
  - `homepage`
  - `bugs.url`

If repository metadata does not match `https://github.com/org-quicko/core-js`, npm provenance validation can fail.
