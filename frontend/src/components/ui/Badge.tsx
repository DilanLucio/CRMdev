import type { ReactNode } from 'react';

type Variant = 'success' | 'warning' | 'purple' | 'info' | 'danger' | 'muted' | 'gold';

const styles: Record<Variant, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  gold:    'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  purple:  'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20',
  info:    'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
  danger:  'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  muted:   'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10',
};

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
}

export function Badge({ variant = 'muted', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
