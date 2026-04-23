---
title: Pleroma/Akkoma
section: Installing
order: 32
---

# Installing Nicolium as Pleroma/Akkoma frontend

## Installation in instance static directory

The most straightforward way to install Nicolium as a frontend for Pleroma or Akkoma is to simply download it and place its files in the `/instance/static` directory of your Pleroma/Akkoma installation (usually `/opt/pleroma/instance/static` or `/opt/akkoma/instance/static`, accordingly).

> **Note:** This assumes you want to use the stable release version of Nicolium. If you want to use the development version (which is more cutting-edge but can break sometimes), replace `release` with `develop` in the URLs and commands below.

```bash
curl -O https://web.nicolium.app/release.zip
unzip release.zip -d /opt/pleroma/instance/static/
rm release.zip
```

## Installation via Pleroma/Akkoma frontend management

It is also possible to use the Pleroma/Akkoma frontend management tool. You can find more information about it in the [Pleroma documentation](https://docs.pleroma.social/backend/administration/frontends-management/). You can use either the PleromaFE built-in admin dashboard or the older AdminFE to install Nicolium and set it as the server frontend. You don't have to provide any URL. It's right there in Pleroma/Akkoma (under the name `pl-fe`).

To install it from CLI, use:

### OTP
```bash
./bin/pleroma_ctl frontend install nicolium --ref release --build-url https://web.nicolium.app/release.zip --build-dir .
```

### From Source

```bash
mix pleroma.frontend install nicolium --ref release --build-url https://web.nicolium.app/release.zip --build-dir .
```

It is now possible to set Nicolium as the primary frontend in the configuration file or via AdminFE:
```elixir
config :pleroma, :frontends,
  primary: %{
    "name" => "nicolium", # Use `pl-fe` if you installed it via Pleroma/Akkoma dashboard
    "ref" => "release"
  },
  ...
```

On Akkoma, it is also possible for individual users to select their preferred frontend to Nicolium by visiting `/akkoma/frontend` page on their Akkoma instance.