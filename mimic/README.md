# SARM Protocol - Mimic Protocol Integration

This directory contains the Mimic Protocol task for automated SSA rating updates, replacing the Chainlink CRE SDK implementation.

## Overview

The Mimic task (`task.ts`) automatically:
1. **Triggers** every 10 minutes via cron
2. **Fetches** signed SSA rating reports from Chainlink DataLink for USDC, USDT, and DAI
3. **Creates intents** to submit reports to the `SSAOracleAdapter` contract on Base Sepolia
4. **Updates** on-chain ratings that power the SARM Hook's dynamic fees and circuit breaker

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mimic Protocol Network                    │
│                                                               │
│  ┌──────────────┐                                            │
│  │ Cron Trigger │ Every 10 minutes                           │
│  └──────┬───────┘                                            │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────────────────────────────────┐                │
│  │ Planning Layer: Task Execution         │                │
│  │ • Fetch DataLink reports (HTTP)        │                │
│  │ • Validate reports                      │                │
│  │ • Create intents for contract calls     │                │
│  └─────────────┬───────────────────────────┘                │
│                │                                              │
│                ▼                                              │
│  ┌─────────────────────────────────────────┐                │
│  │ Execution Layer: Axia                  │                │
│  │ • Broadcast intents to solver network  │                │
│  │ • Select best solver (lowest fee)      │                │
│  └─────────────┬───────────────────────────┘                │
│                │                                              │
│                ▼                                              │
│  ┌─────────────────────────────────────────┐                │
│  │ Security Layer: Settler                 │                │
│  │ • Verify solver execution               │                │
│  │ • Finalize transactions                 │                │
│  └─────────────┬───────────────────────────┘                │
└────────────────┼─────────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  Base Sepolia       │
        │  SSAOracleAdapter   │
        │  • Verifies report  │
        │  • Updates rating   │
        │  • Emits event      │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │  SARMHook           │
        │  • Reads rating     │
        │  • Applies fees     │
        │  • Circuit breaker  │
        └────────────────────┘
```

## Comparison: Mimic vs Chainlink CRE

### Similarities
- ✅ Both support cron triggers for scheduled execution
- ✅ Both can fetch external data (HTTP requests)
- ✅ Both can execute on-chain transactions
- ✅ Both provide decentralized execution networks
- ✅ Both handle secrets management

### Key Differences

| Feature | Chainlink CRE | Mimic Protocol |
|---------|---------------|----------------|
| **Architecture** | Workflow-based with explicit steps | Task-based with intent creation |
| **Execution Model** | Direct EVM writes via runtime | Intent-based with solver competition |
| **Consensus** | BFT consensus across DON nodes | Solver network with competitive execution |
| **Pricing** | Pay per workflow execution | Pay per successful intent execution |
| **Complexity** | More infrastructure-focused | More application-focused |
| **Contract Calls** | Direct `evmClient.write()` | Intent creation (e.g., `ContractCall.create()`) |

## Prerequisites

1. **Mimic Account**: Create account and get API keys from [Mimic Protocol](https://mimic.fi)
2. **Mimic CLI**: Install the Mimic CLI
   ```bash
   npm install -g @mimicprotocol/cli
   ```
3. **DataLink Credentials**: Get API credentials from Chainlink DataLink
4. **Deployed Contracts**: Deploy `SSAOracleAdapter` and `SARMHook` to Base Sepolia

## Setup

### 1. Install Dependencies

```bash
cd mimic
npm install
```

### 2. Configure Secrets

Set your DataLink credentials as Mimic secrets:

```bash
mimic secrets set datalinkUser "your-datalink-username"
mimic secrets set datalinkSecret "your-datalink-password"
```

### 3. Configure Task Inputs

When deploying, provide the required inputs:

```bash
mimic deploy task.ts \
  --input chainId=84532 \
  --input ssaOracleAddress=0x... \
  --input usdcAddress=0x... \
  --input usdtAddress=0x... \
  --input daiAddress=0x... \
  --input feedIdUsdc=0x... \
  --input feedIdUsdt=0x... \
  --input feedIdDai=0x...
```

Or use a configuration file (if supported by Mimic CLI).

### 4. Get DataLink Feed IDs

1. Go to Chainlink DataLink dashboard
2. Find SSA rating feeds for USDC, USDT, DAI
3. Copy the feed IDs (they look like `0x...`)

## Usage

### Compile Task

```bash
mimic compile task.ts
```

This compiles your TypeScript task to WebAssembly.

### Deploy Task

```bash
mimic deploy task.ts --key YOUR_DEPLOYMENT_KEY
```

After deployment, the task will:
- Run automatically every 10 minutes
- Execute on Mimic's decentralized network
- Create intents that are fulfilled by competitive solvers
- Be monitored via Mimic dashboard

### Monitor Task

Access your task dashboard to:
- View execution history
- Check intent status
- Monitor solver performance
- Get alerts for failures

## Implementation Notes

### Current Status

⚠️ **This is a conceptual implementation**. The actual Mimic SDK APIs for:
- HTTP requests with Basic Auth
- Contract call intent creation

may differ from what's shown in `task.ts`. You'll need to:

1. **Check Mimic SDK Documentation** for:
   - HTTP request capabilities (oracle data sources)
   - Contract call intent creation APIs
   - How to handle multiple intents in one task

2. **Update the Implementation** based on actual Mimic SDK APIs:
   - Replace `fetchDataLinkReports()` with actual Mimic HTTP/oracle API
   - Replace `createContractCallIntent()` with actual Mimic intent creation API

### Expected Mimic SDK APIs

Based on Mimic's architecture, you might use:

```typescript
// For HTTP requests (if supported)
import { HTTP } from '@mimicprotocol/lib-ts'
const response = HTTP.post(url, { headers, body })

// For contract calls (conceptual)
import { ContractCall } from '@mimicprotocol/lib-ts'
ContractCall.create(contract, functionName, args, maxFee).send()
```

**Check the [Mimic SDK documentation](https://docs.mimic.fi/developers/sdk) for the actual APIs.**

## Migration from CRE

### Step 1: Review Mimic SDK

1. Read [Mimic SDK documentation](https://docs.mimic.fi/developers/sdk)
2. Understand intent creation APIs
3. Check HTTP/oracle data source capabilities

### Step 2: Update Implementation

1. Replace HTTP fetch logic with Mimic's HTTP/oracle APIs
2. Replace contract call logic with Mimic's intent creation APIs
3. Test locally using Mimic's simulation tools

### Step 3: Deploy and Monitor

1. Deploy to Mimic network
2. Monitor initial executions
3. Compare with CRE workflow behavior

## Advantages of Mimic

1. **Simpler Architecture**: Task-based model vs workflow orchestration
2. **Competitive Execution**: Solvers compete for best execution (lower fees, faster)
3. **Pay-per-Execution**: Only pay when intents are successfully fulfilled
4. **No Infrastructure**: No need to manage nodes or consensus mechanisms

## Advantages of CRE

1. **BFT Consensus**: Guaranteed consensus across multiple nodes
2. **Proven Infrastructure**: Chainlink's established network
3. **Direct Execution**: Direct EVM writes without solver layer
4. **Multi-Step Workflows**: Better for complex multi-step processes

## Resources

- [Mimic Protocol Documentation](https://docs.mimic.fi)
- [Mimic SDK Reference](https://docs.mimic.fi/developers/sdk)
- [Mimic Examples](https://docs.mimic.fi/examples)
- [Chainlink DataLink Documentation](https://docs.chain.link/datalink)
- [SARM Protocol Repository](https://github.com/danelerr/sarm-protocol)

## Support

- **Mimic Issues**: Check Mimic documentation or Discord
- **SARM Protocol**: Create issue in this repository
- **DataLink**: Contact Chainlink support

## License

MIT - Part of SARM Protocol for ETHGlobal Buenos Aires 2025

