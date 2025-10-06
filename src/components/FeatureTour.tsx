import { useState, useEffect } from 'react';
import { X, Upload, Palette, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  targetSelector: string; // CSS selector for the element to highlight
  tooltipPosition: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showSpecialCTA?: boolean;
}

interface FeatureTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'upload',
    title: 'Faça upload da sua foto',
    description: 'Arraste ou clique para fazer upload de uma foto do ambiente que você quer transformar. Funciona melhor com fotos de interiores.',
    icon: <Upload className="w-10 h-10" style={{ color: '#3B82F6' }} />,
    iconColor: '#3B82F6',
    targetSelector: '.tour-upload-area', // Placeholder - needs to be added to Gallery
    tooltipPosition: 'bottom'
  },
  {
    id: 'styles',
    title: 'Escolha um estilo de staging',
    description: 'Temos dezenas de estilos profissionais prontos. Do minimalista ao clássico, escolha o que combina com seu projeto.',
    icon: <Palette className="w-10 h-10" style={{ color: '#8B5CF6' }} />,
    iconColor: '#8B5CF6',
    targetSelector: '.tour-styles-gallery', // Placeholder
    tooltipPosition: 'right'
  },
  {
    id: 'generate',
    title: 'Gere sua primeira imagem',
    description: 'Clique aqui e em segundos você terá uma versão transformada. Pode gerar até 4 variações diferentes gratuitamente.',
    icon: <Sparkles className="w-10 h-10" style={{ color: '#10B981' }} />,
    iconColor: '#10B981',
    targetSelector: '.tour-generate-button', // Placeholder
    tooltipPosition: 'top',
    showSpecialCTA: true
  }
];

export default function FeatureTour({ isOpen, onClose, onComplete }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    // Update target element position
    const updateTargetPosition = () => {
      const step = TOUR_STEPS[currentStep];
      const element = document.querySelector(step.targetSelector);
      
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        // If element not found, center the tooltip
        setTargetRect(null);
      }
    };

    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  const handleGenerateNow = () => {
    // Special CTA for last step
    handleComplete();
    // TODO: Trigger generation
    console.log('🎨 Generating first image...');
  };

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) {
      // Center on screen if no target
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const padding = 24;
    const tooltipWidth = 360;
    let top = 0;
    let left = 0;

    switch (step.tooltipPosition) {
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'top':
        top = targetRect.top - padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2);
        left = targetRect.right + padding;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2);
        left = targetRect.left - tooltipWidth - padding;
        break;
      case 'center':
      default:
        top = window.innerHeight / 2;
        left = (window.innerWidth / 2) - (tooltipWidth / 2);
        break;
    }

    // Ensure tooltip stays within viewport
    const maxLeft = window.innerWidth - tooltipWidth - 20;
    const maxTop = window.innerHeight - 400; // Approximate tooltip height

    return {
      position: 'fixed',
      top: `${Math.min(Math.max(top, 20), maxTop)}px`,
      left: `${Math.min(Math.max(left, 20), maxLeft)}px`
    };
  };

  // Calculate spotlight position
  const getSpotlightStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return { display: 'none' };
    }

    return {
      position: 'fixed',
      top: `${targetRect.top}px`,
      left: `${targetRect.left}px`,
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`,
      borderRadius: '12px', // Match typical element border radius
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8)',
      pointerEvents: 'none',
      transition: 'all 300ms ease-out',
      zIndex: 2001
    };
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 animate-fadeIn"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000
        }}
        onClick={handleSkip}
      />

      {/* Spotlight */}
      {targetRect && (
        <div
          className="animate-fadeIn"
          style={getSpotlightStyle()}
        />
      )}

      {/* Tooltip Card */}
      <div
        className="animate-slideUp"
        style={{
          ...getTooltipStyle(),
          width: '360px',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
          padding: '24px',
          zIndex: 2002
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {/* Step Counter */}
          <div
            className="px-[10px] py-1 bg-[#F3F3F5] rounded-full"
            style={{ fontSize: '12px', fontWeight: 500, color: '#717182' }}
          >
            {currentStep + 1} de {TOUR_STEPS.length}
          </div>

          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F3F3F5] transition-colors"
            aria-label="Fechar tour"
          >
            <X className="w-4 h-4 text-[#717182]" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">
          {/* Icon */}
          <div className="mb-3">
            {step.icon}
          </div>

          {/* Title */}
          <h3
            className="text-[#030213] mb-2"
            style={{ fontSize: '18px', fontWeight: 600 }}
          >
            {step.title}
          </h3>

          {/* Description */}
          <p
            className="text-[#717182]"
            style={{ fontSize: '14px', lineHeight: 1.6 }}
          >
            {step.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          {/* Progress Dots */}
          <div className="flex items-center gap-[6px]">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: index === currentStep ? '#030213' : '#E9EBEF'
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {!isLastStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-8 px-3 text-[#717182] hover:text-[#030213] hover:bg-[#F3F3F5]"
                style={{ fontSize: '13px' }}
              >
                Pular
              </Button>
            )}

            {step.showSpecialCTA ? (
              <Button
                size="sm"
                onClick={handleGenerateNow}
                className="h-8 px-4"
                style={{ fontSize: '13px' }}
              >
                Gerar agora
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleNext}
                className="h-8 px-4"
                style={{ fontSize: '13px' }}
              >
                {isLastStep ? 'Finalizar' : 'Próximo'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
