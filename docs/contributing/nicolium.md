---
title: Contributing to Nicolium
section: Contributing
order: 20
---

# Contributing to Nicolium

The page intends to provide a technical overview of the Nicolium codebase and guidelines for potential contributors.

## Used technologies

Nicolium is a single page application built using the [React](https://react.dev/) framework. It uses [TypeScript](https://www.typescriptlang.org/) as the programming language and [Vite](https://vitejs.dev/) as the build tool. Routing is handled by [TanStack Router](https://tanstack.com/router/latest). Client state management is done using [Zustand](https://zustand-demo.pmnd.rs/) and server state management using [TanStack Query](https://tanstack.com/query/latest).

> **Note:** Important parts of Nicolium are currently being refactored to use a different set of libraries. You can find occurrences of tools being phased out, like Redux or TailwindCSS. Larger contributions should wait until the refactor is complete.

Nicolium also uses `pl-api` library for interacting with the Mastodon-compatible backends. The goal of `pl-api` is to provide a unified, type-safe API for multiple backends extending Mastodon API in incompatible ways. You can find the `pl-api` source code in the `packages/pl-api` directory of the Nicolium repository.

## Setting up development environment

Setting up Nicolium requires [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) package manager to be installed. Since Node v16.13, Node.js comes with `corepack` pre-installed, which can be used to manage package managers like `pnpm`.
To enable `pnpm` using `corepack`, run the following command:

```bash
corepack enable pnpm
```

You can now proceed to fetching Nicolium Git repository, installing dependencies, and—finally—running the development server:

```bash
# Clone the Nicolium repository
git clone https://codeberg.org/nicolium/nicolium.git
cd nicolium
# Install dependencies
pnpm install
# Build the pl-api dependency
pnpm -F pl-api build # Use `pnpm -F pl-api watch` if you want to develop pl-api alongside Nicolium
# Run the Nicolium development server (by default at http://localhost:7312)
pnpm -F nicolium dev
```

The server supports hot module reloading, so any changes you make to the source code will be reflected in the browser automatically.

<!-- TODO: turn those into tip/note again -->
> **Tip:** You can install the [React Developer Tools](https://react.dev/learn/react-developer-tools) browser extension to inspect components, their props and state. It might help you understand the application better and identify performance problems. It is available for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/), [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) (and compatible Chromium-based browsers) and [Edge](https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil).

## Testing

Nicolium has test infrastructure configured with Vitest, though only few files are covered with tests. You can run the test suite with:

```bash
pnpm -F nicolium test
```

For watch mode during development:

```bash
pnpm -F nicolium test:watch
```

## Contributing guidelines

Nicolium hosts its repository on [Codeberg](https://codeberg.org/nicolium/nicolium) and [GitHub](https://github.comnicolium/nicoliumum). While issues are only tracked on Codeberg, you can submit pull requests on both platforms. Remember to follow the [Code of Conduct](./code-of-conduct.mdx) when interacting with the community.
The project uses [ESLint](https://eslint.org/) and [Stylelint](https://stylelint.io/) for code style checking, which is automatically run on every commit using [Husky](https://typicode.github.io/husky). You can run the linters manually using the following command:

```bash
pnpm -F nicolium lint
```

While contributing code, try to follow the existing coding style. Common sense rules regarding contributions apply. Keep your changes focused on a single issue or feature. Do not create pull requests including larger changes you don't understand fully—whether it's from another project or some auto-generated code.

## Localization

[React Intl](https://formatjs.github.io/docs/react-intl/) is used for localizing Nicolium. All user-visible strings, unless provided by backend, should be made translatable.

Before committing changes adding or modifying user-visible strings, make sure to extract the messages using the following command:

```bash
pnpm -F nicolium i18n
```

You can help translating Nicolium into your language on [Weblate](https://hosted.weblate.org/projects/nicolium/).

<a href="https://hosted.weblate.org/engage/nicolium/">
<img src="https://hosted.weblate.org/widget/nicolium/287x66-grey.png" alt="Translation status" />
</a>