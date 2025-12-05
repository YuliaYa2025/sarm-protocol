# DataLink Pull Delivery Integration with Mimic

## Answer: Can Mimic Fetch DataLink Reports?

**Short answer:** Mimic task code **cannot** make direct HTTP requests, but you can fetch DataLink reports in the **deployment script** and pass them as task inputs.

## The Solution: Two-Phase Approach

Since Mimic Library doesn't have HTTP APIs, we use a **hybrid approach**:

1. **Deployment Script (`deploy.ts`)**: Fetches DataLink reports using Node.js (has HTTP access)
2. **Task Code (`task.ts`)**: Receives pre-fetched reports as inputs and creates intents

## Implementation

### Step 1: Update deploy.ts to Fetch DataLink Reports

```typescript
// In deploy.ts - Add this function before deployTask()

/**
 * Fetch DataLink reports using REST API
 * Uses the same API as Chainlink CRE SDK
 */
async function fetchDataLinkReports(): Promise<any[]> {
  const apiUrl = process.env.DATALINK_API_URL || 'https://api.testnet-dataengine.chain.link/api/v1/reports/bulk'
  const user = process.env.DATALINK_USER || ''
  const secret = process.env.DATALINK_SECRET || ''
  
  if (!user || !secret) {
    throw new Error('DATALINK_USER and DATALINK_SECRET must be set in .env')
  }

  // Create Basic Auth header
  const auth = Buffer.from(`${user}:${secret}`).toString('base64')
  
  // Get feed IDs from config
  const feedIds = [
    config.inputs.feedIdUsdc,
    config.inputs.feedIdUsdt,
    config.inputs.feedIdDai,
  ].filter(id => id) // Remove empty values

  if (feedIds.length === 0) {
    throw new Error('At least one feed ID must be configured')
  }

  console.log('[DATALINK] Fetching reports from DataLink API...')
  console.log(`[DATALINK] Feed IDs: ${feedIds.join(', ')}`)

  // Make POST request to DataLink bulk endpoint
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      feedIds: feedIds,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DataLink API error: ${response.status} ${response.statusText}\n${errorText}`)
  }

  const data = await response.json()
  
  if (!data.reports || !Array.isArray(data.reports)) {
    throw new Error('Invalid response from DataLink API: missing reports array')
  }

  console.log(`[DATALINK] ✓ Fetched ${data.reports.length} reports`)
  
  // Log report details
  for (const report of data.reports) {
    console.log(`[DATALINK]   - Feed ${report.feedId}: valid from ${new Date(report.validFromTimestamp * 1000).toISOString()}`)
  }

  return data.reports
}
```

### Step 2: Update deploy.ts to Pass Reports as Inputs

```typescript
// In deployTask() function, before creating config:

// Fetch DataLink reports
const reports = await fetchDataLinkReports()

// Add reports to task inputs
const taskInputs = {
  ...config.inputs,
  reports: reports, // Add pre-fetched reports
}
```

### Step 3: Update manifest.yaml to Include Reports Input

```yaml
inputs:
  # ... existing inputs ...
  
  # Pre-fetched DataLink reports (passed from deploy script)
  - name: reports
    type: array
    description: "Pre-fetched DataLink reports from deployment script"
```

### Step 4: Update task.ts to Use Reports from Inputs

```typescript
export default function main(): void {
  log.info(`[SARM] Task triggered`)

  // Reports are already fetched and passed as inputs
  const reports = inputs.reports as DataLinkReport[]
  
  if (!reports || reports.length === 0) {
    log.warn('[SARM] No reports in inputs, skipping')
    return
  }

  log.info(`[SARM] Using ${reports.length} pre-fetched reports from inputs`)

  // Process each token
  updateToken('USDC', inputs.usdcAddress, inputs.feedIdUsdc, reports)
  updateToken('USDT', inputs.usdtAddress, inputs.feedIdUsdt, reports)
  updateToken('DAI', inputs.daiAddress, inputs.feedIdDai, reports)
}

function updateToken(
  tokenName: string,
  tokenAddress: string,
  feedId: string,
  reports: DataLinkReport[]
): void {
  // Find report by feedId
  const report = reports.find(
    (r) => r.feedId.toLowerCase() === feedId.toLowerCase()
  )

  if (!report || !report.fullReport) {
    log.warn(`[${tokenName}] No report found for feedId: ${feedId}`)
    return
  }

  // Create contract call intent (implementation below)
  // ...
}
```

## Complete Updated Files

Let me create the complete implementation for you.

