import { db, storage } from './src/lib/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

async function testFirebase() {
  console.log('🔵 Testando conexão Firebase...\n')

  try {
    // Teste 1: Firestore Write
    console.log('📝 Teste 1: Firestore Write...')
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Hello Firebase!',
      timestamp: new Date(),
      source: 'test-firebase.ts',
    })
    console.log('✅ Firestore Write OK - ID:', testDoc.id)

    // Teste 2: Firestore Read
    console.log('\n📖 Teste 2: Firestore Read...')
    const snapshot = await getDocs(collection(db, 'test'))
    console.log('✅ Firestore Read OK -', snapshot.size, 'documento(s)')

    snapshot.forEach(doc => {
      console.log('  📄 Doc ID:', doc.id)
      console.log('  📋 Data:', doc.data())
    })

    // Teste 3: Storage (verificar configuração)
    console.log('\n💾 Teste 3: Storage Config...')
    console.log('✅ Storage Bucket:', storage.app.options.storageBucket)

    console.log('\n🎉 Todos os testes passaram!')
    console.log('\n✨ Firebase está conectado e funcionando corretamente!')

  } catch (error: any) {
    console.error('\n❌ Erro ao testar Firebase:', error.message)

    if (error.code === 'permission-denied') {
      console.log('\n💡 Dica: Verifique as regras de segurança do Firestore')
      console.log('   1. Vá em Firestore Database → Regras')
      console.log('   2. Cole o conteúdo de firestore.rules')
      console.log('   3. Clique em Publicar')
    }

    if (error.code === 'app/invalid-credential') {
      console.log('\n💡 Dica: Verifique as credenciais no .env.local')
      console.log('   VITE_FIREBASE_API_KEY=...')
      console.log('   VITE_FIREBASE_PROJECT_ID=...')
    }
  }
}

testFirebase()
