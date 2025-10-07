import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCW_4QoMqGA-zMHbX2WIKNVdXPyJjZfG_U",
  authDomain: "ktirio-ai.firebaseapp.com",
  projectId: "ktirio-ai",
  storageBucket: "ktirio-ai.firebasestorage.app",
  messagingSenderId: "662151273730",
  appId: "1:662151273730:web:a0a4a9e7cd94c89efe8097",
  measurementId: "G-09EXGFN1WB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Aguarda autenticação
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log('✅ Usuário autenticado:', user.email);
    console.log('🔄 Atualizando role para "owner"...');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: 'owner'
      });
      console.log('✅ Role atualizado com sucesso!');
      console.log('🎉 Você agora tem acesso total como owner.');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erro ao atualizar role:', error);
      process.exit(1);
    }
  } else {
    console.log('⚠️  Nenhum usuário autenticado. Por favor, faça login no app primeiro.');
    process.exit(1);
  }
});

console.log('⏳ Aguardando autenticação...');
console.log('💡 Certifique-se de estar logado no app.');

// Timeout de 10 segundos
setTimeout(() => {
  console.log('⏱️  Timeout - nenhum usuário autenticado encontrado.');
  console.log('💡 Faça login no app e tente novamente.');
  process.exit(1);
}, 10000);
