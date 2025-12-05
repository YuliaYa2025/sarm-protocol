# Quick Guide: Get Mimic API Key

## 🚀 Fastest Method

```bash
cd sarm-protocol/mimic

# 1. Add your private key to .env
echo "PRIVATE_KEY=0x-your-private-key-here" >> .env

# 2. Run the script
npm run get-api-key

# 3. Copy the API key shown and add to .env
echo "MIMIC_API_KEY=your-api-key-here" >> .env
```

## 📋 Step-by-Step

### Option A: Using Script (Easiest)

1. **Set private key in `.env`:**
   ```bash
   PRIVATE_KEY=0x-your-wallet-private-key
   ```

2. **Run script:**
   ```bash
   npm run get-api-key
   ```

3. **Copy the API key shown and add to `.env`:**
   ```bash
   MIMIC_API_KEY=your-api-key-here
   ```

### Option B: Using SDK (No API Key Needed!)

If you use `PRIVATE_KEY` with the Mimic SDK, you **don't need an API key**:

```typescript
// In deploy.ts, this already works:
const signer = EthersSigner.fromPrivateKey(process.env.PRIVATE_KEY)
const client = new Client({ signer })
// SDK handles authentication automatically!
```

**So you can skip getting an API key if you use `PRIVATE_KEY`!**

## 🔍 What the Script Does

1. Requests nonce from Mimic API
2. Signs nonce with your private key
3. Authenticates to get token
4. Retrieves API key
5. Displays it for you to copy

## ⚠️ Important

- **Never commit private keys or API keys to git**
- Store them securely in `.env` (which is gitignored)
- Use different keys for development and production

## 📚 Full Documentation

See `GET_API_KEY.md` for:
- Manual process (using curl)
- Troubleshooting
- Security best practices

