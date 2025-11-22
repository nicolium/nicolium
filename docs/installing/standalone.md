# Standalone pl-fe installation

To install `pl-fe` in standalone mode, allowing to sign in to any instance implementing Mastodon client API, you only need a static web server to serve the files. As usual on single page applications with client-side routing, the server must be configured to fallback to `index.html` for non-matching routes.

## Example Caddy configuration

```caddy
pl-fe.example.com {
	root * /var/www/pl-fe
  encode
	try_files {path} /index.html
	file_server
}
```

This assumes you're serving `pl-fe` under the pl-fe.example.com domain and the `pl-fe` files are located in `/var/www/pl-fe`. You can download `pl-fe` from `https://pl.mkljczk.pl/pl-fe.zip` or [build it from source](../building.md).