FROM node:lts-alpine3.21 AS build 
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app 
COPY package.json pnpm-lock.yaml .
RUN pnpm fetch
RUN pnpm install --frozen-lockfile --offline
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build
RUN pnpm prune --prod 

FROM node:lts-alpine3.21 AS production 
WORKDIR /app 
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 8000 
CMD ["node", "dist/app.js"]
