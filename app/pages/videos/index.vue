<script setup lang="ts">

  import { Enum } from '~/utils/enum'
  import type { Database } from '~/types/database.types'

  definePageMeta({
    layout: 'default',
  })

  useSeoMeta({
    title: 'Video Tutorial Pertanian & Peternakan dari Penyuluh Ahli',
    description: 'Tonton video tutorial pertanian, peternakan & perikanan dari ahlinya. Belajar mudah teknik budidaya, merawat ternak, dan strategi panen yang sukses.'
  })

  type VideoRow = Database['public']['Tables']['videos']['Row']
  type CategoryRow = Database['public']['Tables']['category']['Row']

  const supabase = useSupabaseClient()
  const pageSize = 9

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
  const { data: categories } = await useAsyncData(
    'videos-public-categories',
    async () => {
      const { data } = await supabase.from('category').select('*').order('name')
      return (data ?? []) as CategoryRow[]
    },
    { default: () => [] as CategoryRow[] },
  )

  // ─── Computed Query Builder ────────────────────────────────────────────────────
  const videoQuery = computed(() => {
    const [field, dir] = sortValue.value.split('-') as [string, string]
    const dbField = field === 'name' ? 'title' : field

    let q = supabase
      .from('videos')
      .select('id,slug,title,description,link_yt,category,created_at', {
        count: 'exact',
      })
      .is('deleted_at', null)

    if (
      category.value &&
      category.value !== 'all' &&
      category.value !== 'semua'
    ) {
      q = q.eq('category', category.value)
    }

    if (search.value && search.value.trim()) {
      const term = search.value.trim()
      q = q.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    }

    return q.order(dbField, { ascending: dir === 'asc' })
  })

  // ─── Fetch Data ────────────────────────────────────────────────────────────────
  const { data, pending, error, refresh } = await useAsyncData(
    'videos-public-list',
    async () => {
      const from = (page.value - 1) * pageSize
      const to = page.value * pageSize - 1

      const {
        data: videoData,
        count,
        error: fetchError,
      } = await videoQuery.value.range(from, to)

      if (fetchError) throw fetchError

      return {
        items: (videoData ?? []) as VideoRow[],
        total: count || 0,
      }
    },
    {
      default: () => ({ items: [], total: 0 }),
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
      column: rawColumn === 'name' ? 'title' : rawColumn,
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
  <main class="video-page container mx-auto px-4 py-12">
    <header class="mx-auto mb-8 max-w-4xl text-center">
      <div
        class="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-linear-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full"
      >
        <UIcon
          name="i-lucide-video"
          class="w-5 h-5 text-green-600 dark:text-green-400"
        />
        <span class="text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >Pembelajaran Visual & Interaktif</span
        >
      </div>

      <h1
        class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-linear-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent"
      >
        Video Edukasi JuruTani
      </h1>

      <p
        class="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8"
      >
        Akses koleksi lengkap video pembelajaran pertanian dengan
        <span class="font-semibold text-emerald-600 dark:text-emerald-400"
          >tutorial praktis</span
        >,
        <span class="font-semibold text-teal-600 dark:text-teal-400"
          >teknik modern</span
        >, dan
        <span class="font-semibold text-cyan-600 dark:text-cyan-400"
          >tips ahli</span
        >
        untuk meningkatkan produktivitas dan keterampilan pertanian Anda.
      </p>

      <nav aria-label="Filter kategori video edukasi">
        <AppCategoryFilter
          :categories="categories"
          :current-category="category"
          :show-all-option="true"
          all-option-text="Semua"
          all-option-value="all"
          name-field="name"
          value-field="name"
          @update:category="handleCategoryChange"
        />
      </nav>
    </header>

    <aside
      class="flex flex-col gap-4 mb-8"
      aria-label="Filter dan pencarian video"
    >
      <AppSearchBar
        v-model="search"
        placeholder="Cari video tutorial, teknik pertanian, atau topik pembelajaran..."
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
          dari <span class="font-semibold">{{ data.total }}</span> video
        </div>
        <AppSortDropdown
          :sort-options="sortOptions"
          :current-sort="sortValue"
          @update:sort="handleSortChange"
        />
      </div>
    </aside>

    <section aria-labelledby="video-list-heading" class="mt-8">
      <h2 id="video-list-heading" class="sr-only">
        Daftar Video Edukasi Pertanian
      </h2>

      <UiLoadingData v-if="pending" />
      <UiErrorData v-else-if="error" :error="error.message" />
      <UiNotFoundData v-else-if="!hasData" />

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-auto grid-flow-row-dense"
      >
        <FeaturesVideoCard
          v-for="(video, index) in data.items"
          :key="video.id"
          :video="video"
          :variant="getBentoVariant(index, data.items.length)"
        />
      </div>
    </section>

    <nav aria-label="Navigasi halaman video edukasi">
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
  </main>
</template>
