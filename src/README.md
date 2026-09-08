# McSquishy: Blob on the Run

This directory contains the browser-only TypeScript application. It uses Vite
for local development and static production builds, and Vitest for automated
tests. The application has no backend or cloud-service dependency.

## Setup

From this directory, install the pinned development dependencies:

```sh
npm install
```

## Commands

Start the local development server:

```sh
npm run dev
```

Create a static production build in `dist/`:

```sh
npm run build
```

Run the automated tests once:

```sh
npm test
```

Check TypeScript without emitting files:

```sh
npm run typecheck
```
