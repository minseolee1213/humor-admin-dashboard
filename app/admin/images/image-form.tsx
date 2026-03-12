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

    startTransition(async () => {
      const formData = new FormData();
      formData.append('url', url);
      formData.append('additional_context', additionalContext);
      formData.append('is_public', isPublic.toString());
      formData.append('is_common_use', isCommonUse.toString());
      formData.append('image_description', imageDescription);
      formData.append('celebrity_recognition', celebrityRecognition);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-900">
          URL <span className="text-red-600">*</span>
        </label>
        <input
          type="url"
          id="url"
          name="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label htmlFor="image_description" className="block text-sm font-medium text-gray-900">
          Image Description
        </label>
        <textarea
          id="image_description"
          name="image_description"
          value={imageDescription}
          onChange={(e) => setImageDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          placeholder="Describe the image..."
        />
      </div>

      <div>
        <label htmlFor="additional_context" className="block text-sm font-medium text-gray-900">
          Additional Context
        </label>
        <textarea
          id="additional_context"
          name="additional_context"
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          placeholder="Additional context about the image..."
        />
      </div>

      <div>
        <label htmlFor="celebrity_recognition" className="block text-sm font-medium text-gray-900">
          Celebrity Recognition
        </label>
        <input
          type="text"
          id="celebrity_recognition"
          name="celebrity_recognition"
          value={celebrityRecognition}
          onChange={(e) => setCelebrityRecognition(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          placeholder="Recognized celebrities..."
        />
      </div>

      <div>
        <label htmlFor="profile_id" className="block text-sm font-medium text-gray-900">
          Profile ID (optional)
        </label>
        <input
          type="text"
          id="profile_id"
          name="profile_id"
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          placeholder="UUID of profile..."
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_public"
            name="is_public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
          />
          <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
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
            className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
          />
          <label htmlFor="is_common_use" className="ml-2 block text-sm text-gray-900">
            Is Common Use
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving…' : image ? 'Update Image' : 'Create Image'}
        </button>
      </div>
    </form>
  );
}
