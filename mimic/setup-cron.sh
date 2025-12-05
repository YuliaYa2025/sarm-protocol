#!/bin/bash
# Setup cron job for daily Mimic task redeployment at 2 AM UTC

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRON_JOB="0 2 * * * cd $SCRIPT_DIR && /usr/bin/tsx redeploy.ts >> redeploy.log 2>&1"

echo "🔧 Setting up daily redeployment cron job (2 AM UTC)"
echo ""
echo "Cron job to add:"
echo "$CRON_JOB"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "redeploy.ts"; then
    echo "⚠️  Cron job already exists. Current crontab:"
    crontab -l | grep "redeploy.ts"
    echo ""
    read -p "Do you want to replace it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove existing redeploy cron job
        crontab -l 2>/dev/null | grep -v "redeploy.ts" | crontab -
        echo "✅ Removed existing cron job"
    else
        echo "❌ Cancelled. Keeping existing cron job."
        exit 0
    fi
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron job added successfully!"
echo ""
echo "📋 Current crontab:"
crontab -l
echo ""
echo "📝 Logs will be written to: $SCRIPT_DIR/redeploy.log"
echo ""
echo "💡 To remove the cron job later, run:"
echo "   crontab -e"
echo "   (then delete the line with redeploy.ts)"

