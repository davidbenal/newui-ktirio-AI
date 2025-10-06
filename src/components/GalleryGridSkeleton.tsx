import ProjectCardSkeleton from './ProjectCardSkeleton';

interface GalleryGridSkeletonProps {
  count?: number;
}

export default function GalleryGridSkeleton({ count = 9 }: GalleryGridSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="status"
      aria-busy="true"
      aria-label="Carregando galeria"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  );
}
