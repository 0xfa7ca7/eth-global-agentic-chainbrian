# 🔥 Lit Actions Development Guide

## Overview

This template helps you develop Lit Actions with TypeScript support, SDK shimming, and automated IPFS deployment.

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development
pnpm run dev
```

## Project Structure

```
lit-actions/
├── actions/           # Built JS actions + IPFS hashes
│   ├── hello-action.js
│   └── ipfs.json     # IPFS deployment info
├── shims/            # SDK shims
│   └── buffer.shim.js
├── src/
│   ├── actions/      # TypeScript action source
│   │   └── hello-action.ts
│   ├── global.d.ts   # Global type definitions
│   └── index.ts      # IPFS deployment script
├── esbuild.js        # Build configuration
└── package.json
```

## Writing Actions

1. Create a new action in `src/actions/`:

```typescript
/// <reference path="../global.d.ts" />

const go = async () => {
  // Get the token ID from public key
  const tokenId = await Lit.Actions.pubkeyToTokenId({ publicKey });

  // Sign data
  const signature = await Lit.Actions.signEcdsa({
    publicKey,
    toSign,
    sigName,
  });

  // Return response
  Lit.Actions.setResponse({
    response: JSON.stringify({ tokenId, signature }),
  });
};

go();
```

## Adding SDK Shims

1. Create a shim in `shims/`:

```javascript
// shims/my-sdk.shim.js
import { MySDK } from "my-sdk";
globalThis.MySDK = MySDK;
```

2. Update global types in `src/global.d.ts`:

```typescript
import { MySDK } from "my-sdk";

declare global {
  // Add SDK to global scope
  const MySDK: typeof MySDK;

  // Add action parameters
  const myParam: string;
}
```

3. The shim will be automatically injected via esbuild:

```javascript
// esbuild.js
const shimFiles = glob.sync("./shims/**/*.shim.js");
// ...
inject: shimFiles,
```

## Environment Setup

Required variables in `.env`:

```env
# Pinata IPFS Configuration
PINATA_JWT=<Your Pinata JWT>
PINATA_URL=<Your Pinata URL>
```

The `validate-env` script will prompt for missing variables:

```bash
pnpm run predev
```

## Build & Deploy

```bash
# Build actions
pnpm run build

# Deploy to IPFS
pnpm run start
```

This will:

1. Compile TypeScript → JavaScript
2. Bundle with dependencies
3. Inject SDK shims
4. Upload to IPFS via Pinata
5. Save IPFS hashes to `actions/ipfs.json`

## Example: Complete Action

```typescript
/// <reference path="../global.d.ts" />

const go = async () => {
  try {
    console.log("Lit.Auth:", Lit.Auth);

    // Convert public key to token ID
    const tokenId = await Lit.Actions.pubkeyToTokenId({ publicKey });
    console.log("tokenId:", tokenId);

    // Get permitted auth methods
    const permittedAuthMethods = await Lit.Actions.getPermittedAuthMethods({
      tokenId,
    });
    console.log("permittedAuthMethods:", permittedAuthMethods);

    // Sign with ECDSA
    const signature = await Lit.Actions.signEcdsa({
      publicKey,
      toSign,
      sigName,
    });

    // Set response
    Lit.Actions.setResponse({
      response: JSON.stringify({
        tokenId,
        signature,
        permittedAuthMethods,
      }),
    });
  } catch (error) {
    console.error("Action failed:", error);
    throw error;
  }
};

go();
```

## Available Scripts

```bash
# Development
pnpm run dev        # Build + start
pnpm run build     # Build actions
pnpm run start     # Deploy to IPFS

# Utilities
pnpm run lint      # Fix code style
pnpm run predev    # Validate env vars
```

## Type Support

The `global.d.ts` file provides types for:

- Lit Actions API
- Global parameters
- SDK shims
- Buffer utilities
- Ethers.js integration

## IPFS Deployment

Actions are automatically deployed to IPFS with metadata saved to `actions/ipfs.json`:

```json
{
  "hello-action.js": {
    "IpfsHash": "Qm...",
    "PinSize": 69804,
    "Timestamp": "2025-01-03T08:55:32.951Z",
    "Duration": 4.319
  }
}
```

## Best Practices

1. **Type Safety**

   - Always reference `global.d.ts`
   - Define types for parameters
   - Use TypeScript features

2. **SDK Management**

   - Create minimal shims
   - Document SDK versions
   - Test SDK compatibility

3. **Action Structure**

   - One action per file
   - Clear async/await flow
   - Proper error handling

4. **Deployment**
   - Test locally first
   - Verify IPFS uploads
   - Keep actions small

## License

MIT
