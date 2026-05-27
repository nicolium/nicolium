---
title: Mitra
section: Installing
order: 31
---

# Installing Nicolium as Mitra frontend

Installing Nicolium as a frontend for Mitra is no different from installing the default Mitra Web frontend. Just extract the Nicolium files into the directory specified in `config.yaml` under `web_client_dir`, by default `/usr/share/mitra/www`.

> **Note:** This assumes you want to use the stable release version of Nicolium. If you want to use the development version (which is more cutting-edge but can break sometimes), replace `release` with `develop` in the URLs and commands below.

```bash
curl -OL https://web.nicolium.app/release.zip
unzip release.zip -d /usr/share/mitra/www
rm release.zip
```