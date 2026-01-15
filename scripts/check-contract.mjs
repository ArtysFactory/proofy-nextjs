import { createPublicClient, http } from 'viem'
import { polygon } from 'viem/chains'

const PROOFY_REGISTRY_ADDRESS = '0x84250d37de73BE3C1BCbac62947350EA088F16B7'

const PROOFY_REGISTRY_ABI = [
  {
    name: 'registrar',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'totalProofs',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
]

async function checkContract() {
  const publicClient = createPublicClient({
    chain: polygon,
    transport: http('https://polygon-rpc.com')
  })

  console.log('🔍 Checking ProofyRegistry Smart Contract...\n')
  console.log(`📍 Contract Address: ${PROOFY_REGISTRY_ADDRESS}`)
  console.log(`🔗 Polygonscan: https://polygonscan.com/address/${PROOFY_REGISTRY_ADDRESS}\n`)

  try {
    // Get registrar address
    const registrar = await publicClient.readContract({
      address: PROOFY_REGISTRY_ADDRESS,
      abi: PROOFY_REGISTRY_ABI,
      functionName: 'registrar'
    })
    console.log(`👤 Registrar (authorized wallet): ${registrar}`)
    console.log(`🔗 Registrar on Polygonscan: https://polygonscan.com/address/${registrar}`)

    // Get total proofs
    const totalProofs = await publicClient.readContract({
      address: PROOFY_REGISTRY_ADDRESS,
      abi: PROOFY_REGISTRY_ABI,
      functionName: 'totalProofs'
    })
    console.log(`\n📊 Total proofs registered: ${totalProofs}`)

    // Check registrar balance
    const balance = await publicClient.getBalance({ address: registrar })
    const balanceInPol = Number(balance) / 1e18
    console.log(`💰 Registrar POL balance: ${balanceInPol.toFixed(4)} POL`)

    if (balanceInPol < 0.01) {
      console.log(`\n⚠️  WARNING: Low balance! Need to add POL for gas fees.`)
    }

  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkContract()
