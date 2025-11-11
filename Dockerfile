# ---- BUILDER STAGE ----
# FROM node:lts-alpine AS builder
FROM node:22-alpine AS builder

# Install dependencies yang dibutuhkan oleh canvas & node-gyp
RUN apk add --no-cache python3 make g++ py3-pip

# Set working directory
WORKDIR /app

# Salin file dependency dan install semua package
COPY package*.json ./
RUN npm install

# Salin seluruh kode project
COPY . .

# Build Nuxt (akan menghasilkan .output)
RUN npm run build


# ---- RUNTIME STAGE ----
# FROM node:lts-alpine AS runner
FROM node:22-alpine AS runner

WORKDIR /app

# Hanya copy hasil build dan file penting
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Install hanya dependency produksi
RUN npm install --omit=dev

# Set environment untuk Nuxt 4
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Jalankan server Nuxt 4
CMD ["node", ".output/server/index.mjs"]