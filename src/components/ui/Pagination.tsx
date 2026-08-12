import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  page, totalPages, onChange,
}: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button
        className="btn-ghost disabled:opacity-30"
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="font-mono text-sm text-ink-soft">
        Page {page + 1} of {totalPages}
      </span>
      <button
        className="btn-ghost disabled:opacity-30"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
