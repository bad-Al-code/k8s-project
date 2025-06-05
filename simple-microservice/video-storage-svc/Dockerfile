FROM node:lts-alpine3.21 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable # Enable pnpm
WORKDIR /app
COPY . /app 

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS prod
COPY --from=prod-deps /app/node_modules /app/node_modules

# ENV NODE_ENV=production
# ENV PORT=3000
CMD ["node", "src/index.js"] 