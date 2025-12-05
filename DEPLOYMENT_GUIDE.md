# SARM Protocol Deployment Guide

## Prerequisites

1. **Foundry installed**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Dependencies installed**
   ```bash
   forge install
   ```

3. **Environment configured**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

## Required Environment Variables

```bash
# Deployer private key
PRIVATE_KEY=0x...

# Uniswap v4 PoolManager address
POOL_MANAGER=0x...

# Optional: DataLink verifier (leave empty for testnet MockVerifier)
VERIFIER_ADDRESS=

# RPC URL
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

## Deployment Steps

### 1. Find Uniswap v4 PoolManager Address

Check the official Uniswap v4 documentation for the PoolManager address on your target chain:
- [Uniswap v4 Deployments](https://docs.uniswap.org/contracts/v4/deployments)

For Base Sepolia, you may need to deploy your own PoolManager for testing.

### 2. Deploy SARM Protocol

```bash
# Deploy to Base Sepolia (testnet)
forge script script/DeploySARM.s.sol:DeploySARM \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

This will deploy:
1. **MockVerifier** (testnet only)
2. **SSAOracleAdapter**
3. **SARMHook** (with correct CREATE2 address for Uniswap v4)

### 3. Verify Deployment

The script will output:
```
=== Deployment Summary ===
Verifier: 0x...
SSAOracleAdapter: 0x...
SARMHook: 0x...
```

Save these addresses for the next steps.

### 4. Configure Token Feed IDs

Set the DataLink feed IDs for each token:

```bash
# Using cast
cast send <SSA_ORACLE_ADDRESS> \
  "setFeedId(address,bytes32)" \
  <TOKEN_ADDRESS> \
  <FEED_ID> \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

Example for all 10 tokens:
```bash
# EURC
cast send $SSA_ORACLE_ADDRESS "setFeedId(address,bytes32)" \
  $EURC_ADDRESS 0x02000001070700030000000000000000 \
  --rpc-url $BASE_SEPOLIA_RPC_URL --private-key $PRIVATE_KEY

# EURCV
cast send $SSA_ORACLE_ADDRESS "setFeedId(address,bytes32)" \
  $EURCV_ADDRESS 0x02000001080700030000000000000000 \
  --rpc-url $BASE_SEPOLIA_RPC_URL --private-key $PRIVATE_KEY

# ... repeat for all 10 tokens
```

### 5. Set Initial Ratings (Testing Only)

For testing, you can manually set ratings:

```bash
cast send <SSA_ORACLE_ADDRESS> \
  "setRatingManual(address,uint8)" \
  <TOKEN_ADDRESS> \
  2 \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

### 6. Update Mimic Configuration

Update `mimic/.env` with the deployed addresses:

```bash
cd mimic
echo "SSA_ORACLE_ADDRESS=<SSA_ORACLE_ADDRESS>" >> .env
echo "SARM_HOOK_ADDRESS=<SARM_HOOK_ADDRESS>" >> .env
```

### 7. Deploy Mimic Task

```bash
cd mimic
npm install
npm run deploy
```

## Post-Deployment Checklist

- [ ] SSAOracleAdapter deployed
- [ ] SARMHook deployed with correct address
- [ ] Feed IDs set for all 10 tokens
- [ ] Initial ratings set (for testing)
- [ ] Mimic task deployed
- [ ] Test swap in Uniswap v4 pool with SARMHook

## Testing

### Test the Hook

1. **Create a Uniswap v4 pool with the hook:**
   ```solidity
   PoolKey memory key = PoolKey({
       currency0: Currency.wrap(address(token0)),
       currency1: Currency.wrap(address(token1)),
       fee: LPFeeLibrary.DYNAMIC_FEE_FLAG,
       tickSpacing: 60,
       hooks: IHooks(SARM_HOOK_ADDRESS)
   });
   
   manager.initialize(key, SQRT_PRICE_1_1);
   ```

2. **Perform a swap:**
   ```bash
   # The hook will automatically:
   # - Read SSA ratings
   # - Calculate dynamic fee
   # - Apply fee to swap
   # - Emit RiskCheck event
   ```

3. **Check events:**
   ```bash
   cast logs --rpc-url $BASE_SEPOLIA_RPC_URL \
     --address $SARM_HOOK_ADDRESS \
     "RiskCheck(bytes32,uint8,uint8,uint8)"
   ```

## Troubleshooting

### Hook Address Mismatch

If the hook deployment fails with "Hook address mismatch", the CREATE2 salt calculation needs adjustment. This is expected and the script will try different salts.

### PoolManager Not Found

Make sure you're using the correct PoolManager address for your chain. Check Uniswap v4 documentation.

### Gas Estimation Failed

Increase gas limit or check that all dependencies are correctly installed.

## Production Deployment

For mainnet deployment:

1. **Use real DataLink verifier:**
   ```bash
   export VERIFIER_ADDRESS=<REAL_VERIFIER_ADDRESS>
   ```

2. **Deploy to Base Mainnet:**
   ```bash
   forge script script/DeploySARM.s.sol:DeploySARM \
     --rpc-url $BASE_MAINNET_RPC_URL \
     --broadcast \
     --verify \
     -vvvv
   ```

3. **Set up production Mimic task** with real DataLink credentials

4. **Monitor and test thoroughly** before handling real funds

## Security Considerations

- [ ] Audit smart contracts before mainnet deployment
- [ ] Test thoroughly on testnet
- [ ] Set up monitoring for rating updates
- [ ] Configure circuit breakers appropriately
- [ ] Secure private keys and API credentials
- [ ] Set up multi-sig for contract ownership

## Support

For issues or questions:
- Check the test suite: `forge test -vvv`
- Review the documentation in `/docs`
- Open an issue on GitHub

