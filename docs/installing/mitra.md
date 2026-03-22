---
title: Mitra
section: Installing
order: 31
---

# Installing Nicolium as Mitra frontend

Installing Nicolium as a frontend for Mitra is no different from installing the default Mitra Web frontend. Just extract the Nicolium files into the directory specified in `config.yaml` under `web_client_dir`, by default `/usr/share/mitra/www`.

```bash
curl -O https://web.nicolium.app/release.zip
unzip release.zip -d /usr/share/mitra/www
rm release.zip
```