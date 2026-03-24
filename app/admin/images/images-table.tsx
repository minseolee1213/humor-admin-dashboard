'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteImage } from './actions';
import ImageForm from './image-form';

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

interface Image {
  id: string;
  url: string | null;
  created_datetime_utc?: string | null;
  modified_datetime_utc?: string | null;
  is_public?: boolean;
  is_common_use?: boolean;
  profile_id?: string | null;
  image_description?: string | null;
  additional_context?: string | null;
  celebrity_recognition?: string | null;
}

interface ImagesTableProps {
  images: Image[];
}


export default function ImagesTable({ images }: ImagesTableProps) {
  const PAGE_SIZE = 25;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(images.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleImages = images.slice(pageStart, pageStart + PAGE_SIZE);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteImage(id);
      if (!result.error) {
        setShowDeleteConfirm(null);
        router.refresh();
      }
      setDeletingId(null);
    });
  };

  if (images.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No images yet.</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Create one above to start building your content library.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/70">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Preview
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                URL
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Public
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Common Use
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Created
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900/50">
            {visibleImages.map((image) => (
              <tr key={image.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
              {editingId === image.id ? (
                <td colSpan={6} className="px-6 py-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Edit Image</h3>
                    <ImageForm
                      image={image}
                      onSuccess={() => {
                        setEditingId(null);
                        router.refresh();
                      }}
                    />
                    <button
                      onClick={() => setEditingId(null)}
                      className="mt-3 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              ) : (
                <>
                  <td className="whitespace-nowrap px-6 py-4">
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={image.image_description || 'Image'}
                        className="h-10 w-10 rounded-lg border border-slate-200 object-cover shadow-sm dark:border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <svg
                          className="h-5 w-5 text-slate-400 dark:text-slate-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {image.url ? (
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-sm text-slate-900 hover:text-slate-600 dark:text-slate-100 dark:hover:text-slate-300"
                      >
                        {image.url.length > 40 ? `${image.url.substring(0, 40)}...` : image.url}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400 dark:text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {image.is_public ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                        Yes
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">No</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {image.is_common_use ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                        Yes
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">No</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(image.created_datetime_utc)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setEditingId(image.id)}
                        className="rounded-md px-1.5 py-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(image.id)}
                        className="rounded-md px-1.5 py-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                      >
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
      <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:disabled:border-slate-800 dark:disabled:text-slate-500"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:disabled:border-slate-800 dark:disabled:text-slate-500"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-slate-900">
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Delete Image</h3>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deletingId === showDeleteConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
