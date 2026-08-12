import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Ticket, CheckCircle2, ShieldCheck } from 'lucide-react';
import { registerSchema, type RegisterFormValues } from '@/lib/validators';
import { useRegisterMutation, useSendOtpMutation } from '@/api/authApi';
import { useAppDispatch } from '@/app/hooks';
import { sessionEstablished } from '@/features/auth/authSlice';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/Spinner';
import { OtpVerifyModal } from './OtpVerifyModal';
import type { ApiErrorShape } from '@/lib/types';

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });
  const [registerUser, { isLoading, error }] = useRegisterMutation();
  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  const email = watch('email');
  const emailLooksValid = !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isEmailVerified = verifiedEmail !== null && verifiedEmail === email;

  const handleSendOtp = async () => {
    if (!emailLooksValid) return;
    try {
      await sendOtp({ email }).unwrap();
      toast.show('Verification code sent to your email', 'success');
      setOtpModalOpen(true);
    } catch {
      toast.show('Could not send verification code', 'error');
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    if (!isEmailVerified) {
      toast.show('Please verify your email first', 'error');
      return;
    }
    try {
      const payload = { ...values, phone: values.phone || undefined };
      const result = await registerUser(payload).unwrap();
      dispatch(sessionEstablished(result.data));
      toast.show('Account created — welcome to CouponHub!', 'success');
      navigate('/coupons', { replace: true });
    } catch {
      toast.show('Could not create account — check the errors below', 'error');
    }
  };

  const apiError = (error as { data?: ApiErrorShape })?.data;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="ticket-card p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-paper">
            <Ticket size={22} />
          </span>
          <h1 className="font-display text-2xl text-ink">Join CouponHub</h1>
          <p className="mt-1 text-sm text-ink-soft">Free to join. List your first coupon in minutes.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                className="input-field flex-1"
                autoComplete="email"
                disabled={isEmailVerified}
                {...register('email')}
              />
              {isEmailVerified ? (
                <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-light px-3 text-sm font-semibold text-brand-dark">
                  <CheckCircle2 size={16} /> Verified
                </span>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSendOtp}
                  disabled={!emailLooksValid || sendingOtp}
                  className="btn-secondary shrink-0 whitespace-nowrap text-sm disabled:opacity-50"
                >
                  {sendingOtp ? <Spinner className="h-4 w-4" /> : <><ShieldCheck size={14} /> Verify email</>}
                </motion.button>
              )}
            </div>
            {!isEmailVerified && (
              <p className="mt-1.5 text-xs text-ink-soft">
                We'll email you a 6-digit code to confirm this address before you can register.
              </p>
            )}
          </FormField>

          <AnimatePresence>
            {isEmailVerified && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 overflow-hidden"
              >
                <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
                  <input id="fullName" className="input-field" autoComplete="name" {...register('fullName')} />
                </FormField>

                <FormField label="UPI-linked phone number" htmlFor="phone" error={errors.phone?.message}>
                  <input id="phone" className="input-field" placeholder="+919876543210" autoComplete="tel" {...register('phone')} />
                  <p className="mt-1 text-xs text-ink-soft">This number is used to send your seller payouts — use the one linked to your UPI app (GPay, PhonePe, etc.)</p>
                </FormField>

                <FormField label="Password" htmlFor="password" error={errors.password?.message}>
                  <input id="password" type="password" className="input-field" autoComplete="new-password" {...register('password')} />
                </FormField>
                <p className="-mt-3 text-xs text-ink-soft">8+ characters, with an uppercase letter, lowercase letter, and a number.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {apiError && (
            <div className="rounded-lg bg-stamp-light px-3 py-2 text-sm font-medium text-stamp-dark" role="alert">
              {apiError.message}
              {apiError.fieldErrors && (
                <ul className="mt-1 list-disc pl-4">
                  {apiError.fieldErrors.map((fe) => <li key={fe.field}>{fe.message}</li>)}
                </ul>
              )}
            </div>
          )}

          <button type="submit" disabled={isLoading || !isEmailVerified} className="btn-primary w-full disabled:opacity-50">
            {isLoading ? <Spinner className="h-4 w-4" /> : isEmailVerified ? 'Create account' : 'Verify your email to continue'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">Log in</Link>
        </p>
      </div>

      <OtpVerifyModal
        email={email ?? ''}
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerified={() => {
          setVerifiedEmail(email);
          setOtpModalOpen(false);
        }}
      />
    </div>
  );
}
