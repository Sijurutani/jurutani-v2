<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'

  interface StatItem {
    label: string
    value: string | number
    icon: string
  }

  const supabase = useSupabaseClient()

  function getWIBDate(date?: Date) {
    return date || new Date()
  }

  function todayDate() {
    const now = getWIBDate()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  function yesterdayDate() {
    const yesterday = new Date(getWIBDate().getTime() - 86400000)
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  }

  function getFirstDayOfMonth() {
    const now = getWIBDate()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  }

  function getFirstDayOfYear() {
    return `${getWIBDate().getFullYear()}-01-01`
  }

  async function getStats() {
    const today = todayDate()
    const yesterday = yesterdayDate()
    const firstDayOfMonth = getFirstDayOfMonth()
    const firstDayOfYear = getFirstDayOfYear()

    const [
      { data: todayData },
      { data: yesterdayData },
      { data: monthData },
      { data: yearData },
      { data: totalData },
      { data: profilesData, count: profilesCount },
    ] = await Promise.all([
      supabase
        .from('visit_stats')
        .select('count')
        .eq('date', today)
        .maybeSingle(),
      supabase
        .from('visit_stats')
        .select('count')
        .eq('date', yesterday)
        .maybeSingle(),
      supabase
        .from('visit_stats')
        .select('count')
        .gte('date', firstDayOfMonth)
        .lte('date', today),
      supabase
        .from('visit_stats')
        .select('count')
        .gte('date', firstDayOfYear)
        .lte('date', today),
      supabase.from('visit_stats').select('count'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ])

    return {
      today: todayData?.count || 0,
      yesterday: yesterdayData?.count || 0,
      thisMonth: monthData?.reduce((s: number, r: any) => s + r.count, 0) || 0,
      thisYear: yearData?.reduce((s: number, r: any) => s + r.count, 0) || 0,
      total: totalData?.reduce((s: number, r: any) => s + r.count, 0) || 0,
      totalUsers: profilesCount || 0,
    }
  }


  async function getIPAddress() {
    try {
      return (await (await fetch('https://api.ipify.org?format=json')).json())
        .ip
    } catch {
      return 'Unknown'
    }
  }

  const stats = ref<StatItem[]>([])

  onMounted(async () => {
    const [stat, ip] = await Promise.all([getStats(), getIPAddress()])
    stats.value = [
      {
        label: 'Hari Ini',
        value: stat.today.toLocaleString(),
        icon: 'i-lucide-user-round-search',
      },
      {
        label: 'Kemarin',
        value: stat.yesterday.toLocaleString(),
        icon: 'i-lucide-user',
      },
      {
        label: 'Bulan Ini',
        value: stat.thisMonth.toLocaleString(),
        icon: 'i-lucide-calendar-days',
      },
      {
        label: 'Tahun Ini',
        value: stat.thisYear.toLocaleString(),
        icon: 'i-lucide-calendar',
      },
      {
        label: 'Total',
        value: stat.total.toLocaleString(),
        icon: 'i-lucide-line-chart',
      },
      {
        label: 'Pengguna',
        value: stat.totalUsers.toLocaleString(),
        icon: 'i-lucide-users',
      },
      { label: 'IP Anda', value: ip, icon: 'i-lucide-network' },
    ]
  })

</script>

<template>
  <div
    class="stats-panel relative overflow-hidden bg-white/65 dark:bg-gradient-to-br dark:from-[#021207]/90 dark:to-[#14532d]/70 border border-green-500/10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
  >
    <!-- Decorative elements -->
    <div class="card-deco-circle card-deco-circle--1" />
    <div class="card-deco-circle card-deco-circle--2" />
    <div class="card-deco-ring card-deco-ring--1" />

    <div class="relative z-10">
      <h3 class="stats-title text-[#166534] dark:text-[#bbf7d0]">
        <UIcon name="i-lucide-bar-chart" class="w-5 h-5" />
        Statistik Kunjungan
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="stat-card bg-[#f0fdf4]/60 dark:bg-black/20 border border-green-500/10 hover:border-green-500/20 dark:hover:border-green-400/30 shadow-none hover:shadow-[0_6px_16px_rgba(34,197,94,0.08)] dark:hover:shadow-[0_6px_16px_rgba(34,197,94,0.15)] group backdrop-blur-sm"
        >
          <div
            class="stat-icon bg-green-500/10 dark:bg-green-500/20 group-hover:bg-green-500/20 dark:group-hover:bg-green-500/30"
          >
            <UIcon
              :name="stat.icon"
              class="text-lg text-green-600 dark:text-green-300"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="stat-label text-green-600 dark:text-[#bbf7d0]">
              {{ stat.label }}
            </p>
            <p class="stat-value text-[#14532d] dark:text-white">
              {{ stat.value }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Decorative circles inside cards */
  .card-deco-circle {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(34, 197, 94, 0.1);
    pointer-events: none;
    background: radial-gradient(
      circle,
      rgba(34, 197, 94, 0.03) 0%,
      transparent 70%
    );
  }
  :global(.dark) .card-deco-circle {
    border-color: rgba(134, 239, 172, 0.1);
    background: radial-gradient(
      circle,
      rgba(134, 239, 172, 0.05) 0%,
      transparent 70%
    );
  }

  .card-deco-circle--1 {
    width: 250px;
    height: 250px;
    top: -80px;
    right: -80px;
  }
  .card-deco-circle--2 {
    width: 180px;
    height: 180px;
    bottom: -50px;
    left: -50px;
  }

  .card-deco-ring {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    border: 1px solid rgba(34, 197, 94, 0.05);
    box-shadow:
      inset 0 0 0 10px transparent,
      inset 0 0 0 11px rgba(34, 197, 94, 0.02);
  }
  :global(.dark) .card-deco-ring {
    border-color: rgba(134, 239, 172, 0.05);
    box-shadow:
      inset 0 0 0 10px transparent,
      inset 0 0 0 11px rgba(134, 239, 172, 0.02);
  }

  .card-deco-ring--1 {
    width: 300px;
    height: 300px;
    top: 20%;
    left: 20%;
    opacity: 0.5;
  }

  .stats-panel {
    padding: 1.5rem;
    border-radius: 1.25rem;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .stats-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 1.25rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.875rem;
    border-radius: 0.875rem;
    transition: all 0.25s ease;
  }
  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.625rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background-color 0.25s ease;
  }

  .stat-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .stat-value {
    font-size: 0.925rem;
    font-weight: 700;
    margin-top: 0.1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .stats-panel {
      padding: 1rem;
    }
    .grid {
      gap: 0.5rem !important;
    }
    .stat-card {
      padding: 0.625rem;
      gap: 0.5rem;
    }
    .stat-icon {
      width: 1.75rem;
      height: 1.75rem;
    }
    .stat-label {
      font-size: 0.65rem;
    }
    .stat-value {
      font-size: 0.8rem;
    }
  }
</style>
