# Stage 1: Build Frontend
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Server with AWS Secrets Manager integration
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8104

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY scripts ./scripts
COPY server.js ./server.js

EXPOSE 8104

CMD ["node", "server.js"]
