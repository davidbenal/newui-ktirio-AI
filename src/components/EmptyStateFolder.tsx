import { FolderOpen, Plus } from 'lucide-react';
import EmptyState from './EmptyState';

interface EmptyStateFolderProps {
  onAddProject: () => void;
  onBackToGallery: () => void;
}

export default function EmptyStateFolder({ onAddProject, onBackToGallery }: EmptyStateFolderProps) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="Esta pasta está vazia"
      description="Organize seus projetos movendo-os para esta pasta ou crie um novo projeto diretamente aqui."
      primaryButton={{
        label: 'Adicionar projeto',
        onClick: onAddProject,
        icon: Plus,
      }}
      secondaryLink={{
        label: 'Voltar para galeria',
        onClick: onBackToGallery,
      }}
      ariaLabel="Pasta vazia"
    />
  );
}
