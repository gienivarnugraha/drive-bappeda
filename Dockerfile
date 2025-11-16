# syntax=docker/dockerfile:1.4
# Use the syntax directive to enable BuildKit features like cache mounts

# --- STAGE 1: BUILDER ---
FROM node:22-alpine AS builder

# 1. Enable pnpm and set environment variables
# corepack is built into modern Node versions (>=14.19.0 or >=16.9.0)
RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install OS dependencies required for native bindings (if needed)
RUN apk update && \
    apk add --no-cache python3 make g++

# Set working directory for the builder stage
WORKDIR /app

# 2. Install Node.js Dependencies (Leveraging BuildKit Cache)
# Copy only package files and the lockfile to leverage Docker layer caching
# Note: Ensure you have a 'pnpm-lock.yaml' in your project root
COPY package.json pnpm-lock.yaml ./

# Use a cache mount for pnpm's content-addressable store
# This significantly speeds up subsequent builds when dependencies haven't changed.
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# 3. Copy application source code
COPY . .

# Build Nuxt (generates the .output directory)
RUN pnpm run build


# --- STAGE 2: RUNNER ---
FROM node:22-alpine AS runner

# Set working directory
WORKDIR /app

# Only copy the essential production files from the builder stage
# 1. Copy the built application (Nuxt/Nitro bundles the server code)
COPY --from=builder /app/.output ./.output

# 2. Copy production-only node_modules (required for dynamic imports/dependencies not bundled by Nitro)
# We use 'pnpm deploy' or 'pnpm prune' (if using standard pnpm install)
# Since Nuxt/Nitro typically bundles dependencies, this step is often just for sanity, 
# or if you have specific run-time dependencies (like native modules).
# We will explicitly prune the production dependencies in the builder stage to ensure they are available.

# Re-run pruning in the builder stage (optional, but good practice for clarity):
RUN --mount=type=cache,target=/pnpm/store \
    pnpm prune --prod --json

# Copy the generated node_modules (which should only contain production dependencies)
# Note: The .output directory should be sufficient for a fully bundled Nuxt application.
# If your app needs the node_modules directory at runtime, use the following:
# COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Command to start the Nuxt 4 server
CMD ["node", ".output/server/index.mjs"]