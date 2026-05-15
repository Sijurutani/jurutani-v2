<script setup lang="ts">

  import type { JSONContent } from '@tiptap/vue-3'
  import type { Database } from '~/types/database.types'
  import { Enum } from '~/utils/enum'

  definePageMeta({
    layout: 'default',
  })

  useSeoMeta({
    title: 'Marketplace Pertanian — Jual Beli Hasil Panen & Saprotan',
    description: 'Jual beli hasil panen, bibit unggul, pakan ternak & alat pertanian online. Transaksi aman langsung dari produsen terpercaya di marketplace JuruTani.'
  })

  // ─── Types ─────────────────────────────────────────────────────────────────────
  type ProductMarketRow = Database['public']['Tables']['product_markets']['Row']
  type CategoryMarketsRow =
    Database['public']['Tables']['category_markets']['Row']

  interface MarketAttachment {
    name: string
    url: string
    size?: number
    type?: string
  }

  interface MarketLink {
    shopee_link?: string
    tokopedia_link?: string
    tiktok_link?: string
    other_link?: string
  }

  type ProductMarket = Omit<
    ProductMarketRow,
    'content' | 'images' | 'attachments' | 'links'
  > & {
    content: JSONContent
    images: string[]
    attachments: MarketAttachment[]
    links: MarketLink[]
    profiles?: {
      id: string
      full_name: string | null
      avatar_url: string | null
    } | null
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────────
  const normalizeStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === 'string')
  }

  const normalizeAttachments = (value: unknown): MarketAttachment[] => {
    if (!Array.isArray(value)) return []
    return value
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === 'object',
      )
      .map((item) => ({
        name: typeof item.name === 'string' ? item.name : 'Lampiran',
        url: typeof item.url === 'string' ? item.url : '',
        size: typeof item.size === 'number' ? item.size : undefined,
        type: typeof item.type === 'string' ? item.type : undefined,
      }))
      .filter((item) => !!item.url)
  }

  const normalizeLinks = (value: unknown): MarketLink[] => {
    if (!Array.isArray(value)) return []
    return value
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === 'object',
      )
      .map((item) => ({
        shopee_link:
          typeof item.shopee_link === 'string' ? item.shopee_link : undefined,
        tokopedia_link:
          typeof item.tokopedia_link === 'string'
            ? item.tokopedia_link
            : undefined,
        tiktok_link:
          typeof item.tiktok_link === 'string' ? item.tiktok_link : undefined,
        other_link:
          typeof item.other_link === 'string' ? item.other_link : undefined,
      }))
  }

  // ─── Setup ─────────────────────────────────────────────────────────────────────
  const supabase = useSupabaseClient()
  const pageSize = 12

  // ─── Reactive Route Queries ────────────────────────────────────────────────────
  const route = useRoute()
  const router = useRouter()

  const search = ref<string>((route.query.search as string) || '')
  const category = ref<string>((route.query.category as string) || 'all')
  const sortValue = ref<string>((route.query.sort as string) || 'created_at-desc')
  const page = ref<number>(Number(route.query.page) || 1)

  watch([search, category, sortValue, page], ([newSearch, newCategory, newSort, newPage]) => {
    router.replace({
      query: {
        ...route.query,
        search: newSearch || undefined,
        category: newCategory === 'all' ? undefined : newCategory,
        sort: newSort === 'created_at-desc' ? undefined : newSort,
        page: newPage === 1 ? undefined : String(newPage),
      }
    })
  })

  // ─── Data Kategori ─────────────────────────────────────────────────────────────
  const { data: categoriesData } = await useAsyncData(
    'market-public-categories',
    async () => {
      const { data } = await supabase
        .from('category_markets')
        .select('*')
        .order('name', { ascending: true })
      return (data ?? []) as CategoryMarketsRow[]
    },
    { default: () => [] as CategoryMarketsRow[] },
  )

  const categories = computed(() =>
    (categoriesData.value ?? []).map((cat) => ({
      name: cat.name,
      value: cat.name,
    })),
  )

  // ─── Computed Query Builder ────────────────────────────────────────────────────
  const marketQuery = computed(() => {
    const [field, dir] = sortValue.value.split('-') as [string, string]
    const dbField = field === 'title' ? 'name' : field

    let q = supabase
      .from('product_markets')
      .select(
        'id,name,slug,excerpt,content,category,price,price_range,price_unit,thumbnail_url,images,attachments,links,seller,contact_seller,created_at',
        { count: 'exact' },
      )
      .is('deleted_at', null)
      .eq('status', 'approved')

    if (
      category.value &&
      category.value !== 'all' &&
      category.value !== 'semua'
    ) {
      q = q.eq('category', category.value)
    }

    if (search.value && search.value.trim()) {
      const term = search.value.trim()
      q = q.or(
        `name.ilike.%${term}%,excerpt.ilike.%${term}%,seller.ilike.%${term}%`,
      )
    }

    return q.order(dbField, { ascending: dir === 'asc' })
  })

  // ─── Fetch Data ────────────────────────────────────────────────────────────────
  const { data, pending, error, refresh } = await useAsyncData(
    'markets-public-list',
    async () => {
      const from = (page.value - 1) * pageSize
      const to = page.value * pageSize - 1

      const {
        data: marketsData,
        count,
        error: fetchError,
      } = await marketQuery.value.range(from, to)
      if (fetchError) throw fetchError

      const items = (marketsData ?? []).map((item) => ({
        ...item,
        content: item.content as JSONContent,
        images: normalizeStringArray(item.images),
        attachments: normalizeAttachments(item.attachments),
        links: normalizeLinks(item.links),
      })) as ProductMarket[]

      return { items, total: count || 0 }
    },
    {
      default: () => ({ items: [] as ProductMarket[], total: 0 }),
      watch: [sortValue, page],
    },
  )

  // ─── Debounce Search & Category ───────────────────────────────────────────────
  let searchTimeout: ReturnType<typeof setTimeout>
  watch([search, category], () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      page.value = 1
      await refresh()
    }, 400)
  }, { deep: true })

  // ─── Sort Options ──────────────────────────────────────────────────────────────
  const sortOptions = Enum.SortOptions.map((option) => {
    const [rawColumn, direction] = option.value.split('-')
    return {
      label: option.label,
      value: option.value,
      column: rawColumn === 'name' ? 'name' : rawColumn,
      ascending: direction === 'asc',
    }
  })

  // ─── Computed ─────────────────────────────────────────────────────────────────
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(data.value.total / pageSize)),
  )
  const hasData = computed(() => data.value.items.length > 0)
  const showPagination = computed(
    () => !pending.value && hasData.value && totalPages.value > 1,
  )

  const getBentoVariant = (
    index: number,
    total: number,
  ): 'default' | 'large' | 'wide' => {
    const remainder = total % 3
    if (remainder === 2 && index === total - 2) return 'wide'
    if (remainder === 2 && index === total - 1) return 'default'
    if (remainder === 1 && index === total - 1) return 'wide'
    if (index === 0) return 'large'
    const pattern = (index - 1) % 5
    if (pattern === 3 || pattern === 4) return 'wide'
    return 'default'
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  const handleCategoryChange = (value: string) => {
    category.value = value
  }
  const handleSortChange = (value: string) => {
    sortValue.value = value
  }
  const handlePageChange = (value: number) => {
    page.value = value
  }
</script>

<template>
  <main class="markets-page container mx-auto px-4 py-12">
    <!-- Header -->
    <header class="mx-auto mb-8 max-w-4xl text-center">
      <div
        class="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-linear-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full"
      >
        <UIcon
          name="i-lucide-shopping-bag"
          class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
        />
        <span class="text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >Marketplace Petani Terpercaya</span
        >
      </div>

      <h1
        class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-linear-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent"
      >
        Pasar Tani JuruTani
      </h1>

      <p
        class="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8"
      >
        Jelajahi marketplace produk lokal dengan pilihan lengkap
        <span class="font-semibold text-emerald-600 dark:text-emerald-400"
          >hasil pertanian segar</span
        >,
        <span class="font-semibold text-teal-600 dark:text-teal-400"
          >produk peternakan berkualitas</span
        >, dan
        <span class="font-semibold text-cyan-600 dark:text-cyan-400"
          >olahan artisan</span
        >
        langsung dari petani dan produsen terpercaya.
      </p>

      <nav aria-label="Filter kategori pasar tani">
        <AppCategoryFilter
          :categories="categories"
          :current-category="category"
          :show-all-option="true"
          all-option-text="Semua"
          all-option-value="all"
          @update:category="handleCategoryChange"
        />
      </nav>
    </header>

    <!-- Filter & Sort Bar -->
    <aside
      class="flex flex-col gap-4 mb-8"
      aria-label="Filter dan pencarian produk"
    >
      <AppSearchBar
        v-model="search"
        placeholder="Cari produk, kategori, atau penjual..."
      />

      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div
          v-if="!pending && hasData"
          class="text-sm text-gray-600 dark:text-gray-400"
        >
          Menampilkan
          <span class="font-semibold text-green-600 dark:text-green-400">{{
            data.items.length
          }}</span>
          dari <span class="font-semibold">{{ data.total }}</span> produk
        </div>
        <AppSortDropdown
          :sort-options="sortOptions"
          :current-sort="sortValue"
          @update:sort="handleSortChange"
        />
      </div>
    </aside>

    <!-- Products Grid -->
    <section aria-labelledby="markets-list-heading" class="mt-8">
      <h2 id="markets-list-heading" class="sr-only">
        Daftar Produk Pasar Tani
      </h2>

      <UiLoadingData v-if="pending" />
      <UiErrorData v-else-if="error" :error="error.message" />
      <UiNotFoundData v-else-if="!hasData" />

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-auto grid-flow-row-dense"
      >
        <FeaturesMarketsCard
          v-for="(product, index) in data.items"
          :key="product.id"
          :product="product"
          :variant="getBentoVariant(index, data.items.length)"
        />
      </div>
    </section>

    <!-- Pagination -->
    <nav aria-label="Navigasi halaman pasar tani">
      <AppPagination
        v-if="showPagination"
        :current-page="page"
        :total-pages="totalPages"
        :total-items="data.total"
        :page-size="pageSize"
        :show-page-info="true"
        :show-first-last="true"
        @update:page="handlePageChange"
      />
    </nav>

    <!-- CTA - Jual Produk -->
    <div class="mt-8 flex justify-center">
      <NuxtLink
        to="/markets/create"
        class="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg font-semibold"
      >
        <UIcon name="i-lucide-plus" class="w-5 h-5" />
        Jual Produk Sekarang
      </NuxtLink>
    </div>

    <UiButtonCreate />
  </main>
</template>
