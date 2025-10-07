import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import Toast from './Toast';
import type { ToastType } from './Toast';

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showSuccess: (title: string, description?: string, action?: ToastData['action']) => void;
  showError: (title: string, description?: string, action?: ToastData['action']) => void;
  showWarning: (title: string, description?: string, action?: ToastData['action']) => void;
  showInfo: (title: string, description?: string, action?: ToastData['action']) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

const MAX_TOASTS = 3;

const AUTO_DISMISS_TIMES = {
  success: 5000,
  info: 5000,
  warning: 7000,
  error: -1, // Não fecha automaticamente
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastData, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { ...toast, id };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Manter apenas os últimos MAX_TOASTS toasts
        return updated.slice(-MAX_TOASTS);
      });

      // Auto-dismiss baseado no tipo
      const dismissTime = AUTO_DISMISS_TIMES[toast.type];
      if (dismissTime > 0) {
        setTimeout(() => {
          removeToast(id);
        }, dismissTime);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, description?: string, action?: ToastData['action']) => {
      showToast({ type: 'success', title, description, action });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, description?: string, action?: ToastData['action']) => {
      showToast({ type: 'error', title, description, action });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, description?: string, action?: ToastData['action']) => {
      showToast({ type: 'warning', title, description, action });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, description?: string, action?: ToastData['action']) => {
      showToast({ type: 'info', title, description, action });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      
      {/* Container de Toasts */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md w-96">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast
                id={toast.id}
                type={toast.type}
                title={toast.title}
                description={toast.description}
                action={toast.action}
                onClose={removeToast}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
