import { CreditCard, Plus, Zap, History } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

interface UsageHistoryItem {
  date: string;
  action: string;
  credits: number;
}

const usageHistory: UsageHistoryItem[] = [
  { date: 'Hoje', action: '15 gerações de imagem', credits: -15 },
  { date: 'Ontem', action: '8 gerações de imagem', credits: -8 },
  { date: '3 out', action: '12 gerações de imagem', credits: -12 },
  { date: '2 out', action: '20 gerações de imagem', credits: -20 },
  { date: '1 out', action: '10 gerações de imagem', credits: -10 },
];

interface SettingsPlanUsageProps {
  onOpenPricing?: () => void;
}

export default function SettingsPlanUsage({ onOpenPricing }: SettingsPlanUsageProps) {
  const totalCredits = 200;
  const usedCredits = 127;
  const remainingCredits = totalCredits - usedCredits;
  const usagePercentage = (usedCredits / totalCredits) * 100;

  // Determinar cor baseado em créditos restantes
  const getRemainingColor = () => {
    const percentage = (remainingCredits / totalCredits) * 100;
    if (percentage > 50) return '#10B981'; // verde
    if (percentage >= 20) return '#F59E0B'; // amarelo
    return '#D4183D'; // vermelho
  };

  const getProgressColor = () => {
    const percentage = (remainingCredits / totalCredits) * 100;
    if (percentage > 50) return 'bg-[#10B981]';
    if (percentage >= 20) return 'bg-[#F59E0B]';
    return 'bg-[#D4183D]';
  };

  return (
    <div className="flex flex-col">
      {/* SEÇÃO 1: PLANO ATUAL */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Plano Atual</h3>
          <p className="text-sm text-[#717182]">
            Informações sobre seu plano e uso de créditos.
          </p>
        </div>

        <div 
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Badge do Plano */}
          <div
            className="flex items-center justify-between p-5 rounded-xl mb-5"
            style={{
              background: 'linear-gradient(135deg, #F3F3F5 0%, #E9EBEF 100%)',
            }}
          >
            <div>
              <h4 className="text-[#030213] mb-2">Professional</h4>
              <Badge className="bg-[#10B981] text-white hover:bg-[#10B981] px-3 py-1 rounded-full">
                Ativo
              </Badge>
            </div>
            <Button onClick={onOpenPricing}>Gerenciar plano</Button>
          </div>

          <Separator className="mb-5" />

          {/* Detalhes do Plano */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Valor mensal</p>
              <p className="text-base text-foreground">R$ 89,90/mês</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Créditos mensais</p>
              <p className="text-base text-foreground">200 créditos</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Próxima cobrança</p>
              <p className="text-base text-foreground">05 de novembro de 2025</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Método de pagamento</p>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <p className="text-base text-foreground">•••• 4242</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: USO DE CRÉDITOS */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Uso de Créditos</h3>
          <p className="text-sm text-[#717182]">
            Acompanhe seu consumo mensal de créditos.
          </p>
        </div>

        <div 
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Progress Bar de Créditos */}
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-base text-foreground">
                {usedCredits} de {totalCredits} créditos usados
              </p>
              <p className="text-base" style={{ color: getRemainingColor() }}>
                {remainingCredits} restantes
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor()} transition-all`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground mt-2">
              Seus créditos resetam em 18 dias (24 de outubro)
            </p>
          </div>

          <Separator />

          {/* Histórico de Uso */}
          <div className="pt-4">
            <h4 className="text-foreground mb-4 px-5">Últimos 7 dias</h4>
            <div className="flex flex-col">
              {usageHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-5 border-b border-border/50 last:border-b-0"
                >
                  <div>
                    <p className="text-sm text-foreground">{item.date}</p>
                    <p className="text-xs text-muted-foreground">{item.action}</p>
                  </div>
                  <p className="text-sm text-destructive">
                    {item.credits} créditos
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: AÇÕES RÁPIDAS */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Ações Rápidas</h3>
        </div>
        
        <div 
          className="bg-white rounded-2xl p-5 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" onClick={onOpenPricing}>
              <Plus className="w-4 h-4 mr-2" />
              Comprar mais créditos
            </Button>

            <Button className="w-full" onClick={onOpenPricing}>
              <Zap className="w-4 h-4 mr-2" />
              Fazer upgrade
            </Button>

            <Button variant="ghost" className="w-full col-span-2">
              <History className="w-4 h-4 mr-2" />
              Ver histórico completo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
