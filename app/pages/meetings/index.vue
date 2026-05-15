<script setup lang="ts">

  import { Enum } from '~/utils/enum'
  import type { Database } from '~/types/database.types'
  import { parseEmbeds } from '~/utils/embed'

  useSeoMeta({
    title: 'Jadwal Webinar & Pertemuan Penyuluhan Pertanian',
    description: 'Ikuti ragam webinar & pelatihan penyuluhan pertanian rutin bersama pakar Polbangtan. Daftar sekarang secara gratis guna meningkatkan wawasan agribisnis.'
  })

  type MeetingRow = Database['public']['Tables']['meeting_schedules']['Row']

  const supabase = useSupabaseClient()
  const pageSize = 9

  // 1. Reactive Route Queries
  const route = useRoute()
  const router = useRouter()

  const search = ref<string | undefined>((route.query.search as string) || undefined)
  const sortValue = ref<string>((route.query.sort as string) || 'created_at-desc')
  const page = ref<number>(Number(route.query.page) || 1)

  watch([search, sortValue, page], ([newSearch, newSort, newPage]) => {
    router.replace({
      query: {
        ...route.query,
        search: newSearch || undefined,
        sort: newSort === 'created_at-desc' ? undefined : newSort,
        page: newPage === 1 ? undefined : String(newPage),
      }
    })
  })

  // 2. Computed Query Builder
  const meetingsQuery = computed(() => {
    const [field, dir] = sortValue.value.split('-') as [string, string]
    const dbField = field === 'name' ? 'title' : field

    let q = supabase
      .from('meeting_schedules')
      .select('id,title,content,embeds,created_at,updated_at', {
        count: 'exact',
      })
      .is('deleted_at', null)
      .is('archived_at', null)

    if (search.value) {
      const term = search.value.trim()
      q = q.or(`title.ilike.%${term}%,content.ilike.%${term}%`)
    }

    return q.order(dbField, { ascending: dir === 'asc' })
  })

  // 3. Fetch Data
  const { data, pending, error, refresh } = await useAsyncData(
    'meetings-public-list',
    async () => {
      const from = (page.value - 1) * pageSize
      const to = page.value * pageSize - 1

      const {
        data: meetingsData,
        count,
        error: fetchError,
      } = await meetingsQuery.value.range(from, to)

      if (fetchError) throw fetchError

      return {
        items: (meetingsData as any[]) || [],
        total: count || 0,
      }
    },
    {
      default: () => ({ items: [], total: 0 }),
      watch: [sortValue, page],
    },
  )

  // 4. Debounce Search
  let searchTimeout: ReturnType<typeof setTimeout>
  watch(search, () => {
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

  const handleSortChange = (value: string) => {
    sortValue.value = value
  }

  const handlePageChange = (value: number) => {
    page.value = value
  }
</script>

<template>
  <main class="meetings-page container mx-auto px-4 py-12">
    <header class="mx-auto mb-8 max-w-4xl text-center">
      <div
        class="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-linear-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full"
      >
        <UIcon
          name="i-lucide-calendar-range"
          class="w-5 h-5 text-green-600 dark:text-green-400"
        />
        <span class="text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >Jadwal Kegiatan JuruTani</span
        >
      </div>

      <h1
        class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-linear-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent py-2"
      >
        Meetings & Webinar
      </h1>

      <p
        class="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto"
      >
        Ikuti berbagai kegiatan
        <span class="font-semibold text-emerald-600 dark:text-emerald-400"
          >online dan offline</span
        >
        seputar pertanian, penyuluhan, dan
        <span class="font-semibold text-teal-600 dark:text-teal-400"
          >pelatihan</span
        >
        yang diselenggarakan JuruTani.
      </p>
    </header>

    <aside
      class="flex flex-col gap-4 mb-8"
      aria-label="Filter dan pencarian meetings"
    >
      <AppSearchBar
        v-model="search"
        placeholder="Cari meeting, webinar, atau kegiatan pertanian..."
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
          dari <span class="font-semibold">{{ data.total }}</span> kegiatan
        </div>
        <AppSortDropdown
          :sort-options="sortOptions"
          :current-sort="sortValue"
          @update:sort="handleSortChange"
        />
      </div>
    </aside>

    <section aria-labelledby="meetings-list-heading" class="mt-8">
      <h2 id="meetings-list-heading" class="sr-only">
        Daftar Meetings & Webinar JuruTani
      </h2>

      <UiLoadingData v-if="pending" />
      <UiErrorData v-else-if="error" :error="error.message" />
      <UiNotFoundData v-else-if="!hasData" />

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-auto grid-flow-row-dense"
      >
        <FeaturesMeetingCard
          v-for="(meeting, index) in data.items"
          :key="meeting.id"
          :meeting="meeting"
          :variant="getBentoVariant(index, data.items.length)"
        />
      </div>
    </section>

    <nav aria-label="Navigasi halaman meetings">
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
