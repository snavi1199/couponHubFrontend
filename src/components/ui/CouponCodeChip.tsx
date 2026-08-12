import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/** Barcode-style chip that displays a (possibly masked) coupon code with copy-to-clipboard. */
export function CouponCodeChip({ code, onCopy }: { code: string; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);
  const isMasked = code.includes('*') || code.includes('X');

  const handleCopy = async () => {
    if (isMasked) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isMasked}
      className="flex w-full items-center justify-between gap-2 rounded-lg border-2 border-dashed border-brand bg-brand-light/50 px-4 py-2.5 font-mono text-sm font-semibold tracking-wider text-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span>{code}</span>
      {!isMasked && (copied ? <Check size={16} /> : <Copy size={16} />)}
    </button>
  );
}
