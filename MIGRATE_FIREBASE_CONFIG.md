# 🔄 Migrar Configuração do Firebase Existente

## 📋 Passo a Passo

### 1️⃣ Obter Credenciais do Firebase Console

#### 1.1 Config do App Web (Cliente)

```bash
# 1. Acessar: https://console.firebase.google.com/
# 2. Selecionar seu projeto existente
# 3. Ir em ⚙️ Configurações do Projeto
# 4. Aba "Geral"
# 5. Rolar até "Seus apps"
```

**Se já tem um app web cadastrado:**
```bash
# Copiar o objeto firebaseConfig existente
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**Se NÃO tem app web:**
```bash
# 1. Clicar no ícone Web (</>)
# 2. Registrar app: "Ktirio AI Web"
# 3. NÃO marcar Firebase Hosting
# 4. Copiar o firebaseConfig
```

#### 1.2 Preencher .env.local (Cliente)

Cole no `.env.local`:
```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

### 2️⃣ Obter Service Account (Admin SDK)

```bash
# 1. Ainda em ⚙️ Configurações do Projeto
# 2. Aba "Contas de serviço"
# 3. Clicar em "Gerar nova chave privada"
# 4. Confirmar
# 5. Baixar arquivo JSON
```

#### 2.1 Extrair Valores do JSON

Abrir o arquivo baixado (ex: `seu-projeto-firebase-adminsdk.json`):

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id",           // ← COPIAR
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  // ← COPIAR
  "client_email": "firebase-adminsdk-abc@seu-projeto.iam.gserviceaccount.com",  // ← COPIAR
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

#### 2.2 Preencher .env.local (Admin)

```bash
FIREBASE_ADMIN_PROJECT_ID=seu-projeto-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-abc@seu-projeto.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

⚠️ **IMPORTANTE**:
- Manter as aspas duplas em `FIREBASE_ADMIN_PRIVATE_KEY`
- Manter os `\n` (não substituir por quebras de linha reais)

---

### 3️⃣ Verificar Serviços Ativos

#### 3.1 Firestore Database

```bash
# 1. No Firebase Console, ir em "Firestore Database"
# 2. Se não estiver criado:
#    - Clicar em "Criar banco de dados"
#    - Modo: Produção
#    - Localização: us-central (ou mais próxima)
```

#### 3.2 Storage

```bash
# 1. No Firebase Console, ir em "Storage"
# 2. Se não estiver criado:
#    - Clicar em "Começar"
#    - Modo: Produção
#    - Localização: mesma do Firestore
```

#### 3.3 Authentication (Opcional - se usar)

```bash
# 1. No Firebase Console, ir em "Authentication"
# 2. Aba "Sign-in method"
# 3. Ativar provedores se necessário:
#    - Email/Password
#    - Google
```

---

### 4️⃣ Atualizar Regras de Segurança

#### 4.1 Firestore Rules

```bash
# Opção A: Via Console (Manual)
# 1. Firestore Database → Regras
# 2. Copiar conteúdo de firestore.rules
# 3. Publicar

# Opção B: Via CLI (Recomendado)
firebase deploy --only firestore:rules
```

#### 4.2 Storage Rules

```bash
# Opção A: Via Console (Manual)
# 1. Storage → Regras
# 2. Copiar conteúdo de storage.rules
# 3. Publicar

# Opção B: Via CLI (Recomendado)
firebase deploy --only storage
```

---

### 5️⃣ Criar Índices do Firestore

O Firestore precisa de índices compostos para queries complexas.

```bash
# 1. Firestore Database → Índices → Aba "Compostos"
# 2. Clicar em "Criar índice"
```

**Índice 1: Projetos do Usuário**
```
Coleção: projects
Campos indexados:
  - userId (Crescente)
  - updatedAt (Decrescente)
Status da consulta: Ativado
```

**Índice 2: Versões do Projeto**
```
Coleção: versions
Campos indexados:
  - projectId (Crescente)
  - createdAt (Decrescente)
Status da consulta: Ativado
```

**Índice 3: Transações de Crédito**
```
Coleção: creditTransactions
Campos indexados:
  - userId (Crescente)
  - createdAt (Decrescente)
Status da consulta: Ativado
```

**Índice 4: Projetos Favoritos**
```
Coleção: projects
Campos indexados:
  - userId (Crescente)
  - isFavorite (Crescente)
  - updatedAt (Decrescente)
Status da consulta: Ativado
```

---

### 6️⃣ Testar Conexão

Criar arquivo de teste: `test-firebase.ts`

```typescript
import { db, storage } from './src/lib/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

async function testFirebase() {
  try {
    // Teste 1: Firestore Write
    console.log('🔵 Testando Firestore...')
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Hello Firebase!',
      timestamp: new Date(),
    })
    console.log('✅ Firestore Write OK:', testDoc.id)

    // Teste 2: Firestore Read
    const snapshot = await getDocs(collection(db, 'test'))
    console.log('✅ Firestore Read OK:', snapshot.size, 'documentos')

    // Teste 3: Storage (verificar referência)
    console.log('✅ Storage OK:', storage.app.options.storageBucket)

    console.log('\n🎉 Firebase conectado com sucesso!')
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

testFirebase()
```

Executar:
```bash
npx tsx test-firebase.ts
```

---

### 7️⃣ Verificar Variáveis de Ambiente

Criar script de verificação: `check-env.ts`

```typescript
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
]

console.log('🔍 Verificando variáveis de ambiente...\n')

let missing = 0

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar] || import.meta.env?.[envVar]

  if (!value) {
    console.log(`❌ ${envVar} - NÃO CONFIGURADA`)
    missing++
  } else {
    const preview = value.substring(0, 20) + '...'
    console.log(`✅ ${envVar} - OK (${preview})`)
  }
})

console.log(`\n${missing === 0 ? '🎉 Todas configuradas!' : `⚠️  ${missing} variáveis faltando`}`)
```

Executar:
```bash
npx tsx check-env.ts
```

---

## 🔧 Troubleshooting

### Erro: "Firebase: No Firebase App '[DEFAULT]' has been created"

**Solução:**
```typescript
// Verificar se firebaseConfig tem todos os campos
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅' : '❌',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅' : '❌',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅' : '❌',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅' : '❌',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅' : '❌',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✅' : '❌',
})
```

### Erro: "Missing or insufficient permissions"

**Solução:**
```bash
# 1. Verificar se as regras foram publicadas
# 2. No Firestore Database → Regras
# 3. Verificar se match /databases/{database}/documents existe
# 4. Publicar novamente
```

### Erro: "The caller does not have permission" (Admin)

**Solução:**
```bash
# 1. Verificar FIREBASE_ADMIN_PRIVATE_KEY
# 2. Deve ter \n (não quebras de linha)
# 3. Deve estar entre aspas duplas
# 4. Exemplo correto:
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

### Erro de índice: "The query requires an index"

**Solução:**
```bash
# O erro mostra um link como:
# https://console.firebase.google.com/project/.../database/firestore/indexes?create_composite=...

# 1. Copiar o link
# 2. Abrir no navegador
# 3. Clicar em "Criar índice"
# 4. Aguardar criação (~2 minutos)
```

---

## ✅ Checklist Final

- [ ] Copiei apiKey, authDomain, projectId, etc para .env.local
- [ ] Baixei Service Account JSON
- [ ] Copiei project_id, client_email, private_key para .env.local
- [ ] Firestore Database está ativo
- [ ] Storage está ativo
- [ ] Publiquei firestore.rules
- [ ] Publiquei storage.rules
- [ ] Criei índices compostos
- [ ] Testei conexão com test-firebase.ts
- [ ] Verifiquei env vars com check-env.ts

---

## 📝 Resumo

### .env.local deve ter:

```bash
# Firebase Client
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=seu-projeto-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-abc@seu-projeto.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

**Tempo estimado: 10-15 minutos** ⏱️
