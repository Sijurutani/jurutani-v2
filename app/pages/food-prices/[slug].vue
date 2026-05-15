<script setup lang="ts">
  import type { Database } from '~/types/database.types'
  import { formatCurrency } from '~/utils/currency'
  import { Enum } from '~/utils/enum'
  import { getFoodPublicUrl } from '~/utils/storage'
  import { useRoute, useRouter, useSupabaseClient } from '#imports'

  definePageMeta({
    layout: 'default',
  })

  const route = useRoute()
  const router = useRouter()
  const slug = route.params.slug as string

  // --- Food Price Utilities ---
  const supabase = useSupabaseClient<Database>()
  type FoodRow = Database['public']['Tables']['foods']['Row'] & {
    latest_price?: number
    latest_price_date?: string
    price_change?: number
    price_change_percent?: number
  }
  type FoodPriceTrend = {
    date: string
    price: number
    price_change?: number
    price_change_percent?: number
  }
  type FoodWithPrice = FoodRow

  const getFoodBySlug = async (slug: string) => {
    // Ambil food by slug
    const { data: foods, error: foodErr } = await supabase
      .from('foods')
      .select(
        'id,name,category,satuan,slug,description,specifications,tags,updated_at,image_url',
      )
      .eq('slug', slug)
      .is('deleted_at', null)
    if (foodErr) return { data: null, error: foodErr }
    const food = foods?.[0]
    if (!food) return { data: null, error: null }

    // Harga terbaru dan sebelumnya
    const { data: prices, error: priceErr } = await supabase
      .from('food_prices')
      .select('price,date')
      .eq('food_id', food.id)
      .is('deleted_at', null)
      .order('date', { ascending: false })
    if (priceErr) return { data: null, error: priceErr }
    const latest = prices?.[0]
    const prev = prices?.[1]
    let price_change = 0
    let price_change_percent = 0
    if (latest && prev) {
      price_change = latest.price - prev.price
      price_change_percent = prev.price ? (price_change / prev.price) * 100 : 0
    }
    return {
      data: {
        ...food,
        latest_price: latest?.price ?? 0,
        latest_price_date: latest?.date ?? food.updated_at ?? null,
        price_change,
        price_change_percent,
      },
      error: null,
    }
  }

  const getPriceTrend = async (foodId: string, days: number) => {
    // Ambil tren harga N hari terakhir
    const since = new Date()
    since.setDate(since.getDate() - days)
    const { data: prices, error } = await supabase
      .from('food_prices')
      .select('price,date')
      .eq('food_id', foodId)
      .is('deleted_at', null)
      .gte('date', since.toISOString().slice(0, 10))
      .order('date', { ascending: false })
    if (error) return { data: [], error }
    // Hitung perubahan harian
    const trend: FoodPriceTrend[] = (prices || []).map((p, i, arr) => {
      const prev = arr[i + 1]
      let price_change = 0
      let price_change_percent = 0
      if (prev) {
        price_change = p.price - prev.price
        price_change_percent = prev.price
          ? (price_change / prev.price) * 100
          : 0
      }
      return {
        date: p.date,
        price: p.price,
        price_change,
        price_change_percent,
      }
    })
    return { data: trend, error: null }
  }

  const getSimilarFoods = async (
    category: string,
    excludeId: string,
    limit: number,
  ) => {
    // Ambil food lain di kategori sama
    const { data: foods, error } = await supabase
      .from('foods')
      .select(
        'id,name,category,satuan,slug,description,specifications,tags,updated_at,image_url',
      )
      .eq('category', category)
      .neq('id', excludeId)
      .is('deleted_at', null)
      .limit(limit)
    if (error) return { data: [], error }
    // Ambil harga terbaru untuk similar foods
    const ids = (foods || []).map((f) => f.id)
    const { data: prices } = await supabase
      .from('food_prices')
      .select('food_id,price,date')
      .in('food_id', ids)
      .is('deleted_at', null)
      .order('date', { ascending: false })
    const foodsWithPrice = (foods || []).map((food) => {
      const priceEntry = prices?.find((p) => p.food_id === food.id)
      return {
        ...food,
        latest_price: priceEntry?.price ?? 0,
        latest_price_date: priceEntry?.date ?? food.updated_at ?? null,
      } as unknown as FoodWithPrice
    })
    return { data: foodsWithPrice, error: null }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
    } catch {
      return ''
    }
  }

  const getCategoryIcon = (categoryValue: string) => {
    const icons: Record<string, string> = {
      hortikultura: 'i-lucide-leaf',
      perkebunan: 'i-lucide-tree-deciduous',
      peternakan: 'i-lucide-beef',
      perikanan: 'i-lucide-fish',
    }
    return icons[categoryValue] || 'i-lucide-package'
  }

  const getCategoryLabel = (categoryValue: string) => {
    const found = Enum.FoodPriceCategories.find(
      (cat) => cat.value === categoryValue,
    )
    return found ? found.label : categoryValue
  }

  // Fallback image/icon logic
  const getFoodImage = (imageUrl: string | null | undefined) => {
    if (!imageUrl || imageUrl.trim() === '') return ''
    return getFoodPublicUrl(imageUrl) || ''
  }

  const {
    data: routeData,
    pending: loading,
    error,
  } = await useAsyncData(`food-public-detail-${slug}`, async () => {
    const { data: foodData, error: fetchError } = await getFoodBySlug(slug)

    if (fetchError || !foodData) {
      throw fetchError || new Error('Food not found')
    }

    let trendData: FoodPriceTrend[] = []
    let similarData: FoodWithPrice[] = []

    if (foodData.id) {
      const { data: trend } = await getPriceTrend(foodData.id, 30)
      if (trend) trendData = trend

      const { data: similar } = await getSimilarFoods(
        foodData.category,
        foodData.id,
        4,
      )
      if (similar) similarData = similar
    }

    return { food: foodData, priceTrend: trendData, similarFoods: similarData }
  })

  if (error.value || !routeData.value?.food) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Komoditas tidak ditemukan',
    })
  }

  const food = computed(() => routeData.value?.food || null)
  const priceTrend = computed(() => routeData.value?.priceTrend || [])
  const similarFoods = computed(() => routeData.value?.similarFoods || [])

  // UI State
  const foodImageError = ref(false)
  const handleImageError = () => {
    foodImageError.value = true
  }

  // Price trend chart data (computed)
  const chartData = computed(() => {
    if (!priceTrend.value || priceTrend.value.length === 0) return null

    return {
      labels: priceTrend.value.map((p) => formatDate(p.date)).reverse(),
      datasets: [
        {
          label: 'Harga',
          data: priceTrend.value.map((p) => p.price).reverse(),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
      ],
    }
  })

  // Price change badge
  const priceChangeBadge = computed(() => {
    if (!food.value || !food.value.price_change) {
      return {
        color: 'neutral' as const,
        label: 'Tidak ada perubahan',
        icon: 'i-lucide-minus',
      }
    }

    const change = food.value.price_change
    const percent = food.value.price_change_percent || 0

    if (change > 0) {
      return {
        color: 'error' as const,
        label: `Naik ${Math.abs(percent).toFixed(1)}%`,
        icon: 'i-lucide-trending-up',
      }
    } else if (change < 0) {
      return {
        color: 'success' as const,
        label: `Turun ${Math.abs(percent).toFixed(1)}%`,
        icon: 'i-lucide-trending-down',
      }
    }

    return {
      color: 'neutral' as const,
      label: 'Stabil',
      icon: 'i-lucide-minus',
    }
  })

  // Load images on client side

  // SEO
  const { formatCurrency: fmt } = { formatCurrency }
  useSeoMeta({
    title: food.value?.name || 'Komoditas',
    description:
      food.value?.description ||
      `Harga ${food.value?.name} terkini per ${food.value?.satuan} di DIY.`,
    ogImage: getFoodImage(food.value?.image_url) || undefined,
    ogType: 'article',
  })
  useHead({
    title: computed(() =>
      food.value ? `${food.value.name} - Harga Pangan DIY` : 'Memuat...',
    ),
    meta: computed(() => [
      {
        name: 'description',
        content: food.value
          ? `Harga ${food.value.name} terkini: ${formatCurrency(food.value.latest_price || 0)} per ${food.value.satuan}. ${food.value.description || ''}`
          : 'Informasi harga pangan DIY',
      },
    ]),
  })
</script>

<template>
  <div class="food-price-detail-page container mx-auto px-4 py-12">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 dark:border-emerald-800 dark:border-t-emerald-400"
      />
      <p class="mt-4 text-gray-600 dark:text-gray-400">
        Memuat data komoditas...
      </p>
    </div>

    <!-- Content -->
    <template v-else-if="food">
      <!-- Breadcrumb -->
      <nav
        class="mb-8 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
      >
        <NuxtLink
          to="/"
          class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <UIcon name="i-lucide-home" class="w-4 h-4" />
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
        <NuxtLink
          to="/food-prices"
          class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <UIcon name="i-lucide-bar-chart-2" class="w-4 h-4" />
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
        <span class="text-gray-900 dark:text-white font-medium">{{
          food.name
        }}</span>
      </nav>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <!-- Left: Product Image & Price Card -->
        <div class="lg:col-span-1">
          <div class="sticky top-24">
            <!-- Product Image -->
            <div
              class="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square mb-6"
            >
              <NuxtImg
                v-if="!foodImageError && getFoodImage(food.image_url)"
                :src="getFoodImage(food.image_url)"
                :alt="food.name"
                class="w-full h-full object-cover transition-opacity duration-300"
                @error="handleImageError"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
              >
                <UIcon
                  :name="getCategoryIcon(food.category)"
                  class="w-24 h-24 text-gray-400"
                />
              </div>
              <div class="absolute top-4 right-4">
                <UBadge
                  :color="priceChangeBadge.color"
                  variant="solid"
                  size="lg"
                  class="shadow-lg"
                >
                  <div class="flex items-center gap-1">
                    <UIcon :name="priceChangeBadge.icon" class="w-4 h-4" />
                    {{ priceChangeBadge.label }}
                  </div>
                </UBadge>
              </div>
            </div>

            <!-- Price Card -->
            <div
              class="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 mb-4 border border-emerald-200 dark:border-emerald-800"
            >
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Harga Terkini
              </div>
              <div
                class="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1"
              >
                {{ formatCurrency(food.latest_price || 0) }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-500 mb-3">
                per {{ food.satuan }}
              </div>

              <div
                v-if="food.latest_price_date"
                class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"
              >
                <UIcon name="i-lucide-clock" class="w-3 h-3" />
                Update: {{ formatDate(food.latest_price_date) }}
              </div>
            </div>

            <!-- Back Button -->
            <UButton
              color="primary"
              variant="outline"
              size="lg"
              block
              icon="i-lucide-arrow-left"
              @click="router.push('/food-prices')"
            >
              Kembali ke Daftar
            </UButton>

            <!-- Info Notice -->
            <div
              class="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
            >
              <div class="flex gap-3">
                <UIcon
                  name="i-lucide-info"
                  class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                />
                <div class="text-sm text-amber-800 dark:text-amber-300">
                  <strong>Catatan:</strong> Harga di atas adalah harga rata-rata
                  pasar. Untuk informasi lebih detail, silakan hubungi dinas
                  terkait.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Product Details -->
        <div class="lg:col-span-2">
          <!-- Product Header -->
          <div class="mb-6">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center"
              >
                <UIcon
                  :name="getCategoryIcon(food.category)"
                  class="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <UBadge color="primary" variant="subtle" size="lg">
                {{ getCategoryLabel(food.category) }}
              </UBadge>
            </div>

            <h1
              class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {{ food.name }}
            </h1>

            <p
              v-if="food.description"
              class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              {{ food.description }}
            </p>
          </div>

          <!-- Product Information Table -->
          <div
            class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
          >
            <div
              class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4"
            >
              <h2
                class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"
              >
                <UIcon
                  name="i-lucide-info"
                  class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                />
                Informasi Komoditas
              </h2>
            </div>

            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              <div class="px-6 py-4 grid grid-cols-3 gap-4">
                <div
                  class="col-span-1 text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Kategori
                </div>
                <div
                  class="col-span-2 text-sm text-gray-900 dark:text-white font-medium"
                >
                  {{ getCategoryLabel(food.category) }}
                </div>
              </div>

              <div class="px-6 py-4 grid grid-cols-3 gap-4">
                <div
                  class="col-span-1 text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Harga Terkini
                </div>
                <div
                  class="col-span-2 text-sm text-emerald-600 dark:text-emerald-400 font-bold"
                >
                  {{ formatCurrency(food.latest_price || 0) }}
                </div>
              </div>

              <div class="px-6 py-4 grid grid-cols-3 gap-4">
                <div
                  class="col-span-1 text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Satuan
                </div>
                <div class="col-span-2 text-sm text-gray-900 dark:text-white">
                  {{ food.satuan }}
                </div>
              </div>

              <div
                v-if="food.price_change"
                class="px-6 py-4 grid grid-cols-3 gap-4"
              >
                <div
                  class="col-span-1 text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Perubahan Harga
                </div>
                <div class="col-span-2">
                  <div class="flex items-center gap-2">
                    <UBadge :color="priceChangeBadge.color" variant="subtle">
                      <div class="flex items-center gap-1">
                        <UIcon :name="priceChangeBadge.icon" class="w-3 h-3" />
                        {{ priceChangeBadge.label }}
                      </div>
                    </UBadge>
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ food.price_change > 0 ? '+' : ''
                      }}{{ formatCurrency(food.price_change) }}
                    </span>
                  </div>
                </div>
              </div>

              <div
                v-if="food.specifications"
                class="px-6 py-4 grid grid-cols-3 gap-4"
              >
                <div
                  class="col-span-1 text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Spesifikasi
                </div>
                <div
                  class="col-span-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                >
                  {{ food.specifications }}
                </div>
              </div>

              <div
                v-if="food.tags && food.tags.length > 0"
                class="px-6 py-4 grid grid-cols-3 gap-4"
              >
                <div
                  class="col-span-1 text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Tags
                </div>
                <div class="col-span-2 flex flex-wrap gap-2">
                  <UBadge
                    v-for="tag in food.tags"
                    :key="tag"
                    color="neutral"
                    variant="subtle"
                    size="sm"
                  >
                    {{ tag }}
                  </UBadge>
                </div>
              </div>
            </div>
          </div>

          <!-- Price Trend Chart (if data available) -->
          <div
            v-if="priceTrend.length > 0"
            class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
          >
            <div
              class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4"
            >
              <h2
                class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"
              >
                <UIcon
                  name="i-lucide-trending-up"
                  class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                />
                Tren Harga (30 Hari Terakhir)
              </h2>
            </div>

            <div class="p-6">
              <div class="space-y-2">
                <div
                  v-for="(trend, index) in priceTrend.slice(0, 10)"
                  :key="index"
                  class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{
                    formatDate(trend.date)
                  }}</span>
                  <div class="flex items-center gap-3">
                    <span class="font-semibold text-gray-900 dark:text-white">{{
                      formatCurrency(trend.price)
                    }}</span>
                    <span
                      v-if="trend.price_change"
                      :class="[
                        'text-xs font-medium',
                        trend.price_change > 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400',
                      ]"
                    >
                      {{ trend.price_change > 0 ? '+' : ''
                      }}{{ trend.price_change_percent?.toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Similar Foods -->
      <div v-if="similarFoods.length > 0" class="mt-16">
        <div class="flex items-center justify-between mb-8">
          <h2
            class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
          >
            Komoditas Serupa
          </h2>
          <NuxtLink
            :to="`/food-prices?category=${food.category}`"
            class="text-emerald-600 dark:text-emerald-400 hover:underline text-sm font-medium flex items-center gap-1"
          >
            Lihat Semua
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="item in similarFoods"
            :key="item.id"
            :to="`/food-prices/${item.slug}`"
            class="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300"
          >
            <div
              class="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden"
            >
              <NuxtImg
                v-if="getFoodImage(item.image_url)"
                :src="getFoodImage(item.image_url)"
                :alt="item.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                @error="
                  (e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }
                "
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
              >
                <UIcon
                  :name="getCategoryIcon(item.category)"
                  class="w-16 h-16 text-gray-400"
                />
              </div>
              <div v-if="item.price_change" class="absolute top-2 right-2">
                <UBadge
                  :color="item.price_change > 0 ? 'error' : 'success'"
                  variant="solid"
                  size="xs"
                  class="shadow-md"
                >
                  <div class="flex items-center gap-1">
                    <UIcon
                      :name="
                        item.price_change > 0
                          ? 'i-lucide-trending-up'
                          : 'i-lucide-trending-down'
                      "
                      class="w-3 h-3"
                    />
                    {{ item.price_change > 0 ? '+' : ''
                    }}{{ Math.abs(item.price_change_percent || 0).toFixed(1) }}%
                  </div>
                </UBadge>
              </div>
            </div>
            <div class="p-4">
              <h3
                class="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
              >
                {{ item.name }}
              </h3>
              <div
                class="text-lg font-bold text-emerald-600 dark:text-emerald-400"
              >
                {{ formatCurrency(item.latest_price || 0) }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                per {{ item.satuan }}
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>
