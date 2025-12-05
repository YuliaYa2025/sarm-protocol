# How to Find DataLink Feed IDs for Stablecoin Stability Assessment

## Overview

DataLink feeds use **pull-based delivery**, which means they have **Feed IDs** (not contract addresses like push-based feeds). You need to find the Feed IDs from [data.chain.link](https://data.chain.link/feeds?categories=Stablecoin%20Stability%20Assessment).

## Step-by-Step Guide

### 1. Visit the DataLink Feeds Page

Go to: https://data.chain.link/feeds?categories=Stablecoin%20Stability%20Assessment

### 2. Filter by Network

Since you're using **Base Sepolia** (chain ID 84532), you need to:
- Filter by network: **Base Sepolia** or **Base Mainnet** (depending on your deployment)
- Look for feeds with category: **Stablecoin Stability Assessment**

### 3. Find Feed IDs

For each stablecoin (USDC, USDT, DAI), you need to:

1. **Click on the feed name** (e.g., "SSA-USDC" or "USDC SSA")
2. **Look for the Feed ID** - it will be in format: `0x...` (64 character hex string)
3. **Copy the Feed ID**

### 4. Feed ID Format

Feed IDs are typically:
- 64 character hex strings
- Prefixed with `0x`
- Example: `0x0004b9905d8337c34e00f8dbe31619428bac5c3937e73e6af75c71780f1770ce`

## Important Notes

⚠️ **DataLink feeds are pull-based**, so:
- They don't have contract addresses (unlike push-based feeds)
- You use the **Feed ID** to fetch reports via API
- The Feed ID is what you pass to the DataLink API

## What You Need

For your `.env` file, you need:

```bash
FEED_ID_USDC=0x...  # Feed ID for USDC SSA
FEED_ID_USDT=0x...  # Feed ID for USDT SSA
FEED_ID_DAI=0x...   # Feed ID for DAI SSA
```

## Alternative: Check Existing Scripts

Check if feed IDs are already configured in your project:

```bash
# Check refresh-rating.ts or other scripts
grep -r "FEED_ID" sarm-protocol/
```

## Network-Specific Notes

### Base Sepolia (Testnet)
- Chain ID: 84532
- May have limited feeds available
- Check if SSA feeds are available on testnet

### Base Mainnet
- Chain ID: 8453
- More feeds available
- Production-ready

## If Feeds Aren't Available on Base Sepolia

If SSA feeds aren't available on Base Sepolia, you have options:

1. **Use Base Mainnet** (if deploying to mainnet)
2. **Use Ethereum Mainnet** feeds (if your contract supports cross-chain)
3. **Contact Chainlink** to request testnet feeds

## Quick Reference

Based on the [Chainlink DataLink documentation](https://docs.chain.link/datalink), SSA feeds are available for:
- USDC (USD Coin)
- USDT (Tether)
- DAI (Dai Stablecoin)

Each will have its own Feed ID that you need to copy from the data.chain.link page.

## Next Steps

1. Visit https://data.chain.link/feeds?categories=Stablecoin%20Stability%20Assessment
2. Filter by Base Sepolia (or your target network)
3. Find feeds for USDC, USDT, DAI
4. Copy the Feed IDs
5. Add them to your `.env` file

