import { useState } from 'react';
import { Download, FolderDown, ExternalLink, Info } from 'lucide-react';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface PrivacySettings {
  profile: {
    publicProfile: boolean;
    publicProjects: boolean;
  };
  data: {
    usageAnalytics: boolean;
    aiTraining: boolean;
    personalizedCommunications: boolean;
  };
}

const initialSettings: PrivacySettings = {
  profile: {
    publicProfile: false,
    publicProjects: false,
  },
  data: {
    usageAnalytics: true,
    aiTraining: true,
    personalizedCommunications: true,
  },
};

const legalLinks = [
  { id: 'terms', label: 'Termos de Serviço', url: '#' },
  { id: 'privacy', label: 'Política de Privacidade', url: '#' },
  { id: 'cookies', label: 'Política de Cookies', url: '#' },
  { id: 'lgpd', label: 'LGPD e Direitos do Titular', url: '#' },
];

export default function SettingsPrivacy() {
  const [settings, setSettings] = useState<PrivacySettings>(initialSettings);

  const handleProfileToggle = (key: keyof PrivacySettings['profile']) => {
    setSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, [key]: !prev.profile[key] },
    }));
  };

  const handleDataToggle = (key: keyof PrivacySettings['data']) => {
    setSettings((prev) => ({
      ...prev,
      data: { ...prev.data, [key]: !prev.data[key] },
    }));
  };

  const handleExportData = () => {
    console.log('Solicitar exportação de dados');
  };

  const handleDownloadProjects = () => {
    console.log('Baixar todos os projetos');
  };

  const handleLegalLinkClick = (url: string) => {
    console.log('Abrir:', url);
  };

  return (
    <div className="flex flex-col">
      {/* SEÇÃO 1: VISIBILIDADE DO PERFIL */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Visibilidade do Perfil</h3>
          <p className="text-sm text-[#717182]">
            Controle quem pode ver seu perfil e projetos.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Item 1: Perfil Público */}
          <div className="flex items-center justify-between py-4 border-b border-black/[0.05]">
            <div className="flex-1">
              <p className="text-sm text-[#252525]">Perfil público</p>
              <p className="text-xs text-[#717182] mt-1">
                Permitir que outras pessoas encontrem e vejam seu perfil
              </p>
            </div>
            <Switch
              checked={settings.profile.publicProfile}
              onCheckedChange={() => handleProfileToggle('publicProfile')}
            />
          </div>

          {/* Item 2: Projetos Públicos */}
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-[#252525]">Projetos públicos</p>
                <p className="text-xs text-[#717182] mt-1">
                  Permitir que seus projetos apareçam na galeria pública do Ktírio
                </p>
              </div>
              <Switch
                checked={settings.profile.publicProjects}
                onCheckedChange={() => handleProfileToggle('publicProjects')}
              />
            </div>
            <p className="text-[11px] text-[#717182] mt-3 max-w-[80%]">
              Você pode tornar projetos individuais públicos depois
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: DADOS E PRIVACIDADE */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Dados e Privacidade</h3>
          <p className="text-sm text-[#717182]">
            Gerencie como seus dados são usados.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Item 1: Análise de Uso */}
          <div className="flex items-center justify-between py-4 border-b border-black/[0.05]">
            <div className="flex-1">
              <p className="text-sm text-[#252525]">Análise de uso</p>
              <p className="text-xs text-[#717182] mt-1">
                Ajude a melhorar o Ktírio compartilhando dados de uso anônimos
              </p>
            </div>
            <Switch
              checked={settings.data.usageAnalytics}
              onCheckedChange={() => handleDataToggle('usageAnalytics')}
            />
          </div>

          {/* Item 2: Treinamento de IA */}
          <div className="py-4 border-b border-black/[0.05]">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-[#252525]">Treinamento de IA</p>
                <p className="text-xs text-[#717182] mt-1">
                  Permitir que suas gerações sejam usadas para melhorar nossos modelos (sempre anônimo)
                </p>
              </div>
              <Switch
                checked={settings.data.aiTraining}
                onCheckedChange={() => handleDataToggle('aiTraining')}
              />
            </div>
            {/* Info Box */}
            <div className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-lg mt-3">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-[#717182]">
                Suas imagens nunca serão compartilhadas publicamente
              </p>
            </div>
          </div>

          {/* Item 3: Comunicações Personalizadas */}
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <p className="text-sm text-[#252525]">Comunicações personalizadas</p>
              <p className="text-xs text-[#717182] mt-1">
                Usar dados de uso para personalizar sugestões e comunicações
              </p>
            </div>
            <Switch
              checked={settings.data.personalizedCommunications}
              onCheckedChange={() => handleDataToggle('personalizedCommunications')}
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: DOWNLOADS E EXPORTAÇÃO */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Downloads e Exportação</h3>
          <p className="text-sm text-[#717182]">
            Baixe ou exporte seus dados do Ktírio.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Action Card 1: Exportar Dados */}
          <div className="p-5 border-2 border-dashed border-[#CBCED4] rounded-xl mb-4 hover:border-[#030213] hover:bg-[#FAFAFA] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-[#717182] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#252525]">Exportar todos os dados</p>
                  <p className="text-xs text-[#717182] mt-1">
                    Receba um arquivo com todos os seus dados e projetos
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="h-9 flex-shrink-0"
                onClick={handleExportData}
              >
                Solicitar exportação
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Action Card 2: Baixar Projetos */}
          <div className="p-5 border-2 border-dashed border-[#CBCED4] rounded-xl hover:border-[#030213] hover:bg-[#FAFAFA] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <FolderDown className="w-5 h-5 text-[#717182] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#252525]">Baixar todos os projetos</p>
                  <p className="text-xs text-[#717182] mt-1">
                    Download em massa de todas as imagens geradas
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="h-9 flex-shrink-0"
                onClick={handleDownloadProjects}
              >
                Baixar projetos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: INFORMAÇÕES LEGAIS */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Informações Legais</h3>
          <p className="text-sm text-[#717182]">
            Documentos e políticas do Ktírio.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Lista de Links */}
          {legalLinks.map((link, index) => (
            <div
              key={link.id}
              className={`flex items-center justify-between py-4 cursor-pointer hover:bg-[#FAFAFA] transition-colors -mx-6 px-6 ${
                index < legalLinks.length - 1 ? 'border-b border-black/[0.05]' : ''
              }`}
              onClick={() => handleLegalLinkClick(link.url)}
            >
              <span className="text-sm text-[#252525]">{link.label}</span>
              <ExternalLink className="w-4 h-4 text-[#717182]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
