# =============================================================================
# AegisOps — Frontend (Next.js 14)
# Multi-stage build | Base: node:18-alpine | Target: AWS ECS
# Requires next.config.js: output: 'standalone'
# =============================================================================

# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:26-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:26-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public env vars (injected at build, not runtime)
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN npm run build

# ─── Stage 3: Production runner ───────────────────────────────────────────────
FROM node:26-alpine AS runner

RUN apk add --no-cache libc6-compat dumb-init

WORKDIR /app

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Standalone output contains its own minimal server + node_modules snapshot
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

USER nextjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
# Next.js standalone produces server.js at the root
CMD ["node", "server.js"]
