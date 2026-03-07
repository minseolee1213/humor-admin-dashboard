import 'server-only';

import { createServerClient } from '@/lib/supabase/server-client';

export interface DashboardStats {
  totalUsers: number;
  totalImages: number;
  totalCaptions: number;
  averageCaptionsPerImage: number | null;
  publicCaptions: number;
  privateCaptions: number;
  newestImages: Array<{
    id: string;
    url?: string;
    created_datetime_utc?: string;
    image_description?: string;
  }>;
  newestCaptions: Array<{
    id: string;
    content?: string;
    image_id?: string;
    created_datetime_utc?: string;
  }>;
  dailyStats: Array<{
    date: string;
    images: number;
    captions: number;
  }>;
  celebrityTags: Array<{
    tag: string;
    count: number;
  }>;
}

/**
 * Fetches dashboard statistics from the database.
 * Uses service role key to bypass RLS and get all data.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerClient();

  // Calculate date range (last 14 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 14);

  // Fetch all statistics in parallel for better performance
  const [
    usersResult,
    imagesResult,
    captionsResult,
    publicCaptionsResult,
    privateCaptionsResult,
    newestImagesResult,
    newestCaptionsResult,
    images14DaysResult,
    captions14DaysResult,
    celebrityRecognitionResult,
  ] = await Promise.all([
    // Total users/profiles count
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    
    // Total images count
    supabase.from('images').select('id', { count: 'exact', head: true }),

    // Total captions count
    supabase.from('captions').select('id', { count: 'exact', head: true }),

    // Public captions count
    supabase.from('captions').select('id', { count: 'exact', head: true }).eq('is_public', true),

    // Private captions count
    supabase.from('captions').select('id', { count: 'exact', head: true }).eq('is_public', false),

    // Newest images (limit 10)
    supabase
      .from('images')
      .select('*')
      .order('created_datetime_utc', { ascending: false })
      .limit(10),

    // Newest captions (limit 10)
    supabase
      .from('captions')
      .select('*')
      .order('created_datetime_utc', { ascending: false })
      .limit(10),

    // Images from last 14 days
    supabase
      .from('images')
      .select('created_datetime_utc')
      .gte('created_datetime_utc', startDate.toISOString())
      .lte('created_datetime_utc', endDate.toISOString()),

    // Captions from last 14 days
    supabase
      .from('captions')
      .select('created_datetime_utc')
      .gte('created_datetime_utc', startDate.toISOString())
      .lte('created_datetime_utc', endDate.toISOString()),

    // Celebrity recognition data
    supabase
      .from('images')
      .select('celebrity_recognition')
      .not('celebrity_recognition', 'is', null),
  ]);

  const totalUsers = usersResult.count ?? 0;
  const totalImages = imagesResult.count ?? 0;
  const totalCaptions = captionsResult.count ?? 0;
  const publicCaptions = publicCaptionsResult.count ?? 0;
  const privateCaptions = privateCaptionsResult.count ?? 0;

  // Calculate average captions per image
  let averageCaptionsPerImage: number | null = null;
  if (totalImages > 0 && totalCaptions > 0) {
    averageCaptionsPerImage = Math.round((totalCaptions / totalImages) * 10) / 10;
  }

  // Process daily stats for last 14 days
  const dailyStatsMap = new Map<string, { images: number; captions: number }>();
  
  // Initialize all 14 days
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dailyStatsMap.set(dateKey, { images: 0, captions: 0 });
  }

  // Count images by date
  images14DaysResult.data?.forEach((image) => {
    if (image.created_datetime_utc) {
      const dateKey = new Date(image.created_datetime_utc).toISOString().split('T')[0];
      const existing = dailyStatsMap.get(dateKey);
      if (existing) {
        existing.images++;
      }
    }
  });

  // Count captions by date
  captions14DaysResult.data?.forEach((caption) => {
    if (caption.created_datetime_utc) {
      const dateKey = new Date(caption.created_datetime_utc).toISOString().split('T')[0];
      const existing = dailyStatsMap.get(dateKey);
      if (existing) {
        existing.captions++;
      }
    }
  });

  const dailyStats = Array.from(dailyStatsMap.entries()).map(([date, counts]) => ({
    date,
    images: counts.images,
    captions: counts.captions,
  }));

  // Process celebrity recognition tags
  const celebrityTagMap = new Map<string, number>();
  celebrityRecognitionResult.data?.forEach((image) => {
    const recognition = image.celebrity_recognition;
    if (recognition) {
      const tag = typeof recognition === 'string' ? recognition : JSON.stringify(recognition);
      celebrityTagMap.set(tag, (celebrityTagMap.get(tag) || 0) + 1);
    }
  });

  const celebrityTags = Array.from(celebrityTagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalUsers,
    totalImages,
    totalCaptions,
    averageCaptionsPerImage,
    publicCaptions,
    privateCaptions,
    newestImages: newestImagesResult.data ?? [],
    newestCaptions: newestCaptionsResult.data ?? [],
    dailyStats,
    celebrityTags,
  };
}
