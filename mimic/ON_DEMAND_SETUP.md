# On-Demand Task Execution Setup

## New Architecture

Instead of running every 10 minutes, the Mimic task will:
1. **Run on-demand** when a swap happens (triggered by SARMHook)
2. **GitHub Actions** redeploys daily at 2 AM UTC to fetch fresh reports

## Benefits

✅ **More efficient** - Only runs when needed (during swaps)
✅ **Cost-effective** - No unnecessary executions every 10 minutes
✅ **SSA reports are static** - Daily updates are sufficient
✅ **Fresh data on swaps** - Ratings checked at transaction time

## Architecture

```
Swap happens in SARMHook
    ↓
Hook triggers Mimic task execution (via API)
    ↓
Mimic task runs on-demand
    ↓
Updates ratings if needed
    ↓
Swap proceeds with current ratings
```

Plus:

```
Daily at 2 AM UTC
    ↓
GitHub Actions redeploys task
    ↓
Fetches fresh DataLink reports
    ↓
Task ready for next swap
```

## Implementation Options

### Option 1: Event-Based Trigger (Recommended)

Change manifest to use event trigger instead of cron:

```yaml
trigger:
  type: event
  chainId: 84532  # Base Sepolia
  contract: <SARMHook_ADDRESS>
  topics:
    - ["0x..."]  # Swap event signature
  delta: "1h"
```

**How it works:**
- SARMHook emits swap event
- Mimic monitors for events
- Task executes when event detected

### Option 2: On-Demand API Trigger

Keep task without automatic trigger, trigger via API:

```typescript
// In SARMHook or separate service
POST /executions
{
  "configSig": "...",
  "triggerType": "manual",
  "triggerData": {},
  "timestamp": "...",
  "inputs": [...]
}
```

**How it works:**
- SARMHook calls external service/API
- Service triggers Mimic execution
- Task runs on-demand

### Option 3: Hybrid (Event + Manual)

Use event trigger but also allow manual triggers for testing.

## Recommended: Event-Based Trigger

This is the most Mimic-native approach. Let me update the configuration.

