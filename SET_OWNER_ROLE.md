# Como definir seu perfil como Owner

Para ter acesso total à página de administrador, você precisa definir seu `role` como `owner` no Firestore.

## Opção 1: Via Console do Firebase (Recomendado)

1. Acesse: https://console.firebase.google.com/project/ktirio-ai/firestore
2. Navegue até a collection `users`
3. Encontre seu documento de usuário (pelo email)
4. Clique em "Editar documento"
5. Adicione ou edite o campo:
   - **Campo**: `role`
   - **Tipo**: `string`
   - **Valor**: `owner`
6. Salve as alterações
7. Recarregue a página do app

## Opção 2: Via Console do Navegador

1. Abra o app no navegador (http://localhost:3000)
2. Faça login
3. Abra o DevTools (F12)
4. Vá para a aba "Console"
5. Cole e execute este código:

```javascript
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

if (auth.currentUser) {
  const userRef = doc(db, 'users', auth.currentUser.uid);
  await updateDoc(userRef, { role: 'owner' });
  console.log('✅ Role atualizado para owner!');
  window.location.reload();
} else {
  console.log('❌ Faça login primeiro');
}
```

6. Aguarde a mensagem de sucesso
7. A página será recarregada automaticamente

## Opção 3: Via código temporário no App

Adicione este código temporariamente no arquivo `src/App.tsx` dentro do componente:

```typescript
// TEMPORÁRIO - Remover após usar
useEffect(() => {
  const setOwnerRole = async () => {
    if (user?.id && user.role !== 'owner') {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { role: 'owner' });
      console.log('✅ Role atualizado para owner!');
    }
  };
  setOwnerRole();
}, [user]);
```

## Verificação

Após definir o role como `owner`, você deverá ver:

- ✅ Tab "Admin" na barra lateral de configurações
- ✅ Badge "ADMIN" ao lado do nome da tab
- ✅ Acesso completo a todas as funcionalidades administrativas:
  - Dashboard com métricas
  - Gerenciamento de usuários
  - Gerenciamento de cupons
  - Links de trial
  - Gerenciamento de equipe
