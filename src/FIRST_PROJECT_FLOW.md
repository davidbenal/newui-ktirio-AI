# First Project Flow - Fluxo de Primeiro Projeto

## Visão Geral

O fluxo de primeiro projeto guia novos usuários através de uma experiência onboarding completa usando um **checklist de progresso** que acompanha as etapas concluídas no Editor.

## Componentes Envolvidos

### 1. App.tsx (Orquestrador)
- Gerencia estado global `isFirstTimeUser` e `hasCompletedFirstProject`
- Passa props corretas para Gallery e Editor
- Controla `shouldOpenUploadOnMount` flag

### 2. Gallery.tsx
- Detecta se é first-time user
- Mostra botão "Criar Primeiro Projeto" com estilo diferente
- Ao clicar, aciona `onCreateNewProject()` que seta flag

### 3. Editor.tsx
- Recebe `isFirstTimeUser` e `shouldOpenUploadOnMount`
- Abre modal de upload automaticamente
- Exibe `ProgressChecklist` com as etapas
- Atualiza progresso conforme usuário completa ações

### 4. ProgressChecklist.tsx
- Widget flutuante no canto inferior direito
- Mostra 4 etapas com checkboxes
- Pode ser minimizado
- Auto-dismiss quando completo

---

## Fluxo Completo (Passo a Passo)

### Estado Inicial
```typescript
isFirstTimeUser: true
hasCompletedFirstProject: false
currentView: 'gallery'
```

### Passo 1: Gallery
Usuário vê:
- Galeria vazia (EmptyStateGallery)
- Botão destacado "Criar Primeiro Projeto"

```tsx
<Gallery
  isFirstTime={true}
  onFirstProjectComplete={handleFirstProjectComplete}
/>
```

### Passo 2: Clique "Criar Primeiro Projeto"
```typescript
handleCreateNewProject() {
  setSelectedProject(null); // Novo projeto
  setShouldOpenUploadOnMount(true); // FLAG importante
  setCurrentView('editor');
}
```

### Passo 3: Editor Carrega
```typescript
// Editor.tsx - useEffect
useEffect(() => {
  setIsLoadingEditor(true);
  
  setTimeout(() => {
    setIsLoadingEditor(false);
    
    // Se for first-time user, abre upload e checklist
    if (shouldOpenUploadOnMount && isFirstTimeUser) {
      setTimeout(() => {
        setShowUploadModal(true); // ✅ Abre modal de upload
        setShowChecklist(true); // ✅ Mostra checklist
        setChecklistProgress(prev => ({ 
          ...prev, 
          createdProject: true // ✅ Marca primeira etapa
        }));
      }, 300);
    }
  }, 2000); // 2s de loading skeleton
}, [projectId, shouldOpenUploadOnMount, isFirstTimeUser]);
```

### Passo 4: Upload Modal + Checklist Aparecem
Modal de upload renderizado centralmente:
```tsx
{showUploadModal && (
  <div className="fixed inset-0 bg-black/50 z-[200]">
    {/* Upload UI */}
  </div>
)}
```

Checklist flutuante no canto inferior direito:
```tsx
{showChecklist && (
  <ProgressChecklist
    progress={checklistProgress}
    onDismiss={() => setShowChecklist(false)}
  />
)}
```

**Estado do Checklist:**
- ✅ Criar um novo projeto (marcado automaticamente)
- ⬜ Fazer upload de foto
- ⬜ Escolher estilo
- ⬜ Gerar primeira imagem

### Passo 5: Usuário Faz Upload
```tsx
{showUploadModal && (
  <div className="fixed inset-0 bg-black/50 z-[200]">
    <div className="bg-white rounded-2xl p-8">
      {/* Upload UI */}
      <button onClick={handleSimulateUpload}>
        Simular Upload
      </button>
    </div>
  </div>
)}
```

### Passo 6: Upload Completo
```typescript
handleSimulateUpload() {
  if (onUploadComplete) {
    onUploadComplete(); // Notifica App.tsx
  }
  
  // ✅ Atualiza checklist
  setChecklistProgress(prev => ({ 
    ...prev, 
    uploadedPhoto: true 
  }));
  
  setShowUploadModal(false);
  showSuccess('Upload concluído!', '...');
}
```

**Estado do Checklist:**
- ✅ Criar um novo projeto
- ✅ Fazer upload de foto (agora marcado!)
- ⬜ Escolher estilo
- ⬜ Gerar primeira imagem

### Passo 7: Usuário Gera Imagem
```typescript
handleGenerate() {
  setIsGenerating(true);
  
  // ✅ Marca estilo como selecionado
  if (!checklistProgress.selectedStyle) {
    setChecklistProgress(prev => ({ 
      ...prev, 
      selectedStyle: true 
    }));
  }
  
  setTimeout(() => {
    // ✅ Marca imagem como gerada
    setChecklistProgress(prev => ({ 
      ...prev, 
      generatedImage: true 
    }));
    
    // ✅ Completa first project se todas etapas OK
    if (isFirstTimeUser && checklistProgress.uploadedPhoto) {
      setTimeout(() => {
        if (onFirstProjectComplete) {
          onFirstProjectComplete();
        }
      }, 2000);
    }
  }, 3000);
}
```

**Estado do Checklist (COMPLETO!):**
- ✅ Criar um novo projeto
- ✅ Fazer upload de foto
- ✅ Escolher estilo
- ✅ Gerar primeira imagem

### Passo 8: Checklist Auto-Dismiss
```typescript
// ProgressChecklist.tsx
if (completedCount === steps.length && onDismiss) {
  setTimeout(() => onDismiss(), 2000);
}
```

Após 2 segundos, checklist se fecha automaticamente e mostra:
```
"✅ Tudo pronto! Continue criando."
```

### Passo 9: App.tsx Atualiza Estado
```typescript
handleFirstProjectComplete() {
  setHasCompletedFirstProject(true);
  setIsFirstTimeUser(false);
}
```

### Estado Final
```typescript
isFirstTimeUser: false
hasCompletedFirstProject: true
currentView: 'editor' // Continua no editor
checklistProgress: {
  createdProject: true,
  uploadedPhoto: true,
  selectedStyle: true,
  generatedImage: true
}
```

---

## Props Flow Diagram

```
App.tsx
  ├─ isFirstTimeUser: boolean
  ├─ hasCompletedFirstProject: boolean
  ├─ shouldOpenUploadOnMount: boolean
  └─ uploadCompleted: boolean

Gallery.tsx
  ├─ receives: isFirstTime = isFirstTimeUser && !hasCompletedFirstProject
  ├─ receives: onFirstProjectComplete
  └─ triggers: onCreateNewProject() → sets shouldOpenUploadOnMount

Editor.tsx
  ├─ receives: shouldOpenUploadOnMount
  ├─ receives: isFirstTimeUser
  ├─ receives: onFirstProjectComplete
  ├─ receives: onUploadComplete
  └─ manages:
      ├─ showFirstProjectGuide (local state)
      └─ showUploadModal (local state)

FirstProjectGuide.tsx
  ├─ receives: onUpload
  └─ receives: onViewExamples
```

---

## Casos de Uso

### Caso 1: Novo Usuário - Caminho Feliz
1. ✅ Welcome Screen (opcional)
2. ✅ Gallery vazia
3. ✅ Clica "Criar Primeiro Projeto"
4. ✅ Editor carrega (skeleton 2s)
5. ✅ FirstProjectGuide aparece
6. ✅ Clica "Fazer upload"
7. ✅ Upload Modal abre
8. ✅ Simula upload
9. ✅ Success toast
10. ✅ Editor ativo, isFirstTimeUser = false

### Caso 2: Novo Usuário - Skip Examples
1. Welcome Screen
2. Gallery vazia
3. Clica "Criar Primeiro Projeto"
4. FirstProjectGuide aparece
5. Clica "Ver exemplos primeiro" ❌
6. Guide fecha, toast informativo
7. Volta para editor sem upload
8. (Ainda é first-time user até fazer upload)

### Caso 3: Usuário Retornando
```typescript
isFirstTimeUser: false
```
- Não vê FirstProjectGuide
- Vai direto para Editor normal
- Novo projeto mostra toast: "Novo projeto criado!"

### Caso 4: Reset First Time (Developer Tools)
Settings → Developer → "Reset First Time Experience"
```typescript
handleResetFirstTime() {
  setIsFirstTimeUser(true);
  setHasCompletedFirstProject(false);
  setCurrentView('gallery');
}
```

---

## Estados Importantes

### Global (App.tsx)
```typescript
const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
const [hasCompletedFirstProject, setHasCompletedFirstProject] = useState(false);
const [shouldOpenUploadOnMount, setShouldOpenUploadOnMount] = useState(false);
const [uploadCompleted, setUploadCompleted] = useState(false);
```

### Gallery (Gallery.tsx)
```typescript
// Derived
const isFirstTime = props.isFirstTime; // isFirstTimeUser && !hasCompletedFirstProject
```

### Editor (Editor.tsx)
```typescript
const [showFirstProjectGuide, setShowFirstProjectGuide] = useState(false);
const [showUploadModal, setShowUploadModal] = useState(false);
const [isLoadingEditor, setIsLoadingEditor] = useState(true);
```

---

## Condições de Render

### FirstProjectGuide aparece quando:
```typescript
showFirstProjectGuide && isFirstTimeUser
```

Que é setado como `true` quando:
```typescript
isLoadingEditor === false &&
shouldOpenUploadOnMount === true &&
isFirstTimeUser === true
```

### Upload Modal aparece quando:
```typescript
showUploadModal === true
```

Que pode ser acionado por:
1. FirstProjectGuide → onUpload()
2. Toolbar → botão Upload (usuários normais)

---

## Z-Index Layers

```css
/* Editor Base */
z-index: 0

/* FirstProjectGuide */
position: fixed
inset: 0
background: white
z-index: 200

/* Upload Modal */
position: fixed
inset: 0
background: black/50
z-index: 200

/* Modals não podem aparecer simultaneamente */
```

---

## Animações

### Loading Skeleton
- Duração: 2000ms
- Componente: `EditorLoadingSkeleton`

### FirstProjectGuide
- Animation: `animate-breathing` (4s ease-in-out infinite)
- Fade in: Automático (quando aparece)

### Upload Modal
- Animation: `animate-slideUp` (300ms ease-out)
- Backdrop: `animate-fadeIn` (200ms)

---

## Toasts

### Success
```typescript
showSuccess(
  'Upload concluído!',
  'Sua imagem foi carregada com sucesso.'
);
```

### Info (Novo projeto - usuários normais)
```typescript
showInfo(
  'Novo projeto criado!',
  'Faça upload de uma imagem ou comece a desenhar no canvas.'
);
```

### Info (Ver exemplos)
```typescript
showInfo(
  'Galeria de exemplos',
  'Navegue pelos projetos de exemplo na galeria.'
);
```

---

## Testing Checklist

### Manual Testing

- [ ] 1. Reset first-time (Developer Tools)
- [ ] 2. Gallery mostra empty state
- [ ] 3. Botão "Criar Primeiro Projeto" destacado
- [ ] 4. Click abre Editor
- [ ] 5. Editor mostra skeleton por 2s
- [ ] 6. FirstProjectGuide aparece após skeleton
- [ ] 7. Animação breathing funciona
- [ ] 8. Click "Fazer upload" abre modal
- [ ] 9. Modal tem backdrop blur
- [ ] 10. Click "Simular Upload" fecha modal
- [ ] 11. Toast success aparece
- [ ] 12. Editor fica ativo
- [ ] 13. Voltar para Gallery (não é mais first-time)
- [ ] 14. Criar novo projeto → não mostra guide
- [ ] 15. Toast "Novo projeto criado!" aparece

### Edge Cases

- [ ] Close upload modal sem fazer upload
- [ ] Click "Ver exemplos" no guide
- [ ] Refresh durante fluxo
- [ ] Navegação back durante guide
- [ ] Upload modal + hints system (não conflitam)

---

## Integração com Outros Sistemas

### Progressive Hints
- FirstProjectGuide NÃO mostra hints
- Hints aparecem APÓS first project completo
- Condição: `!isFirstTimeUser`

### Feature Tour
- Tour pode rodar APÓS first project
- Acionado manualmente em Settings
- Independente de isFirstTimeUser

### Upgrade Modals
- Podem aparecer durante Editor
- Z-index: 1000 (acima de tudo)
- Pausam first project flow

---

## Próximas Melhorias

### Fase 2: Success Celebration
Após upload completo:
```tsx
{uploadCompleted && isFirstTimeUser && (
  <SuccessCelebration
    onContinue={() => {
      setUploadCompleted(false);
      // Continue editing
    }}
  />
)}
```

### Fase 3: Progress Checklist
Mostrar checklist de progresso:
```tsx
<ProgressChecklist
  steps={[
    { id: 'upload', label: 'Upload de imagem', completed: true },
    { id: 'edit', label: 'Editar área', completed: false },
    { id: 'generate', label: 'Gerar resultado', completed: false },
    { id: 'download', label: 'Baixar imagem', completed: false },
  ]}
/>
```

### Fase 4: Guided Tooltips
Tooltips sequenciais apontando para:
1. Ferramentas (brush, eraser)
2. Painel de estilos
3. Botão gerar
4. Histórico de versões

---

## Debugging

### Console Logs Úteis

```typescript
// App.tsx
console.log('🎯 First Time State:', {
  isFirstTimeUser,
  hasCompletedFirstProject,
  shouldOpenUploadOnMount,
});

// Editor.tsx
console.log('📝 Editor Mount:', {
  projectId,
  shouldOpenUploadOnMount,
  isFirstTimeUser,
  showFirstProjectGuide,
});

// FirstProjectGuide.tsx
console.log('🎨 Guide Action:', action); // 'upload' | 'examples'
```

### LocalStorage (Futuro)

```typescript
// Persistir estado
localStorage.setItem('ktiri_first_time_completed', 'true');

// Verificar ao carregar
const hasCompleted = localStorage.getItem('ktiri_first_time_completed') === 'true';
setIsFirstTimeUser(!hasCompleted);
```

---

## Resumo

O fluxo de primeiro projeto agora funciona corretamente:

✅ **Gallery** → Detecta first-time user  
✅ **Editor** → Recebe props corretas  
✅ **FirstProjectGuide** → Aparece no momento certo  
✅ **Upload Modal** → Segue após guide  
✅ **State Management** → Atualiza globalmente  
✅ **Toast Feedback** → Confirma sucesso  

**Resultado:** Experiência onboarding completa e fluida! 🎉
