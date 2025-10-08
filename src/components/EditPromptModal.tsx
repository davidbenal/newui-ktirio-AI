import { useState, useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface EditPromptModalProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onApply: (prompt: string) => void;
  onCancel: () => void;
}

/**
 * Modal contextual que aparece quando o usuário desenha uma seleção
 * Permite inserir um prompt específico para aquela área
 */
export default function EditPromptModal({
  isOpen,
  position,
  onApply,
  onCancel,
}: EditPromptModalProps) {
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus no input quando abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset prompt quando fecha
  useEffect(() => {
    if (!isOpen) {
      setPrompt('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (prompt.trim()) {
      onApply(prompt.trim());
      setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleApply();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[100]"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="fixed z-[101] bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-[400px] animate-fadeIn"
        style={{
          left: `${Math.min(position.x, window.innerWidth - 420)}px`,
          top: `${Math.min(position.y, window.innerHeight - 300)}px`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-gray-900 font-semibold">Editar Área Selecionada</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Prompt Input */}
        <div className="mb-4">
          <label className="text-xs text-gray-600 mb-2 block">
            O que deseja fazer com esta área?
          </label>
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: mude a cor para azul marinho, transforme em madeira de carvalho..."
            className="w-full h-24 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Enter para aplicar • Esc para cancelar
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={!prompt.trim()}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Aplicar Edição
          </Button>
        </div>
      </div>
    </>
  );
}
