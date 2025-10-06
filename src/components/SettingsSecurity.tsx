import { Key, Shield, ShieldAlert, CheckCircle, Smartphone, MessageSquare, Monitor, Smartphone as SmartphoneIcon, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActivity: string;
  isCurrent: boolean;
  icon: 'desktop' | 'mobile';
}

const mockSessions: Session[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    browser: 'Chrome',
    location: 'São Paulo, Brasil',
    ip: '187.45.xxx.xxx',
    lastActivity: 'now',
    isCurrent: true,
    icon: 'desktop',
  },
  {
    id: '2',
    device: 'iPhone 14',
    browser: 'Safari',
    location: 'Rio de Janeiro, Brasil',
    ip: '191.12.xxx.xxx',
    lastActivity: '2 horas atrás',
    isCurrent: false,
    icon: 'mobile',
  },
];

export default function SettingsSecurity() {
  const handleChangePassword = () => {
    console.log('Alterar senha');
  };

  const handleEnable2FA = () => {
    console.log('Ativar 2FA');
  };

  const handleManageBrowserNotifications = () => {
    console.log('Gerenciar notificações do navegador');
  };

  const handleEndSession = (sessionId: string) => {
    console.log('Encerrar sessão:', sessionId);
  };

  const handleEndAllOtherSessions = () => {
    console.log('Encerrar todas as outras sessões');
  };

  return (
    <div className="flex flex-col">
      {/* SEÇÃO 1: SENHA */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Senha</h3>
          <p className="text-sm text-[#717182]">
            Gerencie a senha da sua conta.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Info Box de Última Alteração */}
          <div className="flex items-center justify-between p-5 bg-[#F3F3F5] rounded-xl mb-6">
            <div>
              <p className="text-xs text-[#717182] mb-1">Última alteração</p>
              <p className="text-sm text-[#252525]">15 de setembro de 2025</p>
            </div>
            <Button variant="outline" className="h-9 gap-2" onClick={handleChangePassword}>
              <Key className="w-4 h-4" />
              Alterar senha
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Seção de Requisitos */}
          <div>
            <h4 className="text-sm text-[#252525] mb-4">Requisitos de senha segura</h4>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm text-[#252525]">Mínimo 8 caracteres</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm text-[#252525]">Pelo menos uma letra maiúscula</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm text-[#252525]">Pelo menos um número</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm text-[#252525]">Pelo menos um caractere especial (@#$%&*)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: AUTENTICAÇÃO EM DUAS ETAPAS (2FA) */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Autenticação em Duas Etapas</h3>
          <p className="text-sm text-[#717182]">
            Adicione uma camada extra de segurança à sua conta.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Alert Box de Status 2FA */}
          <div 
            className="flex items-center gap-4 p-5 bg-destructive/5 border border-destructive/20 rounded-xl mb-6"
          >
            <ShieldAlert className="w-6 h-6 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <p className="text-destructive mb-1">2FA Desativado</p>
              <p className="text-xs text-[#717182]">
                Sua conta está menos protegida sem autenticação em duas etapas
              </p>
            </div>
            <Button className="h-10 gap-2 flex-shrink-0" onClick={handleEnable2FA}>
              <Shield className="w-4 h-4" />
              Ativar 2FA
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Título de Métodos */}
          <h4 className="text-sm text-[#252525] mb-4">Métodos de autenticação disponíveis</h4>

          {/* Método 1: Aplicativo Autenticador */}
          <div 
            className="relative p-4 bg-[#FAFAFA] border border-[#E9EBEF] rounded-xl mb-3 hover:border-[#CBCED4] transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-[#717182] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[#252525]">Aplicativo Autenticador</p>
                <p className="text-xs text-[#717182] mt-1">
                  Use Google Authenticator, Authy ou similar
                </p>
              </div>
              <Badge className="bg-[#10B981] text-white hover:bg-[#10B981] px-2 py-1 text-[11px] rounded-md">
                Recomendado
              </Badge>
            </div>
          </div>

          {/* Método 2: SMS */}
          <div 
            className="p-4 bg-[#FAFAFA] border border-[#E9EBEF] rounded-xl hover:border-[#CBCED4] transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-[#717182] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[#252525]">Código por SMS</p>
                <p className="text-xs text-[#717182] mt-1">
                  Receba código por mensagem de texto
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: SESSÕES ATIVAS */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Sessões Ativas</h3>
          <p className="text-sm text-[#717182]">
            Dispositivos e navegadores com acesso à sua conta.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Lista de Sessões */}
          <div className="flex flex-col">
            {mockSessions.map((session, index) => {
              const DeviceIcon = session.icon === 'desktop' ? Monitor : SmartphoneIcon;
              const isActive = session.lastActivity === 'now';

              return (
                <div key={session.id}>
                  <div className="flex items-start gap-4 py-5">
                    {/* Ícone do Dispositivo */}
                    <DeviceIcon className="w-6 h-6 text-[#030213] flex-shrink-0 mt-1" />

                    {/* Informações do Dispositivo */}
                    <div className="flex-1">
                      <p className="text-sm text-[#252525] mb-1">
                        {session.device} • {session.browser}
                      </p>
                      <p className="text-xs text-[#717182]">{session.location}</p>
                      <p className="text-xs text-[#717182] mt-0.5">{session.ip}</p>
                      {session.isCurrent && (
                        <Badge className="bg-[#10B981] text-white hover:bg-[#10B981] px-2 py-1 text-[11px] rounded-md mt-2">
                          Este dispositivo
                        </Badge>
                      )}
                    </div>

                    {/* Última Atividade e Ação */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <p className={`text-xs ${isActive ? 'text-[#10B981]' : 'text-[#717182]'}`}>
                        {isActive ? 'Ativo agora' : session.lastActivity}
                      </p>
                      {!session.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleEndSession(session.id)}
                        >
                          Encerrar
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Separator (exceto no último item) */}
                  {index < mockSessions.length - 1 && (
                    <Separator className="my-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer do Card */}
          <div className="mt-6 pt-6 border-t border-black/[0.1]">
            <Button
              variant="outline"
              className="w-full h-10 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              onClick={handleEndAllOtherSessions}
            >
              <LogOut className="w-4 h-4" />
              Encerrar todas as outras sessões
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
