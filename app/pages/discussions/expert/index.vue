<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue'
  const supabase = useSupabaseClient()

  interface Expert {
    id: number
    user_id: string
    category: string
    note: string
    profiles: {
      full_name: string
      avatar_url: string
    } | null
  }

  // Data
  const experts = ref<Expert[]>([])
  const loading = ref(true)
  const error = ref<any>(null)

  // Filter states
  const selectedCategory = ref<string>('')
  const categories = ref<string[]>([])
  const searchQuery = ref<string>('')

  // Pagination states
  const currentPage = ref<number>(1)
  const pageSize = 10

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('category_expert')
        .select('name')
        .order('name', { ascending: true })

      if (fetchError) {
        console.error('Error fetching categories:', fetchError)
        categories.value = []
      } else {
        const categoryNames = (data || []).map(
          (item: { name: string }) => item.name,
        )
        categories.value = categoryNames
        // Set first category as default if available
        if (categoryNames.length > 0) {
          selectedCategory.value = categoryNames[0]
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      categories.value = []
    }
  }

  // Computed properties
  const filteredExperts = computed(() => {
    if (loading.value || !experts.value) {
      return []
    }

    return experts.value.filter((expert) => {
      // Category filter
      const matchesCategory =
        !selectedCategory.value || expert.category === selectedCategory.value

      // Search filter
      const fullName = expert.profiles?.full_name || ''
      const matchesSearch =
        !searchQuery.value ||
        fullName.toLowerCase().includes(searchQuery.value.toLowerCase())

      return matchesCategory && matchesSearch
    })
  })

  // Pagination computed properties
  const totalPages = computed(() => {
    return Math.ceil(filteredExperts.value.length / pageSize)
  })

  const paginatedExperts = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredExperts.value.slice(startIndex, endIndex)
  })

  // Fetch experts with profile data
  const fetchExperts = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('experts')
        .select(
          `
        id,
        user_id,
        category,
        note,
        profiles!inner (
          full_name,
          avatar_url
        )
      `,
        )
        .order('id', { ascending: true })

      if (fetchError) {
        console.error('Error fetching experts:', fetchError)
        error.value = fetchError
      } else {
        experts.value = (data || []) as unknown as Expert[]
      }
    } catch (err) {
      console.error('Error fetching experts:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Select category function
  const selectCategory = (category: string) => {
    selectedCategory.value = category
    currentPage.value = 1 // Reset pagination ketika category berubah
  }

  // Reset filter handler
  const handleResetFilter = () => {
    if (categories.value.length > 0) {
      selectedCategory.value = categories.value[0]
    }
    searchQuery.value = ''
  }

  // Watcher untuk reset page ketika filter berubah
  watch([selectedCategory, searchQuery], () => {
    currentPage.value = 1
  })

  // Initial data fetch
  onMounted(async () => {
    await fetchCategories()
    await fetchExperts()
  })

  // Head meta
  useHead({
    title: 'Diskusi Pakar - JuruTani',
    meta: [
      {
        name: 'description',
        content: 'Diskusikan masalah pertanian Anda dengan Pakar berpengalaman',
      },
    ],
  })
</script>

<template>
  <div class="min-h-screen py-8 md:py-12">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <FeaturesDiscussionsDiscussionHeader
        title="Diskusi Pakar"
        subtitle="Konsultasi dengan pakar pertanian berpengalaman"
        icon="i-lucide-lightbulb"
        back-url="/discussions"
      />

      <!-- Main Card -->
      <UCard
        class="mb-8 shadow-xl"
        :ui="{
          body: { padding: 'p-6 sm:p-8' },
          header: { padding: 'px-6 sm:px-8 py-4 sm:py-6' },
        }"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-lightbulb"
              class="w-6 h-6 text-green-600 dark:text-green-400"
            />
            <p
              class="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium"
            >
              Diskusikan permasalahan pertanian Anda dengan pakar berpengalaman
              dan dapatkan saran profesional untuk meningkatkan hasil panen
              Anda.
            </p>
          </div>
        </template>

        <!-- Loading state -->
        <div
          v-if="loading"
          class="flex flex-col items-center justify-center py-16"
        >
          <UIcon
            name="i-lucide-loader"
            class="w-12 h-12 text-green-600 dark:text-green-400 animate-spin mb-4"
          />
          <p class="text-gray-600 dark:text-gray-400">Memuat data pakar...</p>
        </div>

        <!-- Error state -->
        <div
          v-else-if="error"
          class="flex flex-col items-center justify-center py-16"
        >
          <UAlert
            title="Terjadi Kesalahan"
            description="Gagal memuat data pakar. Silakan coba lagi."
            color="error"
            icon="i-lucide-alert-circle"
            class="mb-4 max-w-md"
          />
          <UButton
            color="success"
            icon="i-lucide-refresh-cw"
            @click="fetchExperts"
          >
            Coba Lagi
          </UButton>
        </div>

        <!-- Content -->
        <div v-else class="space-y-8">
          <!-- Search Bar - Full width -->
          <FeaturesDiscussionsDiscussionSearch
            v-model="searchQuery"
            title="Cari Pakar"
            placeholder="Cari nama pakar pertanian..."
          />

          <!-- Category Filter -->
          <div>
            <AppCategoryFilter
              :categories="categories"
              :current-category="selectedCategory"
              :show-all-option="false"
              @update:category="selectCategory"
            />
          </div>

          <!-- Experts based on selected category -->
          <div>
            <div
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-users"
                  class="w-5 h-5 text-green-600 dark:text-green-400"
                />
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  <span v-if="selectedCategory"
                    >Pakar {{ selectedCategory }}</span
                  >
                  <span v-else>Semua Pakar</span>
                  <UBadge color="success" variant="soft" class="ml-2">
                    {{ filteredExperts.length }}
                  </UBadge>
                </h2>
              </div>

              <!-- Results Info -->
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan
                <span
                  class="font-semibold text-green-600 dark:text-green-400"
                  >{{ paginatedExperts.length }}</span
                >
                dari
                <span class="font-semibold">{{ filteredExperts.length }}</span>
                pakar
              </div>
            </div>

            <div v-if="filteredExperts.length > 0">
              <!-- Experts grid -->
              <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              >
                <FeaturesDiscussionsDiscussionCard
                  v-for="expert in paginatedExperts"
                  :id="expert.id"
                  :key="expert.id"
                  :user-id="expert.user_id"
                  :profile="expert.profiles"
                  :category="expert.category"
                  :note="
                    expert.note ||
                    `Ahli dalam bidang ${expert.category.toLowerCase()} yang telah berpengalaman membantu petani.`
                  "
                  type="expert"
                />
              </div>

              <!-- Pagination -->
              <AppPagination
                v-if="totalPages > 1"
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-items="filteredExperts.length"
                :page-size="pageSize"
                :show-page-info="true"
                :show-first-last="true"
                @update:page="currentPage = $event"
              />
            </div>

            <!-- Empty state -->
            <FeaturesDiscussionsDiscussionEmptyState
              v-else
              :message="`Tidak ada pakar tersedia${selectedCategory ? ' untuk kategori ' + selectedCategory : ''}${searchQuery ? ' dengan nama &quot;' + searchQuery + '&quot;' : ''} saat ini.`"
              :show-reset-button="!!(selectedCategory || searchQuery)"
              @reset="handleResetFilter"
            />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
  /* Smooth animations */
  :deep(.u-card) {
    transition: all 0.3s ease;
  }
</style>
