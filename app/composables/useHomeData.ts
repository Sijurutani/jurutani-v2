import type { Database } from '~/types/database.types'
import { getFoodPublicUrl } from '~/utils/storage'

// ─── Shared Types (export untuk dipakai di components) ────────────────────────
export interface HomeExpert {
  id: number
  user_id: string
  category: string
  note: string
  profiles: { full_name: string; avatar_url: string } | null
}

export interface HomeInstructor {
  id: number
  user_id: string
  provinces: string
  district: string
  profiles: { full_name: string; avatar_url: string } | null
}

export interface HomeBanner {
  id: string
  image_url: string
  updated_at: string
}

export interface HomeFoodRow {
  id: string
  name: string
  category: string | null
  satuan: string | null
  slug: string | null
  image_url: string | null
  latest_price: number
  latest_price_date: string
}

export type HomeProduct = Database['public']['Tables']['product_markets']['Row']

// ─── Composable ────────────────────────────────────────────────────────────────
export const useHomeData = () => {
  const supabase = useSupabaseClient<Database>()

  // ── Hero carousel data ────────────────────────────────────────────────────
  const getHeroData = () =>
    useAsyncData(
      'home-hero-data',
      async () => {
        const { data, error } = await supabase
          .schema('public')
          .from('hero_data')
          .select('*')
          .eq('status', 'active')
          .is('deleted_at', null)
          .order('created_at', { ascending: true })
        if (error) throw error
        return data || []
      },
      { default: () => [] as any[] },
    )

  // ── Stats (profiles, instructors, experts counts) ─────────────────────────
  const getHomeStats = () =>
    useAsyncData(
      'home-discussion-stats',
      async () => {
        const [profiles, instructors, experts] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('instructors').select('id', { count: 'exact', head: true }),
          supabase.from('experts').select('id', { count: 'exact', head: true }),
        ])
        return {
          profiles: profiles.count || 500,
          instructors: instructors.count || 400,
          experts: experts.count || 200,
        }
      },
      {
        default: () => ({ profiles: 500, instructors: 400, experts: 200 }),
        dedupe: 'defer',
      },
    )

  // ── Experts (4 rows for SmartDashboard) ───────────────────────────────────
  const getExperts = () =>
    useAsyncData(
      'home-experts',
      async () => {
        const { data } = await supabase
          .from('experts')
          .select('id, user_id, category, note, profiles!inner(full_name, avatar_url)')
          .order('id', { ascending: false })
          .limit(4)
        return (data || []) as unknown as HomeExpert[]
      },
      { dedupe: 'defer' },
    )

  // ── Instructors (4 rows for SmartDashboard) ───────────────────────────────
  const getInstructors = () =>
    useAsyncData(
      'home-instructors',
      async () => {
        const { data } = await supabase
          .from('instructors')
          .select('id, user_id, provinces, district, profiles!inner(full_name, avatar_url)')
          .order('id', { ascending: false })
          .limit(4)
        return (data || []) as unknown as HomeInstructor[]
      },
      { dedupe: 'defer' },
    )

  // ── Banners (PromotionSection) ────────────────────────────────────────────
  const getBanners = () =>
    useAsyncData(
      'home-banners',
      async () => {
        const { data } = await supabase
          .from('banner')
          .select('id, image_url, updated_at')
          .order('updated_at', { ascending: false })
          .limit(10)
        return (data || []) as HomeBanner[]
      },
      { dedupe: 'defer' },
    )

  // ── Products (PromotionSection) ───────────────────────────────────────────
  const getProducts = () =>
    useAsyncData(
      'home-products-all',
      async () => {
        const { data } = await supabase
          .from('product_markets')
          .select('id,name,slug,category,price,price_range,price_unit,thumbnail_url,images,excerpt')
          .is('deleted_at', null)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(8)
        return (data || []) as HomeProduct[]
      },
      { dedupe: 'defer' },
    )

  // ── Food Prices (FoodPriceSection) ────────────────────────────────────────
  const getFoodPrices = () =>
    useAsyncData<HomeFoodRow[]>(
      'fp-home-latest',
      async () => {
        const { data, error } = await supabase
          .from('food_prices')
          .select('price, date, foods!inner(id, name, category, satuan, slug, image_url)', { count: 'exact' })
          .is('deleted_at', null)
          .is('foods.deleted_at', null)
          .order('date', { ascending: false })
          .limit(50)
        if (error) throw error

        const seen = new Set<string>()
        const deduped: HomeFoodRow[] = []
        for (const row of data || []) {
          const food = row.foods as any
          if (!food || seen.has(food.id) || !row.price || row.price <= 0) continue
          seen.add(food.id)
          deduped.push({
            id: food.id, name: food.name, category: food.category,
            satuan: food.satuan, slug: food.slug,
            image_url: getFoodPublicUrl(food.image_url || null),
            latest_price: row.price, latest_price_date: row.date,
          })
          if (deduped.length >= 12) break
        }
        return deduped
      },
    )

  // ── Latest News (NewsSection) ─────────────────────────────────────────────
  const getLatestNews = () =>
    useAsyncData(
      'home-latest-news',
      async () => {
        const { data, error } = await supabase
          .from('news_updated')
          .select('id, title, sub_title, slug, category, created_at, cover_image, images')
          .is('deleted_at', null)
          .eq('status_news', 'approved')
          .order('created_at', { ascending: false })
          .limit(8)
        if (error) throw error
        return (data || []) as any[]
      },
      { default: () => [] as any[] },
    )

  return {
    getHeroData,
    getHomeStats,
    getExperts,
    getInstructors,
    getBanners,
    getProducts,
    getFoodPrices,
    getLatestNews,
  }
}
