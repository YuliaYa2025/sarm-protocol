# DataLink Pull Delivery Integration Solution

## Answer to Your Question

**Can Mimic fetch DataLink pull delivery data?**

**Answer:** Mimic task code **cannot** make direct HTTP requests, but we can fetch DataLink reports in the **deployment script** and pass them as task inputs.

## The Problem

- Mimic Library (`@mimicprotocol/lib-ts`) runs in WASM and **doesn't have HTTP request APIs**
- DataLink pull delivery requires **REST API calls** with Basic Auth
- Task code needs the reports to create contract call intents

## The Solution: Hybrid Approach

We use a **two-phase approach**:

1. **Deployment Script (`deploy.ts`)**: 
   - Runs in Node.js (has HTTP access)
   - Fetches DataLink reports using your credentials
   - Passes reports as task inputs when creating the config

2. **Task Code (`task.ts`)**:
   - Receives pre-fetched reports as inputs
   - Creates EVM call intents using `EvmCall.create()`
   - No HTTP requests needed

## Important Limitation

⚠️ **Reports are fetched ONCE at deployment time**, not on every execution.

**This means:**
- Reports passed at deployment will be used for ALL future executions
- Reports will become stale over time
- This is a limitation of Mimic's architecture

## Alternative Solutions

### Option 1: Fetch Reports at Each Execution (Ideal but Not Possible)

**Problem:** Mimic task code cannot make HTTP requests, so we can't fetch fresh reports on each execution.

### Option 2: Use Mimic Oracles (If Available)

If DataLink is available as a Mimic oracle, you could use:
```typescript
// This would require DataLink to be integrated as a Mimic oracle
// Check Mimic documentation for available oracles
```

### Option 3: Pre-fetch in Deploy Script (Current Implementation)

**What we implemented:**
- Fetch reports in `deploy.ts` before creating config
- Pass reports as inputs
- Task uses those reports

**Limitation:** Reports are static until you redeploy with fresh data.

### Option 4: Use Chainlink Automation (Separate from Mimic)

Keep using Chainlink Automation (or CRE) just for fetching DataLink reports, then have it call Mimic task, or use a hybrid approach.

## Current Implementation Status

✅ **Completed:**
- `deploy.ts` - Fetches DataLink reports using your testnet credentials
- `task.ts` - Uses pre-fetched reports from inputs
- `EvmCall.create()` - Implemented for contract calls
- Manifest updated to include reports input

## How It Works

### 1. Deployment Flow

```bash
# Set your credentials in .env
DATALINK_USER=baf39e3a-f145-41e5-bdf7-a88e08311f87
DATALINK_SECRET=et9kGDCY2aIFOBzXkRdEzVLkrkkSl5MEySFMu1BQHuK0NMQV8fhtiAImOd7Hd3417f10of9Dwhw8KqCDJs33F2dzD90w2N1vX4o19Po3tj91eQmIliGYTT1fuRt7BZKS

# Deploy
npm run deploy
```

**What happens:**
1. `deploy.ts` fetches fresh reports from DataLink API
2. Reports are added to task inputs
3. Config is created with those reports
4. Task is deployed

### 2. Execution Flow (Every 10 Minutes)

```typescript
// Task runs automatically
// Uses reports from inputs (fetched at deployment time)
// Creates intents for each token
```

## DataLink API Details

Based on the documentation you provided:

**Endpoint:** `https://api.testnet-dataengine.chain.link/api/v1/reports/bulk`

**Authentication:** Basic Auth
- Username: `baf39e3a-f145-41e5-bdf7-a88e08311f87`
- Secret: `et9kGDCY2aIFOBzXkRdEzVLkrkkSl5MEySFMu1BQHuK0NMQV8fhtiAImOd7Hd3417f10of9Dwhw8KqCDJs33F2dzD90w2N1vX4o19Po3tj91eQmIliGYTT1fuRt7BZKS`

**Request:**
```json
{
  "feedIds": ["0x...", "0x...", "0x..."]
}
```

**Response:**
```json
{
  "reports": [
    {
      "feedId": "0x...",
      "validFromTimestamp": 1234567890,
      "observationsTimestamp": 1234567890,
      "fullReport": "0x..." // Signed report for onchain verification
    }
  ]
}
```

## Updated Files

I've updated:
1. ✅ `deploy.ts` - Added `fetchDataLinkReports()` function
2. ✅ `task.ts` - Removed placeholder functions, implemented `EvmCall.create()`
3. ✅ `manifest.yaml` - Added `reports` input
4. ✅ `types.ts` - Added `reports` to inputs interface
5. ✅ `.env.example` - Added your testnet credentials

## Next Steps

1. **Set up `.env` file:**
   ```bash
   cd mimic
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Test DataLink fetch:**
   ```bash
   # Test the fetch function in deploy.ts
   # Make sure your credentials work
   ```

3. **Compile task:**
   ```bash
   mimic compile task.ts
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

## Important Notes

1. **Reports are static:** Reports fetched at deployment will be used for all executions until you redeploy.

2. **To update reports:** You need to redeploy the task with fresh reports.

3. **Alternative:** Consider using Chainlink Automation to periodically redeploy with fresh reports, or use a hybrid approach.

4. **Your credentials:** I've added your testnet credentials to `.env.example` - make sure to set them in your actual `.env` file.

## Testing

Before deploying, test the DataLink fetch:

```typescript
// In deploy.ts, you can test the fetch function
const reports = await fetchDataLinkReports()
console.log('Fetched reports:', reports)
```

This will verify:
- Your credentials work
- Feed IDs are correct
- API endpoint is accessible
- Response format is correct

