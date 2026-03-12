'use client';

import { useState, useTransition } from 'react';
import { deleteWhitelistedEmail, updateWhitelistedEmail } from './actions';
import type { WhitelistedEmail } from './page';

interface Props {
  emails: WhitelistedEmail[];
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function WhitelistedEmailsTable({ emails }: Props) {
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const onDelete = (id: number, email: string) => {
    if (!confirm(`Delete whitelisted email "${email}"?`)) return;
    setPendingId(id);
    startTransition(async () => {
      await deleteWhitelistedEmail(id);
      setPendingId(null);
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modified
            </th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {emails.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                No whitelisted emails found.
              </td>
            </tr>
          ) : (
            emails.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <form action={updateWhitelistedEmail} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={row.id} />
                    <input
                      name="email_address"
                      defaultValue={row.email_address}
                      type="email"
                      className="w-64 rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(row.created_datetime_utc)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(row.modified_datetime_utc)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    type="button"
                    onClick={() => onDelete(row.id, row.email_address)}
                    disabled={isPending && pendingId === row.id}
                    className="inline-flex items-center rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50"
                  >
                    {isPending && pendingId === row.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

