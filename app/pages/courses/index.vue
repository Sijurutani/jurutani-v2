<script setup lang="ts">

  import { Enum } from '~/utils/enum'
  import type { Database } from '~/types/database.types'

  useSeoMeta({
    title: 'Kursus & Pelatihan Pertanian, Peternakan Online',
    description: 'Belajar budidaya tanaman, ternak & perikanan gratis bersama ahlinya. Ikuti kursus pertanian organik dan panduan agribisnis modern khusus untuk pemula.'
  })

  type LearningCourse = Database['public']['Tables']['learning_courses']['Row']
  type Category = { id: string; name: string; slug?: string }

  const supabase = useSupabaseClient()
  const pageSize = 9

  // 1. Reactive Route Queries
  const route = useRoute()
  const router = useRouter()

  const search = ref<string | undefined>((route.query.search as string) || undefined)
  const category = ref<string>((route.query.category as string) || 'all')
  const sortValue = ref<string>((route.query.sort as string) || 'published_at-desc')
  const page = ref<number>(Number(route.query.page) || 1)

  watch([search, category, sortValue, page], ([newSearch, newCategory, newSort, newPage]) => {
    router.replace({
      query: {
        ...route.query,
        search: newSearch || undefined,
        category: newCategory === 'all' ? undefined : newCategory,
        sort: newSort === 'published_at-desc' ? undefined : newSort,
        page: newPage === 1 ? undefined : String(newPage),
      }
    })
  })

  // ─── Kategori unik dari data yang ada ────────────────────────────────────────
  const { data: categories } = await useAsyncData(
    'courses-public-categories',
    async () => {
      const { data } = await supabase
        .from('learning_courses')
        .select('category')
        .eq('status', 'approved')
        .is('deleted_at', null)
        .is('archived_at', null)
        .not('category', 'is', null)

      // Dedupe dan bentuk ke format Category
      const unique = [
        ...new Set((data ?? []).map((r: any) => r.category).filter(Boolean)),
      ]
      return unique.map((name: string, i: number) => ({
        id: String(i),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        slug: name,
      })) as Category[]
    },
    { default: () => [] as Category[] },
  )

  // 2. Computed Query Builder
  const coursesQuery = computed(() => {
    const [field, dir] = sortValue.value.split('-') as [string, string]
    const dbField = field === 'name' ? 'title' : field

    let q = supabase
      .from('learning_courses')
      .select(
        'id,slug,title,description,cover_image,category,status,published_at,created_at,updated_at',
        { count: 'exact' },
      )
      .eq('status', 'approved')
      .is('deleted_at', null)
      .is('archived_at', null)

    if (
      category.value &&
      category.value !== 'all' &&
      category.value !== 'semua'
    ) {
      q = q.eq('category', category.value)
    }

    if (search.value) {
      const term = search.value.trim()
      q = q.ilike('title', `%${term}%`)
    }

    return q.order(dbField, { ascending: dir === 'asc' })
  })

  // 3. Fetch Data
  const { data, pending, error, refresh } = await useAsyncData(
    'courses-public-list',
    async () => {
      const from = (page.value - 1) * pageSize
      const to = page.value * pageSize - 1

      const {
        data: coursesData,
        count,
        error: fetchError,
      } = await coursesQuery.value.range(from, to)

      if (fetchError) throw fetchError

      return {
        items: (coursesData as any[]) || [],
        total: count || 0,
      }
    },
    {
      default: () => ({ items: [], total: 0 }),
      watch: [sortValue, page],
    },
  )

  // 4. Debounce Search & Category
  let searchTimeout: ReturnType<typeof setTimeout>
  watch([search, category], () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      page.value = 1
      await refresh()
    }, 400)
  }, { deep: true })

  // 5. Helper Computed & Functions
  const sortOptions = Enum.SortOptions.map((option) => {
    const [rawColumn, direction] = option.value.split('-')
    return {
      label: option.label,
      value: option.value,
      column: rawColumn === 'name' ? 'title' : rawColumn,
      ascending: direction === 'asc',
    }
  })

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
  <main class="courses-page container mx-auto px-4 py-12">
    <header class="mx-auto mb-8 max-w-4xl text-center">
      <div
        class="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-linear-to-r from-amber-100 to-emerald-100 dark:from-amber-900/20 dark:to-emerald-900/20 rounded-full"
      >
        <UIcon
          name="i-lucide-graduation-cap"
          class="w-5 h-5 text-amber-600 dark:text-amber-400"
        />
        <span class="text-sm font-medium text-amber-700 dark:text-amber-300"
          >Kursus JuruTani</span
        >
      </div>

      <h1
        class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-linear-to-r from-amber-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent"
      >
        Belajar Pertanian bersama JuruTani
      </h1>

      <p
        class="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8"
      >
        Kumpulan course pertanian terkurasi dari
        <span class="font-semibold text-amber-600 dark:text-amber-400"
          >pakar dan penyuluh</span
        >
        untuk meningkatkan
        <span class="font-semibold text-emerald-600 dark:text-emerald-400"
          >keterampilan</span
        >
        dan
        <span class="font-semibold text-teal-600 dark:text-teal-400"
          >hasil panenmu</span
        >.
      </p>

      <!-- Category filter — pakai AppCategoryFilter dengan data kategori dinamis -->
      <nav aria-label="Filter kategori kursus">
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

    <aside
      class="flex flex-col gap-4 mb-8"
      aria-label="Filter dan pencarian kursus"
    >
      <AppSearchBar
        v-model="search"
        placeholder="Cari kursus, topik, atau keahlian pertanian..."
      />

      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div
          v-if="!pending && hasData"
          class="text-sm text-gray-600 dark:text-gray-400"
        >
          Menampilkan
          <span class="font-semibold text-amber-600 dark:text-amber-400">{{
            data.items.length
          }}</span>
          dari <span class="font-semibold">{{ data.total }}</span> kursus
        </div>
        <AppSortDropdown
          :sort-options="sortOptions"
          :current-sort="sortValue"
          @update:sort="handleSortChange"
        />
      </div>
    </aside>

    <section aria-labelledby="courses-list-heading" class="mt-8">
      <h2 id="courses-list-heading" class="sr-only">
        Daftar Kursus Pertanian JuruTani
      </h2>

      <UiLoadingData v-if="pending" />
      <UiErrorData v-else-if="error" :error="error.message" />
      <UiNotFoundData v-else-if="!hasData" />

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-auto grid-flow-row-dense"
      >
        <FeaturesCourseLessonCard
          v-for="(course, index) in data.items"
          :key="course.id"
          :course="course"
          :variant="getBentoVariant(index, data.items.length)"
        />
      </div>
    </section>

    <nav aria-label="Navigasi halaman kursus">
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

    <UiButtonCreate />
  </main>
</template>
