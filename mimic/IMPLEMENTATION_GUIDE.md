# Implementation Guide: Using Actual Mimic Library APIs

## ✅ Found APIs!

I've discovered the actual APIs in the installed `@mimicprotocol/lib-ts` package. Here's how to use them:

## 1. EVM Call Intent (Contract Calls)

**For calling `refreshRatingWithReport()` on your contract:**

```typescript
import { EvmCall, Address, Bytes, ChainId, DenominationToken, TokenAmount } from '@mimicprotocol/lib-ts'
import { evm } from '@mimicprotocol/lib-ts'

// Encode function call
const functionSignature = 'refreshRatingWithReport(address,bytes)'
const encodedParams = evm.encode([
  {
    type: 'address',
    value: tokenAddress
  },
  {
    type: 'bytes',
    value: report
  }
])

// Get function selector (first 4 bytes of keccak256 hash)
const functionSelector = evm.keccak(functionSignature).substring(0, 10) // 0x + 8 chars

// Combine selector + encoded params
const callData = Bytes.fromHexString(functionSelector + encodedParams.substring(2))

// Create and send intent
const maxFee = TokenAmount.fromStringDecimal(DenominationToken.USD(), '0.25')
const chainId = ChainId.fromNumber(inputs.chainId)

EvmCall.create(
  chainId,
  Address.fromString(inputs.ssaOracleAddress),
  callData,
  maxFee
).send()
```

**Or using the builder pattern:**

```typescript
import { EvmCallBuilder, Address, Bytes, ChainId, DenominationToken, TokenAmount } from '@mimicprotocol/lib-ts'
import { evm } from '@mimicprotocol/lib-ts'

const chainId = ChainId.fromNumber(inputs.chainId)
const maxFee = TokenAmount.fromStringDecimal(DenominationToken.USD(), '0.25')

// Encode function call (same as above)
const callData = /* ... encoded function call ... */

EvmCallBuilder
  .forChain(chainId)
  .addCall(Address.fromString(inputs.ssaOracleAddress), callData)
  .addMaxFee(maxFee)
  .build()
  .send()
```

## 2. HTTP Requests (DataLink API)

**⚠️ Issue:** The Library doesn't appear to have direct HTTP request APIs.

**Possible Solutions:**

### Option A: Use Oracle/Subgraph Query
If DataLink is available as an oracle, you might use:
```typescript
import { environment } from '@mimicprotocol/lib-ts'

// Check if there's an oracle for DataLink
// This would need to be configured in Mimic
```

### Option B: Use Subgraph Query
If DataLink data is indexed in a subgraph:
```typescript
import { environment } from '@mimicprotocol/lib-ts'

const response = environment.subgraphQuery(
  chainId,
  'datalink-subgraph-id',
  `{
    reports(where: { feedIds: [${feedIds}] }) {
      feedId
      fullReport
      validFromTimestamp
    }
  }`
)
```

### Option C: Pre-fetch Data (Recommended)
**Best approach:** Fetch DataLink reports in your deployment script and pass as inputs:

1. In `deploy.ts`, fetch DataLink reports before creating config
2. Pass reports as task inputs
3. Task code just uses the pre-fetched data

## 3. Updated task.ts Implementation

Here's how to update your `task.ts`:

```typescript
import { 
  EvmCall, 
  Address, 
  Bytes, 
  ChainId, 
  DenominationToken, 
  TokenAmount,
  log 
} from '@mimicprotocol/lib-ts'
import { evm } from '@mimicprotocol/lib-ts'
import { inputs } from './types'

export default function main(): void {
  log.info(`[SARM] Task triggered`)

  // Option 1: Reports passed as inputs (recommended)
  // If you pre-fetch in deploy.ts and pass as inputs
  const reports = inputs.reports // Array of reports from inputs
  
  // Option 2: If using oracle/subgraph (if available)
  // const reports = fetchFromOracle(...)
  
  // For each token, create contract call intent
  updateToken('USDC', inputs.usdcAddress, inputs.feedIdUsdc, reports)
  updateToken('USDT', inputs.usdtAddress, inputs.feedIdUsdt, reports)
  updateToken('DAI', inputs.daiAddress, inputs.feedIdDai, reports)
}

function updateToken(
  tokenName: string,
  tokenAddress: string,
  feedId: string,
  reports: any[]
): void {
  const report = reports.find(r => r.feedId.toLowerCase() === feedId.toLowerCase())
  
  if (!report || !report.fullReport) {
    log.warn(`[${tokenName}] No report found`)
    return
  }

  // Encode function call
  const functionSignature = 'refreshRatingWithReport(address,bytes)'
  const functionHash = evm.keccak(functionSignature)
  const functionSelector = Bytes.fromHexString('0x' + functionHash.substring(2, 10))
  
  // Encode parameters
  const encodedParams = evm.encode([
    { type: 'address', value: tokenAddress },
    { type: 'bytes', value: report.fullReport }
  ])
  
  // Combine selector + params
  const callData = Bytes.fromHexString(
    functionSelector.toHexString() + encodedParams.substring(2)
  )

  // Create intent
  const chainId = ChainId.fromNumber(inputs.chainId)
  const maxFee = TokenAmount.fromStringDecimal(DenominationToken.USD(), '0.25')
  
  EvmCall.create(
    chainId,
    Address.fromString(inputs.ssaOracleAddress),
    callData,
    maxFee
  ).send()

  log.info(`[${tokenName}] Intent created`)
}
```

## 4. Updated deploy.ts

Fetch DataLink reports before creating config:

```typescript
// In deploy.ts, before creating config:
async function fetchDataLinkReports() {
  const auth = Buffer.from(`${process.env.DATALINK_USER}:${process.env.DATALINK_SECRET}`).toString('base64')
  
  const response = await fetch(process.env.DATALINK_API_URL!, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      feedIds: [process.env.FEED_ID_USDC, process.env.FEED_ID_USDT, process.env.FEED_ID_DAI]
    })
  })
  
  const data = await response.json()
  return data.reports
}

// Then pass reports as input when creating config:
const reports = await fetchDataLinkReports()

const config = await client.configs.signAndCreate({
  // ... other config ...
  input: {
    ...config.inputs,
    reports: reports // Add reports to inputs
  }
})
```

## 5. Key Imports

```typescript
// For EVM calls
import { EvmCall, EvmCallBuilder } from '@mimicprotocol/lib-ts'
import { evm } from '@mimicprotocol/lib-ts'

// For types
import { Address, Bytes, ChainId, BigInt } from '@mimicprotocol/lib-ts'

// For fees
import { DenominationToken, TokenAmount } from '@mimicprotocol/lib-ts'

// For logging
import { log } from '@mimicprotocol/lib-ts'
```

## Next Steps

1. **Update task.ts** with EvmCall implementation
2. **Update deploy.ts** to fetch DataLink reports and pass as inputs
3. **Update manifest.yaml** to include `reports` in inputs
4. **Test compilation**: `mimic compile task.ts`
5. **Deploy**: `npm run deploy`

## Resources

- Library source: `node_modules/@mimicprotocol/lib-ts/src/`
- EvmCall: `src/intents/Call/EvmCall.ts`
- Environment: `src/environment.ts`
- EVM encoding: `src/evm.ts`

