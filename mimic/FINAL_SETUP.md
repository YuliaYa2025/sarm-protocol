# Final Setup: On-Demand Execution + Daily Redeployment

## ✅ Complete Architecture

### On-Demand Execution (Swap-Triggered)
- **Trigger:** SARMHook `RiskCheck` event
- **When:** Every time a swap happens
- **What:** Updates all 10 token ratings
- **Cost:** Only when swaps occur

### Daily Redeployment (GitHub Actions)
- **Schedule:** Daily at 2 AM UTC
- **What:** Fetches fresh DataLink reports
- **Result:** Task ready with latest reports

## Configuration Summary

### 1. Event Trigger (manifest.yaml)

```yaml
trigger:
  type: event
  chainId: 84532
  contract: "{{ sarmHookAddress }}"  # From inputs
  topics:
    - ["0x988b2889"]  # RiskCheck event
```

### 2. Event Details

- **Event:** `RiskCheck(PoolId indexed poolId, uint8 rating0, uint8 rating1, uint8 effectiveRating)`
- **Signature:** `0x988b2889`
- **Contract:** SARMHook address

### 3. Required Environment Variables

```bash
# Contract addresses
SSA_ORACLE_ADDRESS=0x...
SARM_HOOK_ADDRESS=0x...  # NEW - Required for event trigger

# All 10 tokens and feeds (already set)
# ...
```

## Setup Checklist

- [ ] Deploy SARMHook contract
- [ ] Get SARMHook address
- [ ] Add `SARM_HOOK_ADDRESS` to `.env`
- [ ] Deploy Mimic task (with event trigger)
- [ ] Set up GitHub Actions (daily redeployment)
- [ ] Test by performing a swap

## How It Works

### Daily Flow

```
2 AM UTC: GitHub Actions
    ↓
Fetches fresh DataLink reports (all 10 feeds)
    ↓
Redeploys Mimic task with fresh reports
    ↓
Task ready for on-demand execution
```

### Swap Flow

```
User performs swap
    ↓
SARMHook._beforeSwap() called
    ↓
Emits RiskCheck event
    ↓
Mimic detects event
    ↓
Task executes on-demand
    ↓
Updates all 10 token ratings
    ↓
Swap proceeds with current ratings
```

## Benefits

✅ **Efficient** - Only runs when swaps happen
✅ **Cost-effective** - No unnecessary executions
✅ **Fresh data** - Daily updates via GitHub Actions
✅ **On-demand** - Ratings checked at transaction time

## Cost Savings

**Old approach (every 10 min):**
- 144 executions/day
- ~$360/day

**New approach (on-demand):**
- Executions = Number of swaps
- If 50 swaps/day: ~$125/day
- **67% cost reduction** (if 50 swaps/day)

## Files Updated

✅ `manifest.yaml` - Event trigger instead of cron
✅ `deploy.ts` - Event trigger configuration
✅ `task.ts` - Updated comments
✅ `.env.example` - Added SARM_HOOK_ADDRESS
✅ `EVENT_TRIGGER_SETUP.md` - Setup guide
✅ `ON_DEMAND_ARCHITECTURE.md` - Architecture details

## Next Steps

1. **Deploy SARMHook:**
   ```bash
   cd sarm-protocol
   forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org --broadcast
   ```

2. **Add to .env:**
   ```bash
   SARM_HOOK_ADDRESS=0x...  # From deployment
   ```

3. **Deploy Mimic task:**
   ```bash
   cd mimic
   npm run deploy
   ```

4. **Set up GitHub Actions:**
   - Add secrets to GitHub
   - Push `.github/workflows/redeploy-mimic.yml`
   - It will run daily automatically

5. **Test:**
   - Perform a swap
   - Check Mimic dashboard for execution
   - Verify ratings updated

## Monitoring

- **Mimic Dashboard:** Check task executions
- **GitHub Actions:** Check daily redeployment logs
- **On-chain:** Check SSAOracleAdapter for updated ratings

