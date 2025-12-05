# SARM Protocol

**Stablecoin Automated Risk Management for Uniswap v4**

A Uniswap v4 Hook that dynamically adjusts swap fees and implements circuit breakers based on S&P Global Stablecoin Stability Assessment (SSA) ratings.

## Overview

SARM Protocol makes stablecoin liquidity "risk-aware" by:

- 📊 **Dynamic Fees** - Adjusts LP fees based on real-time SSA ratings (0.005% - 0.04%)
- 🛡️ **Circuit Breakers** - Automatically blocks swaps when stablecoin risk is too high
- 🔗 **Chainlink DataLink** - Integrates with S&P Global SSA ratings via Chainlink's pull-based oracle
- ⚡ **Mimic Protocol** - Automated rating updates triggered by swap events

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         SARM Protocol                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │ Chainlink    │───→│ SSAOracleAdapter │←───│ Mimic Task   │  │
│  │ DataLink     │    │ (Rating Storage) │    │ (Automation) │  │
│  └──────────────┘    └────────┬─────────┘    └──────────────┘  │
│                               │                                  │
│                               ▼                                  │
│                      ┌──────────────┐                           │
│                      │  SARMHook    │                           │
│                      │ (Uniswap v4) │                           │
│                      └──────────────┘                           │
│                               │                                  │
│            ┌──────────────────┼──────────────────┐              │
│            ▼                  ▼                  ▼              │
│     ┌────────────┐    ┌────────────┐    ┌────────────┐         │
│     │ Risk Check │    │ Dynamic    │    │ Circuit    │         │
│     │ Events     │    │ Fees       │    │ Breaker    │         │
│     └────────────┘    └────────────┘    └────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Fee Structure

| SSA Rating | Risk Level | Swap Fee | Risk Mode |
|------------|------------|----------|-----------|
| 1-2 | Excellent | 0.005% | NORMAL |
| 3 | Good | 0.01% | ELEVATED_RISK |
| 4 | Medium | 0.02% | ELEVATED_RISK |
| 5 | High | N/A | FROZEN (swaps blocked) |

## Supported Stablecoins

All 10 S&P Global SSA-rated stablecoins:

| Token | Feed ID |
|-------|---------|
| USDC | `0x02000001160700030000000000000000` |
| USDT | `0x02000001150700030000000000000000` |
| DAI/USDS | `0x02000001140700030000000000000000` |
| USDP | `0x02000001130700030000000000000000` |
| USDe | `0x02000001120700030000000000000000` |
| TUSD | `0x02000001110700030000000000000000` |
| GUSD | `0x02000001100700030000000000000000` |
| FDUSD | `0x02000001090700030000000000000000` |
| EURCV | `0x02000001080700030000000000000000` |
| EURC | `0x02000001070700030000000000000000` |

## Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js 18+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/sarm-protocol.git
cd sarm-protocol

# Install Foundry dependencies
forge install

# Install Mimic dependencies
cd mimic && npm install && cd ..
```

### Build & Test

```bash
# Compile contracts
forge build

# Run tests
forge test -vvv
```

### Deploy

```bash
# Set environment variables
export PRIVATE_KEY=0x...
export POOL_MANAGER=0x...  # Uniswap v4 PoolManager address
export RPC_URL=https://sepolia.base.org

# Deploy contracts
forge script script/DeploySARM.s.sol:DeploySARM \
  --rpc-url $RPC_URL \
  --broadcast
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## Project Structure

```
sarm-protocol/
├── src/
│   ├── hooks/SARMHook.sol          # Uniswap v4 Hook
│   ├── oracles/SSAOracleAdapter.sol # Rating storage & verification
│   ├── interfaces/                  # Contract interfaces
│   └── mocks/                       # Test mocks
├── test/
│   └── SARMHook.t.sol              # Test suite
├── script/
│   └── DeploySARM.s.sol            # Deployment script
├── mimic/                          # Mimic Protocol integration
│   ├── task.ts                     # Automation task
│   ├── deploy.ts                   # Task deployment
│   └── manifest.yaml               # Task configuration
└── docs/                           # Additional documentation
```

## How It Works

### 1. SSA Rating Updates

SSA ratings are updated via Chainlink DataLink pull-based delivery:

```
Mimic Task → Fetch DataLink Report → Verify On-Chain → Update SSAOracleAdapter
```

### 2. Swap Execution

When a swap occurs in a pool with SARMHook:

```solidity
function _beforeSwap(...) {
    // 1. Read ratings for both tokens
    (uint8 rating0, ) = oracle.getRating(token0);
    (uint8 rating1, ) = oracle.getRating(token1);
    
    // 2. Use worst-case rating
    uint8 effectiveRating = max(rating0, rating1);
    
    // 3. Check for circuit breaker
    if (effectiveRating >= 5) revert SwapBlocked_HighRisk();
    
    // 4. Calculate and return dynamic fee
    uint24 fee = _feeForRating(effectiveRating);
    return (selector, ZERO_DELTA, fee | OVERRIDE_FEE_FLAG);
}
```

### 3. Event-Based Automation

The Mimic task triggers on `RiskCheck` events:

```yaml
trigger:
  type: event
  contract: <SARMHook_ADDRESS>
  topics: ["0x988b2889"]  # RiskCheck event
```

## Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Full deployment instructions
- [Dynamic Fee Analysis](DYNAMIC_FEE_ANALYSIS.md) - Fee calculation details
- [Mimic Integration](mimic/README.md) - Automation setup
- [Event Trigger Setup](mimic/EVENT_TRIGGER_SETUP.md) - On-demand execution

## Security Considerations

⚠️ **This code is unaudited and for educational/hackathon purposes only.**

- Smart contracts should be audited before mainnet deployment
- Use testnets for development and testing
- Secure private keys and API credentials
- Monitor rating updates and system health

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Uniswap v4](https://github.com/Uniswap/v4-core) - Hook infrastructure
- [Chainlink DataLink](https://data.chain.link) - SSA rating data
- [Mimic Protocol](https://mimic.fi) - Automation layer
- [S&P Global](https://www.spglobal.com) - Stablecoin Stability Assessments

---

Built for ETHGlobal Buenos Aires 2025 🇦🇷

