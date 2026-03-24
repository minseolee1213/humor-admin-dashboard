'use client';

import { useMemo, useState } from 'react';

type Profile = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  is_superadmin?: boolean | null;
  is_in_study?: boolean | null;
  is_matrix_admin?: boolean | null;
  created_datetime_utc?: string | null;
  modified_datetime_utc?: string | null;
};

interface UsersTableProps {
  profiles: Profile[];
}

type SortKey = 'created_datetime_utc' | 'email' | 'is_superadmin';

export default function UsersTable({ profiles }: UsersTableProps) {
  const PAGE_SIZE = 25;
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_datetime_utc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let result = profiles;
    if (q) {
      result = result.filter((p) => {
        const email = (p.email || '').toLowerCase();
        const first = (p.first_name || '').toLowerCase();
        const last = (p.last_name || '').toLowerCase();
        const full = `${first} ${last}`.trim();
        const id = (p.id || '').toLowerCase();
        return (
          email.includes(q) ||
          first.includes(q) ||
          last.includes(q) ||
          full.includes(q) ||
          id.includes(q)
        );
      });
    }

    result = [...result].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'email') {
        return ((a.email || '') > (b.email || '') ? 1 : -1) * dir;
      }
      if (sortKey === 'is_superadmin') {
        const av = a.is_superadmin ? 1 : 0;
        const bv = b.is_superadmin ? 1 : 0;
        return (av - bv) * dir;
      }
      // created_datetime_utc default
      const at = a.created_datetime_utc
        ? new Date(a.created_datetime_utc).getTime()
        : 0;
      const bt = b.created_datetime_utc
        ? new Date(b.created_datetime_utc).getTime()
        : 0;
      return (at - bt) * dir;
    });

    return result;
  }, [profiles, query, sortKey, sortDir]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'email' ? 'asc' : 'desc');
    }
  };
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagedRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  if (profiles.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No users found yet.</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Profiles will appear here after users sign in.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by email, name, or ID…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="block w-full sm:max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{profiles.length}</span>
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/70">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Name
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Superadmin
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                In Study
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Matrix Admin
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900/50">
            {pagedRows.map((profile) => (
              <tr key={profile.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                  {profile.email || <span className="text-slate-500 dark:text-slate-400">N/A</span>}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                  {profile.first_name || profile.last_name
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                    : <span className="text-slate-500 dark:text-slate-400">N/A</span>}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {profile.is_superadmin ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                      Yes
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">No</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {profile.is_in_study ? (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                      Yes
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">No</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {profile.is_matrix_admin ? (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-500/20 dark:text-purple-300">
                      Yes
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">No</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {profile.created_datetime_utc
                    ? new Date(profile.created_datetime_utc).toLocaleDateString()
                    : 'N/A'}
                </td>
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
    </div>
  );
}

