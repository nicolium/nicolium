FROM node:22-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY ./.npmrc .

COPY ./pnpm-lock.yaml .
COPY ./pnpm-workspace.yaml .
COPY ./package.json .

COPY ./packages ./packages

RUN pnpm install

RUN pnpm install

RUN pnpm -F pl-api build

RUN pnpm -F nicolium build

FROM nginx AS server

COPY --from=builder /app/packages/nicolium/dist /usr/share/nginx/html

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
