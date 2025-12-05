#!/usr/bin/env tsx
/**
 * @title Automated Mimic Task Redeployment Script
 * @notice Fetches fresh DataLink reports and redeploys Mimic task
 * @dev Designed to run via cron for scheduled redeployments
 * 
 * Usage:
 *   tsx redeploy.ts
 * 
 * Cron examples:
 *   # Daily at 2 AM UTC
 *   0 2 * * * cd /path/to/mimic && tsx redeploy.ts >> redeploy.log 2>&1
 * 
 *   # Every 8 hours (3x per day)
 *   0 */8 * * * cd /path/to/mimic && tsx redeploy.ts >> redeploy.log 2>&1
 */

import * as dotenv from 'dotenv'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'

dotenv.config()

const execAsync = promisify(exec)

async function redeploy(): Promise<void> {
  const timestamp = new Date().toISOString()
  console.log(`[REDEPLOY] Starting automated redeployment at ${timestamp}`)
  console.log(`[REDEPLOY] Working directory: ${process.cwd()}`)
  
  try {
    // Ensure we're in the mimic directory
    const mimicDir = path.join(__dirname)
    process.chdir(mimicDir)
    
    console.log('[REDEPLOY] Changed to:', process.cwd())
    console.log('[REDEPLOY] Running deployment script...')
    
    // Run deployment script (which will fetch fresh DataLink reports)
    const { stdout, stderr } = await execAsync('npm run deploy', {
      env: process.env,
      cwd: mimicDir,
    })
    
    console.log('[REDEPLOY] ✓ Redeployment successful')
    if (stdout) {
      console.log(stdout)
    }
    
    if (stderr) {
      console.warn('[REDEPLOY] Warnings:', stderr)
    }
    
    console.log(`[REDEPLOY] Completed at ${new Date().toISOString()}`)
  } catch (error: any) {
    console.error('[REDEPLOY] ✗ Redeployment failed:', error.message)
    if (error.stdout) {
      console.error('[REDEPLOY] stdout:', error.stdout)
    }
    if (error.stderr) {
      console.error('[REDEPLOY] stderr:', error.stderr)
    }
    throw error
  }
}

// Main execution
redeploy()
  .then(() => {
    console.log('[REDEPLOY] Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[FATAL] Redeployment script failed:', error)
    process.exit(1)
  })

