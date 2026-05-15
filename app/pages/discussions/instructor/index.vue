<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue'
  const supabase = useSupabaseClient()

  interface Instructor {
    id: number
    user_id: string
    provinces: string
    district: string
    profiles: {
      full_name: string
      avatar_url: string
    } | null
  }

  interface District {
    id: number
    name: string
    province: string
  }

  interface DistrictOption {
    value: string
    label: string
    province: string
  }

  // Data
  const instructors = ref<Instructor[]>([])
  const districts = ref<District[]>([])
  const loading = ref(true)
  const error = ref<any>(null)

  // Filter states
  const selectedDistrict = ref<DistrictOption | null>(null)
  const searchQuery = ref<string>('')

  // Pagination states
  const currentPage = ref<number>(1)
  const pageSize = 10

  // Computed properties
  const availableDistricts = computed<DistrictOption[]>(() => {
    // Get all unique districts with their province info
    const districtOptions = districts.value.map((d) => ({
      value: d.name,
      label: `${d.name}, ${d.province}`,
      province: d.province,
    }))

    // Sort by province first, then by district name
    const sortedOptions = districtOptions.sort((a, b) => {
      if (a.province !== b.province) {
        return a.province.localeCompare(b.province)
      }
      return a.value.localeCompare(b.value)
    })

    // Add "All districts" option at the beginning
    return [
      { value: '', label: 'Semua Kabupaten/Kota', province: '' },
      ...sortedOptions,
    ]
  })

  const filteredInstructors = computed(() => {
    if (loading.value || !instructors.value) {
      return []
    }

    return instructors.value.filter((instructor) => {
      // District filter - only filter by district if selectedDistrict is not empty
      const matchesDistrict =
        !selectedDistrict.value?.value ||
        instructor.district === selectedDistrict.value.value

      // Search filter - safely check if full_name exists
      const fullName = instructor.profiles?.full_name || ''
      const matchesSearch =
        !searchQuery.value ||
        fullName.toLowerCase().includes(searchQuery.value.toLowerCase())

      return matchesDistrict && matchesSearch
    })
  })

  // Pagination computed properties
  const totalPages = computed(() => {
    return Math.ceil(filteredInstructors.value.length / pageSize)
  })

  const paginatedInstructors = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredInstructors.value.slice(startIndex, endIndex)
  })

  // Fetch districts for filter options
  const fetchDistricts = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('districts')
        .select('id, name, province')
        .order('province', { ascending: true })
        .order('name', { ascending: true })

      if (fetchError) {
        console.error('Error fetching districts:', fetchError)
        error.value = fetchError
      } else {
        districts.value = data || []
      }
    } catch (err) {
      console.error('Error fetching districts:', err)
      error.value = err
    }
  }

  // Fetch instructors with profile data
  const fetchInstructors = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('instructors')
        .select(
          `
        id,
        user_id,
        provinces,
        district,
        profiles!inner (
          full_name,
          avatar_url
        )
      `,
        )
        .order('id', { ascending: true })

      if (fetchError) {
        console.error('Error fetching instructors:', fetchError)
        error.value = fetchError
      } else {
        instructors.value = (data || []) as unknown as Instructor[]
      }
    } catch (err) {
      console.error('Error fetching instructors:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Reset filter handler
  const handleResetFilter = () => {
    selectedDistrict.value = null
    searchQuery.value = ''
  }

  // Watchers untuk reset page ketika filter berubah
  watch([selectedDistrict, searchQuery], () => {
    currentPage.value = 1
  })

  // Initial data fetch
  onMounted(async () => {
    await fetchDistricts()
    await fetchInstructors()
  })

  // Head meta
  useHead({
    title: 'Diskusi Penyuluh - JuruTani',
    meta: [
      {
        name: 'description',
        content:
          'Diskusikan masalah pertanian Anda dengan penyuluh berpengalaman',
      },
    ],
  })
</script>

<template>
  <div class="min-h-screen py-8 md:py-12">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <FeaturesDiscussionsDiscussionHeader
        title="Diskusi Penyuluh"
        subtitle="Konsultasi dengan penyuluh pertanian berpengalaman"
        icon="i-lucide-users"
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
              name="i-lucide-users"
              class="w-6 h-6 text-green-600 dark:text-green-400"
            />
            <p
              class="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium"
            >
              Diskusikan permasalahan pertanian Anda dengan penyuluh
              berpengalaman dan dapatkan saran profesional untuk meningkatkan
              hasil panen Anda.
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
          <p class="text-gray-600 dark:text-gray-400">
            Memuat data penyuluh...
          </p>
        </div>

        <!-- Error state -->
        <div
          v-else-if="error"
          class="flex flex-col items-center justify-center py-16"
        >
          <UAlert
            title="Terjadi Kesalahan"
            description="Gagal memuat data penyuluh. Silakan coba lagi."
            color="error"
            icon="i-lucide-alert-circle"
            class="mb-4 max-w-md"
          />
          <UButton
            color="success"
            icon="i-lucide-refresh-cw"
            @click="fetchInstructors"
          >
            Coba Lagi
          </UButton>
        </div>

        <!-- Content -->
        <div v-else class="space-y-8">
          <!-- Search and Filter -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <!-- Left: Search -->
            <FeaturesDiscussionsDiscussionSearch
              v-model="searchQuery"
              title="Cari Penyuluh"
              placeholder="Cari nama penyuluh..."
            />

            <!-- Right: District select -->
            <div>
              <div class="flex items-center gap-2 mb-4">
                <UIcon
                  name="i-lucide-map-pin"
                  class="w-5 h-5 text-green-600 dark:text-green-400"
                />
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Pilih Kabupaten/Kota
                </h2>
              </div>
              <div class="relative">
                <USelectMenu
                  v-model="selectedDistrict"
                  :items="availableDistricts"
                  placeholder="Pilih kabupaten/kota"
                  searchable
                  searchable-placeholder="Cari kabupaten/kota..."
                  class="w-full"
                  :ui="{
                    wrapper: 'relative',
                    base: 'w-full py-3.5 pl-4 pr-10 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 text-gray-900 dark:text-white',
                    placeholder: 'text-gray-400 dark:text-gray-500 ml-6',
                  }"
                >
                  <template #leading>
                    <UIcon
                      name="i-lucide-map-pin"
                      class="w-5 h-5 text-gray-400"
                    />
                  </template>
                </USelectMenu>
              </div>
            </div>
          </div>

          <!-- Instructors list -->
          <div>
            <div class="flex items-center gap-2 mb-6">
              <UIcon
                name="i-lucide-briefcase"
                class="w-5 h-5 text-green-600 dark:text-green-400"
              />
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Penyuluh
                <span v-if="selectedDistrict?.value" class="text-green-600">
                  di {{ selectedDistrict.label }}</span
                >
                <UBadge color="success" variant="soft" class="ml-2">
                  {{ filteredInstructors.length }}
                </UBadge>
              </h2>
            </div>

            <div v-if="filteredInstructors.length > 0">
              <!-- Instructors grid -->
              <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              >
                <FeaturesDiscussionsDiscussionCard
                  v-for="instructor in paginatedInstructors"
                  :id="instructor.id"
                  :key="instructor.id"
                  :user-id="instructor.user_id"
                  :profile="instructor.profiles"
                  :location="`${instructor.district}, ${instructor.provinces}`"
                  type="instructor"
                />
              </div>

              <!-- Pagination -->
              <AppPagination
                v-if="totalPages > 1"
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-items="filteredInstructors.length"
                :page-size="pageSize"
                :show-page-info="true"
                :show-first-last="true"
                @update:page="currentPage = $event"
              />
            </div>

            <!-- Empty state -->
            <FeaturesDiscussionsDiscussionEmptyState
              v-else
              :message="`Tidak ada penyuluh tersedia${selectedDistrict?.value ? ' di ' + selectedDistrict.label : ''}${searchQuery ? ' dengan nama &quot;' + searchQuery + '&quot;' : ''} saat ini.`"
              :show-reset-button="!!(selectedDistrict?.value || searchQuery)"
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
