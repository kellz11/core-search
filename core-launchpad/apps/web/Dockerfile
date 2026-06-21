FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile=false && pnpm --filter @core-launchpad/web build
CMD ["pnpm", "--filter", "@core-launchpad/web", "start"]
