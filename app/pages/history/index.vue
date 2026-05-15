<script setup lang="ts">

  import type { SortOption } from '~/types/content'
  import { toastStore } from '~/composables/useJuruTaniToast'
  import { Enum } from '~/utils/enum'

  useSeoMeta({
    title: 'Riwayat Aktivitas',
    description: 'Lihat ringkasan riwayat interaksi, aktivitas kursus, konsultasi & transaksi Anda. Pantau terus seluruh perjalanan Anda bersama platform digital JuruTani.'
  })

  type HistoryType = 'news' | 'markets'
  type HistoryFilter = 'all' | HistoryType

  interface HistoryItem {
    id: string
    title: string
    created_at: string
    status: string
    type: HistoryType
    typeLabel: string
    route: string
    imageUrl: string
  }

  const supabase = useSupabaseClient()
  const pageSize = 10

  const route = useRoute()
  const router = useRouter()

  const filter = ref<HistoryFilter>((route.query.filter as HistoryFilter) || 'all')
  const search = ref<string | undefined>((route.query.search as string) || undefined)
  const sort = ref<string>((route.query.sort as string) || 'created_at-desc')
  const page = ref<number>(Number(route.query.page) || 1)

  watch([filter, search, sort, page], ([newFilter, newSearch, newSort, newPage]) => {
    router.replace({
      query: {
        ...route.query,
        filter: newFilter === 'all' ? undefined : String(newFilter),
        search: newSearch || undefined,
        sort: newSort === 'created_at-desc' ? undefined : String(newSort),
        page: newPage === 1 ? undefined : String(newPage),
      }
    })
  })

  const filterLabels: Record<HistoryFilter, string> = {
    all: 'Semua',
    news: 'Berita',
    markets: 'Pasar',
  }

  const statusColorMap: Record<
    string,
    'success' | 'warning' | 'error' | 'neutral'
  > = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    neutral: 'neutral',
  }

  const sortOptions: SortOption[] = Enum.SortOptions.map((option) => {
    const [rawColumn, direction] = option.value.split('-')
    return {
      label: option.label,
      value: option.value,
      column: rawColumn === 'name' ? 'name' : rawColumn,
      ascending: direction === 'asc',
    }
  })

  const normalizeImages = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === 'string')
  }

  const getNewsImageUrl = (imagePath?: string | null) => {
    if (!imagePath) return '/placeholder.webp'
    if (imagePath.startsWith('http')) return imagePath
    const { data } = supabase.storage
      .from('news-images')
      .getPublicUrl(imagePath)
    return data?.publicUrl || '/placeholder.webp'
  }

  const getMarketImageUrl = (thumbnailUrl: string | null, images: unknown) => {
    const imagePath = thumbnailUrl || normalizeImages(images)[0]
    if (!imagePath) return '/product.webp'
    if (imagePath.startsWith('http')) return imagePath
    const { data } = supabase.storage
      .from('product-markets-images')
      .getPublicUrl(imagePath)
    return data?.publicUrl || '/product.webp'
  }

  const getStatusInfo = (status: string, type: HistoryType) => {
    const normalizedStatus = status?.toLowerCase() || 'pending'
    const source = type === 'news' ? Enum.StatusNews : Enum.StatusMarkets
    const found =
      source.find((item) => item.value === normalizedStatus) || source[0]

    return {
      label: found.label,
      icon: found.icon,
      color: statusColorMap[found.color] || statusColorMap.neutral,
    }
  }

  const currentUserId = ref<string | null>(null)
  const userError = ref<unknown>(null)
  const isUserLoading = ref(true)

  const fetchCurrentUser = async () => {
    isUserLoading.value = true
    userError.value = null
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        userError.value = 'User tidak ditemukan'
        toastStore.error(
          'Tidak dapat memuat data pengguna. Silakan login kembali.',
        )
        return
      }
      currentUserId.value = user.id
    } catch (err) {
      console.error('Error fetching current user:', err)
      userError.value = err
      toastStore.error('Gagal memuat data pengguna.')
    } finally {
      isUserLoading.value = false
    }
  }

  const { data, pending, error, refresh } = await useAsyncData(
    'history-list',
    async () => {
      if (!currentUserId.value) return { items: [] as HistoryItem[], total: 0 }

      const term = (search.value || '').trim().toLowerCase()
      const from = (page.value - 1) * pageSize
      const to = from + pageSize - 1
      const [rawColumn, direction] = sort.value.split('-')
      const ascending = direction === 'asc'

      if (filter.value === 'news') {
        let q = supabase
          .from('news_updated')
          .select('id,title,slug,created_at,cover_image,status_news', {
            count: 'exact',
          })
          .eq('user_id', currentUserId.value)
          .is('deleted_at', null)

        if (term) {
          q = q.or(`title.ilike.%${term}%`)
        }

        const orderColumn = rawColumn === 'name' ? 'title' : 'created_at'
        const {
          data: rows,
          count,
          error: qError,
        } = await q.order(orderColumn, { ascending }).range(from, to)
        if (qError) throw qError

        const items: HistoryItem[] = (rows ?? []).map((item) => ({
          id: item.id,
          title: item.title || 'Berita Tanpa Judul',
          created_at: item.created_at,
          status: item.status_news || 'pending',
          type: 'news',
          typeLabel: 'Berita',
          route: item.slug ? `/update/${item.slug}` : `/update/edit/${item.id}`,
          imageUrl: getNewsImageUrl(item.cover_image),
        }))

        return { items, total: count || 0 }
      }

      if (filter.value === 'markets') {
        let q = supabase
          .from('product_markets')
          .select(
            'id,name,slug,created_at,thumbnail_url,images,status,seller,excerpt',
            { count: 'exact' },
          )
          .eq('user_id', currentUserId.value)
          .is('deleted_at', null)

        if (term) {
          q = q.or(
            `name.ilike.%${term}%,seller.ilike.%${term}%,excerpt.ilike.%${term}%`,
          )
        }

        const orderColumn = rawColumn === 'name' ? 'name' : 'created_at'
        const {
          data: rows,
          count,
          error: qError,
        } = await q.order(orderColumn, { ascending }).range(from, to)
        if (qError) throw qError

        const items: HistoryItem[] = (rows ?? []).map((item) => ({
          id: item.id,
          title: item.name || 'Produk Tanpa Nama',
          created_at: item.created_at,
          status: item.status || 'pending',
          type: 'markets',
          typeLabel: 'Pasar',
          route: item.slug
            ? `/markets/${item.slug}`
            : `/markets/edit/${item.id}`,
          imageUrl: getMarketImageUrl(item.thumbnail_url, item.images),
        }))

        return { items, total: count || 0 }
      }

      const [newsRes, marketsRes] = await Promise.all([
        supabase
          .from('news_updated')
          .select('id,title,slug,created_at,cover_image,status_news')
          .eq('user_id', currentUserId.value)
          .is('deleted_at', null),
        supabase
          .from('product_markets')
          .select(
            'id,name,slug,created_at,thumbnail_url,images,status,seller,excerpt',
          )
          .eq('user_id', currentUserId.value)
          .is('deleted_at', null),
      ])

      if (newsRes.error) throw newsRes.error
      if (marketsRes.error) throw marketsRes.error

      let combined: HistoryItem[] = [
        ...(newsRes.data ?? []).map((item) => ({
          id: item.id,
          title: item.title || 'Berita Tanpa Judul',
          created_at: item.created_at,
          status: item.status_news || 'pending',
          type: 'news' as const,
          typeLabel: 'Berita',
          route: item.slug ? `/update/${item.slug}` : `/update/edit/${item.id}`,
          imageUrl: getNewsImageUrl(item.cover_image),
        })),
        ...(marketsRes.data ?? []).map((item) => ({
          id: item.id,
          title: item.name || 'Produk Tanpa Nama',
          created_at: item.created_at,
          status: item.status || 'pending',
          type: 'markets' as const,
          typeLabel: 'Pasar',
          route: item.slug
            ? `/markets/${item.slug}`
            : `/markets/edit/${item.id}`,
          imageUrl: getMarketImageUrl(item.thumbnail_url, item.images),
        })),
      ]

      if (term) {
        combined = combined.filter((item) =>
          item.title.toLowerCase().includes(term),
        )
      }

      combined.sort((a, b) => {
        if (rawColumn === 'name') {
          return ascending
            ? a.title.localeCompare(b.title, 'id')
            : b.title.localeCompare(a.title, 'id')
        }

        return ascending
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      return {
        items: combined.slice(from, to + 1),
        total: combined.length,
      }
    },
    {
      default: () => ({ items: [] as HistoryItem[], total: 0 }),
      watch: [filter, sort, page, currentUserId],
    },
  )

  let searchTimeout: ReturnType<typeof setTimeout>
  watch(search, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      page.value = 1
      await refresh()
    }, 400)
  })

  watch([filter, sort], () => {
    page.value = 1
  })

  const hasData = computed(() => data.value.items.length > 0)
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(data.value.total / pageSize)),
  )
  const showPagination = computed(
    () => !pending.value && hasData.value && totalPages.value > 1,
  )
  const isLoading = computed(() => isUserLoading.value || pending.value)
  const filterItems: HistoryFilter[] = ['all', 'news', 'markets']

  const emptyStatePrimaryAction = computed(() => {
    if (filter.value === 'news') {
      return {
        to: '/update/create',
        label: 'Buat Berita',
        icon: 'i-lucide-newspaper',
      }
    }

    if (filter.value === 'markets') {
      return {
        to: '/markets/create',
        label: 'Posting Produk',
        icon: 'i-lucide-shopping-cart',
      }
    }

    return null
  })

  const changeFilter = (nextFilter: HistoryFilter) => {
    filter.value = nextFilter
  }

  const handleSortChange = (nextSort: string) => {
    sort.value = nextSort
  }

  const handlePageChange = (nextPage: number) => {
    page.value = nextPage
  }

  onMounted(async () => {
    await fetchCurrentUser()
  })
</script>

<template>
  <div class="min-h-screen py-12 px-4 transition-colors duration-200">
    <div class="container mx-auto max-w-4xl">
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-green-600 dark:bg-green-700 rounded-full mb-4 shadow-lg dark:shadow-green-900/50"
        >
          <UIcon name="i-lucide-clock" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Riwayat Aktivitas
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Pantau dan kelola aktivitas Anda dengan mudah
        </p>
      </div>

      <div
        class="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-md border border-gray-100 dark:border-gray-800 mb-6 overflow-hidden transition-all duration-200"
      >
        <div class="flex border-b border-gray-100 dark:border-gray-800">
          <UButton
            color="neutral"
            variant="ghost"
            v-for="item in filterItems"
            :key="item"
            :class="[
              'flex-1 px-6 py-4 text-center font-medium transition-all duration-200',
              filter === item
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950/30'
                : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800/50',
            ]"
            @click="changeFilter(item)"
          >
            {{ filterLabels[item] }}
          </UButton>
        </div>

        <div class="p-4 space-y-4">
          <AppSearchBar
            v-model="search"
            placeholder="Cari judul berita atau produk..."
          />
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <AppSortDropdown
              :sort-options="sortOptions"
              :current-sort="sort"
              @update:sort="handleSortChange"
            />
            <div
              v-if="!isLoading && hasData"
              class="text-sm text-gray-600 dark:text-gray-400"
            >
              Menampilkan
              <span class="font-semibold text-green-600 dark:text-green-400">{{
                data.items.length
              }}</span>
              dari <span class="font-semibold">{{ data.total }}</span> aktivitas
            </div>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-16">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-500 mb-4"
        />
        <p class="text-gray-500 dark:text-gray-400">
          Memuat riwayat aktivitas Anda...
        </p>
      </div>

      <div
        v-else-if="userError || error"
        class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg transition-colors duration-200"
      >
        <div class="flex items-center">
          <UIcon
            name="i-lucide-triangle-alert"
            class="w-5 h-5 text-red-500 dark:text-red-400 mr-2 shrink-0"
          />
          <p class="font-medium">
            Terjadi kesalahan saat memuat riwayat aktivitas.
          </p>
        </div>
        <UButton
          color="neutral"
          variant="ghost"
          class="mt-3 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/70 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm transition-colors duration-200 font-medium"
          @click="() => refresh()"
        >
          Coba lagi
        </UButton>
      </div>

      <div v-else-if="!hasData" class="text-center py-16">
        <UIcon
          name="i-lucide-file-text"
          class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4"
        />
        <h3 class="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
          Belum ada aktivitas
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          Mulai buat berita atau posting pasar untuk melihat riwayat.
        </p>

        <div
          v-if="filter === 'all'"
          class="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <NuxtLink
            to="/update/create"
            class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <UIcon name="i-lucide-newspaper" class="w-5 h-5 mr-2" />
            Buat Berita
          </NuxtLink>

          <NuxtLink
            to="/markets/create"
            class="inline-flex items-center px-6 py-3 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <UIcon name="i-lucide-shopping-cart" class="w-5 h-5 mr-2" />
            Posting Produk
          </NuxtLink>
        </div>

        <NuxtLink
          v-else-if="emptyStatePrimaryAction"
          :to="emptyStatePrimaryAction.to"
          class="inline-flex items-center px-6 py-3 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          <UIcon :name="emptyStatePrimaryAction.icon" class="w-5 h-5 mr-2" />
          {{ emptyStatePrimaryAction.label }}
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="item in data.items"
          :key="`${item.type}-${item.id}`"
          class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:shadow-black/50 transition-all duration-200"
        >
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors',
                    item.type === 'news'
                      ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                      : 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300',
                  ]"
                >
                  <UIcon
                    :name="
                      item.type === 'news'
                        ? 'i-lucide-newspaper'
                        : 'i-lucide-shopping-cart'
                    "
                    class="w-4 h-4 mr-1"
                  />
                  {{ item.typeLabel }}
                </span>

                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{
                    new Date(item.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }}
                </span>
              </div>

              <UBadge
                :color="getStatusInfo(item.status, item.type).color"
                variant="soft"
                class="inline-flex items-center px-3 py-1 text-sm font-medium"
              >
                <UIcon
                  :name="getStatusInfo(item.status, item.type).icon"
                  class="w-4 h-4 mr-1"
                />
                {{ getStatusInfo(item.status, item.type).label }}
              </UBadge>
            </div>

            <div class="flex items-center space-x-4">
              <div
                class="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800"
              >
                <NuxtImg
                  :src="item.imageUrl"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                  loading="lazy"
                  @error="
                    (e) =>
                      ((e.target as HTMLImageElement).src = '/placeholder.webp')
                  "
                />
              </div>

              <div class="flex-1 min-w-0">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2"
                >
                  {{ item.title }}
                </h3>

                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    ID: {{ item.type.toUpperCase() }}-{{ item.id }}
                  </div>

                  <NuxtLink
                    :to="item.route"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                  >
                    Lihat Detail
                    <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-1" />
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  </div>
</template>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
