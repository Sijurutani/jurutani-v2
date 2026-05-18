import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

type SupabaseServiceClient = SupabaseClient<Database>

interface CountResponse {
  count: number | null
  error: { message?: string } | null
}

export interface ChatbotDistributionItem {
  label: string
  count: number
}

export interface JurutaniPlatformStats {
  generatedAt: string
  totals: {
    profiles: number
    instructors: number
    experts: number
    marketplaceProducts: number
    learningCourses: number
    videos: number
    news: number
    foods: number
    foodPrices: number
    meetings: number
  }
  profileRoles: ChatbotDistributionItem[]
  instructorProvinces: ChatbotDistributionItem[]
  expertCategories: ChatbotDistributionItem[]
}

const DISTRIBUTION_LIMIT = 8
const SAMPLE_LIMIT = 5000

function readCount(label: string, response: CountResponse): number {
  if (response.error) {
    throw new Error(
      `Gagal menghitung ${label}: ${response.error.message || 'Supabase error'}`,
    )
  }

  return response.count ?? 0
}

function normalizeBucket(value?: string | null, fallback = 'Belum diisi'): string {
  const clean = value?.trim()
  return clean || fallback
}

function topDistribution(
  values: Array<string | null | undefined>,
  fallback: string,
): ChatbotDistributionItem[] {
  const counts = new Map<string, number>()

  for (const value of values) {
    const label = normalizeBucket(value, fallback)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, DISTRIBUTION_LIMIT)
}

export async function getJurutaniPlatformStats(
  supabase: SupabaseServiceClient,
): Promise<JurutaniPlatformStats> {
  const [
    profiles,
    instructors,
    experts,
    marketplaceProducts,
    learningCourses,
    videos,
    news,
    foods,
    foodPrices,
    meetings,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null)
      .is('archived_at', null),
    supabase
      .from('instructors')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('experts')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('product_markets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .is('deleted_at', null),
    supabase
      .from('learning_courses')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .is('deleted_at', null)
      .is('archived_at', null),
    supabase
      .from('videos')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('news_updated')
      .select('id', { count: 'exact', head: true })
      .eq('status_news', 'approved')
      .is('deleted_at', null),
    supabase
      .from('foods')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('food_prices')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('meeting_schedules')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null)
      .is('archived_at', null),
  ])

  const [profileRoles, instructorRegions, expertCategories] = await Promise.all([
    supabase
      .from('profiles')
      .select('role')
      .is('deleted_at', null)
      .is('archived_at', null)
      .limit(SAMPLE_LIMIT),
    supabase
      .from('instructors')
      .select('provinces')
      .is('deleted_at', null)
      .limit(SAMPLE_LIMIT),
    supabase
      .from('experts')
      .select('category')
      .is('deleted_at', null)
      .limit(SAMPLE_LIMIT),
  ])

  if (profileRoles.error) throw profileRoles.error
  if (instructorRegions.error) throw instructorRegions.error
  if (expertCategories.error) throw expertCategories.error

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      profiles: readCount('profil pengguna', profiles),
      instructors: readCount('penyuluh', instructors),
      experts: readCount('pakar', experts),
      marketplaceProducts: readCount('produk marketplace', marketplaceProducts),
      learningCourses: readCount('kursus', learningCourses),
      videos: readCount('video', videos),
      news: readCount('berita/update', news),
      foods: readCount('komoditas pangan', foods),
      foodPrices: readCount('data harga pangan', foodPrices),
      meetings: readCount('jadwal pertemuan', meetings),
    },
    profileRoles: topDistribution(
      (profileRoles.data ?? []).map((row) => row.role),
      'Role belum diisi',
    ),
    instructorProvinces: topDistribution(
      (instructorRegions.data ?? []).map((row) => row.provinces),
      'Provinsi belum diisi',
    ),
    expertCategories: topDistribution(
      (expertCategories.data ?? []).map((row) => row.category),
      'Kategori belum diisi',
    ),
  }
}
