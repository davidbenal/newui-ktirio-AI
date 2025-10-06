import { useState } from 'react';
import { Code, Layers, Palette, Users, Lock } from 'lucide-react';
import FeatureLockModal, { FeatureType } from './FeatureLockModal';

/**
 * Componente de exemplo mostrando como integrar Feature Lock Modal
 * em qualquer parte da aplicação.
 * 
 * Este exemplo simula um usuário no plano Free tentando acessar
 * features premium.
 */

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  featureType: FeatureType;
  isLocked: boolean;
  onAccess: (feature: FeatureType) => void;
}

function FeatureCard({ icon: Icon, title, description, featureType, isLocked, onAccess }: FeatureCardProps) {
  return (
    <div className="relative bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
      {isLocked && (
        <div className="absolute top-4 right-4">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          
          <button
            onClick={() => onAccess(featureType)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              isLocked
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLocked ? 'Ver planos' : 'Configurar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeatureLockExample() {
  const [featureLockModal, setFeatureLockModal] = useState<{
    isOpen: boolean;
    feature: FeatureType | null;
  }>({
    isOpen: false,
    feature: null,
  });

  // Simula usuário no plano Free (todas as features bloqueadas)
  const userPlan = 'free';

  const features = [
    {
      icon: Code,
      title: 'API de Integração',
      description: 'Integre o Ktírio AI com suas ferramentas e workflows',
      featureType: 'api' as FeatureType,
      requiredPlan: 'professional',
    },
    {
      icon: Layers,
      title: 'Processamento em Lote',
      description: 'Processe múltiplas imagens de uma vez',
      featureType: 'batch' as FeatureType,
      requiredPlan: 'professional',
    },
    {
      icon: Palette,
      title: 'White Label',
      description: 'Remova a marca Ktírio e use seu próprio branding',
      featureType: 'whitelabel' as FeatureType,
      requiredPlan: 'business',
    },
    {
      icon: Users,
      title: 'Colaboração em Equipe',
      description: 'Trabalhe com sua equipe em projetos compartilhados',
      featureType: 'collaboration' as FeatureType,
      requiredPlan: 'professional',
    },
  ];

  const handleFeatureAccess = (feature: FeatureType) => {
    // Verifica se a feature está bloqueada para o plano atual
    const isLocked = userPlan === 'free';
    
    if (isLocked) {
      // Mostra modal de Feature Lock
      setFeatureLockModal({ isOpen: true, feature });
    } else {
      // Procede com a configuração da feature
      console.log(`Acessando feature: ${feature}`);
    }
  };

  const handleUpgrade = () => {
    console.log('Iniciando processo de upgrade...');
    // Aqui você redirecionaria para o UpgradeModal ou Pricing page
  };

  const handleViewAllPlans = () => {
    console.log('Navegando para página de planos...');
    // Aqui você navegaria para a Pricing page
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl text-gray-900 mb-2">Features Avançadas</h1>
          <p className="text-gray-600">
            Desbloqueie recursos poderosos fazendo upgrade do seu plano
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.featureType}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              featureType={feature.featureType}
              isLocked={userPlan === 'free'}
              onAccess={handleFeatureAccess}
            />
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h3 className="text-blue-900 mb-1">Exemplo de Integração</h3>
              <p className="text-sm text-blue-700">
                Este componente demonstra como integrar o Feature Lock Modal.
                Clique em qualquer feature para ver o modal em ação.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Lock Modal */}
      {featureLockModal.feature && (
        <FeatureLockModal
          isOpen={featureLockModal.isOpen}
          onClose={() => setFeatureLockModal({ isOpen: false, feature: null })}
          feature={featureLockModal.feature}
          onUpgrade={handleUpgrade}
          onViewAllPlans={handleViewAllPlans}
        />
      )}
    </div>
  );
}
