# Firebase Authentication Setup Guide

## ✅ Implementação Completa

A autenticação Firebase foi integrada ao aplicativo com sucesso! Aqui está o que foi feito:

### Componentes Criados

1. **Login Component** ([src/components/Login.tsx](src/components/Login.tsx))
   - Tela de login baseada no design do Figma
   - Suporte para login com Google
   - Suporte para login com email (pronto para expansão)
   - Interface responsiva e moderna

2. **useAuth Hook** ([src/hooks/useAuth.ts](src/hooks/useAuth.ts))
   - Hook customizado para gerenciar autenticação
   - Métodos disponíveis:
     - `signInWithGoogle()` - Login com Google
     - `signInWithEmail(email, password)` - Login com email/senha
     - `signUpWithEmail(email, password, displayName)` - Criar conta
     - `signOut()` - Logout
     - `resetPassword(email)` - Resetar senha

3. **AuthProvider** ([src/components/AuthProvider.tsx](src/components/AuthProvider.tsx))
   - Context Provider para acessar auth em toda a aplicação
   - Use `useAuthContext()` em qualquer componente para acessar:
     - `user` - Usuário autenticado (ou null)
     - `loading` - Estado de carregamento
     - `isAuthenticated` - Boolean para verificar autenticação

### Mudanças no App

- ✅ Clerk removido completamente
- ✅ Firebase Auth integrado
- ✅ Tela de login exibida para usuários não autenticados
- ✅ Proteção de rotas implementada

## 🔧 Configuração Necessária no Firebase Console

Para ativar o login com Google, siga estes passos:

### 1. Acesse o Firebase Console

1. Vá para [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: **ktirio-ai-4540c**

### 2. Ative a Autenticação Google

1. No menu lateral, clique em **Authentication** (Autenticação)
2. Clique na aba **Sign-in method** (Métodos de login)
3. Localize **Google** na lista de provedores
4. Clique em **Google** e depois em **Enable** (Ativar)
5. Configure:
   - **Project support email**: Selecione seu email
   - **Project public-facing name**: "Ktirio AI"
6. Clique em **Save** (Salvar)

### 3. Configure os Domínios Autorizados

1. Ainda em **Authentication > Settings**
2. Na seção **Authorized domains**, adicione:
   - `localhost` (já deve estar lá)
   - Seu domínio de produção quando deploy

### 4. (Opcional) Configurar Email/Senha

Se quiser adicionar login com email/senha:

1. Em **Sign-in method**, ative **Email/Password**
2. Você pode também ativar **Email link (passwordless sign-in)** para login sem senha

## 🧪 Testando a Autenticação

Para testar o login:

```bash
npm run dev
```

1. Abra o aplicativo
2. Você verá a tela de login
3. Clique em "Continue with Google"
4. Faça login com sua conta Google
5. Você será redirecionado para a galeria após o login

## 📝 Próximos Passos (Opcionais)

### 1. Implementar Sign Up (Cadastro)

Crie um componente similar ao Login para novos usuários:

```typescript
// Exemplo de uso
const handleSignUp = async (email: string, password: string) => {
  try {
    await signUpWithEmail(email, password, displayName);
  } catch (error) {
    // Tratar erro
  }
};
```

### 2. Adicionar Recuperação de Senha

```typescript
const handleForgotPassword = async (email: string) => {
  try {
    await resetPassword(email);
    // Mostrar mensagem: "Email de recuperação enviado!"
  } catch (error) {
    // Tratar erro
  }
};
```

### 3. Adicionar Perfil do Usuário no Settings

No componente Settings, você pode adicionar um botão de logout:

```typescript
const { user, signOut } = useAuthContext();

const handleLogout = async () => {
  try {
    await signOut();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};
```

### 4. Sincronizar Dados do Usuário com Firestore

Quando um usuário faz login, você pode criar/atualizar um documento no Firestore:

```typescript
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const syncUserToFirestore = async (user: User) => {
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    lastLogin: new Date(),
  }, { merge: true });
};
```

## 🔐 Segurança

- ✅ As credenciais do Firebase estão em `.env.local`
- ✅ O arquivo `.env.local` está no `.gitignore`
- ⚠️ Lembre-se de configurar as regras de segurança do Firestore para proteger os dados

### Exemplo de Regras de Segurança (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir que usuários leiam/escrevam apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Projetos do usuário
    match /projects/{projectId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## ❓ Problemas Comuns

### "Firebase: Error (auth/popup-blocked)"
- Verifique se o navegador não está bloqueando popups
- Tente em uma aba anônima ou outro navegador

### "Firebase: Error (auth/unauthorized-domain)"
- Adicione o domínio em **Authentication > Settings > Authorized domains**

### "Firebase: Error (auth/configuration-not-found)"
- Verifique se você ativou o provider Google no Firebase Console

## 📚 Recursos

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Auth REST API](https://firebase.google.com/docs/reference/rest/auth)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
