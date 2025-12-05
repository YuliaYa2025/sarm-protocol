# Automated Daily Redeployment Setup (2 AM UTC)

## Quick Setup

### Option 1: Automated Script (Recommended)

```bash
cd sarm-protocol/mimic
./setup-cron.sh
```

This script will:
- ✅ Add cron job for daily redeployment at 2 AM UTC
- ✅ Check for existing cron jobs
- ✅ Set up log file location

### Option 2: Manual Setup

```bash
# Edit crontab
crontab -e

# Add this line (replace /path/to/mimic with actual path):
0 2 * * * cd /path/to/sarm-protocol/mimic && /usr/bin/tsx redeploy.ts >> redeploy.log 2>&1
```

## Cron Schedule Explanation

```
0 2 * * *
│ │ │ │ │
│ │ │ │ └── Day of week (0-7, 0 and 7 = Sunday)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23, UTC)
└────────── Minute (0-59)
```

**`0 2 * * *`** = Every day at 2:00 AM UTC

## Verify Setup

```bash
# View current crontab
crontab -l

# Should show:
# 0 2 * * * cd /path/to/sarm-protocol/mimic && /usr/bin/tsx redeploy.ts >> redeploy.log 2>&1
```

## Logs

Logs are written to `redeploy.log` in the mimic directory:

```bash
# View logs
tail -f sarm-protocol/mimic/redeploy.log

# View last 50 lines
tail -n 50 sarm-protocol/mimic/redeploy.log
```

## What Happens Daily at 2 AM UTC

1. **Cron triggers** `redeploy.ts`
2. **Script runs** `npm run deploy`
3. **Deploy script**:
   - Fetches fresh DataLink reports for all 10 feeds
   - Creates/updates Mimic task configuration
   - Passes fresh reports as inputs
4. **Task runs** every 10 minutes using the fresh reports

## Timezone Conversion

**2 AM UTC** equals:
- **9 PM EST** (previous day)
- **6 PM PST** (previous day)
- **3 AM CET** (same day)
- **11 AM JST** (same day)

## Troubleshooting

### Cron job not running?

1. **Check cron service:**
   ```bash
   # macOS
   sudo launchctl list | grep cron
   
   # Linux
   sudo systemctl status cron
   ```

2. **Check logs:**
   ```bash
   # macOS
   grep CRON /var/log/system.log
   
   # Linux
   grep CRON /var/log/syslog
   ```

3. **Test manually:**
   ```bash
   cd sarm-protocol/mimic
   npm run redeploy
   ```

### Path issues?

Make sure the path in cron is absolute:
```bash
# Get absolute path
cd sarm-protocol/mimic && pwd

# Use that path in cron
0 2 * * * cd /absolute/path/to/mimic && /usr/bin/tsx redeploy.ts >> redeploy.log 2>&1
```

### tsx not found?

Use full path to tsx:
```bash
# Find tsx location
which tsx

# Use in cron (example):
0 2 * * * cd /path/to/mimic && /usr/local/bin/tsx redeploy.ts >> redeploy.log 2>&1
```

Or use npm:
```bash
0 2 * * * cd /path/to/mimic && npm run redeploy >> redeploy.log 2>&1
```

## Remove Cron Job

```bash
# Edit crontab
crontab -e

# Delete the line with redeploy.ts
# Save and exit
```

Or use the script:
```bash
# Remove manually
crontab -l | grep -v "redeploy.ts" | crontab -
```

## Alternative: GitHub Actions

If you prefer CI/CD, see `REDEPLOYMENT_STRATEGY.md` for GitHub Actions setup.

## Monitoring

Check that redeployments are working:

```bash
# Check last redeployment time
ls -lh redeploy.log

# View recent redeployment logs
tail -n 100 redeploy.log | grep "REDEPLOY"
```

## Next Steps

1. ✅ Run `./setup-cron.sh` to set up cron job
2. ✅ Verify with `crontab -l`
3. ✅ Wait for first execution (or test manually)
4. ✅ Monitor `redeploy.log` for success

