<script setup lang="ts">
  const route = useRoute()
  const router = useRouter()
  const supabase = useSupabaseClient()

  // Data
  const instructor = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const creatingConversation = ref(false)
  const instructorId = computed(() => route.params.id as string)

  // Computed
  const age = computed(() => {
    if (!instructor.value?.profiles?.birth_date) return null

    const birthDate = new Date(instructor.value.profiles.birth_date)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age
  })

  // Functions
  const fetchInstructor = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('instructors')
        .select(
          `
        *,
        profiles (
          full_name,
          username,
          avatar_url,
          website,
          phone,
          bio,
          birth_date
        )
      `,
        )
        .eq('id', instructorId.value)
        .single()

      if (fetchError) {
        console.error(fetchError)
        error.value = fetchError
      } else {
        instructor.value = data
      }
    } catch (err) {
      console.error(err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const startConversation = async () => {
    creatingConversation.value = true

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth/login')
        return
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(participant1_id.eq.${user.id},participant2_id.eq.${instructor.value.user_id}),and(participant1_id.eq.${instructor.value.user_id},participant2_id.eq.${user.id})`,
        )
        .single()

      if (existingConversation) {
        router.push(`/messages/${existingConversation.id}`)
      } else {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant1_id: user.id,
            participant2_id: instructor.value.user_id,
          })
          .select('id')
          .single()

        if (createError) {
          console.error('Error creating conversation:', createError)
          error.value = createError
        } else {
          router.push(`/messages/${newConversation.id}`)
        }
      }
    } catch (err) {
      console.error('Error starting conversation:', err)
      error.value = err
    } finally {
      creatingConversation.value = false
    }
  }

  // Initial fetch
  await fetchInstructor()

  // SEO Optimization for instructor detail
  watch(
    () => instructor.value,
    (newVal) => {
      if (newVal) {
        useSeoMeta({
          title: newVal.profiles?.full_name || 'Penyuluh Pertanian',
          description: `Konsultasi dengan ${newVal.profiles?.full_name || 'Penyuluh Pertanian'} - Penyuluh berpengalaman untuk solusi pertanian Anda. Dapatkan panduan praktis untuk budidaya tanaman.`,
          keywords: [
            'penyuluh pertanian',
            'konsultasi tani',
            'penyuluh lapangan',
            'expert agriculture',
            'konsultasi pertanian',
          ],
          ogImage: newVal.profiles?.avatar_url || '/jurutani.webp',
          url: `https://jurutani.com/discussions/instructor/${instructorId.value}`,
          ogType: 'profile',
        })
      }
    },
    { immediate: true },
  )
</script>

<template>
  <div class="flex flex-col gap-8 py-12">
    <!-- Loading State -->
    <USkeleton v-if="loading" class="h-96 w-full" />

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      icon="i-lucide-alert-circle"
      color="error"
      title="Error"
      :description="error.message"
      class="max-w-6xl mx-auto px-4"
    />

    <!-- Instructor Profile -->
    <div v-else-if="instructor" class="max-w-6xl mx-auto px-4">
      <!-- Back Button -->
      <div class="mb-6">
        <NuxtLink
          to="/discussions/instructor"
          class="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors group"
        >
          <svg
            class="w-5 h-5 transition-transform group-hover:-translate-x-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
          Kembali ke Daftar Penyuluh
        </NuxtLink>
      </div>

      <!-- Profile Card -->
      <UCard class="dark:bg-gray-900 dark:border-gray-800">
        <!-- Header Section with Gradient -->
        <template #header>
          <div
            class="bg-linear-to-r from-green-500 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-6 py-10 md:p-8 -m-6 mb-6 rounded-t-lg"
          >
            <div
              class="flex flex-col md:flex-row items-start md:items-center gap-6"
            >
              <!-- Profile Picture -->
              <div class="shrink-0">
                <NuxtImg
                  :src="instructor.profiles?.avatar_url || '/profile.webp'"
                  :alt="instructor.profiles?.full_name"
                  class="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white shadow-md object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>

              <!-- Basic Info -->
              <div class="flex-1 text-white">
                <h1 class="text-3xl font-bold mb-2 tracking-tight">
                  {{ instructor.profiles?.full_name }}
                </h1>
                <p class="text-lg opacity-90 mb-3">
                  @{{ instructor.profiles?.username }}
                </p>
                <div
                  class="flex flex-wrap items-center gap-3 text-sm font-medium opacity-90"
                >
                  <UBadge
                    v-if="age"
                    color="neutral"
                    variant="outline"
                    class="dark:border-green-600"
                  >
                    <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-1" />
                    {{ age }} tahun
                  </UBadge>
                  <UBadge
                    v-if="instructor.provinces"
                    color="neutral"
                    variant="outline"
                    class="dark:border-green-600"
                  >
                    <UIcon name="i-lucide-map-pin" class="w-4 h-4 mr-1" />
                    {{ instructor.district }}, {{ instructor.provinces }}
                  </UBadge>
                </div>
              </div>

              <!-- Chat Button -->
              <div class="shrink-0">
                <UButton
                  :loading="creatingConversation"
                  :disabled="creatingConversation"
                  icon="i-lucide-message-circle"
                  size="lg"
                  color="neutral"
                  label="Mulai Obrolan"
                  @click="startConversation"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Content Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- About Section -->
          <div>
            <h2
              class="text-xl font-semibold mb-4 text-gray-800 dark:text-white"
            >
              Tentang Instruktur
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {{ instructor.profiles?.bio || 'Belum ada deskripsi tersedia.' }}
            </p>

            <!-- Notes -->
            <div v-if="instructor.note" class="mb-6">
              <h3
                class="text-lg font-semibold mb-3 text-gray-800 dark:text-white"
              >
                Catatan
              </h3>
              <UCard class="bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <p class="text-gray-600 dark:text-gray-400">
                  {{ instructor.note }}
                </p>
              </UCard>
            </div>
          </div>

          <!-- Contact & Info -->
          <div class="space-y-6">
            <!-- Contact Information -->
            <div>
              <h3
                class="text-lg font-semibold mb-4 text-gray-800 dark:text-white"
              >
                Informasi Kontak
              </h3>
              <div class="space-y-3">
                <div
                  v-if="instructor.profiles?.phone"
                  class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all duration-200 hover:bg-green-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700"
                >
                  <UIcon
                    name="i-lucide-phone"
                    class="w-5 h-5 text-green-500 shrink-0"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{
                    instructor.profiles.phone
                  }}</span>
                </div>

                <div
                  v-if="instructor.profiles?.website"
                  class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all duration-200 hover:bg-green-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700"
                >
                  <UIcon
                    name="i-lucide-globe"
                    class="w-5 h-5 text-green-500 shrink-0"
                  />
                  <NuxtLink
                    :to="instructor.profiles.website"
                    target="_blank"
                    class="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200"
                  >
                    {{ instructor.profiles.website }}
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Location Info -->
            <UCard
              class="bg-green-50 dark:bg-green-950 dark:border-green-800 border-green-200"
            >
              <template #header>
                <h3
                  class="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2"
                >
                  <UIcon name="i-lucide-map-pin" class="w-5 h-5" />
                  Lokasi
                </h3>
              </template>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 dark:text-gray-400"
                    >Provinsi:</span
                  >
                  <span
                    class="text-sm font-medium text-gray-800 dark:text-gray-200"
                    >{{ instructor.provinces }}</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 dark:text-gray-400"
                    >Kabupaten/Kota:</span
                  >
                  <span
                    class="text-sm font-medium text-gray-800 dark:text-gray-200"
                    >{{ instructor.district }}</span
                  >
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Not Found State -->
    <div v-else class="text-center py-16">
      <UIcon
        name="i-lucide-search-x"
        class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
      />
      <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Instruktur Tidak Ditemukan
      </h2>
      <p class="text-gray-500 dark:text-gray-400">
        Instruktur yang Anda cari tidak tersedia.
      </p>
    </div>
  </div>
</template>
