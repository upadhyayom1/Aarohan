# -------------------------------------------------------------
# Aarohan Express Backend API Dockerfile
# -------------------------------------------------------------
FROM node:22-alpine

WORKDIR /app

# Install dependencies needed for native modules / Prisma
RUN apk add --no-cache openssl libc6-compat

# Install package dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy Prisma schema and generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy backend source code
COPY src ./src/

# Create directory for PDF uploads
RUN mkdir -p /app/uploads

EXPOSE 8000

ENV NODE_ENV=production
ENV PORT=8000

CMD ["node", "src/index.js"]

