import type { ReactNode } from 'react';
import { useAppSelector } from '@/app/hooks';
import type { Role } from '@/lib/types';
import { EmptyState } from '@/components/ui/EmptyState';

export function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const hasAccess = user?.roles.some((r) => allow.includes(r));

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="This area needs a different role"
          description={`Your account needs one of: ${allow.join(', ')}. Ask an admin to grant it, or check the API reference for the SQL to assign roles locally.`}
        />
      </div>
    );
  }
  return <>{children}</>;
}
