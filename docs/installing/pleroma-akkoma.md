---
title: Pleroma/Akkoma
section: Installing
order: 32
---

# Installing Nicolium as Pleroma/Akkoma frontend

## Installation in instance static directory

The most straightforward way to install Nicolium as a frontend for Pleroma or Akkoma is to simply download it and place its files in the `/instance/static` directory of your Pleroma/Akkoma installation (usually `/opt/pleroma/instance/static` or `/opt/akkoma/instance/static`, accordingly).

```bash
curl -O https://pl.mkljczk.pl/pl-fe.zip
unzip pl-fe.zip -d /opt/pleroma/instance/static/
rm pl-fe.zip
```

## Installation via Pleroma/Akkoma frontend management

It is also possible to use the Pleroma/Akkoma frontend management tool. You can find more information about it in the [Pleroma documentation](https://docs.pleroma.social/backend/administration/frontends-management/). You can use either the PleromaFE built-in admin dashboard or the older AdminFE to install Nicolium and set it as the server frontend. You don't have to provide any URL. It's right there in Pleroma/Akkoma.

To install it from CLI, use:

### OTP
```bash
./bin/pleroma_ctl frontend install pl-fe --ref develop --build-url https://pl.mkljczk.pl/pl-fe.zip --build-dir .
```

### From Source

```bash
mix pleroma.frontend install pl-fe --ref develop --build-url https://pl.mkljczk.pl/pl-fe.zip --build-dir .
```

It is now possible to set Nicolium as the primary frontend in the configuration file or via AdminFE:
```elixir
config :pleroma, :frontends,
  primary: %{
    "name" => "pl-fe",
    "ref" => "develop"
  },
  ...
```

On Akkoma, it is also possible for individual users to select their preferred frontend to Nicolium by visiting `/akkoma/frontend` page on their Akkoma instance.