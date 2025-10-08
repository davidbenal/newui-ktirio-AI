import { Zap } from 'lucide-react';
import { useCredits } from '../hooks/useCredits';

interface CreditsBadgeProps {
  userId: string | null;
  onClick?: () => void;
  showPlusButton?: boolean;
}

export default function CreditsBadge({ userId, onClick, showPlusButton = true }: CreditsBadgeProps) {
  const { credits, loading } = useCredits(userId);

  if (!userId || loading) {
    return (
      <div
        className="px-4 py-2 rounded-full flex items-center gap-2 animate-pulse"
        style={{
          background: '#FAFAFA',
          border: '1px solid #E9EBEF'
        }}
      >
        <div className="w-4 h-4 bg-gray-300 rounded-full" />
        <div className="w-12 h-4 bg-gray-300 rounded" />
      </div>
    );
  }

  const isLowCredits = credits < 10;
  const isOutOfCredits = credits === 0;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
          onClick ? 'cursor-pointer hover:bg-opacity-80' : ''
        }`}
        style={{
          background: isOutOfCredits
            ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
            : isLowCredits
            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
            : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          border: 'none',
          color: 'white'
        }}
        onClick={onClick}
        title={isOutOfCredits ? 'Sem créditos! Clique para comprar' : 'Seus créditos disponíveis'}
      >
        <Zap className="w-4 h-4" fill="white" />
        <span style={{ fontSize: '14px', fontWeight: 600 }}>
          {credits}
        </span>
        {isOutOfCredits && (
          <span style={{ fontSize: '12px', opacity: 0.9 }}>
            (comprar)
          </span>
        )}
      </div>

      {showPlusButton && onClick && (
        <button
          onClick={onClick}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-gray-100"
          style={{
            border: '2px solid #E9EBEF',
            background: 'white'
          }}
          title="Comprar mais créditos"
        >
          <span className="text-[#030213]" style={{ fontSize: '18px', fontWeight: 600 }}>
            +
          </span>
        </button>
      )}
    </div>
  );
}
