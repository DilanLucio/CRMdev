import type { ReactNode } from 'react';

type Variant = 'success' | 'warning' | 'purple' | 'info' | 'danger' | 'muted';

const styles: Record<Variant, string> = {
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  info: 'bg-sky-50 text-sky-600',
  danger: 'bg-red-50 text-red-600',
  muted: 'bg-slate-100 text-slate-500',
};

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
}

export function Badge({ variant = 'muted', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
