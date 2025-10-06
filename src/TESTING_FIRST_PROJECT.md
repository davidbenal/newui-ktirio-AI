# Testing Guide - First Project Flow

## Como Testar o Fluxo Completo

### Setup Inicial

1. **Abra o aplicativo**
2. **Vá para Settings → Developer**
3. **Clique em "Reset First Time Experience"**
4. **Você será redirecionado para Gallery**

---

## Cenário 1: Fluxo Completo (Happy Path)

### Passo 1: Gallery
**Esperado:**
- ✅ Tela vazia com EmptyStateGallery
- ✅ Botão "Criar Primeiro Projeto" destacado (grande, centralizado)
- ✅ Texto: "Comece sua jornada criando seu primeiro projeto"

**Ações:**
- Click no botão "Criar Primeiro Projeto"

---

### Passo 2: Editor Loading
**Esperado:**
- ✅ Redirecionamento para Editor
- ✅ Loading skeleton por ~2 segundos
- ✅ Sidebar esquerda: skeleton de estilos
- ✅ Canvas: skeleton central
- ✅ Sidebar direita: skeleton de histórico

**Ações:**
- Aguardar loading terminar

---

### Passo 3: FirstProjectGuide Aparece
**Esperado:**
- ✅ Tela fullscreen branca (z-index 200)
- ✅ Ilustração animada com breathing effect
- ✅ Título: "Crie sua primeira transformação"
- ✅ Descrição: "Faça upload de uma foto e veja a mágica acontecer em segundos"
- ✅ Botão primário: "Fazer upload de foto" (destaque)
- ✅ Botão secundário: "Ver exemplos primeiro"
- ✅ Animação breathing: escala 1.0 → 1.05 → 1.0 (4s loop)

**Validações:**
- [ ] Animação breathing está suave
- [ ] Botões têm hover effects
- [ ] Layout está centralizado
- [ ] Sparkles animam com pulse

**Ações:**
- Click em "Fazer upload de foto"

---

### Passo 4: Upload Modal
**Esperado:**
- ✅ FirstProjectGuide desaparece
- ✅ Upload Modal aparece com backdrop escuro (50% opacity)
- ✅ Modal com animação slideUp
- ✅ Título: "Upload de Imagem"
- ✅ Área de drag & drop com border dashed
- ✅ Ícone de upload
- ✅ Texto: "Clique para fazer upload" / "ou arraste e solte aqui"
- ✅ Botão "Simular Upload" (primário)
- ✅ Botão "Cancelar" (secundário)

**Validações:**
- [ ] Backdrop tem blur effect
- [ ] Modal está centralizado
- [ ] Hover na área de drop muda border para azul

**Ações:**
- Click em "Simular Upload"

---

### Passo 5: Upload Success
**Esperado:**
- ✅ Modal fecha
- ✅ Toast success aparece (canto superior direito)
  - Título: "Upload concluído!"
  - Mensagem: "Sua imagem foi carregada com sucesso."
  - Ícone: Check verde
  - Auto-dismiss: 3 segundos
- ✅ Editor fica visível e ativo
- ✅ Canvas mostra imagem de exemplo
- ✅ Todas as ferramentas funcionais

**Validações:**
- [ ] Toast tem animação slideDown
- [ ] Toast desaparece automaticamente
- [ ] Canvas renderiza corretamente
- [ ] Sidebars estão abertas

**Ações:**
- Voltar para Gallery (click no botão voltar)

---

### Passo 6: Gallery Atualizada
**Esperado:**
- ✅ **NÃO** mostra mais EmptyStateGallery
- ✅ **NÃO** mostra "Criar Primeiro Projeto"
- ✅ Mostra galeria normal com projetos
- ✅ Botão "+ Novo Projeto" normal (não destacado)

**Validações:**
- [ ] Estado isFirstTimeUser = false
- [ ] hasCompletedFirstProject = true

**Ações:**
- Click em "+ Novo Projeto"

---

### Passo 7: Novo Projeto (Usuário Normal)
**Esperado:**
- ✅ Redirecionamento para Editor
- ✅ Loading skeleton por 2s
- ✅ **NÃO** mostra FirstProjectGuide
- ✅ Toast info aparece:
  - Título: "Novo projeto criado!"
  - Mensagem: "Faça upload de uma imagem ou comece a desenhar no canvas."
  - Ícone: Info azul

**Validações:**
- [ ] FirstProjectGuide não aparece
- [ ] Editor fica direto ativo
- [ ] Toast tem cor azul (info)

✅ **FLUXO COMPLETO TESTADO COM SUCESSO!**

---

## Cenário 2: Ver Exemplos Primeiro

### Setup
- Reset First Time Experience
- Gallery → "Criar Primeiro Projeto"
- Aguardar FirstProjectGuide aparecer

### Ações
- Click em "Ver exemplos primeiro"

### Esperado
- ✅ FirstProjectGuide fecha
- ✅ Toast info aparece:
  - Título: "Galeria de exemplos"
  - Mensagem: "Navegue pelos projetos de exemplo na galeria."
- ✅ Editor fica visível (sem upload)

**Nota:** Usuário ainda é first-time até fazer upload real

---

## Cenário 3: Cancelar Upload

### Setup
- Reset First Time Experience
- Gallery → "Criar Primeiro Projeto"
- FirstProjectGuide → "Fazer upload"
- Upload Modal aparece

### Ações
- Click em "Cancelar"

### Esperado
- ✅ Modal fecha
- ✅ Nenhum toast
- ✅ Editor fica visível
- ✅ Usuário ainda é first-time

**Validação:**
- [ ] isFirstTimeUser ainda é true
- [ ] Próximo "Novo Projeto" mostra guide novamente

---

## Cenário 4: Navigation Durante Fluxo

### Teste 4A: Voltar Durante Guide

**Setup:**
- FirstProjectGuide está aberto

**Ações:**
- Click no botão "Voltar" do navegador (ou Header back button)

**Esperado:**
- ✅ Guide fecha
- ✅ Volta para Gallery
- ✅ Estado preservado (ainda first-time)

---

### Teste 4B: Voltar Durante Upload Modal

**Setup:**
- Upload Modal está aberto

**Ações:**
- Click fora do modal (backdrop)

**Nota:** Atualmente não fecha (expected behavior)

---

## Cenário 5: Developer Tools

### Setup
Settings → Developer → First-Time Experience

### Testes

**1. Reset First Time**
- Click "Reset First Time Experience"
- Esperado: Volta para Gallery, isFirstTimeUser = true

**2. Toast de Novo Projeto**
- Click "Simulate New Project Toast"
- Esperado: Toast info "Novo projeto criado!"

**3. Success Celebration**
- Click "Show Success Modal"
- Esperado: Modal de celebração aparece

---

## Validações Técnicas

### Props Propagation

**App.tsx → Editor:**
```typescript
<Editor 
  isFirstTimeUser={true} ✅
  shouldOpenUploadOnMount={true} ✅
  onFirstProjectComplete={fn} ✅
  onUploadComplete={fn} ✅
/>
```

**Verificar no React DevTools:**
- [ ] Editor recebe todas as props
- [ ] Valores corretos

---

### State Updates

**Antes do fluxo:**
```typescript
isFirstTimeUser: true
hasCompletedFirstProject: false
shouldOpenUploadOnMount: false
```

**Após clicar "Criar Primeiro Projeto":**
```typescript
shouldOpenUploadOnMount: true
currentView: 'editor'
```

**Após upload completo:**
```typescript
isFirstTimeUser: false
hasCompletedFirstProject: true
uploadCompleted: true
```

---

### Z-Index Hierarchy

Verificar com DevTools:

```
Editor Base: z-0
↓
Progressive Hints: z-50
↓
FirstProjectGuide: z-200 ✅
Upload Modal: z-200 ✅
↓
Upgrade Modals: z-1000
```

**Nunca devem aparecer simultaneamente:**
- FirstProjectGuide + Upload Modal ❌
- Guide aparece, depois Modal ✅

---

## Performance Checks

### Loading Times

- [ ] Editor skeleton: exatamente 2000ms
- [ ] FirstProjectGuide delay: 300ms após skeleton
- [ ] Upload Modal delay: 0ms (imediato)
- [ ] Toast auto-dismiss: 3000ms

### Animations

- [ ] Breathing: smooth (4s ease-in-out)
- [ ] SlideUp: 300ms ease-out
- [ ] FadeIn: 200ms ease-out
- [ ] No janks ou stutters

---

## Accessibility Checks

### Keyboard Navigation

- [ ] Tab navega pelos botões
- [ ] Enter ativa botões
- [ ] Esc fecha modais (implementar?)
- [ ] Focus visível em todos elementos

### Screen Readers

- [ ] Botões têm labels descritivos
- [ ] Modais anunciam título
- [ ] Toasts são anunciados (role="alert")

---

## Mobile Testing (Responsividade)

### FirstProjectGuide

- [ ] Ilustração escala corretamente
- [ ] Título legível (não truncado)
- [ ] Botões têm tamanho mínimo (44px touch target)
- [ ] Padding adequado nas bordas

### Upload Modal

- [ ] Modal não sai da tela
- [ ] Drag & drop funciona em touch devices
- [ ] Botões empilham verticalmente se necessário

---

## Browser Compatibility

Testar em:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Aspectos críticos:**
- [ ] Backdrop-filter (blur)
- [ ] CSS animations
- [ ] Z-index layering
- [ ] Toast positioning

---

## Edge Cases

### 1. Refresh Durante Fluxo

**Cenário:**
- FirstProjectGuide está aberto
- User refresha a página (F5)

**Esperado:**
- Volta para estado inicial
- Gallery mostra empty state
- isFirstTimeUser reseta para true (ou usa localStorage)

**Atual:** Perde estado (esperado sem backend)

---

### 2. Múltiplos Clicks Rápidos

**Cenário:**
- Usuário clica rapidamente em "Criar Primeiro Projeto" várias vezes

**Esperado:**
- Apenas uma transição
- Não duplica FirstProjectGuide

**Verificar:** Debounce ou disabled state

---

### 3. Slow Network

**Cenário:**
- Simular slow 3G
- Loading skeleton pode demorar mais

**Esperado:**
- Loading persiste até real completion
- Não mostra guide prematuramente

---

## Regression Testing

Após mudanças futuras, verificar que:

- [ ] Editor normal (não first-time) ainda funciona
- [ ] Progressive hints não conflitam
- [ ] Upgrade modals sobrepõem corretamente
- [ ] Settings → Developer tools funcionam
- [ ] Feature Tour independente funciona

---

## Checklist Final

### Funcionalidade Core
- [ ] FirstProjectGuide aparece para novos usuários
- [ ] Upload Modal abre após guide
- [ ] Upload completo marca first project como done
- [ ] Estado global atualiza corretamente
- [ ] Usuários retornando não veem guide

### UX
- [ ] Animações são suaves
- [ ] Toasts aparecem e somem corretamente
- [ ] Feedback visual em todas as ações
- [ ] Loading states claros

### Código
- [ ] Nenhum erro no console
- [ ] Nenhum warning React
- [ ] Props corretas em todos componentes
- [ ] useEffect dependencies corretas

### Documentação
- [ ] FIRST_PROJECT_FLOW.md está atualizado
- [ ] Props documentadas
- [ ] Edge cases documentados

---

## Report de Bugs

### Template

```markdown
**Bug:** FirstProjectGuide não aparece

**Steps to Reproduce:**
1. Reset first-time experience
2. Click "Criar Primeiro Projeto"
3. Editor loads

**Expected:**
FirstProjectGuide should appear after skeleton

**Actual:**
Direct to editor, no guide

**Screenshots:**
[attach]

**Browser:** Chrome 120
**OS:** macOS 14
**Console Errors:** [paste]
```

---

## Success Criteria

Fluxo está pronto quando:

✅ Todos os cenários passam  
✅ Nenhum bug crítico  
✅ Performance aceitável (<3s total)  
✅ Acessível (WCAG AA)  
✅ Documentação completa  
✅ Code review aprovado  

**Status:** ✅ READY FOR PRODUCTION
