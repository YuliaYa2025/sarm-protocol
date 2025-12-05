# Automated Redeployment Strategy for DataLink Reports

## Answer to Your Questions

### 1. Can You Automate Regular Task Redeployment?

**Yes!** You can automate redeployment using:
- **Cron jobs** (Linux/Mac)
- **GitHub Actions** (CI/CD)
- **Chainlink Automation** (on-chain)
- **Custom monitoring script** (Node.js)

### 2. Recommended Redeployment Frequency

Based on the SSA insights:
- **SSAs don't change frequently** (monthly/quarterly reviews)
- **But can change outside review cycle** if structure/context changes
- **Goal: Detect changes quickly, not update every minute**

**Recommended Frequency: Daily or 2-3x per day**

## Strategy Options

### Option 1: Scheduled Redeployment (Recommended)

**Frequency: Once per day (or 2-3x per day)**

**Why:**
- SSAs change infrequently (monthly/quarterly)
- Daily checks catch changes within 24 hours
- Balances freshness with cost/efficiency
- More frequent (2-3x/day) if you want faster detection

**Implementation:**
```bash
# Cron job - runs daily at 2 AM UTC
0 2 * * * cd /path/to/mimic && npm run deploy
```

### Option 2: Hybrid Monitoring (Best for Production)

**Approach:**
1. **Mimic task runs with static reports** (current implementation)
2. **Separate monitoring script** checks for new reports
3. **Triggers redeployment only when reports change**

**Benefits:**
- Only redeploys when data actually changes
- More cost-efficient
- Faster detection of changes

**Implementation:**
```typescript
// monitor-datalink.ts
// Checks if reports changed, redeploys if needed
```

### Option 3: Event-Driven (Most Efficient)

**Approach:**
1. Monitor DataLink API for changes
2. Only redeploy when new reports detected
3. Use webhooks or polling

**Benefits:**
- Minimal redeployments
- Immediate updates when changes occur
- Most cost-efficient

## Recommended Implementation

### Daily Redeployment Script

Create `redeploy.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * Automated redeployment script for Mimic task
 * Fetches fresh DataLink reports and redeploys task
 * 
 * Run via cron: 0 2 * * * (daily at 2 AM UTC)
 * Or: 0 */8 * * * (every 8 hours)
 */

import * as dotenv from 'dotenv'
import { exec } from 'child_process'
import { promisify } from 'util'

dotenv.config()

const execAsync = promisify(exec)

async function redeploy(): Promise<void> {
  console.log(`[REDEPLOY] Starting automated redeployment at ${new Date().toISOString()}`)
  
  try {
    // Change to mimic directory
    process.chdir(__dirname)
    
    // Run deployment script
    const { stdout, stderr } = await execAsync('npm run deploy')
    
    console.log('[REDEPLOY] ✓ Redeployment successful')
    console.log(stdout)
    
    if (stderr) {
      console.warn('[REDEPLOY] Warnings:', stderr)
    }
  } catch (error: any) {
    console.error('[REDEPLOY] ✗ Redeployment failed:', error.message)
    console.error(error.stdout)
    console.error(error.stderr)
    process.exit(1)
  }
}

redeploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[FATAL]', error)
    process.exit(1)
  })
```

### Cron Setup

```bash
# Add to crontab: crontab -e

# Daily at 2 AM UTC (catches changes within 24 hours)
0 2 * * * cd /path/to/sarm-protocol/mimic && /usr/bin/tsx redeploy.ts >> redeploy.log 2>&1

# Or every 8 hours (3x per day)
0 */8 * * * cd /path/to/sarm-protocol/mimic && /usr/bin/tsx redeploy.ts >> redeploy.log 2>&1
```

### GitHub Actions (Alternative)

```yaml
# .github/workflows/redeploy-mimic.yml
name: Redeploy Mimic Task

on:
  schedule:
    # Daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Manual trigger

jobs:
  redeploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd sarm-protocol/mimic
          npm install
      
      - name: Redeploy Mimic task
        env:
          MIMIC_API_KEY: ${{ secrets.MIMIC_API_KEY }}
          DATALINK_USER: ${{ secrets.DATALINK_USER }}
          DATALINK_SECRET: ${{ secrets.DATALINK_SECRET }}
          # ... other env vars
        run: |
          cd sarm-protocol/mimic
          npm run deploy
```

## Frequency Recommendations

### Based on SSA Characteristics

| Frequency | Use Case | Pros | Cons |
|-----------|----------|------|------|
| **Daily** | Recommended | Catches changes within 24h, cost-efficient | May miss same-day changes |
| **2-3x per day** | Balanced | Faster detection, still efficient | Slightly more cost |
| **Every 8 hours** | High frequency | Catches changes within 8h | More redeployments |
| **Every 10 minutes** | Overkill | Unnecessary for SSAs | High cost, no benefit |

### Recommended: **Daily or 2-3x per day**

**Reasoning:**
- SSAs reviewed monthly/quarterly
- Changes outside review cycle are rare but important
- Daily checks provide good balance
- 2-3x per day if you want faster detection

## Hybrid Monitoring Approach (Advanced)

### Smart Monitoring Script

```typescript
// monitor-and-redeploy.ts
// Only redeploys when reports actually change

async function checkAndRedeploy(): Promise<void> {
  // 1. Fetch current reports from DataLink
  const newReports = await fetchDataLinkReports()
  
  // 2. Get current task config from Mimic
  const currentConfig = await client.configs.get(configSig)
  const currentReports = currentConfig.input.reports
  
  // 3. Compare reports (by validFromTimestamp or fullReport hash)
  const hasChanged = compareReports(newReports, currentReports)
  
  if (hasChanged) {
    console.log('[MONITOR] Reports changed, redeploying...')
    await redeploy()
  } else {
    console.log('[MONITOR] No changes detected, skipping redeployment')
  }
}
```

**Benefits:**
- Only redeploys when data changes
- More cost-efficient
- Faster detection (can run every hour, but only redeploy when needed)

## Cost Considerations

### Mimic Execution Fees
- **Execution fee:** ~$0.01-0.10 per execution (depends on network)
- **Redeployment:** Free (just API calls)
- **Task execution:** Paid per execution

### Recommendation
- **Daily redeployment:** Minimal cost
- **Task execution:** Every 10 minutes = 144 executions/day
- **Total daily cost:** ~$1.44-14.40 (mostly from task executions, not redeployments)

## Next Steps

1. **Choose frequency:** Daily or 2-3x per day (recommended)
2. **Set up automation:** Cron job or GitHub Actions
3. **Monitor:** Check logs to ensure redeployments succeed
4. **Optimize:** Consider hybrid monitoring if cost is a concern

## Files to Create

1. ✅ `redeploy.ts` - Automated redeployment script
2. ✅ `.github/workflows/redeploy-mimic.yml` - GitHub Actions (optional)
3. ✅ `monitor-and-redeploy.ts` - Smart monitoring (optional, advanced)

