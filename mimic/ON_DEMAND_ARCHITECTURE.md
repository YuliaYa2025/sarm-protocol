# On-Demand Task Execution Architecture

## New Approach

Instead of running every 10 minutes, the Mimic task will:
1. **Run on-demand** when a swap happens (triggered by swap events)
2. **GitHub Actions** redeploys daily at 2 AM UTC to fetch fresh reports

## Why This Makes Sense

✅ **SSA reports are relatively static** - Don't change frequently
✅ **More efficient** - Only runs when swaps actually happen
✅ **Cost-effective** - No unnecessary executions every 10 minutes
✅ **Fresh data on swaps** - Ratings checked at transaction time

## Architecture Options

### Option 1: Event-Based Trigger (Recommended)

Mimic monitors for SARMHook swap events and triggers task automatically:

```yaml
# manifest.yaml
trigger:
  type: event
  chainId: 84532
  contract: <SARMHook_ADDRESS>
  topics:
    - ["0x..."]  # RiskCheck event signature
  delta: "1h"
```

**How it works:**
1. Swap happens → SARMHook emits `RiskCheck` event
2. Mimic monitors for events
3. Task executes automatically when event detected
4. Updates ratings if needed

**Benefits:**
- ✅ Fully automated within Mimic
- ✅ No external service needed
- ✅ Runs only when swaps happen

### Option 2: On-Demand API Trigger

Keep task without automatic trigger, trigger via API when needed:

```typescript
// External service monitors swap events
// Calls Mimic API to trigger execution
POST /executions
{
  "configSig": "...",
  "triggerType": "manual",
  ...
}
```

**How it works:**
1. Swap happens → SARMHook emits event
2. Off-chain service (e.g., The Graph, Alchemy) detects event
3. Service calls Mimic API to trigger execution
4. Task runs on-demand

**Benefits:**
- ✅ More control over when task runs
- ✅ Can add logic (e.g., only trigger if rating changed)
- ⚠️ Requires external service

### Option 3: Remove Trigger Entirely (Manual Only)

No automatic trigger - only manual execution when needed:

```yaml
# manifest.yaml
# No trigger - task must be executed manually
```

**How it works:**
1. GitHub Actions redeploys daily with fresh reports
2. Task is ready but doesn't run automatically
3. Manually trigger when needed (for testing/debugging)

**Benefits:**
- ✅ Maximum control
- ✅ No execution costs unless needed
- ⚠️ Requires manual intervention

## Recommended: Event-Based Trigger

This is the most Mimic-native and efficient approach.

## Implementation Steps

1. **Get SARMHook address** (after deployment)
2. **Get RiskCheck event signature** (from SARMHook.sol)
3. **Update manifest.yaml** to use event trigger
4. **Redeploy task** with new trigger
5. **Test** by performing a swap

## Event Signature

From SARMHook.sol:
```solidity
event RiskCheck(PoolId indexed poolId, uint8 rating0, uint8 rating1, uint8 effectiveRating);
```

Event signature: `keccak256("RiskCheck(bytes32,uint8,uint8,uint8)")`

## Updated Flow

```
Swap happens
    ↓
SARMHook._beforeSwap() called
    ↓
Emits RiskCheck event
    ↓
Mimic detects event
    ↓
Task executes on-demand
    ↓
Updates ratings if needed
    ↓
Swap proceeds
```

Plus daily:

```
Daily at 2 AM UTC
    ↓
GitHub Actions redeploys
    ↓
Fetches fresh DataLink reports
    ↓
Task ready for next swap
```

## Cost Comparison

### Current (Every 10 minutes):
- 144 executions/day × 10 tokens = 1,440 contract calls/day
- Cost: ~$360/day (if all execute)

### On-Demand (Event-triggered):
- Executions = Number of swaps
- If 100 swaps/day: 100 executions × 10 tokens = 1,000 calls
- Cost: ~$250/day (only when swaps happen)

**Savings:** Only pay when swaps actually occur!

