'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createLlmProvider, updateLlmProvider } from './actions';

export interface LlmProvider {
  id: number;
  created_datetime_utc: string;
  name: string;
}

interface Props {
  provider?: LlmProvider;
  onSuccess?: () => void;
}

export default function LlmProviderForm({ provider, onSuccess }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [id, setId] = useState(provider ? String(provider.id) : '');
  const [name, setName] = useState(provider?.name ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.append('id', id);
      fd.append('name', name);

      const result = provider ? await updateLlmProvider(fd) : await createLlmProvider(fd);
      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(provider ? 'Provider updated.' : 'Provider created.');
      if (!provider) {
        setId('');
        setName('');
      }
      onSuccess?.();
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="provider_id">
            Provider ID <span className="text-red-600">*</span>
          </label>
          <input
            id="provider_id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={!!provider}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm disabled:bg-gray-50"
            placeholder="e.g. 1"
          />
          {provider ? <p className="mt-1 text-xs text-gray-500">ID cannot be changed.</p> : null}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="provider_name">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="provider_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
            placeholder="e.g. OpenAI"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : provider ? 'Save changes' : 'Create provider'}
        </button>
      </div>
    </form>
  );
}

