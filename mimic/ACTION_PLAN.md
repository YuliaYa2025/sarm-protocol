# Action Plan: Next Steps After Installation

✅ **Completed:**
- All three packages installed
- CLI available globally
- SDK and Library installed locally

## Immediate Next Steps

### Step 1: Review Library Documentation (CRITICAL)

You need to find the actual APIs for:
1. **HTTP requests** (for DataLink API)
2. **EVM call intents** (for contract calls)

**Action:**
1. Visit [Mimic Library Documentation](https://docs.mimic.fi/developers/library)
2. Look for examples of:
   - HTTP requests or oracle data sources
   - `EvmCall` or contract call intents
   - How to access `inputs` in task code

**Alternative:** Check [Mimic Examples](https://docs.mimic.fi/examples) for code samples

### Step 2: Create ABI File

Create the ABI file for your contract:

```bash
cd /Users/yuliaya/sarprotocol_amp/sarm-protocol

# Build contracts first
forge build

# Extract ABI
mkdir -p mimic/abis
cat out/SSAOracleAdapter.sol/SSAOracleAdapter.json | jq '.abi' > mimic/abis/SSAOracleAdapter.json
```

**Or create minimal ABI manually:**

```bash
mkdir -p mimic/abis
cat > mimic/abis/SSAOracleAdapter.json << 'EOF'
[
  {
    "type": "function",
    "name": "refreshRatingWithReport",
    "inputs": [
      {"name": "token", "type": "address"},
      {"name": "report", "type": "bytes"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
]
EOF
```

### Step 3: Set Up Environment Variables

```bash
cd mimic
cp .env.example .env
# Edit .env with your actual values
```

**Required in `.env`:**
- `MIMIC_API_KEY` or `PRIVATE_KEY` (for authentication)
- `SSA_ORACLE_ADDRESS` (your deployed contract)
- `USDC_ADDRESS`, `USDT_ADDRESS`, `DAI_ADDRESS`
- `FEED_ID_USDC`, `FEED_ID_USDT`, `FEED_ID_DAI`
- `DATALINK_USER`, `DATALINK_SECRET` (for DataLink API)

### Step 4: Update task.ts with Real APIs

Once you find the Library APIs, replace the placeholder functions:

**Current placeholders to replace:**
1. `fetchDataLinkReports()` - line 130
2. `createContractCallIntent()` - line 149

**What to look for in Library docs:**
- HTTP request API (might be `HTTP.post()` or oracle data source)
- EVM call intent (might be `EvmCall.create()` or similar)
- How to encode function calls
- How to access `inputs` object

### Step 5: Test Compilation

```bash
cd mimic
mimic compile task.ts
```

This will:
- Validate your task code
- Check manifest configuration
- Generate WASM binary

**If compilation fails:**
- Check for TypeScript errors
- Verify imports are correct
- Ensure Library APIs match what you implemented

### Step 6: Test Locally (Optional)

If Mimic supports local testing:

```bash
mimic test
# or
mimic simulate task.ts
```

### Step 7: Deploy

**Option A: Using CLI**
```bash
mimic deploy task.ts --key $MIMIC_API_KEY
```

**Option B: Using deployment script**
```bash
npm run deploy
```

## Quick Reference: What to Find in Library Docs

### For HTTP Requests:
Look for:
- `HTTP` class or module
- Oracle data sources
- External API access
- How to make POST requests with auth headers

### For Contract Calls:
Look for:
- `EvmCall` class
- Contract interaction APIs
- Function encoding
- Intent creation for contract calls

### For Inputs:
Look for:
- How `inputs` object is accessed
- Input type definitions
- Secret handling

## Current Status Checklist

- [x] Packages installed
- [x] CLI available
- [ ] Library APIs reviewed
- [ ] ABI file created
- [ ] Environment variables configured
- [ ] task.ts updated with real APIs
- [ ] Compilation successful
- [ ] Task deployed

## Need Help?

1. **Library APIs**: [Library Documentation](https://docs.mimic.fi/developers/library)
2. **Examples**: [Mimic Examples](https://docs.mimic.fi/examples)
3. **SDK Reference**: [SDK Documentation](https://docs.mimic.fi/developers/sdk)

## Priority Order

1. **First**: Review Library docs to find APIs (Step 1)
2. **Second**: Create ABI file (Step 2) - can do in parallel
3. **Third**: Update task.ts with real implementations (Step 4)
4. **Fourth**: Set up .env and test compilation (Steps 3, 5)
5. **Finally**: Deploy (Step 7)

