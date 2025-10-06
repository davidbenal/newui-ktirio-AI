import { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

export interface ChecklistProgress {
  createdProject: boolean;
  uploadedPhoto: boolean;
  selectedStyle: boolean;
  generatedImage: boolean;
}

interface ProgressChecklistProps {
  progress: ChecklistProgress;
  onDismiss?: () => void;
}

export default function ProgressChecklist({ progress, onDismiss }: ProgressChecklistProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const steps = [
    { id: 'create', label: 'Criar um novo projeto', completed: progress.createdProject },
    { id: 'upload', label: 'Fazer upload de foto', completed: progress.uploadedPhoto },
    { id: 'style', label: 'Escolher estilo', completed: progress.selectedStyle },
    { id: 'generate', label: 'Gerar primeira imagem', completed: progress.generatedImage }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  // Auto-dismiss when all completed
  if (completedCount === steps.length && onDismiss) {
    setTimeout(() => onDismiss(), 2000);
  }

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-6 right-6 z-[100] animate-slideUp"
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
        }}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Expandir checklist"
        >
          <div className="relative">
            {/* Progress ring */}
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#E9EBEF"
                strokeWidth="3"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeDasharray={`${progressPercentage * 1.005} 100.5`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[#030213]" style={{ fontSize: '10px', fontWeight: 600 }}>
                {completedCount}/{steps.length}
              </span>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 w-[280px] bg-white rounded-2xl p-5 z-[100] animate-slideUp"
      style={{
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[#252525]"
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          Primeiros passos
        </h3>
        
        <button
          onClick={() => setIsMinimized(true)}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Minimizar checklist"
        >
          <ChevronDown className="w-4 h-4 text-[#717182]" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-[6px] bg-[#E9EBEF] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-center gap-[10px] transition-all"
            style={{
              opacity: step.completed ? 0.7 : 1
            }}
          >
            {/* Checkbox */}
            <div
              className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all ${
                step.completed
                  ? 'bg-[#10B981] border-[#10B981]'
                  : 'bg-white border-[#E9EBEF]'
              }`}
            >
              {step.completed && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </div>

            {/* Text */}
            <span
              className={`transition-all ${
                step.completed
                  ? 'text-[#252525] line-through'
                  : 'text-[#717182]'
              }`}
              style={{ fontSize: '13px' }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {completedCount === steps.length && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-[#10B981]">
            <Check className="w-4 h-4" />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>
              Tudo pronto! Continue criando.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
