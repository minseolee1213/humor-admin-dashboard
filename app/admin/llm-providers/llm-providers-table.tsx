'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteLlmProvider } from './actions';
import LlmProviderForm, { type LlmProvider } from './llm-provider-form';

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

interface Props {
  providers: LlmProvider[];
}

export default function LlmProvidersTable({ providers }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteLlmProvider(id);
      if (!result.error) {
        setConfirmDeleteId(null);
        router.refresh();
      }
      setDeletingId(null);
    });
  };

  if (providers.length === 0) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-500">No providers found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {providers.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                {editingId === p.id ? (
                  <td colSpan={4} className="px-6 py-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Edit provider</h3>
                      <LlmProviderForm
                        provider={p}
                        onSuccess={() => {
                          setEditingId(null);
                          router.refresh();
                        }}
                      />
                      <button onClick={() => setEditingId(null)} className="mt-3 text-sm text-gray-600 hover:text-gray-900">
                        Cancel
                      </button>
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{p.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(p.created_datetime_utc)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-4">
                        <button onClick={() => setEditingId(p.id)} className="text-gray-600 hover:text-gray-900">
                          Edit
                        </button>
                        <button onClick={() => setConfirmDeleteId(p.id)} className="text-red-600 hover:text-red-700">
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete provider</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this provider? Models referencing it may fail due to foreign keys.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === confirmDeleteId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

