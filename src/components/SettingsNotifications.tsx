import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

interface NotificationSettings {
  email: {
    projects: boolean;
    billing: boolean;
    updates: boolean;
    marketing: boolean;
  };
  push: {
    enabled: boolean;
    generationComplete: boolean;
    lowCredits: boolean;
  };
  weekly: {
    enabled: boolean;
    day: string;
  };
}

const initialSettings: NotificationSettings = {
  email: {
    projects: true,
    billing: true,
    updates: true,
    marketing: false,
  },
  push: {
    enabled: true,
    generationComplete: true,
    lowCredits: true,
  },
  weekly: {
    enabled: true,
    day: 'monday',
  },
};

export default function SettingsNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);

  const handleEmailToggle = (key: keyof NotificationSettings['email']) => {
    setSettings((prev) => ({
      ...prev,
      email: { ...prev.email, [key]: !prev.email[key] },
    }));
  };

  const handlePushToggle = (key: keyof NotificationSettings['push']) => {
    setSettings((prev) => ({
      ...prev,
      push: { ...prev.push, [key]: !prev.push[key] },
    }));
  };

  const handleWeeklyToggle = () => {
    setSettings((prev) => ({
      ...prev,
      weekly: { ...prev.weekly, enabled: !prev.weekly.enabled },
    }));
  };

  const handleWeeklyDayChange = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      weekly: { ...prev.weekly, day },
    }));
  };

  return (
    <div className="flex flex-col">
      {/* SEÇÃO 1: NOTIFICAÇÕES POR EMAIL */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Notificações por Email</h3>
          <p className="text-sm text-[#717182]">
            Escolha quais emails você deseja receber.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Item 1: Projetos e Gerações */}
          <div className="flex items-center justify-between py-4 border-b border-black/[0.05]">
            <div className="flex-1">
              <p className="text-sm text-[#252525]">Projetos e Gerações</p>
              <p className="text-xs text-[#717182] mt-1">
                Notificações sobre conclusão de gerações e updates de projetos
              </p>
            </div>
            <Switch
              checked={settings.email.projects}
              onCheckedChange={() => handleEmailToggle('projects')}
            />
          </div>

          {/* Item 2: Créditos e Cobrança */}
          <div className="flex items-center justify-between py-4 border-b border-black/[0.05]">
            <div className="flex-1">
              <p className="text-sm text-[#252525]">Créditos e Cobrança</p>
              <p className="text-xs text-[#717182] mt-1">
                Avisos sobre créditos baixos, cobranças e faturas
              </p>
            </div>
            <Switch
              checked={settings.email.billing}
              onCheckedChange={() => handleEmailToggle('billing')}
            />
          </div>

          {/* Item 3: Novidades e Atualizações */}
          <div className="flex items-center justify-between py-4 border-b border-black/[0.05]">
            <div className="flex-1">
              <p className="text-sm text-[#252525]">Novidades e Atualizações</p>
              <p className="text-xs text-[#717182] mt-1">
                Novos recursos, melhorias e atualizações do Ktírio
              </p>
            </div>
            <Switch
              checked={settings.email.updates}
              onCheckedChange={() => handleEmailToggle('updates')}
            />
          </div>

          {/* Item 4: Marketing e Promoções */}
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <p className="text-sm text-[#252525]">Marketing e Promoções</p>
              <p className="text-xs text-[#717182] mt-1">
                Ofertas especiais, dicas e conteúdo promocional
              </p>
            </div>
            <Switch
              checked={settings.email.marketing}
              onCheckedChange={() => handleEmailToggle('marketing')}
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: NOTIFICAÇÕES PUSH */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Notificações Push</h3>
          <p className="text-sm text-[#717182]">
            Receba notificações em tempo real no navegador.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Status Geral */}
          <div className="flex items-center justify-between p-5 bg-[#F3F3F5] rounded-xl mb-5">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="text-sm text-[#252525]">Notificações do navegador</span>
              <Badge className="bg-[#10B981] text-white hover:bg-[#10B981] px-3 py-1 rounded-full">
                Habilitadas
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="h-8">
              Gerenciar
            </Button>
          </div>

          <Separator className="my-5" />

          {/* Item 1: Geração Concluída */}
          <div className="flex items-center justify-between py-4 border-b border-black/[0.05]">
            <div className="flex-1">
              <p className="text-sm text-[#252525]">Geração Concluída</p>
              <p className="text-xs text-[#717182] mt-1">
                Quando uma nova variação de imagem for gerada
              </p>
            </div>
            <Switch
              checked={settings.push.generationComplete}
              onCheckedChange={() => handlePushToggle('generationComplete')}
            />
          </div>

          {/* Item 2: Créditos Baixos */}
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <p className="text-sm text-[#252525]">Créditos Baixos</p>
              <p className="text-xs text-[#717182] mt-1">
                Quando restar menos de 10% dos créditos mensais
              </p>
            </div>
            <Switch
              checked={settings.push.lowCredits}
              onCheckedChange={() => handlePushToggle('lowCredits')}
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: RESUMO SEMANAL */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Resumo Semanal</h3>
          <p className="text-sm text-[#717182]">
            Receba um resumo das suas atividades.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Toggle Principal */}
          <div className="flex items-center justify-between py-4 border-b border-black/[0.05]">
            <div className="flex-1">
              <p className="text-sm text-[#252525]">Enviar resumo semanal</p>
              <p className="text-xs text-[#717182] mt-1">
                Toda segunda-feira às 9h com estatísticas da semana anterior
              </p>
            </div>
            <Switch
              checked={settings.weekly.enabled}
              onCheckedChange={handleWeeklyToggle}
            />
          </div>

          {/* Select de Dia (condicional) */}
          {settings.weekly.enabled && (
            <>
              <Separator className="my-4" />
              <div>
                <label className="text-sm text-[#252525] block mb-2">
                  Dia de envio
                </label>
                <Select value={settings.weekly.day} onValueChange={handleWeeklyDayChange}>
                  <SelectTrigger className="w-[200px] h-10 bg-[#F3F3F5] border-transparent rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Segunda-feira</SelectItem>
                    <SelectItem value="tuesday">Terça-feira</SelectItem>
                    <SelectItem value="wednesday">Quarta-feira</SelectItem>
                    <SelectItem value="thursday">Quinta-feira</SelectItem>
                    <SelectItem value="friday">Sexta-feira</SelectItem>
                    <SelectItem value="saturday">Sábado</SelectItem>
                    <SelectItem value="sunday">Domingo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
