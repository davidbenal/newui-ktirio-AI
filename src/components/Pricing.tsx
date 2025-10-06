import { useState } from 'react';
import { Check, ChevronLeft, X, Info, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

// Componente auxiliar para as linhas da tabela de comparação
interface ComparisonRowProps {
  feature: string;
  tooltip: string;
  values: (boolean | string)[];
  isLast?: boolean;
}

function ComparisonRow({ feature, tooltip, values, isLast = false }: ComparisonRowProps) {
  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-[#10B981] mx-auto" />
      ) : (
        <X className="w-5 h-5 text-[#CBCED4] mx-auto" />
      );
    }
    return <span className="text-sm text-[#252525]">{value}</span>;
  };

  return (
    <tr className={`hover:bg-[#FAFAFA] transition-colors ${!isLast ? 'border-b border-black/[0.05]' : ''}`}>
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#252525]">{feature}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-[#717182] cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[200px] text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </td>
      {values.map((value, index) => (
        <td key={index} className="py-4 px-4 text-center">
          {renderValue(value)}
        </td>
      ))}
    </tr>
  );
}

interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  credits: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  buttonVariant: 'default' | 'outline';
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfeito para experimentar',
    priceMonthly: 0,
    priceYearly: 0,
    credits: '10 créditos/mês',
    features: [
      '10 gerações de imagens por mês',
      'Resolução até 1024x1024',
      '2 estilos de staging disponíveis',
      'Histórico de 7 dias',
      'Marca d\'água nas imagens',
    ],
    buttonText: 'Começar grátis',
    buttonVariant: 'outline',
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Ideal para profissionais iniciantes',
    priceMonthly: 49,
    priceYearly: 470,
    credits: '100 créditos/mês',
    features: [
      '100 gerações de imagens por mês',
      'Resolução até 2048x2048',
      '8 estilos de staging disponíveis',
      'Histórico de 30 dias',
      'Sem marca d\'água',
      'Suporte por email',
    ],
    buttonText: 'Escolher Starter',
    buttonVariant: 'outline',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Para profissionais e equipes',
    priceMonthly: 89,
    priceYearly: 854,
    credits: '300 créditos/mês',
    features: [
      '300 gerações de imagens por mês',
      'Resolução até 4096x4096',
      'Todos os estilos de staging',
      'Histórico ilimitado',
      'Sem marca d\'água',
      'Suporte prioritário',
      'API de integração',
      'Exportação em lote',
    ],
    isPopular: true,
    buttonText: 'Escolher Professional',
    buttonVariant: 'default',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes equipes e empresas',
    priceMonthly: 299,
    priceYearly: 2870,
    credits: 'Créditos ilimitados',
    features: [
      'Gerações ilimitadas',
      'Resolução até 8K',
      'Todos os estilos + exclusivos',
      'Histórico ilimitado',
      'Sem marca d\'água',
      'Suporte 24/7 dedicado',
      'API de integração avançada',
      'Exportação em lote',
      'Treinamento personalizado',
      'SLA garantido',
    ],
    buttonText: 'Falar com vendas',
    buttonVariant: 'outline',
  },
];

interface PricingProps {
  onBack: () => void;
}

export default function Pricing({ onBack }: PricingProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (planId: string) => {
    console.log('Plano selecionado:', planId);
  };

  const getPrice = (plan: Plan) => {
    return billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      {/* HEADER - Card Flutuante */}
      <header
        className="bg-white rounded-2xl border border-black/[0.06] flex items-center px-6 py-4 gap-4 mb-6"
        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
      >
        {/* Botão Voltar */}
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Título */}
        <h1 className="text-foreground">Preços</h1>
      </header>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto w-full">
        {/* HERO SECTION */}
        <div className="text-center mb-12">
          <h2 className="text-[28px] md:text-[36px] text-primary mb-3">
            Preços simples e transparentes
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-[600px] mx-auto mb-8">
            Escolha o plano ideal para suas necessidades de staging virtual
          </p>

          {/* Toggle de Billing */}
          <div className="inline-flex bg-secondary rounded-xl p-1 gap-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-5 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-primary shadow-sm'
                  : 'bg-transparent text-muted-foreground'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-5 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1.5 ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-primary shadow-sm'
                  : 'bg-transparent text-muted-foreground'
              }`}
            >
              Anual
              <span className="inline-flex items-center px-1.5 py-0.5 bg-[#10B981] text-white text-[11px] rounded">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* PLAN CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => {
            const price = getPrice(plan);
            const monthlySavings = billingPeriod === 'yearly' && plan.priceMonthly > 0
              ? Math.round((plan.priceMonthly * 12 - plan.priceYearly) / 12)
              : 0;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-8 border transition-all duration-200 hover:-translate-y-1 ${
                  plan.isPopular
                    ? 'border-primary shadow-lg hover:shadow-xl'
                    : 'border-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
                }`}
              >
                {/* Badge Popular */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    {plan.name}
                  </p>
                  
                  {/* Preço */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-[40px] text-primary leading-none">
                      R$ {price}
                    </span>
                    {plan.priceMonthly > 0 && (
                      <span className="text-sm text-muted-foreground">
                        /{billingPeriod === 'monthly' ? 'mês' : 'ano'}
                      </span>
                    )}
                  </div>

                  {/* Economia */}
                  {monthlySavings > 0 && (
                    <p className="text-xs text-[#10B981]">
                      Economize R$ {monthlySavings}/mês
                    </p>
                  )}

                  {/* Descrição */}
                  <p className="text-sm text-muted-foreground mt-3">
                    {plan.description}
                  </p>
                </div>

                {/* Créditos */}
                <div className="mb-6 p-3 bg-secondary rounded-lg">
                  <p className="text-sm text-primary text-center">
                    {plan.credits}
                  </p>
                </div>

                {/* Botão CTA */}
                <Button
                  variant={plan.buttonVariant}
                  className={`w-full mb-6 ${
                    plan.isPopular ? 'h-11' : 'h-10'
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.buttonText}
                </Button>

                {/* Separador */}
                <div className="h-px bg-black/[0.06] mb-6" />

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* COMPARISON TABLE */}
        <div className="mt-20 mb-20">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-[28px] text-[#030213] mb-3">
              Compare todos os recursos
            </h2>
            <p className="text-base text-[#717182]">
              Veja em detalhes o que está incluído em cada plano
            </p>
          </div>

          {/* Table Card */}
          <div
            className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden"
            style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
          >
            <TooltipProvider>
              <table className="w-full border-collapse">
                {/* Header Row */}
                <thead>
                  <tr className="bg-[#FAFAFA] border-b-2 border-[#E9EBEF]">
                    <th className="text-left py-5 px-6 text-sm text-[#252525] w-[40%]">
                      Recursos
                    </th>
                    <th className="text-center py-5 px-4 text-sm text-[#252525] w-[15%]">
                      Free
                    </th>
                    <th className="text-center py-5 px-4 text-sm text-[#252525] w-[15%]">
                      Starter
                    </th>
                    <th className="text-center py-5 px-4 text-sm text-[#252525] w-[15%]">
                      Professional
                    </th>
                    <th className="text-center py-5 px-4 text-sm text-[#252525] w-[15%]">
                      Enterprise
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {/* CATEGORIA 1: CRÉDITOS E USO */}
                  <tr className="bg-[#F3F3F5] border-t border-b border-[#E9EBEF]">
                    <td colSpan={5} className="py-4 px-6 text-sm text-[#030213] uppercase tracking-wider">
                      Créditos e Uso
                    </td>
                  </tr>

                  <ComparisonRow
                    feature="Créditos mensais"
                    tooltip="Quantidade de créditos disponíveis por mês"
                    values={['10', '100', '300', 'Personalizado']}
                  />
                  <ComparisonRow
                    feature="Rollover de créditos"
                    tooltip="Créditos não utilizados são transferidos para o próximo mês"
                    values={[false, false, true, true]}
                  />
                  <ComparisonRow
                    feature="Compra de créditos avulsos"
                    tooltip="Possibilidade de comprar créditos extras quando necessário"
                    values={[false, true, true, true]}
                  />
                  <ComparisonRow
                    feature="Validade dos créditos"
                    tooltip="Tempo até os créditos expirarem"
                    values={['30 dias', '60 dias', '90 dias', 'Sem expiração']}
                  />

                  {/* CATEGORIA 2: PROJETOS */}
                  <tr className="bg-[#F3F3F5] border-t border-b border-[#E9EBEF]">
                    <td colSpan={5} className="py-4 px-6 text-sm text-[#030213] uppercase tracking-wider">
                      Projetos
                    </td>
                  </tr>

                  <ComparisonRow
                    feature="Projetos simultâneos"
                    tooltip="Número de projetos que você pode ter ativos ao mesmo tempo"
                    values={['1', '5', 'Ilimitado', 'Ilimitado']}
                  />
                  <ComparisonRow
                    feature="Histórico de versões"
                    tooltip="Por quanto tempo mantemos o histórico de alterações"
                    values={['7 dias', '30 dias', 'Ilimitado', 'Ilimitado']}
                  />
                  <ComparisonRow
                    feature="Pastas personalizadas"
                    tooltip="Organize seus projetos em pastas customizadas"
                    values={[false, true, true, true]}
                  />
                  <ComparisonRow
                    feature="Tags e organização"
                    tooltip="Sistema de tags para organizar e filtrar projetos"
                    values={[false, true, true, true]}
                  />

                  {/* CATEGORIA 3: QUALIDADE E RECURSOS */}
                  <tr className="bg-[#F3F3F5] border-t border-b border-[#E9EBEF]">
                    <td colSpan={5} className="py-4 px-6 text-sm text-[#030213] uppercase tracking-wider">
                      Qualidade e Recursos
                    </td>
                  </tr>

                  <ComparisonRow
                    feature="Qualidade de geração"
                    tooltip="Nível de qualidade das imagens geradas pela IA"
                    values={['Básica', 'Alta', 'Máxima', 'Máxima']}
                  />
                  <ComparisonRow
                    feature="Resolução de exportação"
                    tooltip="Resolução máxima para exportar suas imagens"
                    values={['1024px', '2048px', '4096px', '4096px']}
                  />
                  <ComparisonRow
                    feature="Marca d'água"
                    tooltip="Imagens exportadas contêm marca d'água"
                    values={['Sim', 'Não', 'Não', 'Não']}
                  />
                  <ComparisonRow
                    feature="Batch processing"
                    tooltip="Processe múltiplas imagens simultaneamente"
                    values={[false, false, 'Até 10', 'Ilimitado']}
                  />
                  <ComparisonRow
                    feature="Máscaras customizadas"
                    tooltip="Crie suas próprias máscaras de edição personalizadas"
                    values={[false, true, true, true]}
                  />
                  <ComparisonRow
                    feature="Estilos avançados"
                    tooltip="Quantidade de estilos de staging disponíveis"
                    values={['3', '10', 'Todos', 'Todos + Custom']}
                  />

                  {/* CATEGORIA 4: COLABORAÇÃO */}
                  <tr className="bg-[#F3F3F5] border-t border-b border-[#E9EBEF]">
                    <td colSpan={5} className="py-4 px-6 text-sm text-[#030213] uppercase tracking-wider">
                      Colaboração
                    </td>
                  </tr>

                  <ComparisonRow
                    feature="Membros da equipe"
                    tooltip="Número de pessoas que podem acessar a conta"
                    values={['1', '1', '3', 'Ilimitado']}
                  />
                  <ComparisonRow
                    feature="Compartilhamento de projetos"
                    tooltip="Compartilhe projetos com colegas e clientes"
                    values={[false, false, true, true]}
                  />
                  <ComparisonRow
                    feature="Comentários e feedback"
                    tooltip="Sistema de comentários para colaboração em tempo real"
                    values={[false, false, true, true]}
                  />
                  <ComparisonRow
                    feature="Permissões granulares"
                    tooltip="Controle detalhado de quem pode ver e editar"
                    values={[false, false, false, true]}
                  />

                  {/* CATEGORIA 5: INTEGRAÇÕES E API */}
                  <tr className="bg-[#F3F3F5] border-t border-b border-[#E9EBEF]">
                    <td colSpan={5} className="py-4 px-6 text-sm text-[#030213] uppercase tracking-wider">
                      Integrações e API
                    </td>
                  </tr>

                  <ComparisonRow
                    feature="API REST"
                    tooltip="Acesso programático via API REST"
                    values={[false, false, 'Básica', 'Completa']}
                  />
                  <ComparisonRow
                    feature="Webhooks"
                    tooltip="Receba notificações automáticas de eventos"
                    values={[false, false, true, true]}
                  />
                  <ComparisonRow
                    feature="Zapier/Make integração"
                    tooltip="Integre com mais de 5000 aplicativos"
                    values={[false, false, true, true]}
                  />
                  <ComparisonRow
                    feature="Custom domain"
                    tooltip="Use seu próprio domínio personalizado"
                    values={[false, false, false, true]}
                  />

                  {/* CATEGORIA 6: SUPORTE */}
                  <tr className="bg-[#F3F3F5] border-t border-b border-[#E9EBEF]">
                    <td colSpan={5} className="py-4 px-6 text-sm text-[#030213] uppercase tracking-wider">
                      Suporte
                    </td>
                  </tr>

                  <ComparisonRow
                    feature="Email support"
                    tooltip="Tempo médio de resposta do suporte por email"
                    values={['48h', '24h', '12h', '2h']}
                  />
                  <ComparisonRow
                    feature="Chat prioritário"
                    tooltip="Acesso ao chat ao vivo com suporte prioritário"
                    values={[false, false, true, true]}
                  />
                  <ComparisonRow
                    feature="Gerente de conta"
                    tooltip="Gerente de conta dedicado ao seu negócio"
                    values={[false, false, false, true]}
                  />
                  <ComparisonRow
                    feature="Onboarding dedicado"
                    tooltip="Sessão de onboarding personalizada com especialista"
                    values={[false, false, false, true]}
                  />
                  <ComparisonRow
                    feature="Treinamento"
                    tooltip="Recursos de treinamento disponíveis"
                    values={[false, 'Docs', 'Vídeos', 'Personalizado']}
                    isLast
                  />
                </tbody>
              </table>
            </TooltipProvider>

            {/* Footer da Tabela */}
            <div className="bg-[#FAFAFA] py-6 px-6 text-center">
              <p className="text-sm text-[#717182]">
                Ainda tem dúvidas? Confira nosso FAQ abaixo ou{' '}
                <button className="text-[#030213] hover:underline">
                  fale com nossa equipe
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="mt-20 max-w-[800px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-[28px] text-[#030213] mb-3">
              Perguntas Frequentes
            </h2>
            <p className="text-base text-[#717182]">
              Tire suas dúvidas sobre nossos planos e funcionalidades
            </p>
          </div>

          {/* FAQ Accordion Card */}
          <div
            className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden"
            style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
          >
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b border-black/[0.05] last:border-0">
                <AccordionTrigger className="px-6 py-6 hover:bg-[#FAFAFA] transition-colors [&[data-state=open]>svg]:rotate-180">
                  <span className="text-base text-[#252525] text-left pr-4">
                    Posso mudar de plano a qualquer momento?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-sm text-[#717182] leading-relaxed">
                    Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. Ao fazer upgrade, você será cobrado proporcionalmente. Ao fazer downgrade, o crédito restante será aplicado na próxima fatura.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b border-black/[0.05] last:border-0">
                <AccordionTrigger className="px-6 py-6 hover:bg-[#FAFAFA] transition-colors [&[data-state=open]>svg]:rotate-180">
                  <span className="text-base text-[#252525] text-left pr-4">
                    O que acontece se eu ultrapassar meu limite de créditos?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-sm text-[#717182] leading-relaxed">
                    Você pode comprar créditos avulsos ou fazer upgrade para um plano superior. Os créditos avulsos não expiram e podem ser usados a qualquer momento. Usuários do plano Professional têm desconto na compra de créditos extras.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b border-black/[0.05] last:border-0">
                <AccordionTrigger className="px-6 py-6 hover:bg-[#FAFAFA] transition-colors [&[data-state=open]>svg]:rotate-180">
                  <span className="text-base text-[#252525] text-left pr-4">
                    Os créditos não utilizados são transferidos para o próximo mês?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-sm text-[#717182] leading-relaxed">
                    Depende do plano. No plano Free, os créditos expiram mensalmente. Nos planos Starter e Professional, você tem rollover limitado de até 50% dos créditos. No plano Enterprise, os créditos não expiram.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-b border-black/[0.05] last:border-0">
                <AccordionTrigger className="px-6 py-6 hover:bg-[#FAFAFA] transition-colors [&[data-state=open]>svg]:rotate-180">
                  <span className="text-base text-[#252525] text-left pr-4">
                    Vocês oferecem desconto para estudantes ou organizações sem fins lucrativos?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-sm text-[#717182] leading-relaxed">
                    Sim! Oferecemos 50% de desconto no plano Professional para estudantes com email .edu válido e para ONGs registradas. Entre em contato com nossa equipe de vendas para mais informações.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-b border-black/[0.05] last:border-0">
                <AccordionTrigger className="px-6 py-6 hover:bg-[#FAFAFA] transition-colors [&[data-state=open]>svg]:rotate-180">
                  <span className="text-base text-[#252525] text-left pr-4">
                    Qual a diferença entre os níveis de qualidade?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-sm text-[#717182] leading-relaxed">
                    Qualidade Básica gera imagens em resolução padrão (1024px) adequadas para preview. Qualidade Alta oferece 2048px ideal para apresentações. Qualidade Máxima gera em 4096px perfeita para impressão e uso profissional.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-b border-black/[0.05] last:border-0">
                <AccordionTrigger className="px-6 py-6 hover:bg-[#FAFAFA] transition-colors [&[data-state=open]>svg]:rotate-180">
                  <span className="text-base text-[#252525] text-left pr-4">
                    Posso cancelar minha assinatura?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-sm text-[#717182] leading-relaxed">
                    Sim, você pode cancelar a qualquer momento. Sua assinatura permanecerá ativa até o final do período pago. Não há taxas de cancelamento ou multas. Seus projetos permanecerão acessíveis por 30 dias após o cancelamento.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border-b border-black/[0.05] last:border-0">
                <AccordionTrigger className="px-6 py-6 hover:bg-[#FAFAFA] transition-colors [&[data-state=open]>svg]:rotate-180">
                  <span className="text-base text-[#252525] text-left pr-4">
                    Vocês oferecem período de teste?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-sm text-[#717182] leading-relaxed">
                    O plano Free funciona como um teste completo do Ktírio. Além disso, oferecemos 14 dias de garantia: se não ficar satisfeito com o plano pago, devolvemos 100% do valor.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border-b border-black/[0.05] last:border-0">
                <AccordionTrigger className="px-6 py-6 hover:bg-[#FAFAFA] transition-colors [&[data-state=open]>svg]:rotate-180">
                  <span className="text-base text-[#252525] text-left pr-4">
                    Como funciona o faturamento anual?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-sm text-[#717182] leading-relaxed">
                    Ao escolher o plano anual, você paga 12 meses antecipados e recebe 20% de desconto. Todos os créditos mensais ficam disponíveis imediatamente, permitindo que você use conforme necessário ao longo do ano.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="border-b border-black/[0.05] last:border-0">
                <AccordionTrigger className="px-6 py-6 hover:bg-[#FAFAFA] transition-colors [&[data-state=open]>svg]:rotate-180">
                  <span className="text-base text-[#252525] text-left pr-4">
                    Posso adicionar mais membros ao meu plano?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-sm text-[#717182] leading-relaxed">
                    Sim! No plano Professional você pode adicionar até 3 membros. No plano Enterprise, membros ilimitados. Cada membro adicional no Pro custa R$ 19/mês.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="border-b border-black/[0.05] last:border-0">
                <AccordionTrigger className="px-6 py-6 hover:bg-[#FAFAFA] transition-colors [&[data-state=open]>svg]:rotate-180">
                  <span className="text-base text-[#252525] text-left pr-4">
                    Quais métodos de pagamento vocês aceitam?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-sm text-[#717182] leading-relaxed">
                    Aceitamos cartões de crédito (Visa, Mastercard, Elo, Amex), Pix e boleto bancário. Planos anuais podem ser pagos via transferência bancária. Para empresas, oferecemos faturamento com prazo.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* CTA Final */}
          <div
            className="mt-16 py-12 px-12 text-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #F3F3F5 0%, #E9EBEF 100%)'
            }}
          >
            <h3 className="text-[24px] text-[#030213] mb-3">
              Pronto para transformar seus projetos?
            </h3>
            <p className="text-base text-[#717182] mb-8">
              Junte-se a milhares de profissionais que já usam o Ktírio
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8">
                <Sparkles className="w-4 h-4 mr-2" />
                Começar grátis
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8">
                <MessageCircle className="w-4 h-4 mr-2" />
                Falar com vendas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
