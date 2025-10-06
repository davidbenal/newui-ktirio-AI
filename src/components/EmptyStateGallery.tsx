import { Image, Plus } from 'lucide-react';
import EmptyState from './EmptyState';

interface EmptyStateGalleryProps {
  onNewProject: () => void;
  onViewExamples: () => void;
}

export default function EmptyStateGallery({ onNewProject, onViewExamples }: EmptyStateGalleryProps) {
  return (
    <EmptyState
      icon={Image}
      title="Nenhum projeto criado ainda"
      description="Comece criando seu primeiro projeto de staging virtual. Faça upload de uma imagem e deixe a IA transformar seu espaço."
      primaryButton={{
        label: 'Novo projeto',
        onClick: onNewProject,
        icon: Plus,
      }}
      secondaryLink={{
        label: 'Ver exemplos',
        onClick: onViewExamples,
      }}
      ariaLabel="Galeria vazia - nenhum projeto criado"
    />
  );
}
