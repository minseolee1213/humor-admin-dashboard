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
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_datetime_utc');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  if (profiles.length === 0) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-500">No profiles found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by email, name, or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full sm:max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filtered.length}</span> of{' '}
            <span className="font-medium text-gray-900">{profiles.length}</span>
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Superadmin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                In Study
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matrix Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((profile) => (
              <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {profile.email || <span className="text-gray-500">N/A</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {profile.first_name || profile.last_name
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                    : <span className="text-gray-500">N/A</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {profile.is_superadmin ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Yes
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">No</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {profile.is_in_study ? (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      Yes
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">No</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {profile.is_matrix_admin ? (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                      Yes
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">No</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {profile.created_datetime_utc
                    ? new Date(profile.created_datetime_utc).toLocaleDateString()
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

