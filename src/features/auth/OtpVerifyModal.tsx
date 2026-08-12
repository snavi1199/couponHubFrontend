import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/toast';
import { useSendOtpMutation, useVerifyOtpMutation } from '@/api/authApi';
import type { ApiErrorShape } from '@/lib/types';

const RESEND_COOLDOWN_SECONDS = 30;

export function OtpVerifyModal({
  email, open, onClose, onVerified,
}: { email: string; open: boolean; onClose: () => void; onVerified: () => void }) {
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [sendOtp, { isLoading: sending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifying, error }] = useVerifyOtpMutation();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setCode('');
    setCooldown(RESEND_COOLDOWN_SECONDS);
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearInterval(timer);
  }, [open]);

  const handleVerify = async () => {
    if (code.length < 4) return;
    try {
      const result = await verifyOtp({ email, code }).unwrap();
      if (result.data) {
        toast.show('Email verified!', 'success');
        onVerified();
      } else {
        toast.show('Incorrect code — try again', 'error');
      }
    } catch {
      toast.show('Could not verify code', 'error');
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp({ email }).unwrap();
      toast.show('New code sent', 'success');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setCode('');
    } catch {
      toast.show('Could not resend code', 'error');
    }
  };

  const apiError = (error as { data?: ApiErrorShape })?.data?.message;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand-dark">
          <Mail size={22} />
        </span>
        <h3 className="font-display text-lg text-ink">Verify your email</h3>
        <p className="mt-1 text-sm text-ink-soft">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          placeholder="000000"
          className="input-field mt-4 text-center font-mono text-2xl tracking-[0.5em]"
        />
        {apiError && <p className="error-text">{apiError}</p>}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleVerify}
          disabled={verifying || code.length < 4}
          className="btn-primary mt-4 w-full"
        >
          {verifying ? <Spinner className="h-4 w-4" /> : 'Verify'}
        </motion.button>

        <button
          onClick={handleResend}
          disabled={cooldown > 0 || sending}
          className="btn-ghost mt-2 text-xs disabled:opacity-50"
        >
          <RefreshCw size={12} className={sending ? 'animate-spin' : ''} />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    </Modal>
  );
}
