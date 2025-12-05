# GitHub Actions Setup for Automated Redeployment

## Overview

This uses **GitHub Actions** (Mimic-native alternative to cron) to automatically redeploy your Mimic task daily at 2 AM UTC.

## Why GitHub Actions?

- ✅ **No local server needed** - Runs in GitHub's cloud
- ✅ **Free for public repos** - No cost
- ✅ **Automatic execution** - Scheduled daily
- ✅ **Built into your repo** - Version controlled
- ✅ **Logs in GitHub** - Easy to monitor

## Setup Steps

### 1. Add Secrets to GitHub

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

**Required:**
- `PRIVATE_KEY` - Your wallet private key (0x...)
- `SSA_ORACLE_ADDRESS` - Your deployed contract address
- `DATALINK_USER` - DataLink username
- `DATALINK_SECRET` - DataLink secret

**All 10 Token Addresses:**
- `EURC_ADDRESS`
- `EURCV_ADDRESS`
- `FDUSD_ADDRESS`
- `GUSD_ADDRESS`
- `TUSD_ADDRESS`
- `USDE_ADDRESS`
- `USDP_ADDRESS`
- `DAI_ADDRESS`
- `USDT_ADDRESS`
- `USDC_ADDRESS`

**All 10 Feed IDs:**
- `FEED_ID_EURC`
- `FEED_ID_EURCV`
- `FEED_ID_FDUSD`
- `FEED_ID_GUSD`
- `FEED_ID_TUSD`
- `FEED_ID_USDE`
- `FEED_ID_USDP`
- `FEED_ID_DAI`
- `FEED_ID_USDT`
- `FEED_ID_USDC`

**Optional:**
- `CHAIN_ID` - Defaults to 84532 (Base Sepolia)
- `DATALINK_API_URL` - Defaults to testnet URL
- `MIMIC_API_KEY` - Alternative to PRIVATE_KEY

### 2. Commit Workflow File

The workflow file is already created at:
`.github/workflows/redeploy-mimic.yml`

Just commit and push:

```bash
git add .github/workflows/redeploy-mimic.yml
git commit -m "Add automated daily redeployment"
git push
```

### 3. Verify Setup

1. Go to your GitHub repo
2. Click "Actions" tab
3. You should see "Daily Mimic Task Redeployment" workflow
4. It will run automatically at 2 AM UTC daily
5. You can also trigger it manually via "Run workflow" button

## How It Works

```
Daily at 2 AM UTC
    ↓
GitHub Actions triggers
    ↓
Runs: npm run deploy
    ↓
Fetches fresh DataLink reports (all 10 feeds)
    ↓
Redeploys Mimic task with fresh reports
    ↓
Task runs every 10 minutes using fresh reports
```

## Monitoring

### View Execution History

1. Go to GitHub repo → Actions tab
2. Click on "Daily Mimic Task Redeployment"
3. See all past executions
4. Click on any execution to see logs

### Manual Trigger

1. Go to Actions tab
2. Click "Daily Mimic Task Redeployment"
3. Click "Run workflow" button
4. Select branch and click "Run workflow"

## Benefits Over Local Cron

| Feature | GitHub Actions | Local Cron |
|---------|---------------|------------|
| Server needed | ❌ No | ✅ Yes |
| Setup complexity | ✅ Easy | ⚠️ Medium |
| Monitoring | ✅ Built-in | ⚠️ Manual |
| Logs | ✅ GitHub UI | ⚠️ Local files |
| Cost | ✅ Free | ⚠️ Server cost |
| Reliability | ✅ High | ⚠️ Depends on server |

## Alternative: Use Mimic's Built-in Cron Only

If you don't want external automation, you can:

1. **Deploy once manually** with initial reports
2. **Let Mimic run** the task every 10 minutes
3. **Accept that reports are static** until you manually redeploy

**Trade-off:** Reports won't update automatically, but task execution is fully automated within Mimic.

## Next Steps

1. ✅ Add secrets to GitHub (see list above)
2. ✅ Commit and push the workflow file
3. ✅ Verify it runs in Actions tab
4. ✅ Monitor first execution

The workflow is ready - just add your secrets and push!

