import { Sparkles, Zap, Image, Clock, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface WelcomeScreenProps {
  userName?: string;
  onStartTour?: () => void;
  onSkipToApp?: () => void;
}

export default function WelcomeScreen({ 
  userName = 'Usuário',
  onStartTour,
  onSkipToApp 
}: WelcomeScreenProps) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)'
      }}
    >
      <div
        className="w-full max-w-[540px] bg-white rounded-3xl p-10 text-center"
        style={{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}
      >
        {/* Logo/Brand */}
        <div className="mb-6">
          <h2 
            className="text-[#030213]"
            style={{ fontSize: '48px', lineHeight: '48px' }}
          >
            KTÍRIO
          </h2>
        </div>

        {/* Animated Icon */}
        <div
          className="w-[100px] h-[100px] rounded-full flex items-center justify-center mx-auto mb-8 animate-float"
          style={{
            background: 'linear-gradient(135deg, #030213 0%, #252525 100%)',
            boxShadow: '0 8px 24px rgba(3, 2, 19, 0.2)'
          }}
        >
          <Sparkles className="w-12 h-12 text-white" />
        </div>

        {/* Title */}
        <h1 
          className="text-[#030213] mb-3"
          style={{ 
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: 1.2
          }}
        >
          Bem-vindo ao Ktírio!
        </h1>

        {/* Subtitle */}
        <p 
          className="text-[#717182] mb-8"
          style={{ 
            fontSize: '18px',
            lineHeight: 1.5
          }}
        >
          Olá, {userName}! Vamos começar sua jornada.
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {/* Stat 1 - Credits */}
          <div 
            className="p-4 bg-[#FAFAFA] rounded-xl text-center"
            style={{ border: '1px solid #E9EBEF' }}
          >
            <Zap className="w-6 h-6 text-[#030213] mx-auto mb-2" />
            <p 
              className="text-[#030213] mt-2 mb-1"
              style={{ 
                fontSize: '18px',
                fontWeight: 700
              }}
            >
              5 créditos
            </p>
            <p 
              className="text-[#717182]"
              style={{ fontSize: '11px' }}
            >
              Grátis para começar
            </p>
          </div>

          {/* Stat 2 - Styles */}
          <div 
            className="p-4 bg-[#FAFAFA] rounded-xl text-center"
            style={{ border: '1px solid #E9EBEF' }}
          >
            <Image className="w-6 h-6 text-[#030213] mx-auto mb-2" />
            <p 
              className="text-[#030213] mt-2 mb-1"
              style={{ 
                fontSize: '18px',
                fontWeight: 700
              }}
            >
              Ilimitados
            </p>
            <p 
              className="text-[#717182]"
              style={{ fontSize: '11px' }}
            >
              Estilos disponíveis
            </p>
          </div>

          {/* Stat 3 - Time */}
          <div 
            className="p-4 bg-[#FAFAFA] rounded-xl text-center"
            style={{ border: '1px solid #E9EBEF' }}
          >
            <Clock className="w-6 h-6 text-[#030213] mx-auto mb-2" />
            <p 
              className="text-[#030213] mt-2 mb-1"
              style={{ 
                fontSize: '18px',
                fontWeight: 700
              }}
            >
              2 min
            </p>
            <p 
              className="text-[#717182]"
              style={{ fontSize: '11px' }}
            >
              Para primeira imagem
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <Button
            className="w-full h-[52px]"
            onClick={onStartTour}
            style={{ fontSize: '16px' }}
          >
            Começar tour guiado
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            variant="ghost"
            className="w-full h-[44px] text-[#717182] hover:text-[#030213] hover:bg-[#FAFAFA]"
            onClick={onSkipToApp}
            style={{ fontSize: '14px' }}
          >
            Pular e ir direto ao app
          </Button>
        </div>

        {/* Footer */}
        <p 
          className="text-[#717182] mt-5"
          style={{ fontSize: '12px' }}
        >
          Leva apenas 2 minutos • Pode pular a qualquer momento
        </p>
      </div>
    </div>
  );
}
