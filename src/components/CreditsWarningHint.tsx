import { useEffect } from 'react';
import { useToast } from './ToastProvider';
import { HintId } from '../hooks/useProgressiveHints';

interface CreditsWarningHintProps {
  creditsUsed: number;
  creditsTotal: number;
  hasSeenHint: (hintId: HintId) => boolean;
  markHintAsSeen: (hintId: HintId) => void;
  onViewPlans?: () => void;
}

export default function CreditsWarningHint({
  creditsUsed,
  creditsTotal,
  hasSeenHint,
  markHintAsSeen,
  onViewPlans
}: CreditsWarningHintProps) {
  const { showWarning } = useToast();

  useEffect(() => {
    // Trigger when 50% of credits used
    const percentageUsed = (creditsUsed / creditsTotal) * 100;
    
    if (percentageUsed >= 50 && !hasSeenHint('credits-warning')) {
      // Show warning toast
      showWarning(
        'Atenção aos créditos',
        `Você usou ${creditsUsed} de ${creditsTotal} créditos gratuitos`,
        onViewPlans ? {
          label: 'Ver planos',
          onClick: onViewPlans
        } : undefined
      );

      // Mark as seen
      markHintAsSeen('credits-warning');
    }
  }, [creditsUsed, creditsTotal, hasSeenHint, markHintAsSeen, showWarning, onViewPlans]);

  return null; // This component doesn't render anything
}
