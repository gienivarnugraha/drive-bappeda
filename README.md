# DRIVE BAPPED - NUXT v4 Based Dashboard

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t github:nuxt-ui-templates/dashboard
```

## Setup

Make sure to install the dependencies:

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


## Storage Config
``` ts
// ./server/plugins/storage.ts

import storageDriver from './storage'

export default defineNitroPlugin(async () => {
  const storage = useStorage()

  storage.mount('storage-name', storageDriver({
    bucketName: 'your-bucket-name-in-supabase'
  }))
})

// to use
const storage = useStorage('storage-name')

await storage.getItem('filename.ext')
```