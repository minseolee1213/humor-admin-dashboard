import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import { getDashboardStats } from '@/lib/admin/dashboard-stats';
import AdminLayout from './admin-layout';
import Link from 'next/link';
import AdminBackButton from './admin-back-button';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return 'N/A';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

export default async function AdminPage() {
  // This will redirect if user is not authenticated or not a superadmin
  await requireSuperadmin();

  // Get user session for display
  const supabase = await createServerComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  // Fetch dashboard statistics
  const stats = await getDashboardStats();

  return (
    <AdminLayout userEmail={session.user.email}>
      {/* Page header */}
      <div className="mb-10">
        <div className="mb-4">
          <AdminBackButton />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-base text-gray-600">
          Track platform activity, monitor content health, and spot what needs attention.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Total Images</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalImages.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Total Captions</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalCaptions.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Public Captions</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.publicCaptions.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Profiles</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalUsers.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Newest Images */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="border-b border-gray-200/60 px-7 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Images</h2>
              </div>
              <Link
                href="/admin/images"
                className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="px-7 py-5">
            {stats.newestImages.length > 0 ? (
              <div className="space-y-2.5">
                {stats.newestImages.slice(0, 5).map((image) => (
                  <div key={image.id} className="flex items-center gap-3.5 py-3 px-3 rounded-xl hover:bg-gray-50/80 transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-gray-200/60 bg-gray-50 flex-shrink-0 shadow-sm">
                      {image.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.url as string}
                          alt={(image.image_description as string) || 'Image'}
                          className="h-12 w-12 object-cover"
                        />
                      ) : (
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.image_description || image.url || 'Image'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {image.created_datetime_utc ? formatDate(String(image.created_datetime_utc)) : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">No images yet</p>
            )}
          </div>
        </div>

        {/* Newest Captions */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="border-b border-gray-200/60 px-7 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Captions</h2>
              </div>
              <Link
                href="/admin/captions"
                className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="px-7 py-5">
            {stats.newestCaptions.length > 0 ? (
              <div className="space-y-3.5">
                {stats.newestCaptions.slice(0, 5).map((caption) => (
                  <div key={caption.id} className="py-3 px-3 rounded-xl hover:bg-gray-50/80 transition-colors">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-relaxed">
                      {truncateText((caption.content as string) ?? '', 80)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {caption.created_datetime_utc
                        ? formatDate(String(caption.created_datetime_utc))
                        : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">No captions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="mt-10">
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Insights</p>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Content charts</h2>
          <p className="text-sm text-gray-600">Creation trend and distribution snapshot.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images vs Captions Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">IMAGES VS CAPTIONS (14 DAYS)</h3>
            <div className="space-y-3">
              {/* Chart area */}
              <div className="h-64 flex items-end justify-between gap-0.5 pb-10">
                {stats.dailyStats.map((day, index) => {
                  const maxValue = Math.max(
                    ...stats.dailyStats.map(d => Math.max(d.images, d.captions)),
                    1
                  );
                  const imagesHeight = maxValue > 0 ? (day.images / maxValue) * 100 : 0;
                  const captionsHeight = maxValue > 0 ? (day.captions / maxValue) * 100 : 0;
                  const date = new Date(day.date + 'T00:00:00');
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const dateLabel = index % 2 === 0 ? `${monthNames[date.getMonth()]} ${date.getDate()}` : '';
                  
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                      <div className="w-full flex flex-col items-center gap-0.5 h-full justify-end relative">
                        {/* Captions bar */}
                        {day.captions > 0 && (
                          <div
                            className="w-full bg-blue-500 rounded-t transition-all"
                            style={{ height: `${Math.max(captionsHeight, 2)}%` }}
                            title={`Captions: ${day.captions}`}
                          />
                        )}
                        {/* Images dot */}
                        {day.images > 0 && (
                          <div
                            className="absolute w-1.5 h-1.5 bg-green-600 rounded-full"
                            style={{ bottom: `${imagesHeight}%` }}
                            title={`Images: ${day.images}`}
                          />
                        )}
                      </div>
                      {dateLabel && (
                        <span className="text-xs text-gray-500 mt-1 text-center leading-tight">
                          {dateLabel.split(' ')[0]}<br/>{dateLabel.split(' ')[1]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Images</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-blue-500 rounded"></div>
                  <span className="text-xs text-gray-600">Captions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Caption Visibility & Celebrity Tags */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {/* Caption Visibility */}
            <h3 className="text-sm font-semibold text-gray-900 mb-4">CAPTION VISIBILITY</h3>
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="16"
                    />
                    {stats.totalCaptions > 0 && (
                      <>
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="16"
                          strokeDasharray={`${(stats.publicCaptions / stats.totalCaptions) * 351.86} 351.86`}
                          strokeDashoffset="0"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="16"
                          strokeDasharray={`${(stats.privateCaptions / stats.totalCaptions) * 351.86} 351.86`}
                          strokeDashoffset={-((stats.publicCaptions / stats.totalCaptions) * 351.86)}
                        />
                      </>
                    )}
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Public</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.publicCaptions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Private</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.privateCaptions.toLocaleString()}</span>
                </div>
                {stats.totalCaptions - stats.publicCaptions - stats.privateCaptions > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">Unknown</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {(stats.totalCaptions - stats.publicCaptions - stats.privateCaptions).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Celebrity Tag Volume */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">CELEBRITY TAG VOLUME</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {stats.celebrityTags.length > 0 ? (
                  stats.celebrityTags.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50">
                      <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                        {item.tag.length > 50 ? `${item.tag.substring(0, 50)}...` : item.tag}
                      </span>
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-2">No celebrity recognition data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
