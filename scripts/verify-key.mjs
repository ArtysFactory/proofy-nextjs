import { privateKeyToAccount } from 'viem/accounts'

const privateKey = '0x07d5a407fa324f765f47b6a486310afe38542ed5daf848d5d56a90b11554f3b4'
const expectedRegistrar = '0x2a22B0b2c452C308b97a6aCEcCf5944Af7D26b91'

const account = privateKeyToAccount(privateKey)

console.log('🔑 Verifying private key...\n')
console.log(`📍 Derived address: ${account.address}`)
console.log(`📍 Expected registrar: ${expectedRegistrar}`)

if (account.address.toLowerCase() === expectedRegistrar.toLowerCase()) {
  console.log('\n✅ MATCH! This private key is correct for the registrar wallet.')
} else {
  console.log('\n❌ NO MATCH! This private key belongs to a different wallet.')
}
