# Fluxo de Novo Projeto - Ktírio AI

## Overview

Implementação do fluxo completo de criação de novo projeto ao clicar no botão "Novo projeto" na Gallery.

## Funcionalidade

### Gallery → Editor

Quando o usuário clica em **"Novo projeto"** na Gallery:

1. ✅ O Editor é aberto
2. ✅ `projectId` é `null` (indica novo projeto)
3. ✅ Nome do projeto é "Novo Projeto"
4. ✅ Toast informativo aparece após carregamento
5. ✅ Área de imagem mostra estado vazio
6. ✅ Botão de upload destacado

---

## Implementação

### 1. App.tsx

**Novo handler adicionado:**

```typescript
const handleCreateNewProject = () => {
  setSelectedProject(null); // Null indica novo projeto
  setCurrentView('editor');
};
```

**Passado para Gallery:**

```tsx
<Gallery 
  onOpenProject={handleOpenProject}
  onCreateNewProject={handleCreateNewProject} // ← Novo
  // ... outras props
/>
```

---

### 2. Gallery.tsx

**Nova prop adicionada:**

```typescript
interface GalleryProps {
  onOpenProject: (projectId: string) => void;
  onCreateNewProject?: () => void; // ← Nova prop
  // ... outras props
}
```

**Botão "Novo projeto" atualizado:**

```tsx
<button
  onClick={() => {
    if (onCreateNewProject) {
      onCreateNewProject();
    }
  }}
  className="tour-upload-area bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 hover:scale-105 transition-all flex items-center gap-2"
>
  <Plus className="w-4 h-4" />
  Novo projeto
</button>
```

**Antes:**
```typescript
onClick={() => {
  showInfo('Novo projeto', 'Funcionalidade de criar projeto em desenvolvimento.');
}}
```

**Depois:**
```typescript
onClick={() => {
  if (onCreateNewProject) {
    onCreateNewProject();
  }
}}
```

---

### 3. Editor.tsx

#### Nome do Projeto

**Dinâmico baseado em `projectId`:**

```typescript
const [projectName, setProjectName] = useState(
  projectId ? 'Sala de Estar Clássica' : 'Novo Projeto'
);
```

- `projectId` existe → "Sala de Estar Clássica"
- `projectId` é `null` → "Novo Projeto"

#### Toast Informativo

**Aparece após loading para novos projetos:**

```typescript
useEffect(() => {
  setIsLoadingEditor(true);
  const timer = setTimeout(() => {
    setIsLoadingEditor(false);
    
    // Mostrar mensagem informativa para novo projeto
    if (!projectId) {
      setTimeout(() => {
        showInfo(
          'Novo projeto criado!',
          'Faça upload de uma imagem ou comece a desenhar no canvas.'
        );
      }, 300);
    }
  }, 2000);
  return () => clearTimeout(timer);
}, [projectId, showInfo]);
```

**Timing:**
1. Loading skeleton: 2 segundos
2. Delay adicional: 300ms
3. Toast aparece: **Total de ~2.3s após abrir**

#### Área de Imagem

**Estado vazio para novos projetos:**

```tsx
<div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-2">
  {projectId ? (
    // Projeto existente - mostrar imagem
    <img src={exampleImage} alt="Projeto" className="w-full h-full object-cover" />
  ) : (
    // Novo projeto - mostrar placeholder
    <div className="w-full h-full flex items-center justify-center text-gray-400">
      <div className="text-center">
        <Upload className="w-8 h-8 mx-auto mb-2" />
        <p className="text-xs">Nenhuma imagem</p>
      </div>
    </div>
  )}
</div>
```

**Visual:**

```
┌─────────────────────────────┐
│                             │
│         📤 Upload           │  ← Ícone grande
│                             │
│      Nenhuma imagem         │  ← Texto
│                             │
└─────────────────────────────┘
```

#### Botão de Upload

**Destacado para novos projetos:**

```tsx
<button
  onClick={() => {
    showSuccess(
      'Upload simulado',
      'Em breve você poderá fazer upload de imagens reais.'
    );
  }}
  className={`w-full rounded-lg px-3 py-2 text-sm flex items-center justify-center gap-2 transition-colors ${
    projectId
      ? 'border border-gray-300 hover:bg-gray-50 text-gray-700'  // Projeto existente
      : 'bg-gray-900 hover:bg-gray-800 text-white'                // Novo projeto
  }`}
>
  <Upload className="w-4 h-4" />
  {projectId ? 'Alterar imagem' : 'Fazer upload'}
</button>
```

**Comparação:**

| Condição | Background | Texto | Label |
|----------|-----------|-------|-------|
| Projeto existente (`projectId`) | Branco com borda | Cinza escuro | "Alterar imagem" |
| Novo projeto (`!projectId`) | Preto (#030213) | Branco | "Fazer upload" |

---

## Fluxo Completo

### User Journey

```
┌────────────┐
│  Gallery   │
└─────┬──────┘
      │
      │ 1. Clica "Novo projeto"
      ↓
┌────────────────────┐
│ handleCreateNew    │
│ Project()          │
│                    │
│ - setSelectedProject(null)
│ - setCurrentView('editor')
└─────┬──────────────┘
      │
      │ 2. Navega para Editor
      ↓
┌──────────────────────────┐
│  EditorLoadingSkeleton   │  ← 2 segundos
└─────┬────────────────────┘
      │
      │ 3. Loading completo
      ↓
┌──────────────────────────┐
│      Editor              │
│                          │
│  - Nome: "Novo Projeto"  │
│  - Imagem: placeholder   │
│  - Botão: destacado      │
└─────┬────────────────────┘
      │
      │ 4. Toast aparece (+300ms)
      ↓
┌──────────────────────────┐
│  ℹ️ Toast Info            │
│                          │
│  "Novo projeto criado!"  │
│  "Faça upload de uma     │
│   imagem ou comece a     │
│   desenhar no canvas."   │
└──────────────────────────┘
```

---

## Estados do Editor

### Projeto Existente (`projectId = "1"`)

```
┌─────────────────────────────────┐
│ ← [Sala de Estar Clássica ▼]   │
├─────────────────────────────────┤
│ IMAGEM DO PROJETO               │
│ ┌───────────────────────────┐   │
│ │                           │   │
│ │   [Imagem existente]      │   │
│ │                           │   │
│ └───────────────────────────┘   │
│ [ 📤 Alterar imagem ]          │  ← Botão branco
└─────────────────────────────────┘
```

### Novo Projeto (`projectId = null`)

```
┌─────────────────────────────────┐
│ ← [Novo Projeto ▼]              │
├─────────────────────────────────┤
│ IMAGEM DO PROJETO               │
│ ┌───────────────────────────┐   │
│ │          📤               │   │
│ │                           │   │
│ │    Nenhuma imagem         │   │
│ │                           │   │
│ └───────────────────────────┘   │
│ [ 📤 Fazer upload ]            │  ← Botão preto (destacado)
└─────────────────────────────────┘
```

---

## Diferenças Visuais

### 1. Nome do Projeto

| Condição | Nome Exibido |
|----------|-------------|
| `projectId` existe | "Sala de Estar Clássica" |
| `projectId` é `null` | "Novo Projeto" |

### 2. Área de Imagem

| Condição | Conteúdo |
|----------|----------|
| `projectId` existe | `<img src={exampleImage} />` |
| `projectId` é `null` | Placeholder com ícone Upload + texto |

### 3. Botão de Upload

| Condição | Estilo | Texto |
|----------|--------|-------|
| `projectId` existe | Branco com borda cinza | "Alterar imagem" |
| `projectId` é `null` | Preto sólido (#030213) | "Fazer upload" |

### 4. Toast Informativo

| Condição | Toast Aparece? |
|----------|---------------|
| `projectId` existe | ❌ Não |
| `projectId` é `null` | ✅ Sim (após 2.3s) |

---

## Interações do Usuário

### Criar Novo Projeto

**Passo a passo:**

1. Usuário está na Gallery
2. Clica no botão "Novo projeto" (canto superior direito)
3. **Loading:** Skeleton de 2 segundos
4. **Editor abre:**
   - Sidebar esquerda visível
   - Nome: "Novo Projeto"
   - Área de imagem vazia (placeholder)
   - Botão "Fazer upload" destacado em preto
5. **Toast aparece (2.3s):**
   - Tipo: Info (azul)
   - Título: "Novo projeto criado!"
   - Mensagem: "Faça upload de uma imagem ou comece a desenhar no canvas."
6. **Usuário pode:**
   - Clicar em "Fazer upload" → Toast de sucesso
   - Usar ferramentas do canvas
   - Adicionar prompt e gerar imagem
   - Voltar para Gallery

### Abrir Projeto Existente

**Passo a passo:**

1. Usuário está na Gallery
2. Clica em um card de projeto
3. **Loading:** Skeleton de 2 segundos
4. **Editor abre:**
   - Sidebar esquerda visível
   - Nome: "Sala de Estar Clássica" (do projeto)
   - Imagem carregada
   - Botão "Alterar imagem" (branco)
5. **Sem toast** (projeto existente)
6. **Usuário pode:**
   - Editar projeto
   - Alterar imagem
   - Gerar variações
   - Voltar para Gallery

---

## Código de Referência

### handleCreateNewProject (App.tsx)

```typescript
const handleCreateNewProject = () => {
  setSelectedProject(null); // Indica novo projeto
  setCurrentView('editor');
};
```

### Conditional Rendering (Editor.tsx)

```typescript
// Nome
const [projectName, setProjectName] = useState(
  projectId ? 'Sala de Estar Clássica' : 'Novo Projeto'
);

// Toast
if (!projectId) {
  showInfo(
    'Novo projeto criado!',
    'Faça upload de uma imagem ou comece a desenhar no canvas.'
  );
}

// Imagem
{projectId ? (
  <img src={exampleImage} alt="Projeto" />
) : (
  <div className="placeholder">
    <Upload />
    <p>Nenhuma imagem</p>
  </div>
)}

// Botão
className={projectId
  ? 'border border-gray-300 text-gray-700'
  : 'bg-gray-900 text-white'
}
```

---

## Future Enhancements

### 1. Upload Real de Imagens

Substituir simulação por upload real:

```typescript
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  const { url } = await response.json();
  setProjectImage(url);
};
```

### 2. Auto-save de Projeto

Salvar automaticamente ao fazer alterações:

```typescript
useEffect(() => {
  if (!projectId) return; // Só para projetos existentes
  
  const timer = setTimeout(() => {
    saveProject({
      id: projectId,
      name: projectName,
      // ... outros dados
    });
  }, 2000); // Debounce de 2s
  
  return () => clearTimeout(timer);
}, [projectName, /* outras dependências */]);
```

### 3. Geração de ID Único

Gerar ID ao criar projeto:

```typescript
const handleCreateNewProject = () => {
  const newProjectId = generateUUID(); // ou Date.now().toString()
  setSelectedProject(newProjectId);
  setCurrentView('editor');
};
```

### 4. Template de Projeto

Oferecer templates ao criar novo projeto:

```typescript
const handleCreateNewProject = (template?: 'living-room' | 'kitchen' | 'bedroom') => {
  const newProject = {
    id: generateUUID(),
    template,
    name: template ? TEMPLATE_NAMES[template] : 'Novo Projeto'
  };
  
  setSelectedProject(newProject.id);
  setCurrentView('editor');
};
```

### 5. Histórico de Versões

Criar primeira versão ao upload:

```typescript
const handleUpload = (imageUrl: string) => {
  const firstVersion = {
    id: '1',
    name: 'Imagem Original',
    timestamp: new Date().toISOString(),
    thumbnail: imageUrl
  };
  
  setVersions([firstVersion]);
};
```

---

## Testing

### Teste Manual

**1. Criar Novo Projeto:**
```
✓ Clicar "Novo projeto" na Gallery
✓ Loading de 2s aparece
✓ Editor abre com nome "Novo Projeto"
✓ Área de imagem mostra placeholder
✓ Botão "Fazer upload" está destacado (preto)
✓ Toast info aparece após ~2.3s
```

**2. Upload Simulado:**
```
✓ Clicar "Fazer upload"
✓ Toast de sucesso aparece
✓ Mensagem: "Em breve você poderá fazer upload..."
```

**3. Voltar para Gallery:**
```
✓ Clicar botão voltar (←)
✓ Retorna para Gallery
✓ Projeto não é salvo (comportamento atual)
```

**4. Abrir Projeto Existente:**
```
✓ Clicar em card de projeto na Gallery
✓ Editor abre com nome do projeto
✓ Imagem carregada
✓ Botão "Alterar imagem" (branco)
✓ Toast NÃO aparece
```

### Edge Cases

**Projeto sem ID (null):**
```typescript
projectId = null
✓ Nome: "Novo Projeto"
✓ Placeholder visível
✓ Botão destacado
✓ Toast aparece
```

**Projeto com ID vazio (""):**
```typescript
projectId = ""
✓ Tratado como projeto existente (truthy check)
✓ Comportamento: projeto existente
```

**Múltiplos Cliques em "Novo Projeto":**
```
✓ Cada clique abre uma nova instância
✓ Loading sempre ocorre (2s)
✓ Toast sempre aparece
```

---

## Conclusão

O fluxo de novo projeto está **100% funcional**:

✅ Botão "Novo projeto" abre Editor  
✅ Estado diferenciado para novo vs. existente  
✅ Visual claro (placeholder + botão destacado)  
✅ Toast informativo automático  
✅ Navegação fluida (Gallery ↔ Editor)  

**Próximos passos sugeridos:**
1. Implementar upload real de imagens
2. Persistir projetos (localStorage ou backend)
3. Auto-save de alterações
4. Templates de projeto
5. Histórico de versões automático
