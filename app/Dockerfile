# Stage 1: Build Frontend
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine AS runner

# Install AWS CLI and jq for AWS Secrets Manager integration
RUN apk add --no-cache aws-cli jq

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx document root
COPY --from=build /app/dist /usr/share/nginx/html/echowatt

# Configure startup script to retrieve secrets for 'usecase-echowatt' before Nginx starts
COPY docker-entrypoint-secrets.sh /docker-entrypoint.d/40-secrets.sh
RUN chmod +x /docker-entrypoint.d/40-secrets.sh

EXPOSE 8104

CMD ["nginx", "-g", "daemon off;"]
