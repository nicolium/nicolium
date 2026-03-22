---
title: Standalone
section: Installing
order: 33
---

# Standalone Nicolium installation

To install Nicolium in standalone mode, allowing to sign in to any instance implementing Mastodon client API, you only need a static web server to serve the files. As usual on single page applications with client-side routing, the server must be configured to fallback to `index.html` for non-matching routes.

## Example Caddy configuration

```caddy
nicolium.example.com {
	root * /var/www/nicolium
  encode
	try_files {path} /index.html
	file_server
}
```

This assumes you're serving Nicolium under the nicolium.example.com domain and the Nicolium files are located in `/var/www/nicolium`. You can download Nicolium from `https://web.nicolium.app/release.zip` or [build it from source](../building/nicolium.md).