# Installing pl-fe as Mitra frontend

Installing `pl-fe` as a frontend for Mitra is no different from installing the default Mitra Web frontend. Just extract the `pl-fe` files into the directory specified in `config.yaml` under `web_client_dir`, by default `/usr/share/mitra/www`.

```sh
curl -O https://pl.mkljczk.pl/pl-fe.zip
unzip pl-fe.zip -d /usr/share/mitra/www
rm pl-fe.zip
```