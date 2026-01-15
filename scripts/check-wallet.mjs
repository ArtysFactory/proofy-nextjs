import { createPublicClient, http } from 'viem'
import { polygon } from 'viem/chains'

const walletAddress = '0xa5105650872a177d85750d77cdb04a94d66212ec'

async function checkWallet() {
  const publicClient = createPublicClient({
    chain: polygon,
    transport: http('https://polygon-rpc.com')
  })

  console.log('🔍 Checking your wallet...\n')
  console.log(`📍 Wallet Address: ${walletAddress}`)
  console.log(`🔗 Polygonscan: https://polygonscan.com/address/${walletAddress}\n`)

  const balance = await publicClient.getBalance({ address: walletAddress })
  const balanceInPol = Number(balance) / 1e18
  console.log(`💰 POL Balance: ${balanceInPol.toFixed(4)} POL`)

  if (balanceInPol >= 0.1) {
    console.log('\n✅ Sufficient balance for contract deployment!')
    console.log('   Estimated deployment cost: ~0.01-0.05 POL')
  } else if (balanceInPol > 0) {
    console.log('\n⚠️  Low balance. You may need more POL for deployment.')
    console.log('   Estimated deployment cost: ~0.01-0.05 POL')
  } else {
    console.log('\n❌ No POL balance! You need to add POL to this wallet.')
  }
}

checkWallet()
