# Quick Deployment Guide for SARMHook

## Status

✅ **Deployment script created**: `script/DeploySARM.s.sol`
✅ **Documentation created**: `DEPLOYMENT_GUIDE.md`
⚠️ **Dependencies need installation**

## Quick Start

### 1. Install Dependencies

```bash
cd sarm-protocol

# Install Foundry dependencies
forge install Uniswap/v4-core Uniswap/v4-periphery foundry-rs/forge-std
```

**Note**: If you encounter permission errors, try running with `--no-commit` flag or check your git configuration.

### 2. Set Up Environment

Create `.env` file:

```bash
# Deployer private key
PRIVATE_KEY=<YOUR_PRIVATE_KEY>

# Uniswap v4 PoolManager address
# Base Sepolia: Check Uniswap v4 docs
POOL_MANAGER=<POOL_MANAGER_ADDRESS>

# RPC URL
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

### 3. Deploy

```bash
# Deploy to Base Sepolia
forge script script/DeploySARM.s.sol:DeploySARM \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

## What Gets Deployed

1. **MockVerifier** (testnet only) - For DataLink report verification
2. **SSAOracleAdapter** - Stores SSA ratings on-chain
3. **SARMHook** - Uniswap v4 hook with dynamic fees

## After Deployment

### 1. Configure Feed IDs

```bash
# Set DataLink feed IDs for each token
cast send $SSA_ORACLE_ADDRESS \
  "setFeedId(address,bytes32)" \
  $TOKEN_ADDRESS \
  $FEED_ID \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

### 2. Update Mimic Configuration

```bash
cd mimic
echo "SSA_ORACLE_ADDRESS=$SSA_ORACLE_ADDRESS" >> .env
echo "SARM_HOOK_ADDRESS=$SARM_HOOK_ADDRESS" >> .env
```

### 3. Deploy Mimic Task

```bash
cd mimic
npm run deploy
```

## Troubleshooting

### Dependencies Won't Install

If `forge install` fails:
1. Check git configuration
2. Try manual clone:
   ```bash
   cd lib
   git clone https://github.com/Uniswap/v4-core
   git clone https://github.com/Uniswap/v4-periphery
   git clone https://github.com/foundry-rs/forge-std
   ```

### PoolManager Address Unknown

For Base Sepolia testing, you may need to:
1. Deploy your own PoolManager
2. Or check Uniswap v4 documentation for testnet addresses

### Hook Address Mismatch

The deployment script uses CREATE2 to find the correct hook address. This may take a moment as it searches for the right salt.

## Full Documentation

See `DEPLOYMENT_GUIDE.md` for comprehensive deployment instructions, including:
- Production deployment
- Security considerations
- Testing procedures
- Monitoring setup

## Architecture

```
SSAOracleAdapter (stores ratings)
        ↑
        │ (reads ratings)
        │
    SARMHook (applies dynamic fees)
        ↑
        │ (updates ratings)
        │
    Mimic Task (fetches DataLink reports)
```

## Support

- Full guide: `DEPLOYMENT_GUIDE.md`
- Dynamic fee analysis: `DYNAMIC_FEE_ANALYSIS.md`
- Mimic setup: `mimic/EVENT_TRIGGER_SETUP.md`

