import { XCircle, RefreshCw, ArrowLeft, Info } from 'lucide-react';
import { Button } from './ui/button';

interface UpgradeCanceledProps {
  onBack?: () => void;
  onTryAgain?: () => void;
}

export default function UpgradeCanceled({ onBack, onTryAgain }: UpgradeCanceledProps) {
  // Container and content classes matching UpgradeSuccess
  const containerClasses = "min-h-screen bg-white flex items-center justify-center py-12 px-6";
  const contentClasses = "w-full max-w-[600px] mx-auto";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <div className="text-center">
          {/* Canceled Icon - XCircle vermelho 64px */}
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'rgba(212, 24, 61, 0.1)',
              border: '2px solid rgba(212, 24, 61, 0.2)'
            }}
          >
            <XCircle className="w-8 h-8 text-[#D4183D]" />
          </div>

          {/* Title */}
          <h1 className="text-[32px] text-[#030213] mb-3">
            Pagamento cancelado
          </h1>

          {/* Description */}
          <p className="text-base text-[#717182] mb-8 leading-relaxed">
            Você cancelou o processo de upgrade. Seus dados não foram alterados.
          </p>

          {/* Info Card */}
          <div className="bg-[#FAFAFA] rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#717182] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-[#252525] mb-2">
                  Nenhuma cobrança foi realizada
                </p>
                <p className="text-xs text-[#717182] leading-relaxed">
                  Você pode fazer upgrade a qualquer momento. Seus créditos gratuitos continuam disponíveis e suas configurações permanecem inalteradas.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full h-12"
              onClick={onTryAgain}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao app
            </Button>
          </div>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-[#E9EBEF]">
            <p className="text-xs text-[#717182]">
              Precisa de ajuda? Entre em contato: <strong>contato@ktirio.ai</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
