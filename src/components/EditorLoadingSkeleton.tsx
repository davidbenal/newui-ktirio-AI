import SkeletonBox from './SkeletonBox';
import { Loader2 } from 'lucide-react';

export default function EditorLoadingSkeleton() {
  return (
    <div
      className="size-full flex gap-4 p-4 bg-[#F7F7F8]"
      role="status"
      aria-busy="true"
      aria-label="Carregando editor"
    >
      {/* Left Panel Skeleton */}
      <aside className="w-80 bg-white dark:bg-card rounded-2xl shadow-lg p-4 flex flex-col gap-2 shrink-0">
        {/* Header */}
        <div className="mb-4">
          <SkeletonBox height="48px" rounded="rounded-lg" />
        </div>

        {/* Tools */}
        <div className="space-y-2">
          <SkeletonBox height="40px" rounded="rounded-lg" />
          <SkeletonBox height="40px" rounded="rounded-lg" />
          <SkeletonBox height="40px" rounded="rounded-lg" />
          <SkeletonBox height="40px" rounded="rounded-lg" />
        </div>

        {/* Section divider */}
        <div className="my-4">
          <SkeletonBox height="1px" rounded="rounded-none" />
        </div>

        {/* More tools */}
        <div className="space-y-2">
          <SkeletonBox height="32px" rounded="rounded-lg" />
          <SkeletonBox height="32px" rounded="rounded-lg" />
          <SkeletonBox height="32px" rounded="rounded-lg" />
        </div>

        {/* Bottom section */}
        <div className="mt-auto pt-4 space-y-2">
          <SkeletonBox height="40px" rounded="rounded-lg" />
          <SkeletonBox height="40px" rounded="rounded-lg" />
        </div>
      </aside>

      {/* Canvas Area Skeleton */}
      <main className="flex-1 bg-white dark:bg-card rounded-2xl shadow-lg p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl h-[600px] bg-[#ECECF0] dark:bg-[#454545] rounded-xl flex items-center justify-center relative overflow-hidden">
          {/* Centered Loader */}
          <div className="flex flex-col items-center gap-4 z-10">
            <Loader2 className="w-12 h-12 text-[#CBCED4] dark:text-muted-foreground animate-spin" />
            <p className="text-sm text-[#717182] dark:text-muted-foreground">
              Carregando editor...
            </p>
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 animate-shimmer">
            <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full" />
          </div>
        </div>
      </main>

      {/* Right Panel Skeleton */}
      <aside className="w-80 bg-white dark:bg-card rounded-2xl shadow-lg p-4 flex flex-col gap-4 shrink-0">
        {/* Section 1 */}
        <div className="space-y-2">
          <SkeletonBox height="24px" width="60%" rounded="rounded" />
          <SkeletonBox height="120px" rounded="rounded-lg" />
        </div>

        {/* Section 2 */}
        <div className="space-y-2">
          <SkeletonBox height="24px" width="50%" rounded="rounded" />
          <SkeletonBox height="80px" rounded="rounded-lg" />
        </div>

        {/* Section 3 */}
        <div className="space-y-2">
          <SkeletonBox height="24px" width="70%" rounded="rounded" />
          <div className="space-y-2">
            <SkeletonBox height="40px" rounded="rounded-lg" />
            <SkeletonBox height="40px" rounded="rounded-lg" />
            <SkeletonBox height="40px" rounded="rounded-lg" />
          </div>
        </div>

        {/* Button section */}
        <div className="mt-auto space-y-2">
          <SkeletonBox height="48px" rounded="rounded-lg" />
        </div>
      </aside>
    </div>
  );
}
