# Event-Based On-Demand Trigger Setup

## Overview

The Mimic task now runs **on-demand** when swaps happen, instead of every 10 minutes. This is more efficient since SSA reports are relatively static.

## Architecture

```
Swap happens in SARMHook
    ↓
SARMHook emits RiskCheck event
    ↓
Mimic detects event
    ↓
Task executes on-demand
    ↓
Updates all 10 token ratings
    ↓
Next swap uses updated ratings
```

Plus daily redeployment:

```
Daily at 2 AM UTC
    ↓
GitHub Actions redeploys
    ↓
Fetches fresh DataLink reports
    ↓
Task ready for next swap
```

## Configuration

### Event Details

**Event:** `RiskCheck(PoolId indexed poolId, uint8 rating0, uint8 rating1, uint8 effectiveRating)`

**Event Signature:** `0x988b2889` (first 4 bytes of keccak256)

**Contract:** SARMHook address (set after deployment)

### manifest.yaml

```yaml
trigger:
  type: event
  chainId: 84532  # Base Sepolia
  contract: ""  # Set SARMHook address after deployment
  topics:
    - ["0x988b2889"]  # RiskCheck event
  delta: "1h"
  endDate: 0
```

## Setup Steps

### 1. Deploy SARMHook Contract

```bash
cd sarm-protocol
forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org --broadcast
```

### 2. Get SARMHook Address

After deployment, copy the SARMHook contract address.

### 3. Update .env

```bash
SARM_HOOK_ADDRESS=0x...  # Your deployed SARMHook address
```

### 4. Deploy Mimic Task

```bash
cd mimic
npm run deploy
```

The task will now:
- ✅ Monitor for RiskCheck events from SARMHook
- ✅ Execute on-demand when swaps happen
- ✅ Update ratings for all 10 tokens

## How It Works

1. **User performs swap** in Uniswap v4 pool with SARMHook
2. **SARMHook._beforeSwap()** is called
3. **RiskCheck event** is emitted with pool and rating info
4. **Mimic detects event** and triggers task execution
5. **Task runs** and updates all 10 token ratings
6. **Future swaps** use the updated ratings

## Benefits

✅ **Efficient** - Only runs when swaps happen
✅ **Cost-effective** - No unnecessary executions
✅ **Fresh data** - Ratings updated on-demand
✅ **Daily updates** - GitHub Actions ensures fresh reports daily

## Testing

### Test On-Demand Execution

1. Perform a swap in a pool with SARMHook
2. Check Mimic dashboard for execution
3. Verify ratings were updated

### Manual Trigger (for testing)

```bash
# Use trigger-on-demand.ts script
tsx trigger-on-demand.ts
```

## Monitoring

Check task executions:

```typescript
// Using Mimic SDK
const executions = await client.executions.get({
  configSig: 'your-config-sig'
})
```

## Cost Comparison

### Old (Every 10 minutes):
- 144 executions/day
- 1,440 contract calls/day
- ~$360/day

### New (On-demand):
- Executions = Number of swaps
- If 50 swaps/day: 50 executions
- 500 contract calls/day
- ~$125/day

**Savings:** Only pay when swaps actually occur!

## Important Notes

1. **First deployment:** Task needs to be deployed once with event trigger
2. **SARMHook address:** Must be set in `.env` and `manifest.yaml`
3. **Event monitoring:** Mimic automatically monitors for events
4. **Daily redeployment:** GitHub Actions still runs daily to fetch fresh reports

## Next Steps

1. ✅ Deploy SARMHook contract
2. ✅ Set `SARM_HOOK_ADDRESS` in `.env`
3. ✅ Deploy Mimic task with event trigger
4. ✅ Test by performing a swap
5. ✅ Monitor executions in Mimic dashboard

