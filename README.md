# DRIVE BAPPED - NUXT v4 Based Dashboard

## Setup

### generate db schema and run migration to server

```bash
# run migration
pnpm run db:generate

# Seed DB
pnpm run init
```

### Fill .env file
```bash
# copy example
cp .env.example .env
```

```env
# .env
# open ai to generate vector
OPENAI_API_KEY =

# for document retrieval link (localhost:3000) {SITE_URL}/show?filename.pdf
SITE_URL=

# for storage url, config in nuxt.config.ts -> storage 
# default storage key are ./public/
STORAGE_KEY=
# default storage path './storage' ./public/
STORAGE_PATH=

# generate session password using 32-characters
NUXT_SESSION_PASSWORD=

# database config
PG_DB='postgresql://USER:PASSWORD@HOST:PORT/DB';

```


### Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

## TODO
- [x] migrate to drizzle
- [x] convert pdfs to markdown to let ai ease to use
- [x] add backup summary to reuse in case document deleted
- [x] validate password change
- [x] chat history
- [x] fix storage path, calling pythong script
- [x] authentication using nuxt-auth-utils
- [ ] fix UI 
- refresh token is not set
- enable text selection on pdf viewer
- generate thumbnail on pdf viewer not showing
- optimize pdf viewer
- dirty user update only