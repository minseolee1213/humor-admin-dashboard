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
      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
    >
      <span aria-hidden>←</span>
      Back
    </button>
  );
}

