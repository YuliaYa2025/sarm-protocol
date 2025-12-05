# Automation Within Mimic Protocol

## What is a Cron Job?

A **cron job** is a scheduled task that runs automatically on your server/computer at specified times. It's an external system (not part of Mimic).

**Example:** "Run this script every day at 2 AM"

## The Challenge

### What Needs to Happen

1. **Fetch fresh DataLink reports** (requires HTTP request)
2. **Redeploy Mimic task** with fresh reports (requires Mimic SDK)
3. **Task runs** using fresh reports (already automated in Mimic)

### The Problem

**Mimic task code cannot:**
- ❌ Make HTTP requests (no `fetch()` API)
- ❌ Call Mimic SDK (no SDK access in task code)
- ❌ Redeploy itself (task code runs in WASM, limited capabilities)

**Mimic task code CAN:**
- ✅ Create intents (EvmCall, Transfer, Swap)
- ✅ Read contract state
- ✅ Query subgraphs
- ✅ Access pre-provided inputs

## Current Architecture

```
┌─────────────────────────────────────┐
│ External System (Cron/CI/CD)        │
│ - Fetches DataLink reports (HTTP)   │
│ - Redeploys task (Mimic SDK)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Mimic Protocol                      │
│ - Task runs every 10 min (cron)    │
│ - Uses pre-fetched reports          │
│ - Creates intents                   │
└─────────────────────────────────────┘
```

## Mimic-Native Solutions

### Option 1: Use Mimic's Cron Trigger (Current)

**What's already automated:**
- ✅ Task runs every 10 minutes automatically (via `manifest.yaml` cron)
- ✅ No external cron needed for task execution

**What's NOT automated:**
- ❌ Fetching fresh reports (needs HTTP)
- ❌ Redeploying with fresh reports (needs SDK)

**This is the limitation:** Mimic can't fetch external data or redeploy itself.

### Option 2: Use Mimic Oracles (If Available)

If DataLink becomes available as a Mimic oracle:

```typescript
// In task.ts - hypothetical future API
const reports = environment.oracleQuery('datalink', {
  feedIds: [inputs.feedIdUsdc, inputs.feedIdUsdt, ...]
})
```

**Status:** Not currently available. DataLink is not a Mimic oracle.

### Option 3: Hybrid Approach

Keep current setup but use **Mimic's cron** for task execution, and external system only for redeployment:

- **Mimic cron:** Runs task every 10 minutes ✅ (already working)
- **External redeployment:** Daily at 2 AM (only for fetching fresh reports)

## Recommended Solution

### Use Mimic's Built-in Cron + External Redeployment

**Why this is the best approach:**

1. **Mimic handles task execution** (every 10 minutes) - fully automated ✅
2. **External system handles redeployment** (daily) - minimal setup
3. **Separation of concerns:**
   - Mimic = on-chain execution
   - External = off-chain data fetching

### Setup Options

#### Option A: GitHub Actions (Recommended for CI/CD)

```yaml
# .github/workflows/redeploy-mimic.yml
name: Daily Mimic Redeployment

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch:  # Manual trigger

jobs:
  redeploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: |
          cd sarm-protocol/mimic
          npm install
          npm run deploy
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
          # ... other env vars
```

**Benefits:**
- ✅ No local server needed
- ✅ Free for public repos
- ✅ Automatic execution
- ✅ Logs in GitHub

#### Option B: Local Cron (If you have a server)

```bash
# Runs on your local machine/server
0 2 * * * cd /path/to/mimic && npm run redeploy
```

**Benefits:**
- ✅ Full control
- ✅ No external dependencies

#### Option C: Cloud Functions (AWS Lambda, Google Cloud Functions)

Deploy `redeploy.ts` as a cloud function scheduled to run daily.

## What's Already Automated in Mimic

✅ **Task execution** - Runs every 10 minutes automatically (via `manifest.yaml`)
✅ **Intent creation** - Automatically creates intents for all 10 tokens
✅ **Contract calls** - Automatically submits reports to SSAOracleAdapter

## What Needs External Automation

❌ **Report fetching** - Requires HTTP (not available in Mimic task code)
❌ **Task redeployment** - Requires Mimic SDK (not available in task code)

## Summary

**Cron job** = External scheduled task (not part of Mimic)

**Mimic's capabilities:**
- ✅ Can run tasks on schedule (cron trigger in manifest)
- ✅ Can create intents automatically
- ❌ Cannot fetch external data (no HTTP API)
- ❌ Cannot redeploy itself (no SDK access)

**Best approach:**
- Use **Mimic's cron** for task execution (already set up)
- Use **external automation** (GitHub Actions, cron, or cloud function) for redeployment

The external automation is minimal - just runs `npm run deploy` daily to fetch fresh reports and update the task config.

