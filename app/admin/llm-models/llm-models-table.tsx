'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteLlmModel } from './actions';
import LlmModelForm, { type LlmModel, type LlmProviderOption } from './llm-model-form';

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
  models: LlmModel[];
  providers: LlmProviderOption[];
}

export default function LlmModelsTable({ models, providers }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const providersById = useMemo(() => {
    const m = new Map<number, string>();
    providers.forEach((p) => m.set(p.id, p.name));
    return m;
  }, [providers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models;
    return models.filter((m) => {
      const providerName = providersById.get(m.llm_provider_id) ?? '';
      return (
        String(m.id).includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.provider_model_id.toLowerCase().includes(q) ||
        providerName.toLowerCase().includes(q)
      );
    });
  }, [models, query, providersById]);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteLlmModel(id);
      if (!result.error) {
        setConfirmDeleteId(null);
        router.refresh();
      }
      setDeletingId(null);
    });
  };

  if (models.length === 0) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-500">No models found</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-200/60">
        <div className="max-w-md">
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="model_search">
            Search
          </label>
          <input
            id="model_search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
            placeholder="Search by id, name, provider, provider model id…"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider model id
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                {editingId === m.id ? (
                  <td colSpan={7} className="px-6 py-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Edit model</h3>
                      <LlmModelForm
                        model={m}
                        providers={providers}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{m.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {providersById.get(m.llm_provider_id) ?? `#${m.llm_provider_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{m.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">{m.provider_model_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {m.is_temperature_supported ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(m.created_datetime_utc)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-4">
                        <button onClick={() => setEditingId(m.id)} className="text-gray-600 hover:text-gray-900">
                          Edit
                        </button>
                        <button onClick={() => setConfirmDeleteId(m.id)} className="text-red-600 hover:text-red-700">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete model</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this model?</p>
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

