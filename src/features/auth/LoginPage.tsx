import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '@/lib/validators';
import { useLoginMutation } from '@/api/authApi';
import { useAppDispatch } from '@/app/hooks';
import { sessionEstablished } from '@/features/auth/authSlice';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/Spinner';
import type { ApiErrorShape } from '@/lib/types';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login(values).unwrap();
      dispatch(sessionEstablished(result.data));
      toast.show(`Welcome back, ${result.data.user.fullName.split(' ')[0]}!`, 'success');
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/coupons';
      navigate(from, { replace: true });
    } catch {
      toast.show('Login failed — check your credentials', 'error');
    }
  };

  const apiError = (error as { data?: ApiErrorShape })?.data?.message;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="ticket-card p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-paper">
            <Ticket size={22} />
          </span>
          <h1 className="font-display text-2xl text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-soft">Log in to grab, list, and track your deals.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email or username" htmlFor="emailOrUsername" error={errors.emailOrUsername?.message}>
            <input id="emailOrUsername" className="input-field" autoComplete="username" {...register('emailOrUsername')} />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <input id="password" type="password" className="input-field" autoComplete="current-password" {...register('password')} />
          </FormField>

          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" className="accent-brand" {...register('rememberMe')} />
            Remember me on this device
          </label>

          {apiError && (
            <div className="rounded-lg bg-stamp-light px-3 py-2 text-sm font-medium text-stamp-dark" role="alert">
              {apiError}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? <Spinner className="h-4 w-4" /> : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          New to CouponHub?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
