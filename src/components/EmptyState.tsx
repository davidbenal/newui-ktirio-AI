import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryButton: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryLink?: {
    label: string;
    onClick: () => void;
  };
  ariaLabel?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  primaryButton,
  secondaryLink,
  ariaLabel,
}: EmptyStateProps) {
  const PrimaryIcon = primaryButton.icon;

  return (
    <section
      className="flex flex-col items-center justify-center w-full max-w-[480px] mx-auto py-12 px-6 gap-6"
      aria-label={ariaLabel}
    >
      {/* Ilustração/Ícone */}
      <div className="flex items-center justify-center">
        <Icon className="w-16 h-16 text-[#CBCED4] dark:text-muted-foreground" strokeWidth={1.5} />
      </div>

      {/* Conteúdo de Texto */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-[#252525] dark:text-[#FAFAFA] max-w-[320px]">
          {title}
        </h2>
        <p className="text-sm text-[#717182] dark:text-[#B3B3B3] max-w-[360px]">
          {description}
        </p>
      </div>

      {/* Botão Primário */}
      <button
        onClick={primaryButton.onClick}
        className="flex items-center justify-center gap-2 h-10 px-6 bg-[#030213] hover:bg-[#030213]/90 text-white rounded-lg transition-all mt-2"
      >
        {PrimaryIcon && <PrimaryIcon className="w-4 h-4" />}
        <span className="text-sm">{primaryButton.label}</span>
      </button>

      {/* Link Secundário */}
      {secondaryLink && (
        <button
          onClick={secondaryLink.onClick}
          className="text-sm text-[#717182] dark:text-[#B3B3B3] hover:underline transition-all mt-3"
        >
          {secondaryLink.label}
        </button>
      )}
    </section>
  );
}
