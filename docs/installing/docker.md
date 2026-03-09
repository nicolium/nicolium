---
title: Docker
section: Installing
order: 34
---

# Docker

To install via docker, one can use the following `docker-compose.yml` file:

```yaml
services:
  app:
    build:
      context: .
    ports:
      - "8080:80"
```
