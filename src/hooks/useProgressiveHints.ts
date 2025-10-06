import { useState, useEffect } from 'react';

export type HintId = 
  | 'download-image'
  | 'comparison-slider'
  | 'history-saved'
  | 'credits-warning';

interface HintState {
  seen: Record<HintId, boolean>;
}

const STORAGE_KEY = 'ktirio-hints-seen';

export function useProgressiveHints() {
  const [hintsState, setHintsState] = useState<HintState>({ seen: {} });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHintsState(parsed);
      }
    } catch (error) {
      console.error('Error loading hints state:', error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hintsState));
    } catch (error) {
      console.error('Error saving hints state:', error);
    }
  }, [hintsState]);

  const hasSeenHint = (hintId: HintId): boolean => {
    return hintsState.seen[hintId] || false;
  };

  const markHintAsSeen = (hintId: HintId) => {
    setHintsState(prev => ({
      seen: {
        ...prev.seen,
        [hintId]: true
      }
    }));
  };

  const resetHints = () => {
    setHintsState({ seen: {} });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting hints:', error);
    }
  };

  const resetHint = (hintId: HintId) => {
    setHintsState(prev => ({
      seen: {
        ...prev.seen,
        [hintId]: false
      }
    }));
  };

  return {
    hasSeenHint,
    markHintAsSeen,
    resetHints,
    resetHint
  };
}
