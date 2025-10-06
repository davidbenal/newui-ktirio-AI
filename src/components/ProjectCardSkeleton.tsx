import SkeletonBox from './SkeletonBox';

export default function ProjectCardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-card rounded-2xl shadow-lg overflow-hidden"
      role="status"
      aria-busy="true"
      aria-label="Carregando projeto"
    >
      {/* Image Placeholder */}
      <div className="w-full h-[240px]">
        <SkeletonBox height="240px" rounded="rounded-t-xl" />
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-2">
        {/* Title Placeholder */}
        <SkeletonBox width="70%" height="20px" rounded="rounded" />
        
        {/* Date Placeholder */}
        <SkeletonBox width="40%" height="16px" rounded="rounded" />
      </div>
    </div>
  );
}
