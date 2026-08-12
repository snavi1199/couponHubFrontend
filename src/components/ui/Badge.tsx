import type { ReactNode } from 'react';

const VARIANTS = {
  brand: 'bg-brand-light text-brand-dark',
  stamp: 'bg-stamp-light text-stamp-dark',
  neutral: 'bg-line/40 text-ink-soft',
  danger: 'bg-red-100 text-red-700',
};

export function Badge({ children, variant = 'neutral' }: { children: ReactNode; variant?: keyof typeof VARIANTS }) {
  return <span className={`stamp-badge ${VARIANTS[variant]}`}>{children}</span>;
}
