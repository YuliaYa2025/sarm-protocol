#!/usr/bin/env tsx
/**
 * @title Trigger Mimic Task On-Demand
 * @notice Script to manually trigger Mimic task execution
 * @dev Can be called when a swap happens or for testing
 * 
 * Usage:
 *   tsx trigger-on-demand.ts
 *   or
 *   Call from external service when swap event detected
 */

import { Client, ApiKeyAuth, EthersSigner } from '@mimicprotocol/sdk'
import * as dotenv from 'dotenv'

dotenv.config()

// Configuration
const config = {
  apiKey: process.env.MIMIC_API_KEY,
  privateKey: process.env.PRIVATE_KEY,
  configSig: process.env.MIMIC_CONFIG_SIG || '', // Get this after first deployment
}

/**
 * Initialize Mimic client
 */
function createClient(): Client {
  if (config.apiKey) {
    return new Client({
      auth: new ApiKeyAuth(config.apiKey),
    })
  } else if (config.privateKey) {
    const signer = EthersSigner.fromPrivateKey(config.privateKey as `0x${string}`)
    return new Client({
      signer,
    })
  } else {
    throw new Error('Either MIMIC_API_KEY or PRIVATE_KEY must be set')
  }
}

/**
 * Trigger Mimic task execution on-demand
 */
async function triggerExecution(): Promise<void> {
  console.log('[TRIGGER] Triggering Mimic task execution on-demand...\n')

  if (!config.configSig) {
    throw new Error('MIMIC_CONFIG_SIG must be set. Get it from the first deployment.')
  }

  const client = createClient()

  try {
    // Create execution on-demand
    // Based on Mimic API: POST /executions
    const execution = await client.executions.create({
      configSig: config.configSig,
      triggerType: 'manual',
      triggerData: {},
      timestamp: new Date().toISOString(),
      inputs: [], // Reports are already in config inputs
      outputs: [],
      signature: '', // Would need to sign this properly
    })

    console.log(`[TRIGGER] ✓ Execution triggered: ${execution.hash}`)
    console.log(`[TRIGGER] Status: ${execution.status}`)
    console.log(`\n[TRIGGER] Monitor execution:`)
    console.log(`  client.executions.get({ hash: '${execution.hash}' })`)

  } catch (error: any) {
    console.error('[TRIGGER] ✗ Failed to trigger execution:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
    throw error
  }
}

// Main execution
triggerExecution()
  .then(() => {
    console.log('\n[TRIGGER] Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n[FATAL] Trigger failed:', error)
    process.exit(1)
  })

