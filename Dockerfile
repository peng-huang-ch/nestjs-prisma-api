FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND pnpm-lock.yaml are copied
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install app dependencies
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --ignore-scripts

# Build app files
FROM base AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run prisma:generate
RUN pnpm run build

# Bundle files
FROM base

WORKDIR /app
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/node_modules/.pnpm/@prisma+client* ./node_modules/.pnpm/
COPY --from=build /app/dist /app/dist

EXPOSE 3000
CMD ["node", "dist/main.js"]