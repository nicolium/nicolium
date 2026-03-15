---
title: Contributing to pl-api
section: Contributing
order: 21
---

# Contributing to pl-api

`pl-api` is a TypeScript library for interacting with Mastodon-compatible backends, focused on supporting multiple projects extending the official Mastodon API in incompatible ways. The goal of `pl-api` is to provide a unified, type-safe API for these backends.

It uses a minimal set of dependencies, most importantly [Valibot](https://valibot.dev/) for remote data validation and guaranteeing type safety. Fetch API is used for making HTTP requests.

The development of `pl-api` happens inside the Nicolium monorepo. You can find the source code in the `packages/pl-api` directory of the Nicolium repository.

## Setting up development environment

Setting up Nicolium requires [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) package manager to be installed. Since Node v16.13, Node.js comes with `corepack` pre-installed, which can be used to manage package managers like `pnpm`.
To enable `pnpm` using `corepack`, run the following command:

```bash
corepack enable pnpm
```

You can now proceed to fetching Nicolium Git repository, installing dependencies, and running the development server:

```bash
# Clone the Nicolium repository
git clone https://codeberg.org/nicolium/nicolium.git
cd nicolium
# Install dependencies
pnpm install
# Build the pl-api dependency
pnpm -F pl-api dev
```

This will start a Vite development server where you can use `pl-api` client inside browser devtools console for testing purposes. It is available globally as `window.PlApiClient`.

## Contributing guidelines

Nicolium monorepo is hosted on [Codeberg](https://codeberg.org/nicolium/nicolium) and [GitHub](https://github.comnicolium/nicoliumum). While issues are only tracked on Codeberg, you can submit pull requests on both platforms. Remember to follow the [Code of Conduct](./code-of-conduct.mdx) when interacting with the community.

The project uses [ESLint](https://eslint.org/) for code style checking. You can run the linter using the following command:

```bash
pnpm -F pl-api lint
```

While contributing code, try to follow the existing coding style. Common sense rules regarding contributions apply. Keep your changes focused on a single issue or feature. Do not create pull requests including larger changes you don't understand fully—whether it's from another project or some auto-generated code.