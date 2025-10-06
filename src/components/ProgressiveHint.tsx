import { useEffect, useState, useRef } from 'react';
import { X, ArrowRight } from 'lucide-react';

export type HintPosition = 'top' | 'bottom' | 'left' | 'right';

interface ProgressiveHintProps {
  isVisible: boolean;
  onDismiss: () => void;
  text: string;
  position?: HintPosition;
  targetSelector?: string;
  showArrow?: boolean;
  delay?: number; // Delay before showing (ms)
  autoDismissDelay?: number; // Auto-dismiss after N ms (optional)
}

export default function ProgressiveHint({
  isVisible,
  onDismiss,
  text,
  position = 'bottom',
  targetSelector,
  showArrow = false,
  delay = 0,
  autoDismissDelay
}: ProgressiveHintProps) {
  const [isShowing, setIsShowing] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  // Handle delayed show
  useEffect(() => {
    if (!isVisible) {
      setIsShowing(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsShowing(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, delay]);

  // Handle auto-dismiss
  useEffect(() => {
    if (!isShowing || !autoDismissDelay) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, autoDismissDelay);

    return () => clearTimeout(timer);
  }, [isShowing, autoDismissDelay]);

  // Calculate position relative to target
  useEffect(() => {
    if (!targetSelector || !isShowing) return;

    const updatePosition = () => {
      const target = document.querySelector(targetSelector);
      if (!target || !hintRef.current) return;

      const targetRect = target.getBoundingClientRect();
      const hintRect = hintRef.current.getBoundingClientRect();
      const padding = 12;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + (targetRect.width / 2) - (hintRect.width / 2);
          break;
        case 'top':
          top = targetRect.top - hintRect.height - padding;
          left = targetRect.left + (targetRect.width / 2) - (hintRect.width / 2);
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (hintRect.height / 2);
          left = targetRect.right + padding;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (hintRect.height / 2);
          left = targetRect.left - hintRect.width - padding;
          break;
      }

      // Keep within viewport
      const maxLeft = window.innerWidth - hintRect.width - 16;
      const maxTop = window.innerHeight - hintRect.height - 16;

      setCoords({
        top: Math.min(Math.max(top, 16), maxTop),
        left: Math.min(Math.max(left, 16), maxLeft)
      });
    };

    // Initial position
    updatePosition();

    // Update on resize/scroll
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [targetSelector, isShowing, position]);

  const handleDismiss = () => {
    setIsShowing(false);
    setTimeout(onDismiss, 200); // Wait for fade out
  };

  if (!isVisible && !isShowing) return null;

  const style: React.CSSProperties = {
    position: targetSelector && coords ? 'fixed' : 'relative',
    ...(coords && { top: `${coords.top}px`, left: `${coords.left}px` }),
    maxWidth: '280px',
    opacity: isShowing ? 1 : 0,
    transform: isShowing ? 'translateY(0)' : 'translateY(-8px)',
    transition: 'opacity 200ms ease-out, transform 200ms ease-out'
  };

  return (
    <div
      ref={hintRef}
      className="z-[200] bg-[#030213] text-white rounded-lg shadow-xl px-3 py-2.5 flex items-center gap-2.5"
      style={style}
      role="tooltip"
    >
      {/* Text */}
      <p
        className="flex-1"
        style={{ fontSize: '13px', lineHeight: 1.4 }}
      >
        {text}
      </p>

      {/* Arrow indicator (optional) */}
      {showArrow && (
        <ArrowRight className="w-4 h-4 flex-shrink-0 animate-pulse" />
      )}

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors flex-shrink-0"
        aria-label="Fechar dica"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Pointer/Arrow (visual indicator) */}
      {targetSelector && coords && position === 'bottom' && (
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#030213] rotate-45"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
        />
      )}
      {targetSelector && coords && position === 'top' && (
        <div
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#030213] rotate-45"
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
        />
      )}
      {targetSelector && coords && position === 'right' && (
        <div
          className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#030213] rotate-45"
          style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}
        />
      )}
      {targetSelector && coords && position === 'left' && (
        <div
          className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#030213] rotate-45"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
        />
      )}
    </div>
  );
}
