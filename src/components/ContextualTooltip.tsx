import { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

export type TooltipType = 'upload-hint' | 'choose-style' | 'ready-to-generate';

interface ContextualTooltipProps {
  type: TooltipType;
  onDismiss: () => void;
  targetSelector?: string;
}

const TOOLTIP_CONFIG: Record<TooltipType, {
  text: string;
  icon?: React.ReactNode;
  autoDismissDelay?: number;
  showArrow?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = {
  'upload-hint': {
    text: 'Dica: Funciona melhor com fotos de quartos, salas e cozinhas vazios',
    autoDismissDelay: 8000,
    position: 'bottom'
  },
  'choose-style': {
    text: 'Ótimo! Agora escolha um estilo',
    icon: <ArrowRight className="w-4 h-4" />,
    autoDismissDelay: 6000,
    showArrow: true,
    position: 'right'
  },
  'ready-to-generate': {
    text: 'Tudo pronto! Clique para ver a mágica ✨',
    autoDismissDelay: 10000,
    position: 'top'
  }
};

export default function ContextualTooltip({ type, onDismiss, targetSelector }: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const config = TOOLTIP_CONFIG[type];

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss
    if (config.autoDismissDelay) {
      const dismissTimer = setTimeout(() => {
        handleDismiss();
      }, config.autoDismissDelay);

      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [config.autoDismissDelay]);

  useEffect(() => {
    if (!targetSelector) return;

    const updatePosition = () => {
      const element = document.querySelector(targetSelector);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 60;
      const padding = 16;

      let top = 0;
      let left = 0;

      switch (config.position) {
        case 'bottom':
          top = rect.bottom + padding;
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'top':
          top = rect.top - tooltipHeight - padding;
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'right':
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.right + padding;
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.left - tooltipWidth - padding;
          break;
        default:
          top = rect.bottom + padding;
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      }

      // Ensure tooltip stays in viewport
      const maxLeft = window.innerWidth - tooltipWidth - 20;
      const maxTop = window.innerHeight - tooltipHeight - 20;

      setPosition({
        top: Math.min(Math.max(top, 20), maxTop),
        left: Math.min(Math.max(left, 20), maxLeft)
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [targetSelector, config.position]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 200); // Wait for fade out animation
  };

  const style: React.CSSProperties = {
    position: targetSelector && position ? 'fixed' : 'relative',
    ...(position && { top: `${position.top}px`, left: `${position.left}px` }),
    maxWidth: '320px',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
    transition: 'opacity 200ms ease-out, transform 200ms ease-out'
  };

  return (
    <div
      className="z-[150] bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3"
      style={style}
    >
      {/* Icon/Emoji */}
      {config.icon && (
        <div className="text-[#030213]">
          {config.icon}
        </div>
      )}

      {/* Text */}
      <p
        className="flex-1 text-[#252525]"
        style={{ fontSize: '13px', lineHeight: 1.5 }}
      >
        {config.text}
      </p>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 transition-colors flex-shrink-0"
        aria-label="Fechar dica"
      >
        <X className="w-3.5 h-3.5 text-[#717182]" />
      </button>

      {/* Arrow indicator (optional) */}
      {config.showArrow && config.position === 'right' && (
        <div
          className="absolute left-full ml-2 animate-pulse"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          <ArrowRight className="w-5 h-5 text-[#030213]" />
        </div>
      )}
    </div>
  );
}
