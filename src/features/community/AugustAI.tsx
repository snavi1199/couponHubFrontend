import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearchCouponsQuery } from '@/api/couponApi';
import { formatCurrency } from '@/lib/format';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  coupons?: AugustCoupon[];
}

interface AugustCoupon {
  id: string;
  title: string;
  brand: string;
  price: string;
  type: string;
}

// Call the backend proxy — same pattern as the reference Express server.
// The API key lives in the backend env (AI_API_KEY), never in the browser bundle.
async function callAugust(
  prompt: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api') as string;

  const response = await fetch(`${baseUrl}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Surface the actual error from the backend
    throw new Error(data.message ?? data.error ?? `Server error ${response.status}`);
  }

  return data.data?.response ?? '';
}

function extractSearchTerm(text: string): string | null {
  const match = text.match(/SEARCH:([^\n\s.!?,]+)/i);
  return match ? match[1].trim() : null;
}

function cleanResponse(text: string): string {
  return text
    .replace(/SEARCH:[^\n\s.!?,]+/gi, '')     // remove SEARCH:keyword
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // strip markdown links [text](url) → text
    .replace(/\*\*([^*]+)\*\*/g, '$1')        // strip **bold**
    .replace(/\*([^*]+)\*/g, '$1')            // strip *italic*
    .trim();
}

// Brand aliases — maps user shorthand to the actual search keyword that will find results
const BRAND_ALIASES: Record<string, string> = {
  pvr: 'pvr cinemas',
  'pvr cinemas': 'pvr cinemas',
  inox: 'inox',
  mcd: 'mcdonalds',
  mcdonalds: 'mcdonalds',
  "mcdonald's": 'mcdonalds',
  mmt: 'makemytrip',
  makemytrip: 'makemytrip',
  bb: 'bigbasket',
  bigbasket: 'bigbasket',
  zomato: 'zomato',
  swiggy: 'swiggy',
  blinkit: 'blinkit',
  zepto: 'zepto',
  amazon: 'amazon',
  flipkart: 'flipkart',
  myntra: 'myntra',
  ajio: 'ajio',
  nykaa: 'nykaa',
  netflix: 'netflix',
  spotify: 'spotify',
  uber: 'uber',
  ola: 'ola',
};

function resolveSearchTerm(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return BRAND_ALIASES[lower] ?? raw;
}

function CouponChip({ coupon }: { coupon: AugustCoupon }) {
  return (
    <Link
      to={`/coupons/${coupon.id}`}
      className="flex items-center justify-between gap-2 rounded-lg border border-line/60 bg-white px-3 py-2 text-xs transition-colors hover:border-brand hover:bg-brand-light/30"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">{coupon.title}</p>
        <p className="text-ink-soft">{coupon.brand}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono font-bold text-[10px] ${
        coupon.type === 'FREE' ? 'bg-brand-light text-brand-dark' : 'bg-stamp-light text-stamp-dark'
      }`}>
        {coupon.type === 'FREE' ? 'FREE' : coupon.price}
      </span>
    </Link>
  );
}

function AugustChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hi! I'm August 👋 I help you find deals on CouponHub and answer your questions. Try asking about Swiggy, Zomato, Amazon deals — or how anything works!",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: couponData } = useSearchCouponsQuery(
    { keyword: searchKeyword, size: 4, status: 'ACTIVE' },
    { skip: !searchKeyword }
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!searchKeyword || !couponData) return;
    const coupons: AugustCoupon[] = couponData.data.content.map((c) => ({
      id: c.id,
      title: c.title,
      brand: c.brand.name,
      price: formatCurrency(c.sellingPrice),
      type: c.type,
    }));
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant' && !last.coupons) {
        return [...prev.slice(0, -1), { ...last, coupons }];
      }
      return prev;
    });
    setSearchKeyword('');
  }, [couponData, searchKeyword]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setLastError(null);

    const userMsg: Message = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      // Build history from previous messages (skip the initial assistant greeting at index 0)
      const history = updated
        .slice(0, -1) // all except the just-added user message
        .filter((_, i) => i !== 0) // drop initial greeting — not part of API conversation
        .map((m) => ({ role: m.role, content: m.content }));

      const raw = await callAugust(text, history);
      const term = extractSearchTerm(raw);
      const clean = cleanResponse(raw);

      setMessages((prev) => [...prev, { role: 'assistant', content: clean }]);
      if (term) setSearchKeyword(resolveSearchTerm(term));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setLastError(msg);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Sorry, I couldn't connect right now. The backend said: "${msg}"`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-line bg-paper shadow-2xl"
         style={{ width: 320, height: 440 }}>

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b-2 border-line bg-brand px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 font-display text-sm font-bold text-paper">A</div>
          <div>
            <p className="text-sm font-bold leading-none text-paper">August</p>
            <p className="mt-0.5 text-[11px] text-paper/70">CouponHub AI · Ask me anything</p>
          </div>
        </div>
        <button onClick={onClose} className="text-paper/70 transition-colors hover:text-paper">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand font-display text-[10px] font-bold text-paper">A</div>
            )}
            <div className="max-w-[82%] space-y-1.5">
              <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'rounded-br-sm bg-brand text-paper'
                  : 'rounded-bl-sm bg-line/30 text-ink'
              }`}>
                {msg.content}
              </div>
              {msg.coupons && msg.coupons.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-ink-soft ml-1">Found on CouponHub:</p>
                  {msg.coupons.map((c) => <CouponChip key={c.id} coupon={c} />)}
                </div>
              )}
              {msg.coupons?.length === 0 && (
                <p className="text-[11px] text-ink-soft ml-1">No matching coupons right now.</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2">
            <div className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand font-display text-[10px] font-bold text-paper">A</div>
            <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-line/30 px-3 py-3">
              {[0, 1, 2].map((i) => (
                <motion.div key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="h-1.5 w-1.5 rounded-full bg-ink-soft"
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t-2 border-line p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
            placeholder="Ask about deals, how it works…"
            className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={send}
            disabled={!input.trim() || loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-paper disabled:opacity-40"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </motion.button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-ink-soft/50">Powered by AI · August knows CouponHub</p>
      </div>
    </div>
  );
}

export function AugustFAB({ bottomOffset = 24 }: { bottomOffset?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-6 z-40" style={{ bottom: bottomOffset }}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="august-chat"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="absolute bottom-[calc(100%+12px)] right-0"
          >
            <AugustChat onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen((o) => !o)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{ background: 'linear-gradient(135deg, #2F6B4F 0%, #1a4530 100%)' }}
        aria-label={open ? 'Close August AI' : 'Chat with August AI'}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} className="text-paper" />
            </motion.div>
          ) : (
            <motion.div key="spark" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles size={22} className="text-paper" />
            </motion.div>
          )}
        </AnimatePresence>

        {!open && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-brand opacity-60"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-xl bg-ink px-3 py-1.5 text-xs font-semibold text-paper opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          Chat with August ✨
        </span>
      </motion.button>
    </div>
  );
}
