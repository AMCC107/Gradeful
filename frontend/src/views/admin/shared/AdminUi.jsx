import { X } from 'lucide-react';

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20';

export const inputErrorClass =
  'w-full rounded-xl border border-red-300 bg-red-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-400/20';

export function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
}

export function FeedbackBanner({ error, success, onDismiss }) {
  if (!error && !success) return null;

  const isError = Boolean(error);
  return (
    <div
      className={[
        'flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm',
        isError
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700',
      ].join(' ')}
      role="status"
    >
      <p>{error || success}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100"
        aria-label="Cerrar aviso"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function AdminPageHero({ eyebrow, title, description }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-lg shadow-brand-600/20">
      <p className="mb-1 text-sm font-medium text-brand-100">{eyebrow}</p>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-brand-200">{description}</p>
    </div>
  );
}
