'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createTerm, updateTerm } from './actions';

export interface TermTypeOption {
  id: number;
  name: string;
}

export interface TermRow {
  id: number;
  created_datetime_utc: string;
  modified_datetime_utc: string | null;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
}

interface Props {
  row?: TermRow;
  termTypes: TermTypeOption[];
  onSuccess?: () => void;
}

export default function TermForm({ row, termTypes, onSuccess }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [id, setId] = useState(row ? String(row.id) : '');
  const [term, setTerm] = useState(row?.term ?? '');
  const [definition, setDefinition] = useState(row?.definition ?? '');
  const [example, setExample] = useState(row?.example ?? '');
  const [priority, setPriority] = useState(row ? String(row.priority) : '0');
  const [termTypeId, setTermTypeId] = useState(row?.term_type_id != null ? String(row.term_type_id) : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const fd = new FormData();
      if (row) fd.append('id', id);
      else if (id.trim()) fd.append('id', id);
      fd.append('term', term);
      fd.append('definition', definition);
      fd.append('example', example);
      fd.append('priority', priority);
      fd.append('term_type_id', termTypeId);

      const result = row ? await updateTerm(fd) : await createTerm(fd);
      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(row ? 'Term updated.' : 'Term created.');
      if (!row) {
        setId('');
        setTerm('');
        setDefinition('');
        setExample('');
        setPriority('0');
        setTermTypeId('');
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
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="term_id">
            ID {row ? '' : <span className="text-gray-400">(optional)</span>}
          </label>
          <input
            id="term_id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={!!row}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm disabled:bg-gray-50"
            placeholder="(auto)"
          />
          {row ? <p className="mt-1 text-xs text-gray-500">ID cannot be changed.</p> : null}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="term">
            Term <span className="text-red-600">*</span>
          </label>
          <input
            id="term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
            placeholder="e.g. Punchline"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="term_type_id">
            Type
          </label>
          <select
            id="term_type_id"
            value={termTypeId}
            onChange={(e) => setTermTypeId(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
          >
            <option value="">(No type)</option>
            {termTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (#{t.id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="priority">
            Priority
          </label>
          <input
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            type="number"
            min={0}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="definition">
          Definition <span className="text-red-600">*</span>
        </label>
        <textarea
          id="definition"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="example">
          Example <span className="text-red-600">*</span>
        </label>
        <textarea
          id="example"
          value={example}
          onChange={(e) => setExample(e.target.value)}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : row ? 'Save changes' : 'Create term'}
        </button>
      </div>
    </form>
  );
}

