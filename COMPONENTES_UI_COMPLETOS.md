# Componentes shadcn/ui - Código Completo

> 📁 Localização: `src/components/ui/`
>
> Total: 46 componentes + 2 utilitários

---

## 1. button.tsx

**Dependências:**
- `@radix-ui/react-slot@1.1.2`
- `class-variance-authority@0.7.1`
- `./utils` (cn)

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

---

## 2. input.tsx

**Dependências:**
- `./utils` (cn)

```typescript
import * as React from "react";
import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
```

---

## 3. card.tsx

**Dependências:**
- `./utils` (cn)

```typescript
import * as React from "react";
import { cn } from "./utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
```

---

## 4. dialog.tsx

**Dependências:**
- `@radix-ui/react-dialog@1.1.6`
- `lucide-react@0.487.0` (XIcon)
- `./utils` (cn)

```typescript
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { XIcon } from "lucide-react@0.487.0";
import { cn } from "./utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
```

---

## 5. utils.ts

**Dependências:**
- `clsx`
- `tailwind-merge`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Lista Completa de Componentes

Devido ao limite de espaço, aqui está a lista completa dos 46 componentes disponíveis. Todos seguem o mesmo padrão de qualidade e integração com Radix UI:

### Formulários (16)
1. ✅ `button.tsx` - Botões com variantes
2. ✅ `input.tsx` - Campos de texto
3. ✅ `textarea.tsx` - Área de texto
4. ✅ `select.tsx` - Seletor dropdown
5. ✅ `checkbox.tsx` - Caixas de seleção
6. ✅ `radio-group.tsx` - Grupo de radio buttons
7. ✅ `switch.tsx` - Toggle switch
8. ✅ `slider.tsx` - Controle deslizante
9. ✅ `label.tsx` - Labels para formulários
10. ✅ `form.tsx` - Sistema de formulários (react-hook-form)
11. `input-otp.tsx` - Input de código OTP
12. `toggle.tsx` - Botão de alternância
13. `toggle-group.tsx` - Grupo de toggles

### Navegação (7)
14. `tabs.tsx` - Abas de navegação
15. `breadcrumb.tsx` - Breadcrumb
16. `navigation-menu.tsx` - Menu de navegação
17. `menubar.tsx` - Barra de menu
18. `pagination.tsx` - Paginação
19. `sidebar.tsx` - Barra lateral
20. `separator.tsx` - Separador visual

### Overlays e Modais (7)
21. ✅ `dialog.tsx` - Diálogos modais
22. `alert-dialog.tsx` - Diálogos de confirmação
23. `sheet.tsx` - Sheet modal lateral
24. `drawer.tsx` - Drawer lateral (vaul)
25. `popover.tsx` - Popover flutuante
26. `tooltip.tsx` - Tooltips
27. `hover-card.tsx` - Card ao passar mouse

### Data Display (6)
28. ✅ `card.tsx` - Cards de conteúdo
29. `avatar.tsx` - Avatar de usuário
30. `badge.tsx` - Badges e tags
31. `table.tsx` - Tabelas
32. `calendar.tsx` - Calendário (react-day-picker)
33. `chart.tsx` - Gráficos (recharts)

### Feedback (3)
34. `alert.tsx` - Alertas informativos
35. `progress.tsx` - Barra de progresso
36. `skeleton.tsx` - Loading skeleton
37. `sonner.tsx` - Toast notifications (sonner)

### Menus (3)
38. `dropdown-menu.tsx` - Menu dropdown
39. `context-menu.tsx` - Menu de contexto
40. `command.tsx` - Command palette (cmdk)

### Utilitários (6)
41. `aspect-ratio.tsx` - Controle de aspect ratio
42. `collapsible.tsx` - Conteúdo colapsável
43. `resizable.tsx` - Painéis redimensionáveis
44. `scroll-area.tsx` - Área de scroll customizada
45. `carousel.tsx` - Carrossel (embla)
46. `accordion.tsx` - Acordeão expansível

### Utilitários Extras (2)
47. ✅ `utils.ts` - Função `cn()` para merge de classes
48. `use-mobile.ts` - Hook para detectar mobile

---

## Padrões de Uso

### Exemplo: Formulário Completo
```typescript
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"

function MyForm() {
  const form = useForm()

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="email@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Enviar</Button>
    </Form>
  )
}
```

### Exemplo: Dialog com Card
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Título do Dialog</DialogTitle>
          <DialogDescription>
            Descrição do dialog aqui
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>Card dentro do Dialog</CardTitle>
          </CardHeader>
          <CardContent>
            Conteúdo do card
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Como Usar no Seu Projeto

### 1. Copiar pasta completa
```bash
cp -r "src/components/ui" "seu-projeto/src/components/"
```

### 2. Instalar dependências
```bash
npm install @radix-ui/react-dialog@1.1.6 \
  @radix-ui/react-slot@1.1.2 \
  @radix-ui/react-label@2.1.2 \
  class-variance-authority@0.7.1 \
  clsx \
  tailwind-merge \
  lucide-react@0.487.0 \
  react-hook-form@7.55.0
```

### 3. Configurar Tailwind
Certifique-se de que o `tailwind.config.js` está configurado corretamente com as cores e variáveis do tema.

### 4. Importar e usar
```typescript
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// ... etc
```

---

## Notas Importantes

1. **Todos os componentes são "use client"** quando usam Radix UI
2. **Acessibilidade completa** - ARIA labels, roles, keyboard navigation
3. **Dark mode suportado** - Classes `dark:` em todos os componentes
4. **TypeScript completo** - Todas as props tipadas
5. **Variantes CVA** - Sistema de variantes com class-variance-authority
6. **Merge de classes** - Função `cn()` para sobrescrever classes facilmente

---

## Documentação Adicional

Para documentação completa de cada componente, consulte:
- [shadcn/ui docs](https://ui.shadcn.com/)
- [Radix UI primitives](https://www.radix-ui.com/)
