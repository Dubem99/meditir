FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
EXPOSE 4000
# Adopt-baseline (idempotent) -> apply migrations -> start. Fails fast on
# migration error instead of silently serving a stale/mismatched schema.
CMD ["sh", "-c", "node scripts/db-baseline.mjs && node dist/server.js"]
