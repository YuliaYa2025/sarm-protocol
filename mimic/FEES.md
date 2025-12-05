# Fee Structure for SARM Protocol SSA Rating Refresh Task

## Overview

This document breaks down the fees you'll pay for running the SSA rating refresh task on Mimic Protocol. All fees are paid using **Mimic USD Credits** (off-chain payment system).

Reference: [Mimic Protocol Fees Documentation](https://docs.mimic.fi/developers/fees)

## Fee Breakdown Per Execution

Each time your task runs (every 10 minutes), you'll pay:

### 1. Execution Fees (Fixed + Variable)

| Component | Fee | Description |
|-----------|-----|-------------|
| **Trigger** | $0.00004 | Cron trigger cost (fixed) |
| **Relayers** | $0.00004 + fuel | Base cost + fuel (0.7257 Gwei × units) for task execution |
| **Oracles** | $0.00000235 | RPC cost for HTTP request to DataLink API |
| **Validators** | $0.00004235 + fuel | Base cost + fuel for execution verification |
| **Intents** | $0.002403 | Per-intent fee × 3 intents (USDC, USDT, DAI) = $0.000801 × 3 |
| **Protocol** | 0% | Currently free (may change in future) |

**Estimated Execution Fee**: ~$0.0025 - $0.003 per run (plus variable fuel costs)

### 2. Solver Fees (Per Intent)

Solver fees are **separate** from execution fees and are paid when solvers fulfill your intents on-chain.

| Intent | Max Fee | Description |
|--------|---------|-------------|
| USDC Rating Update | $0.25 | Maximum fee for solver to execute `refreshRatingWithReport()` for USDC |
| USDT Rating Update | $0.25 | Maximum fee for solver to execute `refreshRatingWithReport()` for USDT |
| DAI Rating Update | $0.25 | Maximum fee for solver to execute `refreshRatingWithReport()` for DAI |

**Total Max Solver Fees**: $0.75 per execution (if all 3 intents are fulfilled)

**Note**: Solver fees are only charged when intents are successfully fulfilled. If a solver can execute for less than $0.25, you only pay the actual cost.

## Cost Projections

### Per Execution
- **Minimum** (if no solver fees): ~$0.003 (execution fees only)
- **Typical** (with solver fees): ~$0.75 - $0.80 (execution + solver fees)

### Daily Costs
- Executions per day: 144 (every 10 minutes)
- **Minimum daily cost**: ~$0.43 (execution fees only)
- **Typical daily cost**: ~$108 - $115 (with solver fees)

### Monthly Costs
- **Minimum monthly cost**: ~$13 (execution fees only)
- **Typical monthly cost**: ~$3,240 - $3,450 (with solver fees)

## Optimizing Costs

### 1. Adjust Solver Fees
- Monitor actual gas costs on Base Sepolia
- Reduce `maxFee` if gas prices are consistently lower
- Current setting: $0.25 per intent (conservative estimate)

### 2. Reduce Execution Frequency
- Change cron schedule from every 10 minutes to every 30 minutes or hourly
- Reduces execution fees proportionally
- Trade-off: Less frequent rating updates

### 3. Batch Updates
- If Mimic supports batching, combine all 3 updates into a single intent
- Reduces from 3 intents ($0.002403) to 1 intent ($0.000801)
- Saves ~$0.0016 per execution

## Payment Method

All fees are paid using **Mimic USD Credits**:
- Fund credits from any token on any supported chain
- Credits are deducted automatically when:
  - Task executes (execution fees)
  - Solvers fulfill intents (solver fees)

## Example: Setting Solver Fees in Code

```typescript
import { DenominationToken, TokenAmount } from '@mimicprotocol/lib-ts'

// Set max solver fee to $0.25 USD per contract call
const maxSolverFee = TokenAmount.fromStringDecimal(DenominationToken.USD(), '0.25')

// Create intent with maxFee
ContractCall.create(
  contractAddress,
  'refreshRatingWithReport',
  [tokenAddress, report],
  maxSolverFee
).send()
```

## Monitoring Costs

1. **Mimic Dashboard**: View execution history and fees
2. **Credit Balance**: Monitor your Mimic USD Credits balance
3. **Solver Performance**: Track actual solver fees vs. maxFee

## Comparison with Chainlink CRE

| Aspect | Chainlink CRE | Mimic Protocol |
|--------|---------------|----------------|
| **Execution Model** | Pay per workflow run | Pay per execution + per intent |
| **Solver Fees** | N/A (direct execution) | Separate, competitive solver fees |
| **Cost Structure** | Fixed per workflow | Variable based on intents |
| **Payment** | On-chain or credits | Mimic USD Credits only |

## Questions?

- **Q: Can I pay solver fees on-chain?**  
  A: Yes, but Mimic Credits are recommended for simplicity.

- **Q: What if a solver fee exceeds maxFee?**  
  A: The intent won't be fulfilled until a solver accepts the maxFee or you increase it.

- **Q: Are execution fees refunded if intents fail?**  
  A: No, execution fees are charged regardless of intent fulfillment.

- **Q: How do I reduce costs?**  
  A: Optimize solver fees, reduce execution frequency, or batch operations.

