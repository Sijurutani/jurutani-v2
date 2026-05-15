import type { Database } from '~/types/database.types'

export const useHomeData = () => {
  const supabase = useSupabaseClient<Database>()

  const getHeroData = () => {
    return useAsyncData(
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
  }

  const getHomeStats = () => {
    return useAsyncData(
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
  }

  // ─── Fetching Latest News — menggunakan tabel & field yang benar ─────────
  const getLatestNews = () => {
    return useAsyncData(
      'home-latest-news',
      async () => {
        const { data, error } = await supabase
          .from('news_updated')
          .select('id, title, sub_title, slug, category, created_at, cover_image, images')
          .is('deleted_at', null)
          .eq('status_news', 'approved')
          .order('created_at', { ascending: false })
          .limit(4)

        if (error) throw error
        return (data || []) as any[]
      },
      { default: () => [] as any[] },
    )
  }

  return {
    getHeroData,
    getHomeStats,
    getLatestNews,
  }
}

