<script setup lang="ts">
  const route = useRoute()
  const router = useRouter()
  const supabase = useSupabaseClient()

  // Data
  const expert = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const creatingConversation = ref(false)

  // Computed
  const age = computed(() => {
    if (!expert.value?.profiles?.birth_date) return null

    const birthDate = new Date(expert.value.profiles.birth_date)
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
  const fetchExpert = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('experts')
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
          birth_date, 
          address
        )
      `,
        )
        .eq('id', route.params.id)
        .single()

      if (fetchError) {
        console.error(fetchError)
        error.value = fetchError
      } else {
        expert.value = data
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
          `and(participant1_id.eq.${user.id},participant2_id.eq.${expert.value.user_id}),and(participant1_id.eq.${expert.value.user_id},participant2_id.eq.${user.id})`,
        )
        .single()

      if (existingConversation) {
        router.push(`/messages/${existingConversation.id}`)
      } else {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant1_id: user.id,
            participant2_id: expert.value.user_id,
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
  await fetchExpert()

  // SEO Optimization for expert detail
  watch(
    () => expert.value,
    (newVal) => {
      if (newVal) {
        useSeoMeta({
          title: newVal.profiles?.full_name || 'Pakar Pertanian',
          description: `Konsultasi dengan ${newVal.profiles?.full_name || 'Pakar Pertanian'} - Spesialis ${newVal.category || 'Pertanian'}. Dapatkan solusi terbaik untuk masalah pertanian Anda.`,
          keywords: [
            'pakar pertanian',
            'konsultasi pertanian',
            newVal.category?.toLowerCase() || 'spesialis',
            'ahli tani',
            'expert advisor',
          ],
          ogImage: newVal.profiles?.avatar_url || '/jurutani.webp',
          url: `https://jurutani.com/discussions/expert/${route.params.id}`,
          ogType: 'profile',
        })
      }
    },
    { immediate: true },
  )
</script>

<template>
  <div class="min-h-screen py-12 px-6">
    <!-- Loading State -->
    <USkeleton v-if="loading" class="max-w-6xl mx-auto h-96 w-full" />

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      icon="i-lucide-alert-circle"
      color="error"
      title="Error"
      :description="error.message"
      class="max-w-6xl mx-auto px-4"
    />

    <!-- Expert Profile -->
    <div v-else-if="expert" class="max-w-6xl mx-auto">
      <!-- Back Button -->
      <div class="mb-6">
        <NuxtLink
          to="/discussions/expert"
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
          Kembali ke Daftar Pakar
        </NuxtLink>
      </div>

      <!-- Hero Card -->
      <UCard class="mb-8 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
        <!-- Cover Background with Agriculture Pattern -->
        <template #header>
          <div
            class="h-48 relative agriculture-pattern bg-linear-to-r from-green-400 via-green-500 to-emerald-600 dark:from-green-700 dark:via-green-800 dark:to-emerald-700"
          >
            <!-- Expert Badge -->
            <div class="absolute top-6 right-6">
              <UBadge
                color="success"
                variant="soft"
                class="font-semibold text-sm dark:bg-green-900 dark:text-green-200"
              >
                Pakar {{ expert.category || 'Pertanian' }}
              </UBadge>
            </div>
          </div>
        </template>

        <!-- Profile Content -->
        <div class="pb-8">
          <div
            class="flex flex-col lg:flex-row items-start lg:items-end gap-6 -mt-16 px-6"
          >
            <!-- Avatar -->
            <div class="relative shrink-0">
              <NuxtImg
                :src="expert.profiles?.avatar_url || '/profile.webp'"
                :alt="expert.profiles?.full_name"
                class="w-32 h-32 rounded-2xl border-6 border-white shadow-xl object-cover bg-white dark:bg-gray-800"
                loading="lazy"
              />
              <div
                class="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center"
              >
                <UIcon name="i-lucide-check" class="w-4 h-4 text-white" />
              </div>
            </div>

            <!-- Basic Info & Action -->
            <div
              class="flex-1 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pt-4 w-full"
            >
              <div class="flex-1 min-w-0">
                <h1
                  class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words"
                >
                  {{ expert.profiles?.full_name || 'Nama Pakar' }}
                </h1>
                <p
                  class="text-lg text-green-600 dark:text-green-400 font-semibold mb-2"
                >
                  Pakar JuruTani Profesional
                </p>
                <div
                  class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span v-if="age" class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                    {{ age }} tahun
                  </span>
                  <span
                    v-if="expert.provinces"
                    class="flex items-center gap-1.5"
                  >
                    <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                    {{ expert.district }}, {{ expert.provinces }}
                  </span>
                  <span
                    class="flex items-center gap-1.5 text-green-600 dark:text-green-400"
                  >
                    <UIcon name="i-lucide-badge-check" class="w-4 h-4" />
                    Terverifikasi
                  </span>
                </div>
              </div>

              <!-- Consultation Button -->
              <UButton
                :loading="creatingConversation"
                :disabled="creatingConversation"
                icon="i-lucide-message-circle"
                size="lg"
                color="success"
                label="Konsultasi Sekarang"
                @click="startConversation"
              />
            </div>
          </div>
        </div>
      </UCard>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- About Section -->
          <UCard class="dark:bg-gray-900 dark:border-gray-800">
            <template #header>
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-info"
                    class="w-6 h-6 text-green-600 dark:text-green-400"
                  />
                </div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Tentang Pakar
                </h2>
              </div>
            </template>

            <div class="prose prose-gray dark:prose-invert max-w-none">
              <p
                class="text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
              >
                {{
                  expert.profiles?.bio ||
                  'Seorang pakar pertanian profesional yang berpengalaman di bidangnya dengan dedikasi tinggi untuk berbagi pengetahuan dan memberikan konsultasi terbaik dalam bidang pertanian dan agribisnis.'
                }}
              </p>
            </div>
          </UCard>

          <!-- Expertise Notes -->
          <UCard
            v-if="expert.note"
            class="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 dark:border-green-900"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-lightbulb"
                    class="w-6 h-6 text-green-600 dark:text-green-400"
                  />
                </div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Keahlian & Spesialisasi
                </h3>
              </div>
            </template>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <p
                class="text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
              >
                {{ expert.note }}
              </p>
            </div>
          </UCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
          <!-- Contact Card -->
          <UCard class="dark:bg-gray-900 dark:border-gray-800">
            <template #header>
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-mail"
                    class="w-5 h-5 text-green-600 dark:text-green-400"
                  />
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                  Kontak
                </h3>
              </div>
            </template>

            <div class="space-y-4">
              <div
                v-if="expert.profiles?.phone"
                class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <UIcon
                  name="i-lucide-phone"
                  class="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0"
                />
                <div>
                  <p
                    class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium"
                  >
                    Telepon
                  </p>
                  <p
                    class="text-sm text-gray-800 dark:text-gray-200 font-medium"
                  >
                    {{ expert.profiles.phone }}
                  </p>
                </div>
              </div>

              <div
                v-if="expert.profiles?.website"
                class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <UIcon
                  name="i-lucide-globe"
                  class="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0"
                />
                <div class="min-w-0 flex-1">
                  <p
                    class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium"
                  >
                    Website
                  </p>
                  <NuxtLink
                    :to="expert.profiles.website"
                    target="_blank"
                    class="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium truncate"
                  >
                    {{
                      expert.profiles.website
                        .replace('https://', '')
                        .replace('http://', '')
                    }}
                  </NuxtLink>
                </div>
              </div>

              <div
                class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <UIcon
                  name="i-lucide-at-sign"
                  class="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0"
                />
                <div>
                  <p
                    class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium"
                  >
                    Username
                  </p>
                  <p
                    class="text-sm text-gray-800 dark:text-gray-200 font-medium"
                  >
                    @{{ expert.profiles?.username }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Location Card -->
          <UCard
            class="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 dark:border-emerald-900"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-map-pin"
                    class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                  Lokasi
                </h3>
              </div>
            </template>

            <div class="space-y-3">
              <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <p
                  class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1"
                >
                  Alamat
                </p>
                <p class="text-gray-800 dark:text-gray-200 font-semibold">
                  {{ expert.profiles?.address || 'Alamat tidak tersedia' }}
                </p>
              </div>
            </div>
          </UCard>

          <!-- Trust Badge -->
          <UCard
            class="bg-linear-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 dark:border-yellow-900"
          >
            <div class="text-center">
              <div
                class="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <UIcon
                  name="i-lucide-star"
                  class="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                />
              </div>
              <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Pakar Terverifikasi
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Telah melewati proses verifikasi dan memiliki kredibilitas
                tinggi di bidang pertanian
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="max-w-4xl mx-auto py-20 text-center">
      <UCard class="dark:bg-gray-900 dark:border-gray-800">
        <div class="flex flex-col items-center">
          <UIcon
            name="i-lucide-search-x"
            class="w-24 h-24 text-gray-300 dark:text-gray-700 mb-6"
          />
          <h2 class="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            Pakar Tidak Ditemukan
          </h2>
          <p class="text-gray-500 dark:text-gray-400 text-lg mb-6">
            Maaf, pakar yang Anda cari tidak tersedia atau mungkin sudah tidak
            aktif.
          </p>
          <UButton
            to="/discussions/expert"
            icon="i-lucide-arrow-left"
            color="success"
            label="Kembali ke Daftar Pakar"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
  /* Agriculture pattern background */
  .agriculture-pattern {
    background-image:
      radial-gradient(
        circle at 25px 25px,
        rgba(34, 197, 94, 0.3) 2px,
        transparent 2px
      ),
      radial-gradient(
        circle at 75px 75px,
        rgba(22, 163, 74, 0.2) 1.5px,
        transparent 1.5px
      ),
      radial-gradient(
        circle at 50px 100px,
        rgba(21, 128, 61, 0.15) 1px,
        transparent 1px
      );
    background-size:
      100px 100px,
      80px 80px,
      120px 120px;
  }

  /* Responsive text fix */
  @media (max-width: 1024px) {
    .text-3xl {
      font-size: 1.875rem;
    }
  }

  @media (max-width: 640px) {
    .text-3xl {
      font-size: 1.5rem;
    }
  }
</style>
