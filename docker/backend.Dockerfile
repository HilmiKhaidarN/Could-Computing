# =============================================================================
# AegisOps — Backend (NestJS)
# Multi-stage build | Base: node:18-alpine | Target: AWS ECS
# =============================================================================

# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:18-alpine AS deps

# Install libc compatibility for native modules (bcrypt, etc.)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy only manifests first — maximises layer cache
COPY package.json package-lock.json* ./

# Install ALL dependencies (dev + prod) needed for build
RUN npm install --legacy-peer-deps

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Bring in node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

# Generate Prisma client before build
RUN npx prisma generate

# Compile TypeScript → dist/
RUN npm run build

# ─── Stage 3: Production runner ───────────────────────────────────────────────
FROM node:18-alpine AS runner

RUN apk add --no-cache libc6-compat dumb-init

WORKDIR /app

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nestjs

ENV NODE_ENV=production \
    PORT=3000

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy compiled output and Prisma schema
COPY --from=builder /app/dist    ./dist
COPY --from=builder /app/prisma  ./prisma

# Re-generate Prisma client against production node_modules
RUN npx prisma generate

# Transfer ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

# dumb-init handles PID 1 signal forwarding correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
