/**
 * Blockchain Service for Proofy
 * Real blockchain anchoring on Polygon Mainnet
 * Uses ProofyRegistry Smart Contract
 */

import { createWalletClient, createPublicClient, http, formatEther, encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygon } from 'viem/chains'

// Smart Contract Address (deployed on Polygon Mainnet)
export const PROOFY_REGISTRY_ADDRESS = '0x84250d37de73BE3C1BCbac62947350EA088F16B7' as const

// Smart Contract ABI (only the functions we need)
export const PROOFY_REGISTRY_ABI = [
  {
    name: 'registerProof',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_fileHash', type: 'bytes32' },
      { name: '_publicId', type: 'string' },
      { name: '_projectType', type: 'string' }
    ],
    outputs: [{ name: 'success', type: 'bool' }]
  },
  {
    name: 'verifyProof',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_fileHash', type: 'bytes32' }],
    outputs: [
      { name: 'exists', type: 'bool' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'blockNumber', type: 'uint256' }
    ]
  },
  {
    name: 'getProofDetails',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_fileHash', type: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'fileHash', type: 'bytes32' },
          { name: 'publicId', type: 'string' },
          { name: 'projectType', type: 'string' },
          { name: 'depositor', type: 'address' },
          { name: 'currentOwner', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'blockNumber', type: 'uint256' },
          { name: 'exists', type: 'bool' }
        ]
      }
    ]
  },
  {
    name: 'totalProofs',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

// RPC URLs
export const RPC_URLS = {
  polygon_mainnet: 'https://polygon-rpc.com',
  polygon_amoy: 'https://rpc-amoy.polygon.technology',
}

/**
 * Blockchain anchoring result
 */
export interface AnchorResult {
  success: boolean
  txHash?: string
  blockNumber?: number
  timestamp?: number
  error?: string
  explorerUrl?: string
  contractAddress?: string
  simulated?: boolean
}

/**
 * Proof verification result
 */
export interface VerifyResult {
  exists: boolean
  timestamp?: number
  blockNumber?: number
  publicId?: string
  projectType?: string
  depositor?: string
  currentOwner?: string
}

/**
 * Convert SHA-256 hash string to bytes32
 * SHA-256 produces 64 hex chars = 32 bytes = perfect for bytes32
 */
function hashToBytes32(hash: string): `0x${string}` {
  // Remove 0x prefix if present
  const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash
  
  // SHA-256 = 64 hex chars, bytes32 = 64 hex chars (32 bytes)
  if (cleanHash.length !== 64) {
    throw new Error(`Invalid hash length: expected 64 chars, got ${cleanHash.length}`)
  }
  
  return `0x${cleanHash}` as `0x${string}`
}

/**
 * Anchor proof to blockchain using ProofyRegistry Smart Contract
 */
export async function anchorToBlockchain(
  fileHash: string,
  publicId: string,
  projectType: string,
  privateKey: string,
  rpcUrl: string = RPC_URLS.polygon_mainnet
): Promise<AnchorResult> {
  try {
    console.log(`[Blockchain] Starting Smart Contract anchor for ${publicId}...`)
    console.log(`[Blockchain] Contract: ${PROOFY_REGISTRY_ADDRESS}`)
    
    // Validate and format private key
    const formattedKey = (privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`) as `0x${string}`
    
    // Create account from private key
    const account = privateKeyToAccount(formattedKey)
    console.log(`[Blockchain] Wallet address: ${account.address}`)
    
    // Create public client for reading
    const publicClient = createPublicClient({
      chain: polygon,
      transport: http(rpcUrl)
    })
    
    // Check balance
    const balance = await publicClient.getBalance({ address: account.address })
    console.log(`[Blockchain] Balance: ${formatEther(balance)} POL`)
    
    if (balance === 0n) {
      throw new Error('Wallet has no POL balance')
    }
    
    // Create wallet client for writing
    const walletClient = createWalletClient({
      account,
      chain: polygon,
      transport: http(rpcUrl)
    })
    
    // Convert hash to bytes32
    const fileHashBytes32 = hashToBytes32(fileHash)
    console.log(`[Blockchain] File hash (bytes32): ${fileHashBytes32}`)
    
    // Encode function call
    const data = encodeFunctionData({
      abi: PROOFY_REGISTRY_ABI,
      functionName: 'registerProof',
      args: [fileHashBytes32, publicId, projectType]
    })
    
    // Estimate gas
    let gasEstimate: bigint
    try {
      gasEstimate = await publicClient.estimateGas({
        account: account.address,
        to: PROOFY_REGISTRY_ADDRESS,
        data
      })
      console.log(`[Blockchain] Estimated gas: ${gasEstimate}`)
    } catch (estimateError: any) {
      console.log(`[Blockchain] Gas estimation failed, using default: ${estimateError.message}`)
      gasEstimate = 150000n
    }
    
    // Send transaction to Smart Contract
    console.log(`[Blockchain] Sending transaction to Smart Contract...`)
    const txHash = await walletClient.sendTransaction({
      to: PROOFY_REGISTRY_ADDRESS,
      data,
      gas: gasEstimate + 20000n, // Add buffer
    })
    
    console.log(`[Blockchain] TX Hash: ${txHash}`)
    
    // Wait for confirmation
    console.log(`[Blockchain] Waiting for confirmation...`)
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash: txHash,
      confirmations: 1,
      timeout: 60_000
    })
    
    console.log(`[Blockchain] Confirmed in block ${receipt.blockNumber}`)
    
    if (receipt.status === 'reverted') {
      throw new Error('Transaction reverted - proof may already exist')
    }
    
    // Get block for timestamp
    const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber })
    const timestamp = Number(block.timestamp) * 1000
    
    const explorerUrl = `https://polygonscan.com/tx/${txHash}`
    console.log(`[Blockchain] Success! Explorer: ${explorerUrl}`)
    
    return {
      success: true,
      txHash,
      blockNumber: Number(receipt.blockNumber),
      timestamp,
      explorerUrl,
      contractAddress: PROOFY_REGISTRY_ADDRESS,
      simulated: false
    }
    
  } catch (error: any) {
    console.error('[Blockchain] Anchor error:', error.message || error)
    return {
      success: false,
      error: error.message || String(error)
    }
  }
}

/**
 * Verify proof on blockchain via Smart Contract
 */
export async function verifyProofOnChain(
  fileHash: string,
  rpcUrl: string = RPC_URLS.polygon_mainnet
): Promise<VerifyResult> {
  try {
    console.log(`[Blockchain] Verifying proof for hash: ${fileHash.slice(0, 20)}...`)
    
    const publicClient = createPublicClient({
      chain: polygon,
      transport: http(rpcUrl)
    })
    
    const fileHashBytes32 = hashToBytes32(fileHash)
    
    // Call verifyProof
    const [exists, timestamp, blockNumber] = await publicClient.readContract({
      address: PROOFY_REGISTRY_ADDRESS,
      abi: PROOFY_REGISTRY_ABI,
      functionName: 'verifyProof',
      args: [fileHashBytes32]
    }) as [boolean, bigint, bigint]
    
    if (!exists) {
      return { exists: false }
    }
    
    // Get full details
    try {
      const details = await publicClient.readContract({
        address: PROOFY_REGISTRY_ADDRESS,
        abi: PROOFY_REGISTRY_ABI,
        functionName: 'getProofDetails',
        args: [fileHashBytes32]
      }) as {
        fileHash: `0x${string}`
        publicId: string
        projectType: string
        depositor: `0x${string}`
        currentOwner: `0x${string}`
        timestamp: bigint
        blockNumber: bigint
        exists: boolean
      }
      
      return {
        exists: true,
        timestamp: Number(details.timestamp) * 1000,
        blockNumber: Number(details.blockNumber),
        publicId: details.publicId,
        projectType: details.projectType,
        depositor: details.depositor,
        currentOwner: details.currentOwner
      }
    } catch {
      // Fallback to basic info
      return {
        exists: true,
        timestamp: Number(timestamp) * 1000,
        blockNumber: Number(blockNumber)
      }
    }
    
  } catch (error: any) {
    console.error('[Blockchain] Verify error:', error.message || error)
    return { exists: false }
  }
}

/**
 * Simulate blockchain anchoring (for development/testing)
 */
export async function simulateAnchor(
  fileHash: string,
  publicId: string,
  _projectType: string
): Promise<AnchorResult> {
  // Create a deterministic but unique "transaction hash"
  const encoder = new TextEncoder()
  const data = encoder.encode(fileHash + publicId + Date.now())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const simulatedTxHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  const simulatedBlockNumber = Math.floor(Math.random() * 1000000) + 65000000
  
  return {
    success: true,
    txHash: simulatedTxHash,
    blockNumber: simulatedBlockNumber,
    timestamp: Date.now(),
    explorerUrl: `https://polygonscan.com/tx/${simulatedTxHash}`,
    contractAddress: PROOFY_REGISTRY_ADDRESS,
    simulated: true
  }
}

/**
 * Get Polygon block explorer URL for a transaction
 */
export function getExplorerUrl(txHash: string): string {
  return `https://polygonscan.com/tx/${txHash}`
}

/**
 * Get contract explorer URL
 */
export function getContractUrl(): string {
  return `https://polygonscan.com/address/${PROOFY_REGISTRY_ADDRESS}`
}
