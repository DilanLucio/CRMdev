interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} />;
}

export function DetailsPaneSkeleton() {
  return (
    <div className="animate-pulse p-6 space-y-4">
      <div className="h-8 w-2/5 rounded-lg bg-slate-200/70" />
      <div className="space-y-2 pt-2">
        <div className="h-4 w-full rounded bg-slate-200/70" />
        <div className="h-4 w-3/4 rounded bg-slate-200/70" />
        <div className="h-4 w-2/3 rounded bg-slate-200/70" />
      </div>
      <div className="h-40 rounded-xl bg-slate-200/70" />
    </div>
  );
}

export function TaskRowSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-3 px-3 py-2.5">
      <div className="h-4 w-4 rounded bg-slate-200/70" />
      <div className="h-4 flex-1 rounded bg-slate-200/70" />
      <div className="h-4 w-14 rounded bg-slate-200/70" />
      <div className="h-5 w-16 rounded-full bg-slate-200/70" />
    </div>
  );
}
