/**
 * @title SARM Protocol SSA Rating Refresh Task
 * @notice Mimic Protocol task for automated SSA rating updates
 * @dev This task:
 *      1. Triggers on-demand when a swap happens (via SARMHook RiskCheck event)
 *      2. Uses pre-fetched SSA rating reports from DataLink (updated daily via GitHub Actions)
 *      3. Submits reports to SSAOracleAdapter on-chain via refreshRatingWithReport()
 * 
 * Architecture:
 * - Trigger: Event-based (RiskCheck event from SARMHook)
 * - Reports: Pre-fetched daily via GitHub Actions redeployment
 * - Execution: On-demand when swaps occur
 * - Updates: All 10 stablecoin ratings
 * 
 * Security:
 * - DataLink credentials stored as Mimic secrets
 * - Tasks run on Mimic's decentralized network
 * - DataLink reports are cryptographically signed and verified on-chain
 * 
 * Part of SARM Protocol for ETHGlobal Buenos Aires 2025
 */

import { 
  EvmCall, 
  Address, 
  Bytes, 
  ChainId, 
  DenominationToken, 
  TokenAmount,
  log,
  evm,
  EvmEncodeParam
} from '@mimicprotocol/lib-ts'

// Inputs are injected by Mimic runtime as a global variable
// Type definition is in types.ts for reference
declare const inputs: {
  chainId: number
  ssaOracleAddress: string
  eurcAddress: string
  eurcvAddress: string
  fdusdAddress: string
  gusdAddress: string
  tusdAddress: string
  usdeAddress: string
  usdpAddress: string
  daiAddress: string
  usdtAddress: string
  usdcAddress: string
  datalinkApiUrl: string
  datalinkUser: string
  datalinkSecret: string
  feedIdEurc: string
  feedIdEurcv: string
  feedIdFdusd: string
  feedIdGusd: string
  feedIdTusd: string
  feedIdUsde: string
  feedIdUsdp: string
  feedIdDai: string
  feedIdUsdt: string
  feedIdUsdc: string
  reports: Array<{
    feedId: string
    validFromTimestamp: number
    observationsTimestamp: number
    fullReport: string
  }>
}

/**
 * DataLink API response structure
 */
interface DataLinkReport {
  feedId: string
  validFromTimestamp: number
  observationsTimestamp: number
  fullReport: string // Hex-encoded signed report
}

// DataLinkBulkResponse no longer needed - reports come from inputs

/**
 * Main task function - triggered on-demand by swap events
 * 
 * Flow:
 * 1. Fetch all SSA reports from DataLink in one bulk request
 * 2. For each stablecoin (EURC, EURCV, FDUSD, GUSD, TUSD, USDe, USDP, DAI, USDT, USDC):
 *    - Find its report by feedId
 *    - Create intent to submit to oracle contract
 * 
 * Note: This implementation assumes Mimic supports:
 * - HTTP requests with Basic Auth (via oracle data sources)
 * - Contract calls via intent creation (similar to Transfer.create())
 * - Multiple intents in a single task execution
 */
export default function main(): void {
  log.info(`[SARM] Task triggered`)

  // Reports are pre-fetched in deploy.ts and passed as inputs
  // This avoids the need for HTTP requests in task code (which Mimic doesn't support)
  const reports = inputs.reports
  
  if (!reports || reports.length === 0) {
    log.warning('[SARM] No reports in inputs, skipping execution')
    return
  }

  log.info(`[SARM] Using ${reports.length} pre-fetched reports from inputs`)

  // Step 2-4: Update each token's rating on-chain
  // Helper function to update one token
  function updateToken(
    tokenName: string,
    tokenAddress: string,
    feedId: string,
    reports: DataLinkReport[]
  ): void {
    log.info(`[${tokenName}] Finding report for feedId: ${feedId}`)

    const report = reports.find(
      (r) => r.feedId.toLowerCase() === feedId.toLowerCase()
    )

    if (!report || !report.fullReport) {
      log.warning(`[${tokenName}] ⚠ No report found, skipping`)
      return
    }

    log.info(`[${tokenName}] Report found, creating intent to submit to oracle...`)
    log.info(`[${tokenName}]   validFrom: ${new Date(report.validFromTimestamp * 1000).toISOString()}`)
    log.info(`[${tokenName}]   observations: ${new Date(report.observationsTimestamp * 1000).toISOString()}`)

    // Create EVM call intent using Mimic Library APIs
    // Encode function call: refreshRatingWithReport(address,bytes)
    const functionSignature = 'refreshRatingWithReport(address,bytes)'
    
    // Get function selector (first 4 bytes of keccak256 hash)
    const functionHash = evm.keccak(functionSignature)
    const functionSelector = Bytes.fromHexString('0x' + functionHash.substring(2, 10))
    
    // Encode parameters using EvmEncodeParam
    const encodeParams = [
      EvmEncodeParam.fromValue('address', tokenAddress),
      EvmEncodeParam.fromValue('bytes', report.fullReport)
    ]
    const encodedParams = evm.encode(encodeParams)
    
    // Combine selector + encoded params
    const callData = Bytes.fromHexString(
      functionSelector.toHexString() + encodedParams.substring(2)
    )

    // Map chainId number to ChainId enum
    // Base Sepolia (84532) is not in enum, use BASE (8453) as fallback
    // In production, you may need to handle custom chain IDs differently
    let chainId: ChainId
    if (inputs.chainId === 84532) {
      // Base Sepolia - use BASE enum value as closest match
      // Note: You may need to verify if Mimic supports Base Sepolia
      chainId = ChainId.BASE
    } else if (inputs.chainId === 8453) {
      chainId = ChainId.BASE
    } else if (inputs.chainId === 1) {
      chainId = ChainId.ETHEREUM
    } else if (inputs.chainId === 10) {
      chainId = ChainId.OPTIMISM
    } else if (inputs.chainId === 42161) {
      chainId = ChainId.ARBITRUM
    } else {
      // Default to BASE if unknown
      log.warning(`[${tokenName}] Unknown chainId ${inputs.chainId}, using BASE`)
      chainId = ChainId.BASE
    }
    
    const maxFee = TokenAmount.fromStringDecimal(DenominationToken.USD(), '0.25')
    
    EvmCall.create(
      chainId,
      Address.fromString(inputs.ssaOracleAddress),
      callData,
      maxFee
    ).send()

    log.info(`[${tokenName}] ✓ Intent created for rating update`)
  }

  // Execute updates for all 10 tokens
  updateToken('EURC', inputs.eurcAddress, inputs.feedIdEurc, reports)
  updateToken('EURCV', inputs.eurcvAddress, inputs.feedIdEurcv, reports)
  updateToken('FDUSD', inputs.fdusdAddress, inputs.feedIdFdusd, reports)
  updateToken('GUSD', inputs.gusdAddress, inputs.feedIdGusd, reports)
  updateToken('TUSD', inputs.tusdAddress, inputs.feedIdTusd, reports)
  updateToken('USDe', inputs.usdeAddress, inputs.feedIdUsde, reports)
  updateToken('USDP', inputs.usdpAddress, inputs.feedIdUsdp, reports)
  updateToken('DAI', inputs.daiAddress, inputs.feedIdDai, reports)
  updateToken('USDT', inputs.usdtAddress, inputs.feedIdUsdt, reports)
  updateToken('USDC', inputs.usdcAddress, inputs.feedIdUsdc, reports)

  log.info('[SARM] ✓ Task completed successfully')
}

// Note: DataLink reports are now fetched in deploy.ts and passed as inputs
// This avoids the need for HTTP requests in task code (which Mimic Library doesn't support)

