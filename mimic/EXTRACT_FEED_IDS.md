# How to Extract Feed IDs from data.chain.link

## Important Note

Based on the [Chainlink DataLink page](https://data.chain.link/feeds?categories=Stablecoin%20Stability%20Assessment), I can see the page structure, but **Feed IDs are not visible in the main table**. You need to:

1. **Click on each feed** to see its details page
2. **Find the Feed ID** on the detail page (usually in a "Feed ID" or "Stream ID" field)
3. **Copy the Feed ID** (format: `0x...` 64 character hex string)

## Step-by-Step Process

### 1. Visit the Page

Go to: https://data.chain.link/feeds?categories=Stablecoin%20Stability%20Assessment

### 2. Filter by Network

- Select **Base Sepolia** (or your target network) from the network filter
- Look for feeds with category: **Stablecoin Stability Assessment**

### 3. Find Each Feed

For **USDC, USDT, and DAI**, you need to:

1. **Click on the feed name** (e.g., "SSA-USDC" or similar)
2. **On the feed detail page**, look for:
   - "Feed ID"
   - "Stream ID" 
   - "ID"
   - Usually displayed as: `0x...` (64 character hex string)

### 4. Copy Feed IDs

Each feed will have a unique Feed ID. Copy them and add to `.env`:

```bash
FEED_ID_USDC=0x...  # From USDC SSA feed detail page
FEED_ID_USDT=0x...  # From USDT SSA feed detail page
FEED_ID_DAI=0x...   # From DAI SSA feed detail page
```

## Important: DataLink vs Data Feeds

⚠️ **DataLink feeds are pull-based**, which means:
- They use **Feed IDs** (not contract addresses)
- Feed IDs are used to fetch reports via API
- No contract addresses needed (unlike push-based Data Feeds)

## Alternative: Check API Response

If you have access to the DataLink API, you can also:

1. Make a test API call to see available feeds
2. The response may include feed IDs

## Network Availability

**Note:** SSA feeds may not be available on all networks. Check:
- **Base Sepolia** (testnet) - may have limited feeds
- **Base Mainnet** - more likely to have feeds
- **Ethereum Mainnet** - most likely to have all feeds

If feeds aren't available on Base Sepolia, you may need to:
1. Use Base Mainnet
2. Contact Chainlink to request testnet feeds
3. Use a different network for testing

## Quick Reference

Based on Chainlink documentation, SSA feeds are typically named:
- **SSA-USDC** or **USDC SSA**
- **SSA-USDT** or **USDT SSA**  
- **SSA-DAI** or **DAI SSA**

Each will have a unique Feed ID in format: `0x` followed by 64 hex characters.

## Next Steps

1. Visit https://data.chain.link/feeds?categories=Stablecoin%20Stability%20Assessment
2. Filter by your target network (Base Sepolia or Base Mainnet)
3. Click on each feed (USDC, USDT, DAI)
4. Copy the Feed ID from each feed's detail page
5. Add to your `.env` file

