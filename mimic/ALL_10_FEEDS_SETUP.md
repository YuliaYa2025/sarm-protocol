# All 10 SSA Feeds Configuration

## ✅ Complete Setup

All 10 Stablecoin Stability Assessment feeds are now configured:

1. **EURC** - Feed ID: `0x02000001070700030000000000000000`
2. **EURCV** - Feed ID: `0x02000001080700030000000000000000`
3. **FDUSD** - Feed ID: `0x02000001090700030000000000000000`
4. **GUSD** - Feed ID: `0x02000001100700030000000000000000`
5. **TUSD** - Feed ID: `0x02000001110700030000000000000000`
6. **USDe** - Feed ID: `0x02000001120700030000000000000000`
7. **USDP** - Feed ID: `0x02000001130700030000000000000000`
8. **DAI** - Feed ID: `0x02000001140700030000000000000000`
9. **USDT** - Feed ID: `0x02000001150700030000000000000000`
10. **USDC** - Feed ID: `0x02000001160700030000000000000000`

## Files Updated

### 1. `.env`
- ✅ Added all 10 Feed IDs
- ✅ Added all 10 Contract Addresses

### 2. `manifest.yaml`
- ✅ Added all 10 token address inputs
- ✅ Added all 10 feed ID inputs

### 3. `types.ts`
- ✅ Updated interface to include all 10 tokens
- ✅ Updated interface to include all 10 feed IDs

### 4. `deploy.ts`
- ✅ Updated to fetch all 10 reports from DataLink
- ✅ Updated validation to check all 10 tokens
- ✅ Updated inputs configuration

### 5. `task.ts`
- ✅ Updated to process all 10 tokens
- ✅ Updated inputs declaration
- ✅ Updated execution loop

## How It Works

1. **Deployment (`deploy.ts`)**:
   - Fetches all 10 reports from DataLink API in one bulk request
   - Passes all 10 reports as task inputs

2. **Task Execution (`task.ts`)**:
   - Receives all 10 pre-fetched reports
   - For each token (EURC, EURCV, FDUSD, GUSD, TUSD, USDe, USDP, DAI, USDT, USDC):
     - Finds report by Feed ID
     - Creates `EvmCall` intent to submit to `SSAOracleAdapter`
     - Calls `refreshRatingWithReport(tokenAddress, report)`

3. **Execution Frequency**:
   - Task runs every 10 minutes (cron schedule)
   - Each execution updates all 10 tokens

## Environment Variables

All required variables are in `.env`:

```bash
# All 10 Feed IDs
FEED_ID_EURC=0x02000001070700030000000000000000
FEED_ID_EURCV=0x02000001080700030000000000000000
FEED_ID_FDUSD=0x02000001090700030000000000000000
FEED_ID_GUSD=0x02000001100700030000000000000000
FEED_ID_TUSD=0x02000001110700030000000000000000
FEED_ID_USDE=0x02000001120700030000000000000000
FEED_ID_USDP=0x02000001130700030000000000000000
FEED_ID_DAI=0x02000001140700030000000000000000
FEED_ID_USDT=0x02000001150700030000000000000000
FEED_ID_USDC=0x02000001160700030000000000000000

# All 10 Contract Addresses
EURC_ADDRESS=0xcF99622B5440a338f45daEE134d531A4BE64251F
EURCV_ADDRESS=0xf5eA763bbFc7968A27b28bc612a8B89fCF9E0069
FDUSD_ADDRESS=0x2EBC55F260023Ce197CEa0238ebF2EACD4db7cFf
GUSD_ADDRESS=0x4a771da1D304a9a81ecfee87DE553e0b93e1B77e
TUSD_ADDRESS=0x20ceF12ceb8835CAE5Afae9B2313185d79f734a0
USDE_ADDRESS=0xe1AE5C352d713Be1BD910677BDA598579295a1c1
USDP_ADDRESS=0x5eaE92C5439251dE8a16c18e4BEAb4C7884dC09E
DAI_ADDRESS=0x251f3763AaCBdcC8d62Ea74D7fb03B355836a18e
USDT_ADDRESS=0x5c17bfd3dEffa9A352cfDfdEB8F68B5C8e3a2f54
USDC_ADDRESS=0x3C72A4B35ba7e5E52e31F132794682d6A3fCAA21
```

## Next Steps

1. ✅ **Deploy SSAOracleAdapter contract** (if not already deployed)
2. ✅ **Set `SSA_ORACLE_ADDRESS` in `.env`**
3. ✅ **Test deployment**: `npm run deploy`
4. ✅ **Monitor executions** to ensure all 10 tokens are updated

## Execution Flow

```
Every 10 minutes (cron trigger)
    ↓
Task executes
    ↓
Uses pre-fetched reports (from deploy.ts)
    ↓
For each of 10 tokens:
    - Find report by Feed ID
    - Create EvmCall intent
    - Submit to SSAOracleAdapter
    ↓
All 10 tokens updated on-chain
```

## Cost Considerations

- **10 contract calls per execution** (one per token)
- **144 executions per day** (every 10 minutes)
- **1,440 contract calls per day** (10 tokens × 144 executions)
- Each call has `maxSolverFee` of $0.25 USD
- Total potential solver fees: up to $360/day (if all calls execute)

**Note:** Actual fees depend on gas prices and solver execution costs.

