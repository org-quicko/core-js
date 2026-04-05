# core

Foundational Node.js library built with TypeScript used across Quicko.

## Installation

```bash
npm install @org-quicko/core
```

## Release Flow

This repository uses GitHub Actions to separate pull request validation, release drafting, and npm publishing.

- Pull requests run install, date util tests, and build validation.
- Pushes to `main` update the next draft release using Release Drafter.
- Publishing happens only when a GitHub release is published.

### Publishing A New Version

1. Update the version in `package.json`.
2. Merge the change into `main`.
3. Review the drafted GitHub release.
4. Publish the release with a tag that matches the package version, for example `v2.0.4`.

When the release is published, GitHub Actions will:

- verify the release tag matches `package.json`
- run install, tests, and build
- skip publish if that version already exists on npm
- publish the package to npm using the configured `NPM_TOKEN`
