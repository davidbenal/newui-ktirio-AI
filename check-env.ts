const requiredEnvVars = [
  // Firebase Client
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',

  // Firebase Admin
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',

  // Clerk
  'VITE_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',

  // Gemini
  'GOOGLE_GEMINI_API_KEY',

  // Stripe
  'STRIPE_SECRET_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
]

console.log('🔍 Verificando variáveis de ambiente...\n')
console.log('📁 Arquivo: .env.local\n')

let missing = 0
let configured = 0

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar]

  if (!value || value.includes('your_key_here') || value.includes('...')) {
    console.log(`❌ ${envVar.padEnd(40)} - NÃO CONFIGURADA`)
    missing++
  } else {
    const preview = value.substring(0, 30)
    const masked = preview + '...'
    console.log(`✅ ${envVar.padEnd(40)} - ${masked}`)
    configured++
  }
})

console.log('\n' + '='.repeat(80))
console.log(`\n📊 Resumo:`)
console.log(`   ✅ Configuradas: ${configured}`)
console.log(`   ❌ Faltando: ${missing}`)
console.log(`   📝 Total: ${requiredEnvVars.length}`)

if (missing === 0) {
  console.log('\n🎉 Todas as variáveis estão configuradas!')
} else {
  console.log(`\n⚠️  ${missing} variável(is) precisam ser configurada(s)`)
  console.log('\n📝 Para configurar:')
  console.log('   1. Copie .env.example para .env.local')
  console.log('   2. Preencha os valores reais')
  console.log('   3. Execute este script novamente')
}

console.log('\n' + '='.repeat(80))
