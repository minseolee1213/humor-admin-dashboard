'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createImage, updateImage } from './actions';

interface ImageFormProps {
  image?: {
    id: string;
    url: string | null;
    additional_context?: string | null;
    is_public?: boolean;
    is_common_use?: boolean;
    image_description?: string | null;
    celebrity_recognition?: string | null;
    profile_id?: string | null;
  };
  onSuccess?: () => void;
}

export default function ImageForm({ image, onSuccess }: ImageFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [url, setUrl] = useState(image?.url || '');
  const [additionalContext, setAdditionalContext] = useState(image?.additional_context || '');
  const [isPublic, setIsPublic] = useState(image?.is_public || false);
  const [isCommonUse, setIsCommonUse] = useState(image?.is_common_use || false);
  const [imageDescription, setImageDescription] = useState(image?.image_description || '');
  const [celebrityRecognition, setCelebrityRecognition] = useState(image?.celebrity_recognition || '');
  const [profileId, setProfileId] = useState(image?.profile_id || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formEl = e.currentTarget;

    startTransition(async () => {
      const formData = new FormData();
      const fileInput = formEl.elements.namedItem('image_file') as HTMLInputElement | null;
      const selectedFile = fileInput?.files?.[0];
      formData.append('url', url);
      formData.append('additional_context', additionalContext);
      formData.append('is_public', isPublic.toString());
      formData.append('is_common_use', isCommonUse.toString());
      formData.append('image_description', imageDescription);
      formData.append('celebrity_recognition', celebrityRecognition);
      if (selectedFile) {
        formData.append('image_file', selectedFile);
      }
      if (profileId) {
        formData.append('profile_id', profileId);
      }

      let result;
      if (image) {
        formData.append('id', image.id);
        result = await updateImage(formData);
      } else {
        result = await createImage(formData);
      }

      if (result.error) {
        setError(result.error);
      } else {
        if (!image) {
          setUrl('');
          setAdditionalContext('');
          setIsPublic(false);
          setIsCommonUse(false);
          setImageDescription('');
          setCelebrityRecognition('');
          setProfileId('');
        }
        setSuccess(image ? 'Image updated successfully.' : 'Image created successfully.');
        if (onSuccess) {
          onSuccess();
        }
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
            URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="https://example.com/image.jpg"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use this, upload a file below, or both.</p>
        </div>

        <div>
          <label htmlFor="image_file" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
            Upload Image File
          </label>
          <input
            type="file"
            id="image_file"
            name="image_file"
            accept="image/*"
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:file:bg-slate-800 dark:file:text-slate-200 dark:hover:file:bg-slate-700"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Optional. If provided, the uploaded file URL will be saved to this image row.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="image_description" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
          Image Description
        </label>
        <textarea
          id="image_description"
          name="image_description"
          value={imageDescription}
          onChange={(e) => setImageDescription(e.target.value)}
          rows={3}
          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          placeholder="Describe the image..."
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="additional_context" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
            Additional Context
          </label>
          <textarea
            id="additional_context"
            name="additional_context"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            rows={3}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="Additional context about the image..."
          />
        </div>

        <div>
          <label htmlFor="celebrity_recognition" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
            Celebrity Recognition
          </label>
          <input
            type="text"
            id="celebrity_recognition"
            name="celebrity_recognition"
            value={celebrityRecognition}
            onChange={(e) => setCelebrityRecognition(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="Recognized celebrities..."
          />
        </div>
      </div>

      <div>
        <label htmlFor="profile_id" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
          Profile ID (optional)
        </label>
        <input
          type="text"
          id="profile_id"
          name="profile_id"
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          placeholder="UUID of profile..."
        />
      </div>

      <div className="flex flex-wrap items-center gap-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Visibility</p>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_public"
            name="is_public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700"
          />
          <label htmlFor="is_public" className="ml-2 block text-sm text-slate-900 dark:text-slate-100">
            Is Public
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_common_use"
            name="is_common_use"
            checked={isCommonUse}
            onChange={(e) => setIsCommonUse(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700"
          />
          <label htmlFor="is_common_use" className="ml-2 block text-sm text-slate-900 dark:text-slate-100">
            Is Common Use
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Saving...' : image ? 'Update Image' : 'Create Image'}
        </button>
      </div>
    </form>
  );
}
