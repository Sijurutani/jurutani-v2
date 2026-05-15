<script setup lang="ts">
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()
  const toast = useToast()

  // ── Cuaca ──────────────────────────────────────────────────────────────────
  const { weatherData, isLoading: weatherLoading, error: weatherError, requestLocation, fetchDefault } = useWeatherData()
  const currentTime = ref('')
  const tick = () => {
    currentTime.value = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date())
  }

  const farmingSuitable = computed(() => {
    const w = weatherData.value
    if (!w) return true
    const main = w.weather[0]?.main?.toLowerCase() ?? ''
    const temp = w.main.temp
    return !main.includes('rain') && !main.includes('thunder') && temp >= 15 && temp <= 35
  })

  const weatherGradient = computed(() => {
    const w = weatherData.value
    if (!w) return 'from-slate-700 to-slate-900'
    const main = w.weather[0]?.main?.toLowerCase() ?? ''
    const temp = w.main.temp
    if (main.includes('thunder')) return 'from-slate-900 via-purple-950 to-slate-900'
    if (main.includes('rain') || main.includes('drizzle')) return 'from-slate-700 via-blue-900 to-slate-800'
    if (main.includes('cloud')) return 'from-slate-500 via-slate-700 to-slate-800'
    if (main.includes('mist') || main.includes('fog')) return 'from-slate-400 via-slate-600 to-slate-700'
    if (temp >= 32) return 'from-orange-600 via-amber-700 to-red-800'
    if (temp >= 25) return 'from-emerald-700 via-teal-800 to-cyan-900'
    return 'from-indigo-700 via-blue-800 to-cyan-900'
  })

  // ── Pakar & Penyuluh ───────────────────────────────────────────────────────
  interface Expert {
    id: number
    user_id: string
    category: string
    note: string
    profiles: { full_name: string; avatar_url: string } | null
  }

  interface Instructor {
    id: number
    user_id: string
    provinces: string
    district: string
    profiles: { full_name: string; avatar_url: string } | null
  }

  const { data: expertsData } = await useAsyncData(
    'home-experts',
    async () => {
      const { data } = await supabase
        .from('experts')
        .select('id, user_id, category, note, profiles!inner(full_name, avatar_url)')
        .order('id', { ascending: false })
        .limit(4)
      return (data || []) as unknown as Expert[]
    },
    { dedupe: 'defer' },
  )

  const { data: instructorsData } = await useAsyncData(
    'home-instructors',
    async () => {
      const { data } = await supabase
        .from('instructors')
        .select('id, user_id, provinces, district, profiles!inner(full_name, avatar_url)')
        .order('id', { ascending: false })
        .limit(4)
      return (data || []) as unknown as Instructor[]
    },
    { dedupe: 'defer' },
  )

  const experts = computed(() => expertsData.value || [])
  const instructors = computed(() => instructorsData.value || [])

  const startingId = ref<number | null>(null)

  const startChat = async (userId: string, id: number) => {
    try {
      if (!authStore.isAuthenticated) { await navigateTo('/auth/login'); return }
      startingId.value = id
      const res = await supabase.rpc('create_or_get_conversation', { other_user_id: userId })
      if (res.error) throw res.error
      await navigateTo(`/messages/${res.data}`)
    } catch (e: any) {
      toast.add({ title: 'Gagal membuka chat', description: e?.message, color: 'error' })
    } finally {
      startingId.value = null
    }
  }

  let clockTimer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    if (import.meta.client) {
      fetchDefault()
      tick()
      clockTimer = setInterval(tick, 30_000)
    }
  })

  onUnmounted(() => {
    if (clockTimer) clearInterval(clockTimer)
  })
</script>

<template>
  <div class="px-4 lg:px-6 flex flex-col gap-5">
    <!-- Header Dashboard -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <!-- Badge -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100/50 dark:bg-green-900/20 border border-green-500/20 mb-3 shadow-sm">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span class="text-[10px] font-extrabold uppercase tracking-widest text-green-700 dark:text-green-400">
            Akses Cepat
          </span>
        </div>

        <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
          Smart Dashboard
        </h2>
        <p class="text-sm md:text-[15px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-xl">
          Pantau cuaca terkini dan akses layanan konsultasi pakar atau penyuluh secara cepat.
        </p>
      </div>
    </div>

    <!-- Bento Grid Container -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      <!-- ── Kiri: Cuaca (Span 7) ── -->
      <div class="lg:col-span-7 flex flex-col h-full relative group">
        <!-- Main Weather Card -->
        <NuxtLink
          v-if="weatherData && !weatherLoading && !weatherError"
          to="/weathers"
          class="relative flex-1 rounded-2xl overflow-hidden no-underline block h-64 lg:h-full bg-linear-to-br shadow-xl shadow-black/5 hover:shadow-2xl hover:scale-[1.01] transition-all duration-500"
          :class="weatherGradient"
        >
          <!-- Ornaments -->
          <div class="absolute -top-20 -right-10 w-64 h-64 rounded-full opacity-30 blur-[60px] bg-white pointer-events-none" />
          <div class="absolute -bottom-16 -left-10 w-48 h-48 rounded-full opacity-30 blur-[50px] bg-black/40 pointer-events-none" />
          <div class="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/50 to-transparent pointer-events-none" />
          
          <div class="relative z-10 flex flex-col justify-between h-full p-6 lg:p-8">
            <!-- Top Section -->
            <div class="flex items-start justify-between w-full">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-sm w-fit">
                    <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5" />
                    {{ weatherData.name }}
                  </span>
                  <button class="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors" aria-label="Gunakan Lokasi Saya" title="Gunakan Lokasi Saya" @click.prevent="requestLocation">
                    <UIcon name="i-lucide-crosshair" class="w-4 h-4" />
                  </button>
                </div>
                <span class="text-3xl lg:text-4xl font-black text-white tracking-wide drop-shadow-md mt-2">
                  {{ currentTime }}
                </span>
              </div>
              <NuxtImg
                :src="'https://openweathermap.org/img/wn/' + weatherData.weather[0].icon + '@4x.png'"
                :alt="weatherData.weather[0].description"
                class="w-24 h-24 lg:w-32 lg:h-32 drop-shadow-2xl -mt-4 -mr-4"
                @error="(e: any) => (e.target.style.display = 'none')"
              />
            </div>

            <!-- Bottom Section -->
            <div class="flex flex-col gap-4 mt-auto">
              <div class="flex items-end gap-3">
                <div class="flex items-start leading-none drop-shadow-xl">
                  <span class="text-7xl lg:text-8xl font-black text-white tracking-tighter">
                    {{ Math.round(weatherData.main.temp) }}
                  </span>
                  <span class="text-4xl lg:text-5xl font-light text-white/80 mt-2">°</span>
                </div>
                <div class="flex flex-col pb-2">
                  <span class="text-lg lg:text-xl font-bold text-white capitalize drop-shadow-md">
                    {{ weatherData.weather[0].description }}
                  </span>
                  <span class="text-xs text-white/70">Terasa seperti {{ Math.round(weatherData.main.feels_like) }}°</span>
                </div>
              </div>

              <!-- Stats Row -->
              <div class="flex items-center gap-2 flex-wrap mt-2">
                <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 text-xs font-medium text-white">
                  <UIcon name="i-lucide-droplet" class="w-4 h-4 text-blue-300" />
                  {{ weatherData.main.humidity }}%
                </div>
                <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 text-xs font-medium text-white">
                  <UIcon name="i-lucide-wind" class="w-4 h-4 text-cyan-300" />
                  {{ weatherData.wind?.speed || 0 }}m/s
                </div>
                <div
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-bold"
                  :class="farmingSuitable ? 'bg-emerald-500/30 border-emerald-400/40 text-emerald-100' : 'bg-amber-500/30 border-amber-400/40 text-amber-100'"
                >
                  <UIcon :name="farmingSuitable ? 'i-lucide-check-circle' : 'i-lucide-alert-triangle'" class="w-4 h-4" />
                  {{ farmingSuitable ? 'Cuaca Optimal' : 'Perlu Perhatian' }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Hover Glow -->
          <div class="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500 pointer-events-none" />
        </NuxtLink>

        <!-- Loading / Error Weather -->
        <div v-else-if="weatherLoading" class="flex-1 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse min-h-[250px]" />
        <div v-else class="flex-1 rounded-2xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-6 gap-3 min-h-[250px]">
          <UIcon name="i-lucide-cloud-off" class="w-10 h-10 text-gray-400" />
          <p class="text-sm text-gray-500 text-center">{{ weatherError || 'Gagal memuat cuaca' }}</p>
          <button class="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors" @click="requestLocation">
            Coba Lagi
          </button>
        </div>
      </div>

      <!-- ── Kanan: Layanan Akses Cepat (Span 5) ── -->
      <div class="lg:col-span-5 flex flex-col gap-4">
        
        <!-- Pakar Box -->
        <div class="flex-1 rounded-2xl bg-white/40 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60 backdrop-blur-xl p-4 flex flex-col shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-[15px] font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <UIcon name="i-lucide-lightbulb" class="w-4 h-4 text-amber-500" />
              Pakar Pertanian
            </h3>
            <NuxtLink to="/discussions/expert" class="text-xs font-bold text-green-600 dark:text-green-400 hover:underline">
              Lihat Semua
            </NuxtLink>
          </div>
          
          <div class="flex flex-col gap-2.5 overflow-y-auto max-h-[160px] pr-1 custom-scroll">
            <NuxtLink
              v-for="expert in experts"
              :key="expert.id"
              :to="`/discussions/expert/${expert.id}`"
              class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 hover:border-amber-300/50 dark:hover:border-amber-500/50 hover:shadow-md transition-all group no-underline"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="relative shrink-0">
                  <NuxtImg :src="expert.profiles?.avatar_url || '/placeholder/user.webp'" class="w-9 h-9 rounded-full object-cover" />
                  <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-500 border-2 border-white dark:border-gray-800 rounded-full" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-gray-900 dark:text-white truncate">{{ expert.profiles?.full_name }}</p>
                  <p class="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">{{ expert.category }}</p>
                </div>
              </div>
              <button
                class="shrink-0 w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 group-hover:text-amber-600 transition-colors"
                @click.prevent="startChat(expert.user_id, expert.id)"
              >
                <UIcon :name="startingId === expert.id ? 'i-lucide-loader' : 'i-lucide-message-circle'" class="w-4 h-4" :class="{'animate-spin': startingId === expert.id}" />
              </button>
            </NuxtLink>
          </div>
        </div>

        <!-- Penyuluh Box -->
        <div class="flex-1 rounded-2xl bg-white/40 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60 backdrop-blur-xl p-4 flex flex-col shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-[15px] font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-green-500" />
              Penyuluh Lokal
            </h3>
            <NuxtLink to="/discussions/instructor" class="text-xs font-bold text-green-600 dark:text-green-400 hover:underline">
              Lihat Semua
            </NuxtLink>
          </div>
          
          <div class="flex flex-col gap-2.5 overflow-y-auto max-h-[160px] pr-1 custom-scroll">
            <NuxtLink
              v-for="ins in instructors"
              :key="ins.id"
              :to="`/discussions/instructor/${ins.id}`"
              class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 hover:border-green-300/50 dark:hover:border-green-500/50 hover:shadow-md transition-all group no-underline"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="relative shrink-0">
                  <NuxtImg :src="ins.profiles?.avatar_url || '/placeholder/user.webp'" class="w-9 h-9 rounded-full object-cover" />
                  <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-gray-900 dark:text-white truncate">{{ ins.profiles?.full_name }}</p>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate">{{ ins.district }}, {{ ins.provinces }}</p>
                </div>
              </div>
              <button
                class="shrink-0 w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 group-hover:text-green-600 transition-colors"
                @click.prevent="startChat(ins.user_id, ins.id)"
              >
                <UIcon :name="startingId === ins.id ? 'i-lucide-loader' : 'i-lucide-message-circle'" class="w-4 h-4" :class="{'animate-spin': startingId === ins.id}" />
              </button>
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}
.dark .custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.4);
}
</style>
