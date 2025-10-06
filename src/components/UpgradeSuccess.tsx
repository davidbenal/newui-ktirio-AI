import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { verifyCheckoutSession, VerifyCheckoutSessionResponse } from '../api/verify-checkout-session';

interface UpgradeSuccessProps {
  onContinue?: () => void;
}

type PageState = 'loading' | 'success' | 'error';

export default function UpgradeSuccess({ onContinue }: UpgradeSuccessProps) {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [sessionData, setSessionData] = useState<VerifyCheckoutSessionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    verifySession();
  }, []);

  const verifySession = async () => {
    // Get session_id from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      setPageState('error');
      setErrorMessage('ID da sessão não encontrado na URL.');
      return;
    }

    try {
      setPageState('loading');

      // Check if we're in development mode
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('figma.com');

      if (isDevelopment) {
        // Use mock API in development
        const result = await verifyCheckoutSession({ sessionId });
        setSessionData(result);
        setPageState('success');
        
        console.log('🔧 DEV MODE - Session verified:', result);
      } else {
        // Production: Make real API call
        const response = await fetch('/api/verify-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId })
        });

        if (!response.ok) {
          throw new Error('Failed to verify session');
        }

        const data = await response.json();

        if (data.status === 'failed') {
          throw new Error('Session verification failed');
        }

        if (data.status === 'pending') {
          setPageState('loading');
          setErrorMessage('Seu pagamento ainda está sendo processado. Isso pode levar alguns minutos.');
          // In production, you might want to poll the API or show a different message
          return;
        }

        setSessionData(data);
        setPageState('success');
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      setPageState('error');
      setErrorMessage('Não foi possível verificar sua sessão. Por favor, contate o suporte.');
    }
  };

  // Container styles
  const containerClasses = "min-h-screen bg-white flex items-center justify-center py-12 px-6";
  const contentClasses = "w-full max-w-[600px] mx-auto";

  // LOADING STATE
  if (pageState === 'loading') {
    return (
      <div className={containerClasses}>
        <div className={contentClasses}>
          <div className="text-center">
            {/* Loading Icon */}
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'linear-gradient(135deg, #030213 0%, #252525 100%)',
                boxShadow: '0 8px 24px rgba(3, 2, 19, 0.2)'
              }}
            >
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>

            {/* Title */}
            <h1 className="text-[32px] text-[#030213] mb-3">
              Verificando pagamento...
            </h1>

            {/* Description */}
            <p className="text-base text-[#717182] leading-relaxed">
              {errorMessage || 'Aguarde enquanto confirmamos seu pagamento com o Stripe.'}
            </p>

            {/* Loading Progress */}
            <div className="mt-8 bg-[#FAFAFA] rounded-2xl p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <p className="text-sm text-[#717182]">Validando sessão do Stripe</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#717182]" />
                  <p className="text-sm text-[#717182]">Processando pagamento</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#717182]" />
                  <p className="text-sm text-[#717182]">Ativando plano</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (pageState === 'error') {
    return (
      <div className={containerClasses}>
        <div className={contentClasses}>
          <div className="text-center">
            {/* Error Icon */}
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'rgba(212, 24, 61, 0.1)',
                border: '2px solid rgba(212, 24, 61, 0.3)'
              }}
            >
              <AlertCircle className="w-10 h-10 text-[#D4183D]" />
            </div>

            {/* Title */}
            <h1 className="text-[32px] text-[#030213] mb-3">
              Erro ao verificar pagamento
            </h1>

            {/* Description */}
            <p className="text-base text-[#717182] mb-8 leading-relaxed">
              {errorMessage}
            </p>

            {/* Error Info */}
            <div 
              className="mb-8 p-4 rounded-xl text-left"
              style={{
                background: 'rgba(212, 24, 61, 0.05)',
                border: '1px solid rgba(212, 24, 61, 0.2)'
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#D4183D] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#252525] mb-2">
                    O que fazer agora?
                  </p>
                  <ul className="text-xs text-[#717182] space-y-1 list-disc list-inside">
                    <li>Verifique seu email para confirmação do pagamento</li>
                    <li>Aguarde alguns minutos e recarregue a página</li>
                    <li>Entre em contato com nosso suporte: contato@ktirio.ai</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full h-12"
                onClick={verifySession}
              >
                Tentar novamente
              </Button>

              <Button
                variant="outline"
                className="w-full h-12"
                onClick={onContinue}
              >
                Voltar para a plataforma
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS STATE
  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <div className="text-center">
          {/* Success Icon */}
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
            }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-[32px] text-[#030213] mb-3">
            Pagamento confirmado!
          </h1>

          {/* Description */}
          <p className="text-base text-[#717182] mb-8 leading-relaxed">
            Seu upgrade para o plano <strong className="text-[#030213]">{sessionData?.planName}</strong> foi processado com sucesso. 
            Agora você tem acesso a todos os recursos premium do Ktírio AI.
          </p>

          {/* Plan Summary Card */}
          {sessionData && (
            <div className="mb-6 p-6 rounded-2xl text-left bg-[#FAFAFA]">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E9EBEF]">
                <div>
                  <p className="text-sm text-[#717182] mb-1">Plano ativado</p>
                  <p className="text-lg text-[#030213]">
                    {sessionData.planName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#717182] mb-1">Valor pago</p>
                  <p className="text-lg text-[#030213]">
                    R$ {sessionData.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#717182] mb-1">Cobrança</p>
                  <p className="text-[#030213]">
                    {sessionData.billingPeriod === 'monthly' ? 'Mensal' : 'Anual'}
                  </p>
                </div>
                <div>
                  <p className="text-[#717182] mb-1">Créditos/mês</p>
                  <p className="text-[#030213]">{sessionData.credits}</p>
                </div>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-[#FAFAFA] rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#030213]" />
              <h3 className="text-base text-[#030213]">
                O que você ganhou
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#252525] mb-1">
                    Créditos adicionados
                  </p>
                  <p className="text-xs text-[#717182]">
                    {sessionData?.credits || 100} créditos já estão disponíveis na sua conta
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#252525] mb-1">
                    Recursos premium desbloqueados
                  </p>
                  <p className="text-xs text-[#717182]">
                    {sessionData?.planId === 'professional' 
                      ? 'API, integrações e qualidade máxima disponíveis' 
                      : 'Qualidade alta e sem marca d\'água'}
                  </p>
                </div>
              </div>

              {sessionData?.planId === 'professional' && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#252525] mb-1">
                      Suporte prioritário
                    </p>
                    <p className="text-xs text-[#717182]">
                      Nossa equipe está pronta para ajudar você
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <Button
            className="w-full h-12"
            onClick={onContinue}
          >
            Começar a usar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-[#E9EBEF]">
            <p className="text-xs text-[#717182] mb-2">
              Email de confirmação enviado para <strong>{sessionData?.customerEmail}</strong>
            </p>
            {sessionData && (
              <p className="text-xs text-[#717182]">
                ID da transação: {sessionData.timestamp.substring(0, 10)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
