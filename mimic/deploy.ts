#!/usr/bin/env tsx

/**
 * @title Mimic Protocol Task Deployment Script
 * @notice Deploys the SSA rating refresh task to Mimic Protocol network
 * @dev Uses Mimic SDK to create task and configuration
 * 
 * Usage:
 *   MIMIC_API_KEY=your-key tsx deploy.ts
 *   or
 *   PRIVATE_KEY=0x... tsx deploy.ts
 */

import { Client, ApiKeyAuth, EthersSigner, TriggerType } from '@mimicprotocol/sdk'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config()

/**
 * DataLink API response structure
 */
interface DataLinkReport {
  feedId: string
  validFromTimestamp: number
  observationsTimestamp: number
  fullReport: string // Hex-encoded signed report
}

interface DataLinkBulkResponse {
  reports: DataLinkReport[]
}

// Configuration
const config = {
  // Authentication (choose one)
  apiKey: process.env.MIMIC_API_KEY,
  privateKey: process.env.PRIVATE_KEY,
  
  // Task files
  taskFile: path.join(__dirname, 'task.ts'),
  manifestFile: path.join(__dirname, 'manifest.yaml'),
  
  // Task inputs (from environment or config)
  inputs: {
    chainId: parseInt(process.env.CHAIN_ID || '84532'), // Base Sepolia
    ssaOracleAddress: process.env.SSA_ORACLE_ADDRESS || '',
    sarmHookAddress: process.env.SARM_HOOK_ADDRESS || '', // For event trigger
    // All 10 token addresses
    eurcAddress: process.env.EURC_ADDRESS || '',
    eurcvAddress: process.env.EURCV_ADDRESS || '',
    fdusdAddress: process.env.FDUSD_ADDRESS || '',
    gusdAddress: process.env.GUSD_ADDRESS || '',
    tusdAddress: process.env.TUSD_ADDRESS || '',
    usdeAddress: process.env.USDE_ADDRESS || '',
    usdpAddress: process.env.USDP_ADDRESS || '',
    daiAddress: process.env.DAI_ADDRESS || '',
    usdtAddress: process.env.USDT_ADDRESS || '',
    usdcAddress: process.env.USDC_ADDRESS || '',
    // All 10 feed IDs
    feedIdEurc: process.env.FEED_ID_EURC || '',
    feedIdEurcv: process.env.FEED_ID_EURCV || '',
    feedIdFdusd: process.env.FEED_ID_FDUSD || '',
    feedIdGusd: process.env.FEED_ID_GUSD || '',
    feedIdTusd: process.env.FEED_ID_TUSD || '',
    feedIdUsde: process.env.FEED_ID_USDE || '',
    feedIdUsdp: process.env.FEED_ID_USDP || '',
    feedIdDai: process.env.FEED_ID_DAI || '',
    feedIdUsdt: process.env.FEED_ID_USDT || '',
    feedIdUsdc: process.env.FEED_ID_USDC || '',
    datalinkApiUrl: process.env.DATALINK_API_URL || 'https://api.datalink.chainlink.com/api/v1/reports/bulk',
  },
  
  // Trigger configuration - Event-based (on-demand when swap happens)
  // Note: contract address comes from inputs.sarmHookAddress
  trigger: {
    type: TriggerType.Event as const,
    chainId: parseInt(process.env.CHAIN_ID || '84532'),
    contract: process.env.SARM_HOOK_ADDRESS || '', // SARMHook contract address (will be set from inputs)
    topics: [
      ['0x988b2889'] // RiskCheck(bytes32,uint8,uint8,uint8) event signature
    ],
    delta: '1h', // Execution window
    endDate: 0, // No end date
  },
  
  // Execution limits
  executionFeeLimit: '1000000000000000000', // 1 ETH in wei (adjust as needed)
  minValidations: 1,
}

/**
 * Initialize Mimic client with authentication
 */
function createClient(): Client {
  if (config.apiKey) {
    console.log('[AUTH] Using API key authentication')
    return new Client({
      auth: new ApiKeyAuth(config.apiKey),
    })
  } else if (config.privateKey) {
    console.log('[AUTH] Using signer authentication')
    const signer = EthersSigner.fromPrivateKey(config.privateKey as `0x${string}`)
    return new Client({
      signer,
    })
  } else {
    throw new Error('Either MIMIC_API_KEY or PRIVATE_KEY must be set in .env file')
  }
}

/**
 * Fetch DataLink reports using REST API
 * Uses the same API as Chainlink CRE SDK
 * Based on: https://docs.chain.link/datalink/pull-delivery/tutorials/fetch-decode/api-go
 */
async function fetchDataLinkReports(): Promise<DataLinkReport[]> {
  const apiUrl = process.env.DATALINK_API_URL || 'https://api.testnet-dataengine.chain.link/api/v1/reports/bulk'
  const user = process.env.DATALINK_USER || ''
  const secret = process.env.DATALINK_SECRET || ''
  
  if (!user || !secret) {
    throw new Error('DATALINK_USER and DATALINK_SECRET must be set in .env file')
  }

  // Create Basic Auth header
  const auth = Buffer.from(`${user}:${secret}`).toString('base64')
  
  // Get all 10 feed IDs from config
  const feedIds = [
    config.inputs.feedIdEurc,
    config.inputs.feedIdEurcv,
    config.inputs.feedIdFdusd,
    config.inputs.feedIdGusd,
    config.inputs.feedIdTusd,
    config.inputs.feedIdUsde,
    config.inputs.feedIdUsdp,
    config.inputs.feedIdDai,
    config.inputs.feedIdUsdt,
    config.inputs.feedIdUsdc,
  ].filter(id => id && id !== '') // Remove empty values

  if (feedIds.length === 0) {
    throw new Error('At least one feed ID must be configured')
  }

  console.log('[DATALINK] Fetching reports from DataLink API...')
  console.log(`[DATALINK] API URL: ${apiUrl}`)
  console.log(`[DATALINK] Feed IDs: ${feedIds.join(', ')}`)

  // Make POST request to DataLink bulk endpoint
  // Based on: https://docs.chain.link/datalink/pull-delivery/reference/api-sdk-onchain-verification
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      feedIds: feedIds,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DataLink API error: ${response.status} ${response.statusText}\n${errorText}`)
  }

  const data = await response.json() as DataLinkBulkResponse
  
  if (!data.reports || !Array.isArray(data.reports)) {
    throw new Error('Invalid response from DataLink API: missing reports array')
  }

  console.log(`[DATALINK] ✓ Fetched ${data.reports.length} reports`)
  
  // Log report details
  for (const report of data.reports) {
    const validFrom = new Date(report.validFromTimestamp * 1000).toISOString()
    const observations = new Date(report.observationsTimestamp * 1000).toISOString()
    console.log(`[DATALINK]   - Feed ${report.feedId}:`)
    console.log(`[DATALINK]     Valid from: ${validFrom}`)
    console.log(`[DATALINK]     Observations: ${observations}`)
  }

  return data.reports
}

/**
 * Validate configuration
 */
function validateConfig(): void {
  const required = [
    'ssaOracleAddress',
    'sarmHookAddress', // Required for event trigger
    // All 10 token addresses
    'eurcAddress',
    'eurcvAddress',
    'fdusdAddress',
    'gusdAddress',
    'tusdAddress',
    'usdeAddress',
    'usdpAddress',
    'daiAddress',
    'usdtAddress',
    'usdcAddress',
    // All 10 feed IDs
    'feedIdEurc',
    'feedIdEurcv',
    'feedIdFdusd',
    'feedIdGusd',
    'feedIdTusd',
    'feedIdUsde',
    'feedIdUsdp',
    'feedIdDai',
    'feedIdUsdt',
    'feedIdUsdc',
  ] as const

  for (const key of required) {
    if (!config.inputs[key]) {
      throw new Error(`${key.toUpperCase()} is required in .env file`)
    }
  }

  if (!fs.existsSync(config.taskFile)) {
    throw new Error(`Task file not found: ${config.taskFile}`)
  }

  if (!fs.existsSync(config.manifestFile)) {
    throw new Error(`Manifest file not found: ${config.manifestFile}`)
  }
}

/**
 * Deploy task to Mimic Protocol
 */
async function deployTask(): Promise<void> {
  console.log('[DEPLOY] Starting Mimic Protocol task deployment...\n')

  // Validate configuration
  validateConfig()

  // Create client
  const client = createClient()

  // Fetch DataLink reports BEFORE creating config
  // This allows us to pass fresh reports as task inputs
  console.log('[DATALINK] Fetching DataLink reports...')
  const reports = await fetchDataLinkReports()
  
  // Add reports to task inputs
  const taskInputs = {
    ...config.inputs,
    reports: reports, // Pre-fetched reports passed as inputs
  }

  // Read task files
  console.log('[FILES] Reading task files...')
  const taskCode = fs.readFileSync(config.taskFile, 'utf-8')
  const manifestContent = fs.readFileSync(config.manifestFile, 'utf-8')

  // Parse manifest (YAML to JSON)
  // Note: You may need to install 'js-yaml' for YAML parsing
  // For now, we'll assume the manifest is already in the correct format
  // In production, you'd parse YAML and convert to Mimic's manifest format

  console.log('[TASK] Creating task...')
  
  // Create task using SDK
  // Note: This is a conceptual implementation
  // The actual API may require compiling to WASM first
  try {
    const task = await client.tasks.create({
      manifestFile: new File([manifestContent], 'manifest.yaml', { type: 'application/yaml' }),
      wasmFile: new File([], 'task.wasm', { type: 'application/wasm' }), // Would be compiled WASM
    })

    console.log(`[OK] Task created: ${task.CID}`)

    // Create configuration
    console.log('[CONFIG] Creating task configuration...')
    
    // Note: The manifest is parsed from the task, so we don't need to provide it here
    // The SDK will fetch it from the task CID
    const taskConfig = await client.configs.signAndCreate({
      description: 'SARM Protocol SSA Rating Refresh - On-demand rating updates triggered by swaps',
      taskCid: task.CID,
      version: '1.0.0',
      trigger: config.trigger,
      input: taskInputs, // Use inputs with pre-fetched reports
      executionFeeLimit: config.executionFeeLimit,
      minValidations: config.minValidations,
      // manifest is not needed - it's fetched from task CID
    } as any) // Type assertion needed due to SDK type definitions

    console.log(`[OK] Configuration created: ${taskConfig.sig}`)
    console.log(`[OK] Task will execute on-demand when swaps happen`)
    console.log(`\n[DONE] Deployment complete!`)
    console.log(`\nNext steps:`)
    console.log(`1. Monitor executions: client.executions.get({ configSig: '${taskConfig.sig}' })`)
    console.log(`2. Check dashboard: https://mimic.fi`)
    console.log(`3. View task: ${task.CID}`)
    console.log(`4. Save config signature: export MIMIC_CONFIG_SIG='${taskConfig.sig}'`)

  } catch (error: any) {
    console.error('[ERROR] Deployment failed:', error.message)
    if (error instanceof Error) {
      console.error('Details:', error)
    }
    throw error
  }
}

// Main execution
deployTask()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n[FATAL] Deployment failed:', error)
    process.exit(1)
  })

