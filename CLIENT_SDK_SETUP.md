# ✅ Configuração Completa - Client SDK (SEM Admin)

## 🎉 O que foi configurado

### 1. Firebase Client SDK
- ✅ Removido Firebase Admin (não é necessário)
- ✅ Configurado apenas Client SDK
- ✅ Credenciais do projeto `ktirio-ai-4540c` no .env.local

### 2. Hooks Customizados Criados

#### [src/hooks/useFirebaseUser.ts](src/hooks/useFirebaseUser.ts)
```typescript
// Sincroniza automaticamente Clerk → Firestore
const { user, loading } = useFirebaseUser()
```

**Funcionalidades:**
- ✅ Detecta login do Clerk
- ✅ Cria usuário no Firestore automaticamente
- ✅ Retorna dados do usuário (credits, plan, etc)
- ✅ 5 créditos grátis no primeiro login

#### [src/hooks/useProjects.ts](src/hooks/useProjects.ts)
```typescript
// Gerencia projetos do usuário
const { projects, createProject, deleteProject } = useProjects({ userId })
```

**Funcionalidades:**
- ✅ Listar projetos do usuário
- ✅ Criar novo projeto
- ✅ Atualizar projeto
- ✅ Deletar projeto
- ✅ Toggle favorito
- ✅ Toggle arquivado
- ✅ Busca e filtros

#### [src/hooks/useImageUpload.ts](src/hooks/useImageUpload.ts)
```typescript
// Upload de imagens para Firebase Storage
const { upload, uploading, progress } = useImageUpload()
```

**Funcionalidades:**
- ✅ Validação de arquivo (tipo, tamanho)
- ✅ Upload para Firebase Storage
- ✅ Progress tracking
- ✅ Error handling

---

## 📂 Estrutura de Arquivos

```
src/
├── lib/
│   ├── firebase.ts          ✅ Cliente Firebase (Firestore + Storage)
│   ├── firestore.ts         ✅ Operações CRUD
│   ├── storage.ts           ✅ Upload de imagens
│   ├── gemini.ts            ✅ Google Gemini AI
│   └── stripe.ts            ✅ Stripe config
├── hooks/
│   ├── useFirebaseUser.ts   ✅ Sync Clerk + Firestore
│   ├── useProjects.ts       ✅ Gerenciar projetos
│   └── useImageUpload.ts    ✅ Upload de imagens
└── examples/
    └── GalleryWithFirebase.tsx  ✅ Exemplo de integração

firestore.rules               ✅ Regras de segurança Firestore
storage.rules                 ✅ Regras de segurança Storage
```

---

## 🚀 Como Usar

### 1. Configurar Clerk

```bash
# 1. Criar conta: https://dashboard.clerk.com/
# 2. Create Application "Ktirio AI"
# 3. Enable: Email + Google
# 4. Copiar keys para .env.local
```

**No App.tsx (ou main.tsx):**
```typescript
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {/* Seu app aqui */}
    </ClerkProvider>
  )
}
```

### 2. Usar Hook de Usuário

```typescript
import { useFirebaseUser } from '@/hooks/useFirebaseUser'

function MyComponent() {
  const { user, loading, clerkUser } = useFirebaseUser()

  if (loading) return <div>Carregando...</div>
  if (!user) return <div>Faça login</div>

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Créditos: {user.credits}</p>
      <p>Plano: {user.plan}</p>
    </div>
  )
}
```

### 3. Usar Hook de Projetos

```typescript
import { useFirebaseUser } from '@/hooks/useFirebaseUser'
import { useProjects } from '@/hooks/useProjects'

function ProjectsList() {
  const { user } = useFirebaseUser()
  const { projects, createProject, deleteProject } = useProjects({
    userId: user?.id || null
  })

  return (
    <div>
      <button onClick={() => createProject('Meu Projeto')}>
        Criar Projeto
      </button>

      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <button onClick={() => deleteProject(project.id)}>
            Deletar
          </button>
        </div>
      ))}
    </div>
  )
}
```

### 4. Upload de Imagens

```typescript
import { useFirebaseUser } from '@/hooks/useFirebaseUser'
import { useImageUpload } from '@/hooks/useImageUpload'

function ImageUploader() {
  const { user } = useFirebaseUser()
  const { upload, uploading, progress } = useImageUpload()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const imageUrl = await upload(file, user.id, 'projects')

    if (imageUrl) {
      console.log('Imagem enviada:', imageUrl)
      // Salvar URL no projeto, etc
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {uploading && <p>Enviando... {progress}%</p>}
    </div>
  )
}
```

---

## 🔐 Regras de Segurança

### Firestore Rules

Já configuradas em [firestore.rules](firestore.rules):

```javascript
// Usuários só acessam seus próprios dados
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Projetos protegidos por dono
match /projects/{projectId} {
  allow read: if request.auth.uid == resource.data.userId;
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update, delete: if request.auth.uid == resource.data.userId;
}
```

### Publicar Regras

**Opção A: Via Console**
```bash
1. https://console.firebase.google.com/project/ktirio-ai-4540c/firestore/rules
2. Copiar conteúdo de firestore.rules
3. Publicar

4. https://console.firebase.google.com/project/ktirio-ai-4540c/storage/rules
5. Copiar conteúdo de storage.rules
6. Publicar
```

**Opção B: Via CLI**
```bash
firebase deploy --only firestore:rules,storage
```

---

## 📊 Estrutura de Dados

### Collection: users/{userId}
```typescript
{
  clerkId: string           // ID do Clerk
  email: string
  name?: string
  avatar?: string
  plan: 'free' | 'starter' | 'professional'
  credits: number           // 5 grátis no início
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Collection: projects/{projectId}
```typescript
{
  userId: string           // Referência ao dono
  name: string
  thumbnail?: string       // URL da imagem no Storage
  isFavorite: boolean
  isArchived: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Collection: versions/{versionId}
```typescript
{
  projectId: string        // Referência ao projeto
  name: string
  imageUrl: string         // URL da imagem gerada
  prompt?: string          // Prompt usado
  style?: string           // Estilo aplicado
  createdAt: Timestamp
}
```

---

## 🧪 Testar Configuração

### 1. Testar Firebase
```bash
npx tsx test-firebase.ts
```

Esperado:
```
✅ Firestore Write OK
✅ Firestore Read OK
✅ Storage OK
🎉 Todos os testes passaram!
```

### 2. Verificar Variáveis
```bash
npx tsx check-env.ts
```

### 3. Iniciar App
```bash
npm run dev
```

---

## 📝 Exemplo Completo

Veja [src/examples/GalleryWithFirebase.tsx](src/examples/GalleryWithFirebase.tsx) para exemplo completo de integração.

---

## 🔄 Fluxo de Dados

### 1. Login do Usuário
```
1. Usuário faz login no Clerk
2. useFirebaseUser detecta login
3. Verifica se usuário existe no Firestore
4. Se não existe, cria com 5 créditos grátis
5. Retorna dados do usuário
```

### 2. Criar Projeto
```
1. User clica em "Novo Projeto"
2. useProjects.createProject() é chamado
3. Cria documento em projects/ com userId
4. Atualiza lista local
5. Mostra toast de sucesso
```

### 3. Upload de Imagem
```
1. User seleciona arquivo
2. useImageUpload.upload() valida arquivo
3. Faz upload para Storage
4. Retorna URL pública da imagem
5. Salva URL no projeto
```

### 4. Geração com IA
```
1. User digita prompt
2. Verifica créditos no Firestore
3. Deduz 1 crédito
4. Gemini otimiza prompt
5. DALL-E gera imagem
6. Upload da imagem gerada
7. Salva em versions/
8. Atualiza UI
```

---

## ✅ Checklist Final

### Configuração
- [x] Firebase Client SDK configurado
- [x] Firebase Admin SDK removido
- [x] .env.local limpo e atualizado
- [x] Hooks customizados criados
- [ ] Clerk configurado
- [ ] Regras publicadas no Firestore
- [ ] Regras publicadas no Storage

### Integração
- [ ] Clerk Provider no App.tsx
- [ ] useFirebaseUser no componente principal
- [ ] Gallery integrado com useProjects
- [ ] Upload integrado com useImageUpload
- [ ] Créditos funcionando

### Testes
- [ ] Login cria usuário no Firestore
- [ ] Criar projeto funciona
- [ ] Upload de imagem funciona
- [ ] Dedução de créditos funciona

---

## 🆘 Problemas Comuns

### Erro: "Missing or insufficient permissions"
```bash
# Solução: Publicar regras de segurança
firebase deploy --only firestore:rules,storage
```

### Erro: "The query requires an index"
```bash
# Solução: Criar índice (Firestore mostra link)
# Ou criar manualmente no console
```

### Erro: "No user found"
```bash
# Solução: Verificar se Clerk está configurado
# Verificar VITE_CLERK_PUBLISHABLE_KEY
```

---

## 🚀 Próximos Passos

1. **Configurar Clerk** (10 min)
   ```bash
   https://dashboard.clerk.com/
   ```

2. **Publicar Regras** (2 min)
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

3. **Testar Fluxo** (5 min)
   - Login
   - Criar projeto
   - Upload de imagem

4. **Configurar APIs de IA** (15 min)
   - Google Gemini
   - DALL-E

5. **Configurar Stripe** (15 min)
   - Produtos e preços
   - Webhooks

---

**Total: Client SDK 100% configurado! 🎉**

Próximo passo: [Configurar Clerk](#1-configurar-clerk)
