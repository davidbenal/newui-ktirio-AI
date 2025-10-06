import { motion } from 'motion/react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    color: '#10B981',
    borderColor: '#10B981',
    ariaLive: 'polite' as const,
  },
  error: {
    icon: XCircle,
    color: '#D4183D',
    borderColor: '#D4183D',
    ariaLive: 'assertive' as const,
  },
  warning: {
    icon: AlertTriangle,
    color: '#F59E0B',
    borderColor: '#F59E0B',
    ariaLive: 'polite' as const,
  },
  info: {
    icon: Info,
    color: '#3B82F6',
    borderColor: '#3B82F6',
    ariaLive: 'polite' as const,
  },
};

export default function Toast({ id, type, title, description, action, onClose }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={config.ariaLive}
      className="w-[356px] min-h-[72px] bg-white rounded-[10px] shadow-lg flex gap-3 p-4 group hover:shadow-xl transition-shadow"
      style={{
        borderLeft: `4px solid ${config.borderColor}`,
      }}
    >
      {/* Ícone */}
      <div className="shrink-0 mt-0.5">
        <Icon className="w-5 h-5" style={{ color: config.color }} />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <h4 className="text-[#252525] leading-[150%]">{title}</h4>
        {description && (
          <p className="text-sm text-[#717182] leading-[150%] line-clamp-2">
            {description}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm text-[#030213] self-start py-1 hover:underline transition-all mt-2"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Botão Close */}
      <button
        onClick={() => onClose(id)}
        aria-label="Fechar notificação"
        className="shrink-0 w-5 h-5 p-0.5 text-[#717182] hover:text-[#252525] transition-colors mt-0.5"
      >
        <X className="w-full h-full" />
      </button>
    </motion.div>
  );
}
