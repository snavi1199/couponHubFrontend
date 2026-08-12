import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useUpdateCurrentUserMutation } from '@/api/userApi';
import { useAppDispatch } from '@/app/hooks';
import { profileLoaded } from '@/features/auth/authSlice';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import type { UserResponse } from '@/lib/types';

interface FormValues {
  fullName: string;
  location: string;
  bio: string;
}

export function ProfileEditor({ user }: { user: UserResponse }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { fullName: user.fullName, location: user.location ?? '', bio: user.bio ?? '' },
  });
  const [updateProfile, { isLoading }] = useUpdateCurrentUserMutation();
  const dispatch = useAppDispatch();

  const onSubmit = async (values: FormValues) => {
    const result = await updateProfile(values).unwrap();
    dispatch(profileLoaded(result.data));
    setOpen(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost text-sm">
        Edit profile
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="ticket-card mt-4 w-full max-w-sm space-y-3 p-4">
      <FormField label="Full name" htmlFor="fullName">
        <input id="fullName" className="input-field" {...register('fullName')} />
      </FormField>
      <FormField label="Location" htmlFor="location">
        <input id="location" className="input-field" {...register('location')} />
      </FormField>
      <FormField label="Bio" htmlFor="bio">
        <textarea id="bio" className="input-field min-h-16" {...register('bio')} />
      </FormField>
      <div className="flex gap-2">
        <button type="submit" disabled={isLoading} className="btn-primary flex-1 text-sm">
          {isLoading ? <Spinner className="h-4 w-4" /> : 'Save'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost text-sm">Cancel</button>
      </div>
    </form>
  );
}
