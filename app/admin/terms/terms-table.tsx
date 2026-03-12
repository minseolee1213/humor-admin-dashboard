'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTerm } from './actions';
import TermForm, { type TermRow, type TermTypeOption } from './term-form';

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
  terms: TermRow[];
  termTypes: TermTypeOption[];
}

export default function TermsTable({ terms, termTypes }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const termTypesById = useMemo(() => {
    const m = new Map<number, string>();
    termTypes.forEach((t) => m.set(t.id, t.name));
    return m;
  }, [termTypes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter((t) => {
      const typeName = t.term_type_id != null ? termTypesById.get(t.term_type_id) ?? '' : '';
      return (
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.example.toLowerCase().includes(q) ||
        typeName.toLowerCase().includes(q) ||
        String(t.id).includes(q)
      );
    });
  }, [terms, query, termTypesById]);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteTerm(id);
      if (!result.error) {
        setConfirmDeleteId(null);
        router.refresh();
      }
      setDeletingId(null);
    });
  };

  if (terms.length === 0) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-500">No terms found</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-200/60">
        <div className="max-w-md">
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="term_search">
            Search
          </label>
          <input
            id="term_search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
            placeholder="Search term, definition, example, type…"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                {editingId === t.id ? (
                  <td colSpan={6} className="px-6 py-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Edit term</h3>
                      <TermForm
                        row={t}
                        termTypes={termTypes}
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
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-semibold">{t.term}</div>
                      <div className="text-xs text-gray-500 mt-0.5">#{t.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {t.term_type_id != null ? termTypesById.get(t.term_type_id) ?? `#${t.term_type_id}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{t.priority}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(t.created_datetime_utc)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(t.modified_datetime_utc)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-4">
                        <button onClick={() => setEditingId(t.id)} className="text-gray-600 hover:text-gray-900">
                          Edit
                        </button>
                        <button onClick={() => setConfirmDeleteId(t.id)} className="text-red-600 hover:text-red-700">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete term</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this term?</p>
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

