# 🎯 Próximos Passos - Firebase Configurado

## ✅ O que já foi configurado

- ✅ Firebase Client credentials no .env.local
- ✅ Projeto: **ktirio-ai-4540c**
- ✅ Arquivos de configuração criados:
  - src/lib/firebase.ts (cliente)
  - src/lib/firebase-admin.ts (admin)
  - src/lib/firestore.ts (CRUD)
  - src/lib/storage.ts (upload)
  - firestore.rules (segurança)
  - storage.rules (segurança)

---

## 🔴 URGENTE: Baixar Service Account (2 min)

### Por que precisa?
O Firebase Admin SDK (server-side) precisa de credenciais especiais para acessar o Firebase.

### Como fazer:

```bash
1. Acessar: https://console.firebase.google.com/project/ktirio-ai-4540c/settings/serviceaccounts/adminsdk

2. Clicar no botão "Gerar nova chave privada"

3. Confirmar e baixar o arquivo JSON

4. Abrir o arquivo baixado (ex: ktirio-ai-4540c-firebase-adminsdk-xxxxx.json)

5. Copiar 3 valores:
   - project_id       → já está preenchido ✅
   - client_email     → COLAR em FIREBASE_ADMIN_CLIENT_EMAIL
   - private_key      → COLAR em FIREBASE_ADMIN_PRIVATE_KEY

6. Atualizar .env.local
```

### Exemplo do JSON baixado:
```json
{
  "type": "service_account",
  "project_id": "ktirio-ai-4540c",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc123@ktirio-ai-4540c.iam.gserviceaccount.com",
  ...
}
```

### Preencher em .env.local:
```bash
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-abc123@ktirio-ai-4540c.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

⚠️ **Manter as aspas duplas e os \n!**

---

## 🔵 Verificar Serviços Firebase (5 min)

### 1. Ativar Firestore Database

```bash
1. Acessar: https://console.firebase.google.com/project/ktirio-ai-4540c/firestore

2. Se aparecer "Começar" ou "Create database":
   - Clicar em "Criar banco de dados"
   - Modo: Produção
   - Localização: us-central ou southamerica-east1
   - Criar

3. Se já estiver ativo:
   - ✅ Verificar se tem coleções
```

### 2. Ativar Storage

```bash
1. Acessar: https://console.firebase.google.com/project/ktirio-ai-4540c/storage

2. Se aparecer "Começar":
   - Clicar em "Começar"
   - Modo: Produção
   - Localização: mesma do Firestore
   - Concluir

3. Se já estiver ativo:
   - ✅ Verificar o bucket
```

---

## 🟢 Deploy das Regras de Segurança (3 min)

### Opção A: Via Console (Fácil)

**Firestore Rules:**
```bash
1. Ir em: https://console.firebase.google.com/project/ktirio-ai-4540c/firestore/rules

2. Apagar tudo e colar o conteúdo de: firestore.rules

3. Clicar em "Publicar"
```

**Storage Rules:**
```bash
1. Ir em: https://console.firebase.google.com/project/ktirio-ai-4540c/storage/rules

2. Apagar tudo e colar o conteúdo de: storage.rules

3. Clicar em "Publicar"
```

### Opção B: Via CLI (Avançado)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar (se ainda não fez)
firebase init

# Selecionar:
# - Firestore
# - Storage
# - Projeto: ktirio-ai-4540c

# Deploy
firebase deploy --only firestore:rules,storage
```

---

## 🟡 Criar Índices do Firestore (5 min)

### Por que precisa?
Firestore requer índices para queries com múltiplos campos.

### Como criar:

```bash
1. Ir em: https://console.firebase.google.com/project/ktirio-ai-4540c/firestore/indexes

2. Clicar na aba "Compostos"

3. Clicar em "Criar índice"
```

### Índice 1: Projetos do Usuário
```
Coleção: projects
Campo 1: userId (Crescente)
Campo 2: updatedAt (Decrescente)
Status da consulta: Ativado
```

### Índice 2: Versões do Projeto
```
Coleção: versions
Campo 1: projectId (Crescente)
Campo 2: createdAt (Decrescente)
Status da consulta: Ativado
```

### Índice 3: Transações de Crédito
```
Coleção: creditTransactions
Campo 1: userId (Crescente)
Campo 2: createdAt (Decrescente)
Status da consulta: Ativado
```

### Índice 4: Projetos Favoritos
```
Coleção: projects
Campo 1: userId (Crescente)
Campo 2: isFavorite (Crescente)
Campo 3: updatedAt (Decrescente)
Status da consulta: Ativado
```

---

## 🧪 Testar Conexão (2 min)

### 1. Verificar Variáveis de Ambiente
```bash
npx tsx check-env.ts
```

Deve mostrar:
```
✅ VITE_FIREBASE_API_KEY           - AIzaSyD7PYY4bWjiglZ4QdB48...
✅ VITE_FIREBASE_PROJECT_ID        - ktirio-ai-4540c
✅ FIREBASE_ADMIN_CLIENT_EMAIL     - firebase-adminsdk-...
...
```

### 2. Testar Conexão Firebase
```bash
npx tsx test-firebase.ts
```

Esperado:
```
🔵 Testando conexão Firebase...

📝 Teste 1: Firestore Write...
✅ Firestore Write OK - ID: abc123

📖 Teste 2: Firestore Read...
✅ Firestore Read OK - 1 documento(s)

💾 Teste 3: Storage Config...
✅ Storage Bucket: ktirio-ai-4540c.firebasestorage.app

🎉 Todos os testes passaram!
```

---

## 🎨 Configurar Outras APIs

### 1. Clerk (Autenticação) - 10 min
```bash
1. https://dashboard.clerk.com/
2. Create Application "Ktirio AI"
3. Enable: Email + Google
4. Copiar keys para .env.local
```

### 2. Google Gemini (IA) - 5 min
```bash
1. https://aistudio.google.com/
2. Get API key
3. Copiar para .env.local
```

### 3. OpenAI DALL-E (Geração de Imagens) - 5 min
```bash
1. https://platform.openai.com/api-keys
2. Create new secret key
3. Copiar para .env.local

# Instalar SDK
npm install openai
```

### 4. Stripe (Pagamentos) - 15 min
```bash
1. https://stripe.com/
2. Dashboard → API Keys (test mode)
3. Criar produtos: Starter + Professional
4. Criar preços mensais e anuais
5. Copiar Price IDs para .env.local
```

---

## 📊 Status Atual

### ✅ Concluído
- Firebase Client configurado
- Estrutura de arquivos criada
- Regras de segurança prontas
- Scripts de teste criados

### 🔄 Em Progresso
- [ ] Baixar Service Account JSON
- [ ] Preencher FIREBASE_ADMIN_CLIENT_EMAIL
- [ ] Preencher FIREBASE_ADMIN_PRIVATE_KEY

### ⏳ Pendente
- [ ] Ativar Firestore Database
- [ ] Ativar Storage
- [ ] Publicar firestore.rules
- [ ] Publicar storage.rules
- [ ] Criar índices compostos
- [ ] Testar conexão
- [ ] Configurar Clerk
- [ ] Configurar Gemini
- [ ] Configurar DALL-E
- [ ] Configurar Stripe

---

## 🆘 Precisa de Ajuda?

### Se encontrar erro "permission-denied"
```bash
# Publicar as regras de segurança
firebase deploy --only firestore:rules,storage
```

### Se encontrar erro "The caller does not have permission"
```bash
# Verificar FIREBASE_ADMIN_PRIVATE_KEY no .env.local
# Deve ter \n e estar entre aspas duplas
```

### Se encontrar erro "requires an index"
```bash
# Copiar o link do erro e criar o índice
# Ou criar manualmente no console
```

---

## ⏱️ Tempo Estimado Total

- ✅ Firebase Client: Concluído
- 🔴 Firebase Admin: 2 min
- 🔵 Verificar Serviços: 5 min
- 🟢 Deploy Regras: 3 min
- 🟡 Criar Índices: 5 min
- 🧪 Testar: 2 min
- 🎨 Outras APIs: 35 min

**Total: ~50 minutos**

---

## 🚀 Comando Rápido

Após baixar o Service Account e preencher .env.local:

```bash
# 1. Verificar env vars
npx tsx check-env.ts

# 2. Testar Firebase
npx tsx test-firebase.ts

# 3. Se tudo OK, começar desenvolvimento
npm run dev
```

---

**Próximo passo:** Baixar Service Account do Firebase e atualizar .env.local 🔐
