import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Link } from 'react-router-dom';
import { useGetCommunityMessagesQuery, usePostCommunityMessageMutation } from '@/api/communityApi';
import { useToast } from '@/components/ui/toast';
import { timeAgo } from '@/lib/format';

const FAQ_ITEMS = [
  {
    question: 'Is this platform free to use?',
    answer: 'Yes — browsing and using FREE coupons requires no account at all. Creating an account lets you list your own coupons, request paid deals, and earn from selling.',
  },
  {
    question: 'How does payment work for paid coupons?',
    answer: "When a seller accepts your request, you'll see a UPI QR code to pay the platform. Once we verify the payment the coupon code unlocks automatically. We never share your contact details with the seller.",
  },
  {
    question: 'How do I receive my payout as a seller?',
    answer: "After a buyer's payment is verified, you'll get a notification to confirm your UPI-linked phone number. Once confirmed, our team transfers the payout (minus the 5% platform fee) within 1-2 business days.",
  },
  {
    question: 'Can I trust the coupons listed here?',
    answer: 'Sellers can be voted on by buyers (👍 worked / 👎 did not work). Coupons with a high expired vote rate are flagged automatically. Always check the vote count and seller rating before requesting a paid deal.',
  },
  {
    question: 'What is the platform fee?',
    answer: 'We charge a 5% fee on paid coupon transactions. FREE coupons have no fees ever. The fee is shown clearly in the payout preview when you list a paid coupon.',
  },
  {
    question: 'How do I report a fake or expired coupon?',
    answer: "Vote it as 'didn't work' on the coupon page. Our moderation team reviews flagged coupons. Repeated bad listings lead to account suspension.",
  },
  {
    question: 'Can I list event tickets?',
    answer: "Yes — choose 'Event Ticket' type when listing. Add venue, date, seat details, and optionally a ticket image. The image stays hidden until the buyer's payment is verified.",
  },
];

export default function CommunityPage() {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [input, setInput] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  const { data, isLoading } = useGetCommunityMessagesQuery({ size: 50 }, { pollingInterval: 8000 });
  const [postMessage, { isLoading: sending }] = usePostCommunityMessageMutation();

  // Messages come newest-first from the API — reverse so oldest is at top, newest at bottom
  const messages = [...(data?.data.content ?? [])].reverse();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !isAuthenticated) return;
    setInput('');
    try {
      await postMessage({ text }).unwrap();
    } catch {
      toast.show('Could not send message', 'error');
      setInput(text); // restore on failure
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-3"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-paper">
          <MessageCircle size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl text-ink">Community</h1>
          <p className="text-sm text-ink-soft">Chat with other deal hunters and find answers</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* FAQ — 2/5 on large screens */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="ticket-card lg:col-span-2 p-5"
        >
          <h2 className="mb-4 font-display text-lg text-ink">Frequently asked</h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div key={i} layout className="overflow-hidden rounded-xl border border-line/60">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-start justify-between gap-2 p-3 text-left text-sm font-semibold text-ink transition-colors hover:bg-brand-light/30"
                >
                  <span>{item.question}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 90 : 0 }} transition={{ duration: 0.15 }}>
                    <ChevronRight size={15} className="mt-0.5 shrink-0" />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-line/40 px-3 pb-3 pt-2 text-xs text-ink-soft">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chat — 3/5 on large screens */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
          className="ticket-card flex flex-col lg:col-span-3"
          style={{ height: 560 }}
        >
          <div className="border-b border-line/60 px-4 py-3">
            <p className="font-display text-base text-ink">Community chat</p>
            <p className="text-xs text-ink-soft">Tips, questions, and coupon alerts — visible to everyone</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 size={24} className="animate-spin text-brand" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <MessageCircle size={32} className="text-ink-soft/40" />
                <p className="text-sm text-ink-soft">No messages yet — be the first to say something!</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isMe = user?.username === msg.authorUsername;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <p className="mb-0.5 text-xs text-ink-soft">
                        {isMe ? 'You' : msg.authorName} · {timeAgo(msg.createdAt)}
                      </p>
                      <div
                        className={`max-w-[80%] break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          isMe
                            ? 'rounded-tr-sm bg-brand text-paper'
                            : 'rounded-tl-sm bg-line/30 text-ink'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-line/60 p-3">
            {isAuthenticated ? (
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Say something… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="input-field flex-1 resize-none py-2 text-sm"
                  style={{ maxHeight: 96 }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="btn-primary shrink-0 px-3 py-2 disabled:opacity-40"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-1">
                <p className="text-sm text-ink-soft">
                  <Link to="/login" className="font-semibold text-brand hover:underline">Log in</Link>
                  {' '}to join the conversation
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
