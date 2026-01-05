# Building pl-fe

Building pl-fe requires [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) package manager to be installed. Since Node v16.13, Node.js comes with `corepack` pre-installed, which can be used to manage package managers like `pnpm`.

To enable `pnpm` using `corepack`, run the following command:

```bash
corepack enable pnpm
```

You can now proceed to fetching pl-fe Git repository, installing dependencies, and building the project:

```bash
# Clone the pl-fe repository
git clone https://codeberg.org/mkljczk/pl-fe.git
cd pl-fe
# Install dependencies
pnpm install
# Build the pl-api dependency
pnpm -F pl-api build
# Build the pl-fe project
pnpm -F pl-fe build
```

The built files will be located in the `packages/pl-fe/dist` directory. You can [serve them using a static web server](./installing/standalone.md).

Following environment variables can be used to customize the instance in build process:

- `BACKEND_URL` - URL of the Mastodon-compatible instance to connect to. If not set, tries fetching /api/v1/instance from the origin and falls back to standalone mode.
- `FE_SUBDIRECTORY` - The path where pl-fe is mounted to. Defaults to `/`.
- `WITH_LANDING_PAGE` - Displays the landing page on the home page, when running in standalone mode.