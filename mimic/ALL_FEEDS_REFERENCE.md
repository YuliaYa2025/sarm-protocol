# All SSA Feed IDs and Contract Addresses Reference

## Primary Feeds (Currently Used)

### USDC
- **Feed ID:** `0x02000001160700030000000000000000`
- **Contract:** `0x3C72A4B35ba7e5E52e31F132794682d6A3fCAA21`

### USDT
- **Feed ID:** `0x02000001150700030000000000000000`
- **Contract:** `0x5c17bfd3dEffa9A352cfDfdEB8F68B5C8e3a2f54`

### DAI (USDS/DAI)
- **Feed ID:** `0x02000001140700030000000000000000`
- **Contract:** `0x251f3763AaCBdcC8d62Ea74D7fb03B355836a18e`

## Additional Available Feeds

### EURC
- **Feed ID:** `0x02000001070700030000000000000000`
- **Contract:** `0xcF99622B5440a338f45daEE134d531A4BE64251F`

### EURCV
- **Feed ID:** `0x02000001080700030000000000000000`
- **Contract:** `0xf5eA763bbFc7968A27b28bc612a8B89fCF9E0069`

### FDUSD
- **Feed ID:** `0x02000001090700030000000000000000`
- **Contract:** `0x2EBC55F260023Ce197CEa0238ebF2EACD4db7cFf`

### GUSD
- **Feed ID:** `0x02000001100700030000000000000000`
- **Contract:** `0x4a771da1D304a9a81ecfee87DE553e0b93e1B77e`

### TUSD
- **Feed ID:** `0x02000001110700030000000000000000`
- **Contract:** `0x20ceF12ceb8835CAE5Afae9B2313185d79f734a0`

### USDe
- **Feed ID:** `0x02000001120700030000000000000000`
- **Contract:** `0xe1AE5C352d713Be1BD910677BDA598579295a1c1`

### USDP
- **Feed ID:** `0x02000001130700030000000000000000`
- **Contract:** `0x5eaE92C5439251dE8a16c18e4BEAb4C7884dC09E`

## Usage

These feeds are configured in `.env` for the three primary stablecoins (USDC, USDT, DAI).

To add additional feeds:
1. Add Feed ID to `.env`: `FEED_ID_<TOKEN>=0x...`
2. Add Contract Address: `<TOKEN>_ADDRESS=0x...`
3. Update `manifest.yaml` to include new inputs
4. Update `task.ts` to process additional tokens

## Network

All addresses and Feed IDs are for **Base Sepolia** testnet.

## Source

Feed IDs and contract addresses from: https://data.chain.link/feeds?categories=Stablecoin%20Stability%20Assessment

