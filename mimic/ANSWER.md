# Answer: Can Mimic Fetch DataLink Pull Delivery Data?

## Short Answer

**Mimic task code cannot make direct HTTP requests**, but we've implemented a solution where **DataLink reports are fetched in the deployment script** and passed as task inputs.

## The Solution

### ✅ What We Implemented

1. **`deploy.ts`** - Fetches DataLink reports using Node.js `fetch()` API
   - Uses your testnet credentials
   - Calls DataLink bulk endpoint: `POST /api/v1/reports/bulk`
   - Passes reports as task inputs when creating config

2. **`task.ts`** - Uses pre-fetched reports from inputs
   - No HTTP requests needed
   - Creates `EvmCall` intents for each token
   - Uses `EvmCall.create()` to submit reports to `SSAOracleAdapter`

3. **`manifest.yaml`** - Updated to include `reports` input

## Important Limitation ⚠️

**Reports are fetched ONCE at deployment time**, not on every execution.

This means:
- Reports passed at deployment will be used for ALL future executions
- Reports will become stale over time
- To get fresh reports, you need to **redeploy the task**

## Why This Limitation Exists

Mimic Library (`@mimicprotocol/lib-ts`) runs in **WebAssembly (WASM)** and doesn't have HTTP request APIs. The task code can only:
- Read contract state (`environment.contractCall()`)
- Query subgraphs (`environment.subgraphQuery()`)
- Create intents (`EvmCall.create()`, `Transfer.create()`, etc.)
- Access pre-provided inputs

## Alternative Solutions

### Option 1: Periodic Redeployment (Current Workaround)

Create a separate script that:
1. Fetches fresh DataLink reports
2. Redeploys the Mimic task with new reports
3. Runs on a schedule (e.g., every 10 minutes)

### Option 2: Use Chainlink Automation (Hybrid)

Keep using Chainlink Automation or CRE just for fetching DataLink reports, then have it trigger Mimic task or call your contract directly.

### Option 3: Check Mimic Oracles (Future)

If DataLink becomes available as a Mimic oracle, you could use:
```typescript
// This would require DataLink oracle integration
const reports = environment.oracleQuery('datalink', { feedIds: [...] })
```

## Your Testnet Credentials

I've added your credentials to `.env.example`:
- **User:** `baf39e3a-f145-41e5-bdf7-a88e08311f87`
- **Secret:** `et9kGDCY2aIFOBzXkRdEzVLkrkkSl5MEySFMu1BQHuK0NMQV8fhtiAImOd7Hd3417f10of9Dwhw8KqCDJs33F2dzD90w2N1vX4o19Po3tj91eQmIliGYTT1fuRt7BZKS`
- **API URL:** `https://api.testnet-dataengine.chain.link/api/v1/reports/bulk`

## Next Steps

1. **Set up `.env` file:**
   ```bash
   cd mimic
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Test DataLink fetch:**
   ```bash
   # The deploy.ts script will fetch reports before deployment
   npm run deploy
   ```

3. **Compile task:**
   ```bash
   mimic compile task.ts
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

## Files Updated

✅ `deploy.ts` - Added `fetchDataLinkReports()` function
✅ `task.ts` - Implemented `EvmCall.create()` with correct APIs
✅ `manifest.yaml` - Added `reports` input
✅ `types.ts` - Added `reports` to inputs interface
✅ `.env.example` - Added your testnet credentials

## Summary

**Yes, you can integrate DataLink with Mimic**, but with the limitation that reports are static until redeployment. The implementation fetches reports in the deployment script and passes them as inputs, which the task code then uses to create contract call intents.

For production, consider:
1. Periodic redeployment with fresh reports
2. Hybrid approach using Chainlink Automation for fetching
3. Waiting for Mimic oracle support for DataLink

