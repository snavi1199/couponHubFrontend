import type { ReactNode } from 'react';

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label-text">{label}</label>
      {children}
      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  );
}
