# Progress Checklist - Guia de Testes

## Objetivo

Testar o fluxo completo do **Progress Checklist** (checklist de primeiros passos) que aparece para novos usuários no Editor.

---

## Setup Inicial

1. **Abra a aplicação**
2. **Vá para Settings → Developer**
3. **Clique em "Reset First Time Experience"**
4. **Você será redirecionado para Gallery**

---

## Teste 1: Fluxo Completo (Happy Path)

### Passo 1: Gallery Empty State
**Ação:** Observe a tela

**Esperado:**
- ✅ EmptyStateGallery visível
- ✅ Botão "Criar Primeiro Projeto" destacado
- ✅ Texto: "Comece sua jornada criando seu primeiro projeto"

---

### Passo 2: Criar Primeiro Projeto
**Ação:** Click no botão "Criar Primeiro Projeto"

**Esperado:**
- ✅ Redirecionamento para Editor
- ✅ Loading skeleton por ~2 segundos
- ✅ Sidebars com skeleton animado

---

### Passo 3: Editor Carregado
**Ação:** Aguardar loading terminar

**Esperado:**
- ✅ Modal de upload abre automaticamente (z-index 200)
- ✅ Backdrop escuro (50% opacity)
- ✅ **ProgressChecklist aparece no canto inferior direito**
  - Widget branco com sombra
  - Título: "Primeiros passos"
  - Barra de progresso: 25% (1/4 completo)
  - **Checklist:**
    - ✅ Criar um novo projeto (checked, riscado)
    - ⬜ Fazer upload de foto
    - ⬜ Escolher estilo
    - ⬜ Gerar primeira imagem

**Validações:**
- [ ] Checklist está visível
- [ ] Primeira etapa marcada
- [ ] Progresso: 25%
- [ ] Botão minimizar visível (ícone chevron down)

---

### Passo 4: Fazer Upload
**Ação:** No modal de upload, click em "Simular Upload"

**Esperado:**
- ✅ Modal fecha
- ✅ Toast success: "Upload concluído!"
- ✅ **Checklist atualiza automaticamente:**
  - ✅ Criar um novo projeto
  - ✅ Fazer upload de foto (agora checked!)
  - ⬜ Escolher estilo
  - ⬜ Gerar primeira imagem
  - Barra de progresso: **50%** (2/4)

**Validações:**
- [ ] Segunda etapa marcada
- [ ] Animação suave na barra de progresso
- [ ] Checkbox muda de cor (cinza → verde)
- [ ] Texto fica riscado

---

### Passo 5: Preencher Prompt
**Ação:** 
1. No campo "PROMPT DA CENA", digite: "sala moderna minimalista"
2. Click no botão "Gerar imagem"

**Esperado:**
- ✅ Botão muda para "Gerando..." com spinner
- ✅ **Checklist atualiza imediatamente:**
  - ✅ Criar um novo projeto
  - ✅ Fazer upload de foto
  - ✅ Escolher estilo (agora checked!)
  - ⬜ Gerar primeira imagem
  - Barra de progresso: **75%** (3/4)
- ✅ Aguarda ~3 segundos (simulação)

**Validações:**
- [ ] Terceira etapa marcada
- [ ] Progresso: 75%
- [ ] Loading state no botão

---

### Passo 6: Imagem Gerada
**Ação:** Aguardar término da geração (3s)

**Esperado:**
- ✅ Toast success: "Imagem gerada com sucesso!"
- ✅ **Checklist COMPLETO:**
  - ✅ Criar um novo projeto
  - ✅ Fazer upload de foto
  - ✅ Escolher estilo
  - ✅ Gerar primeira imagem
  - Barra de progresso: **100%** (4/4)
  - Gradiente azul → roxo completo
- ✅ **Mensagem de conclusão aparece:**
  - "✅ Tudo pronto! Continue criando."
  - Borda superior cinza clara
- ✅ **Auto-dismiss após 2 segundos**
  - Checklist desaparece suavemente

**Validações:**
- [ ] Quarta etapa marcada
- [ ] Progresso: 100%
- [ ] Mensagem de conclusão visível
- [ ] Auto-dismiss funciona
- [ ] Checklist some após ~2s

---

### Passo 7: Verificar Estado Global
**Ação:** Voltar para Gallery (botão voltar)

**Esperado:**
- ✅ Gallery agora mostra projetos (não empty state)
- ✅ Botão "+ Novo Projeto" normal (não destacado)
- ✅ `isFirstTimeUser = false`

**Ações:**
- Click em "+ Novo Projeto"

**Esperado:**
- ✅ Editor abre
- ✅ **Checklist NÃO aparece** (não é mais first-time)
- ✅ Toast info: "Novo projeto criado!"

---

## Teste 2: Minimizar e Expandir Checklist

### Setup
- Reset First Time
- Gallery → "Criar Primeiro Projeto"
- Aguardar checklist aparecer

### Ações

**1. Minimizar**
- Click no ícone ChevronDown (canto superior direito do checklist)

**Esperado:**
- ✅ Checklist minimiza para botão circular
- ✅ Botão tem 56x56px (w-14 h-14)
- ✅ **Progress Ring:**
  - Círculo cinza de fundo
  - Arco verde com progresso (25%)
  - Texto central: "1/4"
- ✅ Hover: escala 1.05

**Validações:**
- [ ] Animação suave
- [ ] Ring mostra progresso correto
- [ ] Contador correto

**2. Expandir**
- Click no botão circular minimizado

**Esperado:**
- ✅ Checklist expande de volta
- ✅ Estado preservado (mesmo progresso)
- ✅ Animação slideUp

---

## Teste 3: Progresso Parcial

### Setup
- Reset First Time
- Gallery → "Criar Primeiro Projeto"
- Upload de foto (2/4 completo)

### Ações
**NÃO gerar imagem, apenas minimizar**

- Click em minimizar

**Esperado:**
- ✅ Ring mostra 50% (metade do arco verde)
- ✅ Texto: "2/4"

**Validações:**
- [ ] Progresso visual correto
- [ ] Percentual matemático: 50%

---

## Teste 4: Cancelar Upload

### Setup
- Reset First Time
- Gallery → "Criar Primeiro Projeto"
- Modal de upload aparece

### Ações
- Click em "Cancelar" no modal

**Esperado:**
- ✅ Modal fecha
- ✅ Checklist permanece visível
- ✅ **Progresso mantém 25% (1/4)**
  - Apenas "Criar projeto" marcado
  - Upload ainda desmarcado

**Validações:**
- [ ] Checklist não some
- [ ] Estado preservado

**Próximo Passo:**
- Abrir upload novamente (botão "Fazer upload" na sidebar)
- Simular upload
- Checklist atualiza para 50%

---

## Teste 5: Developer Tools

### Setup
- Editor aberto
- Press **Ctrl+Shift+H** (abre debug panel)

### Botões de Checklist

**1. Mostrar/Ocultar Checklist**
```
[Mostrar Checklist] → Botão roxo
```

**Ação:** Click

**Esperado:**
- ✅ Checklist aparece/desaparece
- ✅ Toast: "Checklist exibido/ocultado"
- ✅ Estado preservado

**2. Reset Checklist**
```
[Reset Checklist] → Botão outline roxo
```

**Ação:** Click

**Esperado:**
- ✅ Progresso volta para 0/4
- ✅ Todas etapas desmarcadas
- ✅ Barra de progresso: 0%
- ✅ Toast: "Checklist resetado"

**Validações:**
- [ ] Reset completo
- [ ] Visual atualiza imediatamente

---

## Teste 6: Etapas Fora de Ordem

### Cenário
E se o usuário gerar imagem SEM fazer upload?

### Setup
- Reset First Time
- Gallery → "Criar Primeiro Projeto"
- **CANCELAR** modal de upload

### Ações
1. Preencher prompt: "teste"
2. Click "Gerar imagem"

**Esperado:**
- ✅ Erro! Toast: "Prompt vazio" (validação)
- OU (se passar validação):
  - Marca "Escolher estilo" ✅
  - Marca "Gerar imagem" ✅
  - **MAS "Upload" ainda desmarcado** ⬜
  - Progresso: 75% (3/4)

**Observação:** Lógica atual permite gerar sem upload (usando imagem placeholder)

---

## Teste 7: Multiple Sessions

### Cenário
Verificar se checklist persiste em múltiplas sessões

### Setup
- Complete até 50% (2/4)
- **Refresh da página (F5)**

**Esperado (SEM backend/localStorage):**
- ❌ Progresso perde (esperado)
- ✅ Volta para first-time user
- ✅ Checklist reinicia do zero

**Futuro (COM localStorage):**
```typescript
localStorage.setItem('checklist_progress', JSON.stringify(progress));
```
- ✅ Progresso persiste
- ✅ Continua de onde parou

---

## Teste 8: Responsividade

### Mobile (375px width)

**Esperado:**
- ✅ Checklist permanece visível
- ✅ Largura: 280px (fixo)
- ✅ Posição: bottom-6 right-6
- ✅ Pode sair da tela se viewport < 280px
  - **Considerar:** position right-4 em mobile

**Tablet (768px)**
- ✅ Funciona perfeitamente

**Desktop (1920px)**
- ✅ Funciona perfeitamente

---

## Teste 9: Accessibility

### Keyboard Navigation

**Tab:**
- ✅ Foca no botão minimizar
- ✅ Tab para próximo elemento

**Enter/Space:**
- ✅ Ativa minimizar/expandir

**Screen Reader:**
```
"Checklist de primeiros passos"
"1 de 4 etapas concluídas"
"Criar um novo projeto - concluído"
"Fazer upload de foto - não concluído"
```

**ARIA Labels:**
- [ ] `aria-label="Minimizar checklist"` no botão
- [ ] `aria-label="Expandir checklist"` no botão minimizado
- [ ] `role="progressbar"` na barra de progresso
- [ ] `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

---

## Teste 10: Z-Index Conflicts

### Cenário
Verificar se checklist não conflita com outros elementos

### Elementos para Testar

**1. Upload Modal (z-200)**
- ✅ Modal sobrepõe checklist
- ✅ Checklist fica por trás

**2. Upgrade Modal (z-1000)**
- Settings → Developer → "Show Trial Ended Banner"
- Click CTA para abrir upgrade modal
- ✅ Modal sobrepõe checklist

**3. Progressive Hints (z-50)**
- ✅ Checklist (z-100) sobrepõe hints
- ✅ Não conflitam (aparecem em momentos diferentes)

**4. Toast Notifications (z-[9999])**
- ✅ Toasts sobrepõem checklist
- ✅ Posição diferente (superior direita)

---

## Validações Visuais

### Checklist Expandido

```
┌─────────────────────────────┐
│ Primeiros passos      [v]   │ ← Header
├─────────────────────────────┤
│ ████████░░░░░░░░░░░░░░░░   │ ← Progress bar (50%)
├─────────────────────────────┤
│ ✓ Criar um novo projeto     │ ← Checked, riscado, opacity 0.7
│ ✓ Fazer upload de foto      │ ← Checked, riscado, opacity 0.7
│ ○ Escolher estilo           │ ← Unchecked, normal
│ ○ Gerar primeira imagem     │ ← Unchecked, normal
└─────────────────────────────┘
```

### Checklist Minimizado

```
      ┌──────┐
      │  ◯   │  ← Progress ring (50%)
      │ 2/4  │  ← Counter
      └──────┘
```

### Checklist Completo

```
┌─────────────────────────────┐
│ Primeiros passos      [v]   │
├─────────────────────────────┤
│ ████████████████████████████ │ ← 100% (gradiente azul→roxo)
├─────────────────────────────┤
│ ✓ Criar um novo projeto     │
│ ✓ Fazer upload de foto      │
│ ✓ Escolher estilo           │
│ ✓ Gerar primeira imagem     │
├─────────────────────────────┤
│ ✓ Tudo pronto! Continue...  │ ← Mensagem verde
└─────────────────────────────┘

(Auto-dismiss em 2s)
```

---

## Edge Cases

### 1. Gerar Múltiplas Imagens
- Gerar imagem → marca "Gerar primeira imagem" ✅
- Gerar segunda vez → **já marcado, não muda**

### 2. Upload Múltiplas Vezes
- Upload → marca ✅
- Upload novamente → **já marcado, não muda**

### 3. Dismiss Manual
- Checklist tem `onDismiss` prop
- Usuário pode fechar manualmente? **Atualmente só auto-dismiss**
- **Considerar:** Botão "X" para fechar antes de completar

### 4. Minimizado Durante Auto-Dismiss
- Checklist minimizado
- Completa última etapa
- **Esperado:** Auto-dismiss funciona mesmo minimizado

---

## Performance

### Rendering
- [ ] Checklist não re-renderiza desnecessariamente
- [ ] Apenas atualiza quando `progress` muda
- [ ] Animações são smooth (60fps)

### Memory
- [ ] Checklist limpa listeners ao desmontar
- [ ] Sem memory leaks

---

## Checklist Final de Aceitação

### Funcionalidade
- [ ] Checklist aparece para first-time users
- [ ] 4 etapas rastreadas corretamente
- [ ] Progresso atualiza em tempo real
- [ ] Auto-dismiss após conclusão (2s)
- [ ] Minimizar/expandir funciona
- [ ] Dismiss manual (se implementado)

### Visual
- [ ] Design match Figma/specs
- [ ] Animações suaves
- [ ] Progress bar gradiente correto
- [ ] Checkboxes têm estado visual correto
- [ ] Texto riscado quando completo

### UX
- [ ] Não atrapalha workflow
- [ ] Posição não cobre controles importantes
- [ ] Minimizado economiza espaço
- [ ] Feedback claro de progresso

### Técnico
- [ ] Sem erros console
- [ ] Props corretas
- [ ] Estado sincronizado
- [ ] Z-index correto
- [ ] Acessível (keyboard, screen reader)

---

## Bugs Conhecidos

### Bug #1: Auto-dismiss conflita com minimizado
**Descrição:** Se checklist minimizado quando auto-dismiss dispara, pode não fechar

**Status:** A investigar

**Workaround:** Expandir antes de completar

---

## Próximas Melhorias

### Fase 2: Persistência
- [ ] Salvar progresso em localStorage
- [ ] Restaurar ao recarregar página
- [ ] API sync (quando backend disponível)

### Fase 3: Customização
- [ ] Permitir usuário fechar permanentemente
- [ ] "Não mostrar novamente" checkbox
- [ ] Reiniciar checklist manualmente

### Fase 4: Gamificação
- [ ] Confetti ao completar
- [ ] Badges/achievements
- [ ] Share progress

---

## Status

✅ **IMPLEMENTAÇÃO COMPLETA**  
🧪 **READY FOR TESTING**  
📝 **DOCUMENTED**
