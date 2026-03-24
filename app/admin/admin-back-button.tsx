'use client';

import { useRouter } from 'next/navigation';

export default function AdminBackButton() {
  const router = useRouter();

  const handleBack = () => {
    // If there is no meaningful browser history entry, fall back to /admin.
    if (typeof window !== 'undefined' && window.history.length <= 1) {
      router.push('/admin');
      return;
    }
    router.back();
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <span aria-hidden>←</span>
      Back
    </button>
  );
}

