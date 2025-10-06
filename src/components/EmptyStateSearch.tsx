import { SearchX } from 'lucide-react';
import EmptyState from './EmptyState';

interface EmptyStateSearchProps {
  searchTerm: string;
  onClearSearch: () => void;
  onViewAll: () => void;
}

export default function EmptyStateSearch({ searchTerm, onClearSearch, onViewAll }: EmptyStateSearchProps) {
  return (
    <EmptyState
      icon={SearchX}
      title="Nenhum resultado encontrado"
      description={`Não encontramos projetos com o termo "${searchTerm}". Tente usar palavras-chave diferentes ou crie um novo projeto.`}
      primaryButton={{
        label: 'Limpar busca',
        onClick: onClearSearch,
      }}
      secondaryLink={{
        label: 'Ver todos os projetos',
        onClick: onViewAll,
      }}
      ariaLabel="Busca sem resultados"
    />
  );
}
