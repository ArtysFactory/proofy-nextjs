import { privateKeyToAccount } from 'viem/accounts'

const privateKey = '0x9dA6a4027a8a6871Bdf43Cb94CC0E73E902c863d'
const expectedRegistrar = '0x2a22B0b2c452C308b97a6aCEcCf5944Af7D26b91'

try {
  const account = privateKeyToAccount(privateKey)

  console.log('🔑 Verifying private key...\n')
  console.log(`📍 Derived address: ${account.address}`)
  console.log(`📍 Expected registrar: ${expectedRegistrar}`)

  if (account.address.toLowerCase() === expectedRegistrar.toLowerCase()) {
    console.log('\n✅ MATCH! This private key is correct for the registrar wallet.')
  } else {
    console.log('\n❌ NO MATCH! This private key belongs to a different wallet.')
  }
} catch (error) {
  console.log('❌ Error:', error.message)
  console.log('\n⚠️  This doesn\'t look like a valid private key.')
  console.log('A private key should be 64 hex characters (or 66 with 0x prefix).')
}
