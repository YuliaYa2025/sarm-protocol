# Mimic Protocol Setup Guide

Based on the [Mimic SDK Documentation](https://docs.mimic.fi/developers/sdk), this guide clarifies the two different packages and provides setup instructions.

## Understanding Mimic's Two Packages

### 1. `@mimicprotocol/sdk` - Management SDK
**Purpose**: TypeScript client for managing tasks, configs, executions, and intents via the Mimic Protocol API.

**Use Cases**:
- Deploying tasks to Mimic network
- Creating and managing task configurations
- Querying execution history
- Managing intents
- Authentication and signing

**Installation**:
```bash
yarn add @mimicprotocol/sdk
# or
npm install @mimicprotocol/sdk
```

### 2. `@mimicprotocol/lib-ts` - Task Library
**Purpose**: TypeScript library for writing task code that gets compiled to WASM and runs on Mimic's network.

**Use Cases**:
- Writing task logic (like our `task.ts`)
- Creating intents (transfers, swaps, contract calls)
- Accessing oracle data
- Logging and utilities

**Installation**:
```bash
yarn add @mimicprotocol/lib-ts
# or
npm install @mimicprotocol/lib-ts
```

## Installation Steps

### Step 1: Install Both Packages

```bash
cd mimic

# Install task library (for writing task code)
npm install @mimicprotocol/lib-ts

# Install SDK (for deployment and management)
npm install @mimicprotocol/sdk

# Install CLI (for compilation and deployment)
npm install -g @mimicprotocol/cli
```

### Step 2: Verify Installation

```bash
# Check CLI
mimic --version

# Check packages
npm list @mimicprotocol/lib-ts
npm list @mimicprotocol/sdk
```

### Step 3: Set Up Authentication

You'll need authentication for deploying tasks and managing configs. Choose one:

#### Option A: API Key Authentication

1. Get API key from [Mimic Protocol Dashboard](https://mimic.fi)
2. Create deployment script:

```typescript
// deploy.ts
import { Client, ApiKeyAuth } from '@mimicprotocol/sdk'

const client = new Client({
  auth: new ApiKeyAuth(process.env.MIMIC_API_KEY!)
})

// Use client to deploy task
```

#### Option B: Signer Authentication (Recommended for Production)

```typescript
// deploy.ts
import { Client, EthersSigner } from '@mimicprotocol/sdk'

const signer = EthersSigner.fromPrivateKey(process.env.PRIVATE_KEY!)
const client = new Client({
  signer
})
```

### Step 4: Review Library Documentation

Before implementing task code, review:
- [Mimic Library Documentation](https://docs.mimic.fi/developers/library) - For task code APIs
- [Mimic Examples](https://docs.mimic.fi/examples) - For code examples

**Key APIs to Find:**
- HTTP request capabilities (for DataLink API)
- EVM call intent creation (for contract calls)
- Oracle data sources
- How to access secrets/inputs

## Updated Project Structure

```
mimic/
├── task.ts                    # Task code (uses @mimicprotocol/lib-ts)
├── manifest.yaml              # Task manifest
├── types.ts                   # TypeScript types
├── deploy.ts                  # Deployment script (uses @mimicprotocol/sdk) ⭐ NEW
├── package.json               # Dependencies (both packages)
├── README.md                  # Architecture docs
├── FEES.md                    # Fee documentation
├── NEXT_STEPS.md              # Integration guide
└── SETUP_GUIDE.md            # This file
```

## Next Steps

1. **Install packages** (Step 1 above)
2. **Review Library docs** for task code APIs
3. **Create deployment script** using SDK
4. **Implement task code** using Library APIs
5. **Test and deploy**

See `NEXT_STEPS.md` for detailed implementation guide.

