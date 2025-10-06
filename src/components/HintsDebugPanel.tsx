import { useProgressiveHints } from '../hooks/useProgressiveHints';
import { Button } from './ui/button';
import { Check, X } from 'lucide-react';

const HINT_LABELS: Record<string, string> = {
  'download-image': 'Download de imagem',
  'comparison-slider': 'Comparação antes/depois',
  'history-saved': 'Histórico salvo',
  'credits-warning': 'Aviso de créditos'
};

export default function HintsDebugPanel() {
  const { hasSeenHint, markHintAsSeen, resetHints, resetHint } = useProgressiveHints();

  const hintIds = Object.keys(HINT_LABELS);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#030213]" style={{ fontSize: '16px', fontWeight: 600 }}>
          Progressive Hints Status
        </h3>
        <Button
          onClick={resetHints}
          variant="outline"
          size="sm"
        >
          Reset All
        </Button>
      </div>

      <div className="space-y-3">
        {hintIds.map((hintId) => {
          const seen = hasSeenHint(hintId as any);
          return (
            <div
              key={hintId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    seen ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  {seen ? (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  ) : (
                    <X className="w-3 h-3 text-gray-500" strokeWidth={3} />
                  )}
                </div>
                <div>
                  <p className="text-[#030213]" style={{ fontSize: '14px', fontWeight: 500 }}>
                    {HINT_LABELS[hintId]}
                  </p>
                  <p className="text-[#717182]" style={{ fontSize: '12px' }}>
                    {seen ? 'Visto' : 'Não visto'}
                  </p>
                </div>
              </div>

              {seen && (
                <Button
                  onClick={() => resetHint(hintId as any)}
                  variant="ghost"
                  size="sm"
                >
                  Reset
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-[#717182]" style={{ fontSize: '12px' }}>
          Hints vistos: {hintIds.filter(id => hasSeenHint(id as any)).length}/{hintIds.length}
        </p>
      </div>
    </div>
  );
}
