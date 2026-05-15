<script setup lang="ts">
  import { formatCurrency } from '~/utils/currency'
  import { getFoodPublicUrl } from '~/utils/storage'
  import type { Database } from '~/types/database.types'

  const supabase = useSupabaseClient<Database>()

  type FoodRow = {
    id: string
    name: string
    category: string | null
    satuan: string | null
    slug: string | null
    image_url: string | null
    latest_price: number
    latest_price_date: string
  }

  const categoryIcon = (val: string) =>
    ({ hortikultura: 'i-lucide-leaf', perkebunan: 'i-lucide-tree-deciduous', peternakan: 'i-lucide-beef' })[val] ||
    'i-lucide-package'

  const categoryAccent = (val: string) =>
    ({ hortikultura: 'text-emerald-400', perkebunan: 'text-green-400', peternakan: 'text-amber-400' })[val] ||
    'text-gray-400'

  const formatShortDate = (d?: string) => {
    if (!d) return ''
    try {
      return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d))
    } catch { return '' }
  }

  const { data: items, pending } = await useAsyncData<FoodRow[]>(
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
      const deduped: FoodRow[] = []
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

  const trackRef = ref<HTMLElement | null>(null)
  const dotIndex = ref(0)
  const perPage = ref(2)

  const updatePerPage = () => {
    if (!trackRef.value || !(items.value as FoodRow[] | null)?.length) return
    const card = trackRef.value.children[0] as HTMLElement
    if (!card) return
    perPage.value = Math.max(1, Math.round(trackRef.value.clientWidth / card.offsetWidth))
  }

  const dotCount = computed(() =>
    Math.max(1, Math.ceil(((items.value as FoodRow[] | null)?.length ?? 0) / perPage.value)),
  )

  const handleScroll = () => {
    if (!trackRef.value) return
    dotIndex.value = Math.round(trackRef.value.scrollLeft / trackRef.value.clientWidth)
  }

  const scrollTo = (i: number) => {
    if (!trackRef.value) return
    trackRef.value.scrollTo({ left: trackRef.value.clientWidth * i, behavior: 'smooth' })
    dotIndex.value = i
  }

  const latestDate = computed(() => (items.value as FoodRow[] | null)?.[0]?.latest_price_date)

  onMounted(() => {
    nextTick(() => updatePerPage())
    window.addEventListener('resize', updatePerPage, { passive: true })
  })
  onBeforeUnmount(() => window.removeEventListener('resize', updatePerPage))
</script>

<template>
  <div class="px-4 lg:px-6 flex flex-col gap-4">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <!-- Badge -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100/50 dark:bg-green-900/20 border border-green-500/20 mb-3 shadow-sm">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span class="text-[10px] font-extrabold uppercase tracking-widest text-green-700 dark:text-green-400">
            Market Update
          </span>
        </div>

        <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
          Harga Pangan Terkini
        </h2>
        <p class="text-sm md:text-[15px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-xl">
          Data komoditas pertanian daerah istimewa
          <span v-if="latestDate"> (Update terakhir: {{ formatShortDate(latestDate) }})</span>
        </p>
      </div>

      <NuxtLink
        to="/food-prices"
        class="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold text-green-600 dark:text-green-400 border border-green-600/30 dark:border-green-400/30 rounded-full no-underline hover:bg-green-600/8 hover:border-green-600/55 transition-all duration-200 shrink-0 self-start md:self-auto"
      >
        Semua Komoditas
        <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
      </NuxtLink>
    </div>

    <!-- Loading skeleton -->
    <div v-if="pending" class="flex gap-3 overflow-hidden">
      <div
        v-for="i in 4"
        :key="i"
        class="flex-none w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] aspect-square rounded-sm bg-white/10 animate-pulse"
      />
    </div>

    <!-- Carousel -->
    <template v-else-if="(items as FoodRow[] | null)?.length">
      <div
        ref="trackRef"
        class="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
        @scroll.passive="handleScroll"
      >
        <NuxtLink
          v-for="item in (items as FoodRow[])"
          :key="item.id"
          :to="`/food-prices/${item.slug || item.id}`"
          class="relative flex-none snap-start w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] rounded-sm overflow-hidden no-underline group cursor-pointer aspect-square"
        >
          <!-- Background image -->
          <NuxtImg
            v-if="item.image_url"
            :src="item.image_url"
            :alt="item.name"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            width="200"
            height="200"
            decoding="async"
            @error="(e: any) => { (e.target as HTMLImageElement).style.display = 'none' }"
          />

          <!-- Fallback bg if no image -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-emerald-900 to-teal-950"
            :class="item.image_url ? 'opacity-0 group-hover:opacity-0' : 'opacity-100'"
          >
            <div class="flex items-center justify-center w-full h-full">
              <UIcon
                v-if="!item.image_url"
                :name="categoryIcon(item.category || '')"
                class="w-10 h-10 opacity-30"
                :class="categoryAccent(item.category || '')"
              />
            </div>
          </div>

          <!-- Gradient scrim -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <!-- Category badge -->
          <div
            v-if="item.category"
            class="absolute top-2 left-2 z-10 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white bg-green-600/80 backdrop-blur-sm"
          >
            {{ item.category }}
          </div>

          <!-- Info overlay -->
          <div class="absolute inset-x-0 bottom-0 z-10 p-3 flex flex-col gap-0.5">
            <p class="text-[12px] font-bold text-white leading-snug line-clamp-1">{{ item.name }}</p>
            <div class="flex items-center gap-1.5">
              <span class="text-[13px] font-extrabold text-green-300">
                {{ formatCurrency(item.latest_price || 0) }}
              </span>
              <span v-if="item.satuan" class="text-[10px] text-white/55">/ {{ item.satuan }}</span>
            </div>
          </div>

          <!-- Hover border glow -->
          <div class="absolute inset-0 rounded-sm border border-transparent group-hover:border-green-400/40 transition-colors duration-300 pointer-events-none" />
        </NuxtLink>
      </div>

      <!-- Dots -->
      <div v-if="dotCount > 1" class="flex items-center justify-center gap-1.5 mt-2">
        <button
          v-for="(_, i) in dotCount"
          :key="i"
          :aria-label="`Halaman ${i + 1}`"
          class="h-1.5 rounded-full border-none cursor-pointer transition-all duration-300"
          :class="i === dotIndex ? 'w-6 bg-green-500' : 'w-1.5 bg-gray-400/50 hover:bg-green-400'"
          @click="scrollTo(i)"
        />
      </div>
    </template>

    <!-- Empty -->
    <div v-else class="flex flex-col items-center justify-center py-10 border border-dashed border-white/20 rounded-lg">
      <UIcon name="i-lucide-package-open" class="w-8 h-8 text-gray-400 dark:text-gray-600" />
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Belum ada data harga pangan</p>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
