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
