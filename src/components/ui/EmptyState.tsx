import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line px-6 py-16 text-center">
      <div className="mb-3 font-display text-lg text-ink">{title}</div>
      {description && <p className="mb-4 max-w-sm text-sm text-ink-soft">{description}</p>}
      {action}
    </div>
  );
}
