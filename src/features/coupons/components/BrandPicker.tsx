import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, ChevronDown } from 'lucide-react';
import { useGetBrandsQuery } from '@/api/brandApi';
import { brandIcon } from '@/lib/brandIcons';

interface BrandPickerProps {
  value: string;
  onChange: (id: string) => void;
  error?: string;
}

export function BrandPicker({ value, onChange, error }: BrandPickerProps) {
  const { data } = useGetBrandsQuery();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const allBrands = data?.data ?? [];
  // Separate "Others" to always show at the bottom
  const othersBrand = allBrands.find((b) => b.slug === 'others');
  const regularBrands = allBrands.filter((b) => b.slug !== 'others');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return [
      ...regularBrands.filter((b) => b.name.toLowerCase().includes(q)),
      ...(othersBrand && ('others'.includes(q) || 'other'.includes(q) || !q) ? [othersBrand] : []),
    ];
  }, [allBrands, query]);

  const selected = allBrands.find((b) => b.id === value);
  const isOthers = selected?.slug === 'others';

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="space-y-2">
      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`input-field flex w-full items-center justify-between text-left ${error ? 'border-stamp-dark' : ''}`}
      >
        {selected ? (
          <span className="flex items-center gap-2">
            <span className="text-lg leading-none">{brandIcon(selected.slug)}</span>
            {selected.name}
          </span>
        ) : (
          <span className="text-ink-soft/60">Select a brand — Swiggy, Zomato, BigBasket…</span>
        )}
        <ChevronDown size={16} className={`text-ink-soft transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="z-20 w-full overflow-hidden rounded-xl border-2 border-line bg-white shadow-xl"
          >
            <div className="relative border-b border-line/60 p-2">
              <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink-soft" size={15} />
              <input
                autoFocus
                type="text"
                placeholder="Search brands…"
                className="w-full rounded-lg border-none bg-paper py-2 pl-8 pr-3 text-sm focus:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="py-4 text-center text-sm text-ink-soft">No brands match "{query}"</p>
              )}
              {filtered.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelect(b.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-light ${
                    b.id === value ? 'bg-brand-light font-semibold text-brand-dark' : 'text-ink'
                  } ${b.slug === 'others' ? 'mt-1 border-t border-line/40 text-ink-soft' : ''}`}
                >
                  <span className="shrink-0 text-lg leading-none">{brandIcon(b.slug)}</span>
                  <span className="flex-1">{b.slug === 'others' ? '🏷️ Others — my brand isn\'t listed' : b.name}</span>
                  {b.id === value && <Check size={15} className="shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show brand name input when Others is selected */}
      <AnimatePresence>
        {isOthers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <input
              type="text"
              placeholder="Enter your brand name (e.g. My Local Store)"
              className="input-field w-full text-sm"
              // The brand name goes in the coupon title/description since we can't create
              // new brands from the listing form — this just signals to the user to mention it there
            />
            <p className="mt-1 text-xs text-ink-soft">
              💡 Mention the brand name in your coupon title so buyers can find it easily.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
