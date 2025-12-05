# Setting Up .env File

## Quick Setup

1. **Copy the example file:**
   ```bash
   cd sarm-protocol/mimic
   cp .env.example .env
   ```

2. **Edit .env with your values:**
   ```bash
   # Use your preferred editor
   nano .env
   # or
   code .env
   ```

## Required Values to Fill In

### ✅ Already Set (Testnet Credentials)
These are already in `.env.example` with your testnet credentials:
- `DATALINK_USER` ✅
- `DATALINK_SECRET` ✅
- `DATALINK_API_URL` ✅ (testnet URL)

### ⚠️ Need to Fill In

1. **Mimic Authentication** (choose one):
   - `MIMIC_API_KEY` - Get using `npm run get-api-key` (see `GET_API_KEY.md`)
   - OR `PRIVATE_KEY` - Your wallet private key (0x...) - **No API key needed if using this!**

2. **Contract Addresses:**
   - `SSA_ORACLE_ADDRESS` - Your deployed SSAOracleAdapter contract
   - `USDC_ADDRESS` - USDC token address on Base Sepolia
   - `USDT_ADDRESS` - USDT token address on Base Sepolia
   - `DAI_ADDRESS` - DAI token address on Base Sepolia

3. **DataLink Feed IDs:**
   - `FEED_ID_USDC` - Get from https://data.chain.link
   - `FEED_ID_USDT` - Get from https://data.chain.link
   - `FEED_ID_DAI` - Get from https://data.chain.link

## How to Get Values

### 1. Mimic API Key (Optional - only if not using PRIVATE_KEY)

**Option A: Use Script (Recommended)**
```bash
# Add PRIVATE_KEY to .env first
PRIVATE_KEY=0x-your-private-key

# Run script to get API key
npm run get-api-key

# Copy the API key shown and add to .env
MIMIC_API_KEY=your-api-key-here
```

**Option B: Manual Process**
- See `GET_API_KEY.md` for detailed instructions
- Or use `QUICK_API_KEY.md` for quick reference

**Note:** If you use `PRIVATE_KEY`, the SDK handles authentication automatically - **you don't need an API key!**

### 2. Contract Addresses
If you've already deployed:
```bash
# Check your deployment logs or use:
cast code $SSA_ORACLE_ADDRESS --rpc-url https://sepolia.base.org
```

If not deployed yet:
- Deploy SSAOracleAdapter contract first
- Get token addresses from Base Sepolia explorer

### 3. DataLink Feed IDs
1. Visit [data.chain.link](https://data.chain.link)
2. Search for "Stablecoin Stability Assessment"
3. Filter by network (Base Sepolia)
4. Find feeds for USDC, USDT, DAI
5. Copy the Feed ID (0x... format)

## Example .env File

```bash
# Mimic Authentication
MIMIC_API_KEY=your-actual-api-key-here

# Network
CHAIN_ID=84532

# Contracts (example addresses - replace with yours)
SSA_ORACLE_ADDRESS=0x1234567890123456789012345678901234567890
USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
USDT_ADDRESS=0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2
DAI_ADDRESS=0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6

# Feed IDs (example - replace with actual from data.chain.link)
FEED_ID_USDC=0x0000000000000000000000000000000000000000000000000000000000000001
FEED_ID_USDT=0x0000000000000000000000000000000000000000000000000000000000000002
FEED_ID_DAI=0x0000000000000000000000000000000000000000000000000000000000000003

# DataLink (already set with testnet credentials)
DATALINK_API_URL=https://api.testnet-dataengine.chain.link/api/v1/reports/bulk
DATALINK_USER=baf39e3a-f145-41e5-bdf7-a88e08311f87
DATALINK_SECRET=et9kGDCY2aIFOBzXkRdEzVLkrkkSl5MEySFMu1BQHuK0NMQV8fhtiAImOd7Hd3417f10of9Dwhw8KqCDJs33F2dzD90w2N1vX4o19Po3tj91eQmIliGYTT1fuRt7BZKS
```

## Verify Setup

After setting up `.env`, test it:

```bash
# Check that variables are loaded
npm run deploy
# Should show: [DATALINK] Fetching DataLink reports...
```

## Security Notes

⚠️ **Never commit `.env` to git!**
- `.env` is in `.gitignore`
- Only commit `.env.example` (without secrets)

## Next Steps

Once `.env` is set up:
1. ✅ Test DataLink fetch: `npm run deploy`
2. ✅ Compile task: `npm run compile`
3. ✅ Deploy: `npm run deploy`

