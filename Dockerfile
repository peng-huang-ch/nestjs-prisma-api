FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

RUN npm pkg delete scripts.prepare && npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma/client  ./node_modules/.prisma/client

EXPOSE 3000
CMD ["node", "dist/main.js"]