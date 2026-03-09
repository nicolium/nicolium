---
title: Iceshrimp.NET
section: Installing
order: 30
---

# Installing Nicolium as Iceshrimp.NET frontend

Iceshrimp.NET does not have built-in support for alternative frontends. However, there are ways to use Nicolium as the frontend for Iceshrimp.NET by rerouting specific requests using a reverse proxy like Nginx.

While this is the only way to use some of Iceshrimp.NET-specific features with Nicolium, because of Iceshrimp.NET CORS configuration, remember that it doesn't have full feature parity with the default Iceshrimp.NET frontend. You might prefer using Nicolium [in standalone mode](./standalone.md) instead.

## Example Nginx configuration

(Assuming Nicolium files are located in `/var/www/nicolium`)

```nginx
map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}

map "$http_accept,$http_content_type" $maybe_activitypub {
  default @nicolium;

  "~application/json" @shrimp;
  "~application/activity\+json" @shrimp;
  "~application/ld\+json" @shrimp;
  "~application/ld\+json; *profile=\"https://www.w3.org/ns/activitystreams\"" @shrimp;
}

server {
  server_name iceshrimp.example.com;
  root /var/www/nicolium/;

  location ~ ^/(Components|openapi|scalar|swagger|css|_content|js|files|avatars|banners|api|inbox|oauth|admin|manifest.json|nodeinfo|.well-known|@(.+)$|[a-zA-Z0-9.]+.css$) {
    try_files /dev/null @shrimp;
  }

  location / {
    try_files $uri $maybe_activitypub;
  }

  location ~ ^/(users|notes|threads|inbox|emoji|@(.+)) {
    try_files /dev/null $maybe_activitypub;
  }

  location @nicolium {
    try_files /index.html /dev/null;
  }

  location @shrimp {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
  }

  listen 443 ssl;
}
```

## Example Caddy configuration

There is also a Caddyfile made by [Alexia](https://cyrneko.eu/) used by [The Starlight Network](https://shrimp.starlightnet.work/) instance. You can find it and read more about it [here](https://forge.starlightnet.work/Team/configurations/src/pl-fe).
