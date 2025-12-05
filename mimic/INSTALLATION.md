# Mimic SDK Installation & Next Steps

Based on the [Mimic SDK Documentation](https://docs.mimic.fi/developers/sdk), here are the immediate next steps.

## Key Understanding

Mimic Protocol has **two separate packages**:

1. **`@mimicprotocol/lib-ts`** ✅ Already in package.json
   - Used for **writing task code** (your `task.ts` file)
   - Provides APIs for creating intents, accessing oracles, etc.
   - Gets compiled to WASM and runs on Mimic's network

2. **`@mimicprotocol/sdk`** ⚠️ Needs to be added
   - Used for **deployment and management**
   - TypeScript client for Mimic Protocol API
   - Manages tasks, configs, executions, intents
   - Handles authentication and signing

## Immediate Next Steps

### 1. Install Both Packages

```bash
cd mimic
npm install @mimicprotocol/lib-ts @mimicprotocol/sdk
npm install -g @mimicprotocol/cli
```

### 2. Verify Installation

```bash
mimic --version
npm list @mimicprotocol/lib-ts @mimicprotocol/sdk
```

### 3. Set Up Authentication

Get credentials from [Mimic Protocol Dashboard](https://mimic.fi):

**Option A: API Key** (Simpler)
```bash
# Add to .env file
MIMIC_API_KEY=your-api-key-here
```

**Option B: Private Key** (More secure for production)
```bash
# Add to .env file
PRIVATE_KEY=0x-your-private-key-here
```

### 4. Review Library Documentation

**Critical**: The SDK docs show deployment APIs, but for **task code** you need:

- [Library Documentation](https://docs.mimic.fi/developers/library) - For task code APIs
- [Examples](https://docs.mimic.fi/examples) - Code examples

**Key APIs to Find:**
- HTTP requests (for DataLink API)
- EVM call intents (for contract calls)
- How to access `inputs` in task code
- Oracle data sources

### 5. Update Task Code

Once you find the Library APIs, update `task.ts`:

```typescript
// Replace placeholder functions with actual Library APIs
// Example (actual API may differ):
import { EvmCall } from '@mimicprotocol/lib-ts'

// For HTTP requests - check Library docs
// For contract calls:
EvmCall.create({
  chainId: inputs.chainId,
  target: inputs.ssaOracleAddress,
  data: encodedFunctionCall,
  maxFee: maxSolverFee
}).send()
```

### 6. Create Deployment Script

Use the SDK to deploy (see `deploy.ts` for example):

```typescript
import { Client, ApiKeyAuth } from '@mimicprotocol/sdk'

const client = new Client({
  auth: new ApiKeyAuth(process.env.MIMIC_API_KEY!)
})

// Create task
const task = await client.tasks.create({...})

// Create configuration
const config = await client.configs.signAndCreate({
  taskCid: task.cid,
  trigger: { type: 'cron', schedule: '0 */10 * * * *' },
  input: { /* your inputs */ }
})
```

### 7. Deploy

```bash
# Using deployment script
npm run deploy

# Or using CLI
mimic deploy task.ts --key $MIMIC_API_KEY
```

## Documentation References

- [SDK Documentation](https://docs.mimic.fi/developers/sdk) - For deployment/management
- [Library Documentation](https://docs.mimic.fi/developers/library) - For task code ⭐
- [Examples](https://docs.mimic.fi/examples) - Code examples
- [Fees](https://docs.mimic.fi/developers/fees) - Fee structure

## Files Created

✅ **SETUP_GUIDE.md** - Detailed explanation of both packages
✅ **deploy.ts** - Deployment script using SDK
✅ **.env.example** - Environment variable template
✅ **package.json** - Updated with both packages

## Checklist

- [ ] Install both packages (`lib-ts` and `sdk`)
- [ ] Install Mimic CLI globally
- [ ] Get API key or set up signer
- [ ] Review Library documentation for task code APIs
- [ ] Update `task.ts` with actual Library APIs
- [ ] Create ABI file for SSAOracleAdapter
- [ ] Configure `.env` file
- [ ] Test deployment locally
- [ ] Deploy to Mimic network
- [ ] Monitor first execution

## Need Help?

1. **Task Code APIs**: Check [Library Documentation](https://docs.mimic.fi/developers/library)
2. **Deployment**: Check [SDK Documentation](https://docs.mimic.fi/developers/sdk)
3. **Examples**: Check [Examples](https://docs.mimic.fi/examples)

