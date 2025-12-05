/**
 * Type definitions for Mimic task inputs
 * These match the manifest.yaml input definitions
 */

export interface inputs {
  // Chain configuration
  chainId: number
  
  // Contract addresses
  ssaOracleAddress: string
  sarmHookAddress?: string  // Optional - for event trigger
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
  
  // DataLink configuration
  datalinkApiUrl: string
  datalinkUser: string
  datalinkSecret: string
  
  // DataLink feed IDs (all 10 feeds)
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
  
  // Pre-fetched DataLink reports (passed from deploy.ts)
  reports: Array<{
    feedId: string
    validFromTimestamp: number
    observationsTimestamp: number
    fullReport: string
  }>
}

