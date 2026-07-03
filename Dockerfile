# =========================
# Stage 1 — Builder
# =========================

FROM node:24-bookworm-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Cache npm downloads between builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

RUN npm run build


# =========================
# Stage 2 — Runtime
# =========================

FROM node:24-bookworm-slim

WORKDIR /usr/src/app

ENV NODE_ENV=development

# Install minimal init system for proper signal handling
RUN apt-get update && \
    apt-get install -y dumb-init && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install production dependencies only
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Copy built application
COPY --from=builder /usr/src/app/dist ./dist

# Set ownership
RUN chown -R node:node /usr/src/app

# Switch to non-root user
USER node

EXPOSE 3000

# Graceful shutdown
STOPSIGNAL SIGTERM

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Proper init process
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]