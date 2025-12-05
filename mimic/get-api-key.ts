#!/usr/bin/env tsx
/**
 * @title Get Mimic API Key
 * @notice Script to authenticate with Mimic and retrieve your API key
 * @dev Uses wallet signature-based authentication flow
 * 
 * Usage:
 *   PRIVATE_KEY=0x... tsx get-api-key.ts
 *   or
 *   WALLET_ADDRESS=0x... tsx get-api-key.ts (will prompt for signature)
 */

import * as dotenv from 'dotenv'
import { ethers } from 'ethers'

dotenv.config()

// Mimic API base URL (update if different)
const MIMIC_API_URL = process.env.MIMIC_API_URL || 'https://api.mimic.fi'

/**
 * Step 1: Request a nonce for wallet address
 */
async function requestNonce(address: string): Promise<string> {
  console.log(`[1/4] Requesting nonce for address: ${address}`)
  
  const response = await fetch(`${MIMIC_API_URL}/users/nonce`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to request nonce: ${response.status} ${response.statusText}\n${error}`)
  }

  const data = await response.json()
  console.log(`[1/4] ✓ Nonce received: ${data.nonce}`)
  return data.nonce
}

/**
 * Step 2: Sign the nonce with wallet
 */
async function signNonce(nonce: string, privateKey?: string): Promise<string> {
  console.log(`[2/4] Signing nonce...`)
  
  if (privateKey) {
    // Use private key directly
    const wallet = new ethers.Wallet(privateKey)
    const message = `Mimic Protocol authentication nonce: ${nonce}`
    const signature = await wallet.signMessage(message)
    console.log(`[2/4] ✓ Nonce signed with private key`)
    return signature
  } else {
    // Manual signing (for MetaMask or other wallets)
    const message = `Mimic Protocol authentication nonce: ${nonce}`
    console.log(`\n[2/4] Please sign this message with your wallet:`)
    console.log(`\nMessage: ${message}\n`)
    console.log(`You can use MetaMask, WalletConnect, or any EIP-191 compatible wallet.`)
    console.log(`After signing, paste the signature here:`)
    
    // In a real implementation, you'd use a wallet library
    // For now, we'll prompt the user
    throw new Error('Private key required. Set PRIVATE_KEY in .env or use a wallet library.')
  }
}

/**
 * Step 3: Authenticate with signature to get token
 */
async function authenticate(address: string, signature: string): Promise<string> {
  console.log(`[3/4] Authenticating with signature...`)
  
  const response = await fetch(`${MIMIC_API_URL}/users/authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address, signature }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Authentication failed: ${response.status} ${response.statusText}\n${error}`)
  }

  const data = await response.json()
  console.log(`[3/4] ✓ Authentication successful`)
  return data.token
}

/**
 * Step 4: Get API key using authentication token
 */
async function getApiKey(token: string): Promise<string> {
  console.log(`[4/4] Fetching API key...`)
  
  const response = await fetch(`${MIMIC_API_URL}/users/api-key`, {
    method: 'GET',
    headers: {
      'x-auth-token': token,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get API key: ${response.status} ${response.statusText}\n${error}`)
  }

  const data = await response.json()
  console.log(`[4/4] ✓ API key retrieved`)
  return data.apiKey
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🔑 Mimic API Key Retrieval\n')
  
  // Get wallet address
  const privateKey = process.env.PRIVATE_KEY
  let address: string
  
  if (privateKey) {
    const wallet = new ethers.Wallet(privateKey)
    address = wallet.address
    console.log(`Using wallet: ${address}`)
  } else {
    address = process.env.WALLET_ADDRESS || ''
    if (!address) {
      throw new Error('Either PRIVATE_KEY or WALLET_ADDRESS must be set in .env')
    }
  }

  try {
    // Step 1: Request nonce
    const nonce = await requestNonce(address)
    
    // Step 2: Sign nonce
    const signature = await signNonce(nonce, privateKey)
    
    // Step 3: Authenticate
    const token = await authenticate(address, signature)
    
    // Step 4: Get API key
    const apiKey = await getApiKey(token)
    
    // Success!
    console.log('\n✅ API Key retrieved successfully!\n')
    console.log('='.repeat(60))
    console.log('Add this to your .env file:')
    console.log('='.repeat(60))
    console.log(`MIMIC_API_KEY=${apiKey}`)
    console.log('='.repeat(60))
    console.log('\n💡 Tip: Copy the line above and add it to your .env file')
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

// Run
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

