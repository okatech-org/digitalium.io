FROM node:20-alpine3.19 AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Cache-bust: 2026-03-29T21:25 — NEXUS-OMEGA M5 Sprint 10
COPY . .

# ── Build-time environment variables ──────────────────────────
# NEXT_PUBLIC_* vars are baked into the JS bundle at build time.
# Server-only secrets (GEMINI_API_KEY, CONVEX_DEPLOY_KEY) are
# injected at runtime via Cloud Run environment variables.
COPY .env.production .env.production

# Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Inject .env.production for runtime NEXT_PUBLIC_* fallback
COPY --from=builder --chown=nextjs:nodejs /app/.env.production ./

# ── Runtime secrets (injected by Cloud Run env vars) ──────────
# These placeholders document what Cloud Run must provide:
#   CONVEX_DEPLOY_KEY  — Convex deployment key
#   GEMINI_API_KEY     — Google Gemini API key
# They are NOT baked into the image for security.

USER nextjs

EXPOSE 3000

ENV PORT=3000
# Hostname 0.0.0.0 is required for Cloud Run
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
