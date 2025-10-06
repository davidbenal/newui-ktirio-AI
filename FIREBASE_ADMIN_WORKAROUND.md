# 🔐 Firebase Admin - Solução para Restrição de Service Account

## ❌ Problema

```
Não é permitido criar chaves nesta conta de serviço.
Verifique se a criação de chaves de conta de serviço está restrita
por políticas da organização.
```

---

## ✅ Soluções Alternativas

### Opção 1: Usar Firebase App Check (Recomendado para Vite)

Como você está usando **Vite (frontend)** e não Next.js (backend), você pode usar apenas o Firebase Client SDK sem precisar do Admin SDK!

#### Passo 1: Remover dependência do Admin

```bash
npm uninstall firebase-admin
```

#### Passo 2: Usar apenas Client SDK

Todos os arquivos já estão configurados para funcionar com o Client SDK:
- ✅ `src/lib/firebase.ts` (Cliente)
- ✅ `src/lib/firestore.ts` (Operações)
- ✅ `src/lib/storage.ts` (Upload)

#### Passo 3: Atualizar Regras de Segurança

As regras em `firestore.rules` e `storage.rules` já permitem operações autenticadas.

**Você NÃO precisa do Admin SDK se:**
- Não estiver usando Server-Side Rendering (SSR)
- Não estiver criando API routes no servidor
- Estiver usando apenas o frontend (Vite/React)

---

### Opção 2: Criar Service Account Manual (IAM)

Se você **realmente precisar** do Admin SDK (para backend):

#### 2.1 Via Google Cloud Console

```bash
1. Acessar: https://console.cloud.google.com/

2. Selecionar projeto: ktirio-ai-4540c

3. Menu → IAM e Administração → Contas de serviço

4. Clicar em "Criar conta de serviço"

5. Preencher:
   - Nome: ktirio-admin
   - Descrição: Firebase Admin SDK
   - Criar e continuar

6. Conceder papéis:
   ✅ Firebase Admin
   ✅ Cloud Datastore User
   ✅ Storage Object Admin

7. Clicar em "Concluir"

8. Clicar na conta criada

9. Aba "Chaves" → "Adicionar chave" → "Criar nova chave"

10. Tipo: JSON → Criar

11. Baixar e usar o JSON
```

#### 2.2 Link direto:
```
https://console.cloud.google.com/iam-admin/serviceaccounts?project=ktirio-ai-4540c
```

---

### Opção 3: Verificar Permissões da Organização

Se o projeto está sob uma organização Google Workspace:

#### 3.1 Verificar se você é Admin

```bash
1. Ir em: https://console.cloud.google.com/

2. Selecionar projeto: ktirio-ai-4540c

3. Menu → IAM e Administração → IAM

4. Procurar seu email

5. Verificar papéis:
   ✅ Precisa ter: "Proprietário" ou "Editor"
```

#### 3.2 Solicitar ao Admin da Organização

Se você não é admin, peça ao administrador para:

1. **Desativar restrição temporariamente:**
   ```
   Organização → Políticas → Restrições de política da organização
   → iam.disableServiceAccountKeyCreation → Desativar
   ```

2. **Ou criar a chave para você:**
   - Admin cria Service Account
   - Admin gera a chave
   - Admin envia o JSON para você

---

### Opção 4: Usar Emulador Firebase (Desenvolvimento)

Para desenvolvimento local, use o Emulador:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar emuladores
firebase init emulators

# Selecionar:
# ✅ Authentication
# ✅ Firestore
# ✅ Storage

# Iniciar emuladores
firebase emulators:start
```

**Configurar no código:**

```typescript
// src/lib/firebase.ts
import { connectFirestoreEmulator } from 'firebase/firestore'
import { connectStorageEmulator } from 'firebase/storage'

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}
```

---

## 🎯 Qual Solução Escolher?

### Para seu caso (Vite + Frontend):

**✅ Opção 1: NÃO USAR Admin SDK**
- Mais simples
- Sem necessidade de Service Account
- Funciona perfeitamente com Vite
- Usa apenas Firebase Client SDK

### Quando usar Admin SDK:
- ❌ Você está usando Next.js com API Routes
- ❌ Você precisa de operações server-side
- ❌ Você precisa validar tokens no backend
- ❌ Você precisa acessar dados sem autenticação

---

## 🔧 Implementação Recomendada (SEM Admin SDK)

### 1. Remover referências ao Admin

**Deletar ou comentar:**
```bash
# Deletar arquivo (não será usado)
rm src/lib/firebase-admin.ts

# Ou comentar todo o conteúdo
```

**Remover do .env.local:**
```bash
# FIREBASE_ADMIN_PROJECT_ID=...
# FIREBASE_ADMIN_CLIENT_EMAIL=...
# FIREBASE_ADMIN_PRIVATE_KEY=...
```

### 2. Usar apenas Client SDK

**Exemplo: Criar usuário no Firestore após Clerk signup**

```typescript
// src/hooks/useFirebaseSync.ts
import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function useFirebaseSync() {
  const { user } = useUser()

  useEffect(() => {
    async function syncUser() {
      if (!user) return

      const userRef = doc(db, 'users', user.id)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        // Criar usuário no Firestore
        await setDoc(userRef, {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
          avatar: user.imageUrl,
          plan: 'free',
          credits: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }

    syncUser()
  }, [user])
}
```

### 3. Operações do Cliente

Todas as operações podem ser feitas do cliente com as regras corretas:

```typescript
// Criar projeto
import { createProject } from '@/lib/firestore'
const projectId = await createProject({
  userId: user.id,
  name: 'Meu Projeto',
  isFavorite: false,
  isArchived: false,
})

// Upload de imagem
import { uploadImage } from '@/lib/storage'
const imageUrl = await uploadImage(file, user.id, 'projects')

// Deduzir créditos
import { deductCredits } from '@/lib/firestore'
await deductCredits(user.id, 1, 'Geração de imagem')
```

---

## 🔒 Segurança com Regras

As regras já criadas garantem segurança:

**firestore.rules:**
```javascript
// Usuários só podem ler/editar seus próprios dados
match /users/{userId} {
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId;
}

// Projetos só podem ser acessados pelo dono
match /projects/{projectId} {
  allow read: if request.auth.uid == resource.data.userId;
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update, delete: if request.auth.uid == resource.data.userId;
}
```

---

## ✅ Checklist Final (SEM Admin SDK)

- [ ] Remover firebase-admin do package.json
- [ ] Deletar ou comentar src/lib/firebase-admin.ts
- [ ] Remover variáveis FIREBASE_ADMIN_* do .env.local
- [ ] Publicar firestore.rules e storage.rules
- [ ] Usar apenas Client SDK (src/lib/firebase.ts)
- [ ] Implementar sync de usuário com Clerk
- [ ] Testar criação de projeto
- [ ] Testar upload de imagem

---

## 🆘 Ainda Precisa do Admin SDK?

Se você **realmente** precisa do Admin SDK, responda:

1. Você vai criar um backend Node.js/Express separado?
2. Você vai migrar para Next.js com API Routes?
3. Qual operação específica precisa do Admin SDK?

Com essas respostas, posso te ajudar melhor! 🤔

---

**Para seu caso (Vite frontend): Não precisa do Admin SDK! ✅**

Quer que eu:
1. ✅ Configure tudo para funcionar SEM Admin SDK?
2. ✅ Crie o hook de sync Clerk → Firestore?
3. ✅ Remova as referências ao Admin SDK?
