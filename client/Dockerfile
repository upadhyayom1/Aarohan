# -------------------------------------------------------------
# Aarohan Frontend Client Dockerfile (Multi-stage SPA Build)
# -------------------------------------------------------------

# Stage 1: Build production static bundle
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

# Set build-time variables for Vite (routes through reverse proxy)
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_AI_BASE_URL=/api/v1/ai
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AI_BASE_URL=$VITE_AI_BASE_URL

RUN npm run build

# Stage 2: Serve static bundle via Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback configuration
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

