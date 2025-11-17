# ----------------------------------------------------
# Stage 1: Base Environment Setup
# Sets up Node, Corepack/pnpm, and the working directory.
# ----------------------------------------------------
FROM node:22-alpine AS base

# Install corepack and enable pnpm
RUN corepack enable

# Set environment variables for pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Copy the rest of the source code
COPY . /app

# Set working directory for all subsequent stages
WORKDIR /app

# ----------------------------------------------------
# Stage 2: Production Dependencies (Runtime Only)
# Installs only the dependencies needed for runtime.
# This stage is for the final image.
# ----------------------------------------------------
FROM base AS prod_modules
# Copy only lockfile and package.json to leverage Docker layer caching
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN --mount=type=cache,id=pnpm_prod,target=/pnpm/store pnpm install --prod --frozen-lockfile

# ----------------------------------------------------
# Stage 3: Builder (Full Dependencies and Build)
# Installs all dependencies (including dev) and runs the build script.
# ----------------------------------------------------
FROM base AS builder
# Copy only lockfile and package.json for dependency installation cache
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN --mount=type=cache,id=pnpm_full,target=/pnpm/store pnpm install --frozen-lockfile

# Run the build command (e.g., Nuxt/Next/Astro/SvelteKit/etc. build)
RUN pnpm run build

# ----------------------------------------------------
# Stage 4: Final Production Runner
# Starts from a fresh, minimal node image and copies only artifacts.
# ----------------------------------------------------
FROM node:22-alpine AS runner

# Set necessary environment variables (re-declared for clarity in final stage)
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV HOST=0.0.0.0
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

# Copy production node_modules from the prod_modules stage
COPY --from=prod_modules /app/node_modules /app/node_modules

# Copy the built server output from the builder stage
COPY --from=builder /app/.output ./.output

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"]