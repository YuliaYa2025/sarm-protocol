# Next Steps: Complete Mimic Integration

## ✅ Completed

1. ✅ **DataLink Integration**
   - `deploy.ts` fetches DataLink reports
   - `task.ts` uses pre-fetched reports
   - `EvmCall.create()` implemented correctly
   - All linter errors fixed

2. ✅ **Redeployment Strategy**
   - `redeploy.ts` script created
   - Frequency recommendations documented
   - Automation options provided

## 🎯 Immediate Next Steps

### Step 1: Set Up Environment Variables

```bash
cd sarm-protocol/mimic
cp .env.example .env
# Edit .env with your actual values:
# - MIMIC_API_KEY or PRIVATE_KEY
# - DATALINK_USER and DATALINK_SECRET (already in .env.example)
# - Contract addresses
# - Feed IDs
```

### Step 2: Test DataLink Fetch

```bash
# Test that DataLink API works with your credentials
npm run deploy
# Should fetch reports successfully
```

### Step 3: Compile Task

```bash
# Compile task.ts to WASM
mimic compile task.ts
# Or check if there's a build script
npm run build  # if configured
```

### Step 4: Deploy Task

```bash
# Deploy to Mimic Protocol
npm run deploy
# This will:
# 1. Fetch fresh DataLink reports
# 2. Create task with manifest
# 3. Create config with reports as inputs
```

### Step 5: Set Up Automated Redeployment

**Option A: Cron Job (Recommended)**

```bash
# Edit crontab
crontab -e

# Add one of these:
# Daily at 2 AM UTC
0 2 * * * cd /path/to/sarm-protocol/mimic && /usr/bin/tsx redeploy.ts >> redeploy.log 2>&1

# Every 8 hours (3x per day)
0 */8 * * * cd /path/to/sarm-protocol/mimic && /usr/bin/tsx redeploy.ts >> redeploy.log 2>&1
```

**Option B: GitHub Actions**

Create `.github/workflows/redeploy-mimic.yml` (see `REDEPLOYMENT_STRATEGY.md`)

### Step 6: Monitor Executions

```typescript
// Check task executions
const executions = await client.executions.get({ configSig: 'your-config-sig' })
console.log('Executions:', executions)
```

## 📋 Recommended Redeployment Frequency

**Based on SSA characteristics:**
- **SSAs don't change frequently** (monthly/quarterly reviews)
- **But can change outside review cycle** if structure/context changes
- **Goal: Detect changes quickly, not update every minute**

**Recommended: Daily or 2-3x per day**

### Why This Frequency?

| Frequency | Detection Time | Cost | Recommendation |
|-----------|---------------|------|----------------|
| Every 10 min | Immediate | High | ❌ Overkill for SSAs |
| Every 8 hours | 8 hours max | Medium | ✅ Good balance |
| Daily | 24 hours max | Low | ✅ Recommended |
| Weekly | 7 days max | Very Low | ⚠️ Too slow |

**Best Choice: Daily at 2 AM UTC** (catches changes within 24 hours)

## 🔍 Testing Checklist

- [ ] DataLink API credentials work
- [ ] Reports fetch successfully
- [ ] Task compiles without errors
- [ ] Task deploys successfully
- [ ] Config created with reports
- [ ] Task executes on schedule
- [ ] Contract calls succeed
- [ ] Redeployment script works
- [ ] Cron job scheduled (if using)

## 📝 Files to Review

1. **`deploy.ts`** - Deployment script with DataLink fetch
2. **`task.ts`** - Task code using EvmCall
3. **`redeploy.ts`** - Automated redeployment script
4. **`REDEPLOYMENT_STRATEGY.md`** - Detailed strategy guide
5. **`.env.example`** - Environment variables template

## 🚨 Important Notes

1. **Reports are static** - Fetched at deployment, used for all executions until redeployment
2. **Redeploy regularly** - Use `redeploy.ts` script daily or 2-3x per day
3. **Monitor executions** - Check that task runs successfully
4. **ChainId mapping** - Base Sepolia (84532) maps to `ChainId.BASE` (8453) - verify this works
5. **Costs** - Task executions cost fees, redeployments are free

## 🎓 Understanding the Architecture

```
┌─────────────────┐
│  Cron Job        │  (Daily at 2 AM)
│  redeploy.ts     │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  deploy.ts      │
│  - Fetch DataLink│
│  - Create Task   │
│  - Create Config │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  Mimic Protocol │
│  - Task runs     │
│  - Every 10 min │
│  - Uses reports  │
│  - Creates intents│
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  SSAOracleAdapter│
│  - Receives reports│
│  - Updates ratings│
└─────────────────┘
```

## 🔄 Workflow

1. **Daily (2 AM UTC):** `redeploy.ts` runs
2. **Fetches fresh reports** from DataLink
3. **Redeploys task** with new reports
4. **Task runs every 10 minutes** using those reports
5. **Next day:** Process repeats

## 📚 Additional Resources

- `REDEPLOYMENT_STRATEGY.md` - Detailed strategy and options
- `ANSWER.md` - Answer to DataLink integration question
- `DATALINK_SOLUTION.md` - Technical implementation details
- `IMPLEMENTATION_GUIDE.md` - API usage guide

## 🎯 Success Criteria

✅ Task deploys successfully
✅ Reports fetched from DataLink
✅ Task executes on schedule (every 10 min)
✅ Contract calls succeed
✅ Redeployment works automatically
✅ Changes detected within 24 hours
