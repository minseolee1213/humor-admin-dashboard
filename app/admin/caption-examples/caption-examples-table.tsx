'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCaptionExample } from './actions';
import CaptionExampleForm, { type CaptionExampleRow, type ImageOption } from './caption-example-form';

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function truncate(text: string, max = 80): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

interface Props {
  rows: CaptionExampleRow[];
  images: ImageOption[];
}

export default function CaptionExamplesTable({ rows, images }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const imagesById = useMemo(() => {
    const m = new Map<string, ImageOption>();
    images.forEach((img) => m.set(img.id, img));
    return m;
  }, [images]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const img = r.image_id ? imagesById.get(r.image_id) : null;
      const imgLabel = img?.url ?? img?.image_description ?? '';
      return (
        String(r.id).includes(q) ||
        r.caption.toLowerCase().includes(q) ||
        r.explanation.toLowerCase().includes(q) ||
        r.image_description.toLowerCase().includes(q) ||
        imgLabel.toLowerCase().includes(q)
      );
    });
  }, [rows, query, imagesById]);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteCaptionExample(id);
      if (!result.error) {
        setConfirmDeleteId(null);
        router.refresh();
      }
      setDeletingId(null);
    });
  };

  if (rows.length === 0) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-500">No caption examples found</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-200/60">
        <div className="max-w-md">
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="example_search">
            Search
          </label>
          <input
            id="example_search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
            placeholder="Search caption examples…"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caption</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image link
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((r) => {
              const img = r.image_id ? imagesById.get(r.image_id) : null;
              return (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  {editingId === r.id ? (
                    <td colSpan={5} className="px-6 py-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Edit caption example</h3>
                        <CaptionExampleForm
                          row={r}
                          images={images}
                          onSuccess={() => {
                            setEditingId(null);
                            router.refresh();
                          }}
                        />
                        <button
                          onClick={() => setEditingId(null)}
                          className="mt-3 text-sm text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-semibold">{truncate(r.caption, 90)}</div>
                        <div className="text-xs text-gray-500 mt-1">{truncate(r.explanation, 110)}</div>
                        <div className="text-xs text-gray-400 mt-1">#{r.id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {img?.url ? (
                          <a href={img.url} target="_blank" rel="noreferrer" className="text-green-700 hover:underline">
                            {img.url.length > 40 ? `${img.url.slice(0, 40)}…` : img.url}
                          </a>
                        ) : r.image_id ? (
                          <span className="font-mono text-xs text-gray-500">{String(r.image_id).slice(0, 8)}…</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.priority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(r.created_datetime_utc)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-4">
                          <button onClick={() => setEditingId(r.id)} className="text-gray-600 hover:text-gray-900">
                            Edit
                          </button>
                          <button onClick={() => setConfirmDeleteId(r.id)} className="text-red-600 hover:text-red-700">
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete caption example</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this caption example?</p>
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

