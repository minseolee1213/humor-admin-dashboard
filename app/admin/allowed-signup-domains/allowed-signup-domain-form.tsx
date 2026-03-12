'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createAllowedSignupDomain, updateAllowedSignupDomain } from './actions';

export interface AllowedSignupDomain {
  id: number;
  created_datetime_utc: string;
  apex_domain: string;
}

interface Props {
  row?: AllowedSignupDomain;
  onSuccess?: () => void;
}

export default function AllowedSignupDomainForm({ row, onSuccess }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [id, setId] = useState(row ? String(row.id) : '');
  const [domain, setDomain] = useState(row?.apex_domain ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const fd = new FormData();
      if (row) fd.append('id', id);
      else if (id.trim()) fd.append('id', id);
      fd.append('apex_domain', domain);

      const result = row ? await updateAllowedSignupDomain(fd) : await createAllowedSignupDomain(fd);
      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(row ? 'Domain updated.' : 'Domain added.');
      if (!row) {
        setId('');
        setDomain('');
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
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="domain_id">
            ID {row ? '' : <span className="text-gray-400">(optional)</span>}
          </label>
          <input
            id="domain_id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={!!row}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm disabled:bg-gray-50"
            placeholder="(auto)"
          />
          {row ? <p className="mt-1 text-xs text-gray-500">ID cannot be changed.</p> : null}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="apex_domain">
            Apex domain <span className="text-red-600">*</span>
          </label>
          <input
            id="apex_domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
            placeholder="example.com"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : row ? 'Save changes' : 'Add domain'}
        </button>
      </div>
    </form>
  );
}

