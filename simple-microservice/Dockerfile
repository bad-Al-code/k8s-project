FROM node:lts-alpine3.21 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app
RUN pnpm install
ENV PORT=3000
EXPOSE 3000
CMD [ "pnpm", "dev" ]

