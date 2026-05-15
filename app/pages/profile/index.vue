<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import type { Database } from '~/types/database.types'

  const authStore = useAuthStore()
  const supabase = useSupabaseClient<Database>()

  useSeoMeta({
    title: 'Profil Saya',
    description: 'Kelola profil petani, peternak, atau nelayan Anda di JuruTani. Edit informasi pribadi, atur preferensi komoditas, dan perbarui data usaha tani.'
  })

  const userData = computed(() => authStore.profile)
  const loading = computed(() => authStore.profileLoading)
  const error = computed(() => authStore.error)

  const fetchUserData = async () => {
    await authStore.fetchProfile()
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-'
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
    }).format(new Date(dateString))
  }

  const professionalData = ref<{ type: string; data: any } | null>(null)
  const professionalPending = ref(false)

  const fetchProfessionalData = async () => {
    if (!userData.value?.id) return
    professionalPending.value = true

    try {
      const role = userData.value.role
      if (role === 'pakar') {
        const { data } = await supabase
          .from('experts')
          .select('*')
          .eq('user_id', userData.value.id)
          .maybeSingle()
        professionalData.value = { type: 'pakar', data }
      } else if (role === 'penyuluh') {
        const { data } = await supabase
          .from('instructors')
          .select('*')
          .eq('user_id', userData.value.id)
          .maybeSingle()
        professionalData.value = { type: 'penyuluh', data }
      } else {
        professionalData.value = null
      }
    } catch (error) {
      console.error('Error fetching professional data:', error)
    } finally {
      professionalPending.value = false
    }
  }

  const isValidUrl = (string?: string | null) => {
    if (!string) return false
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`)
      return true
    } catch (_) {
      return false
    }
  }

  // Active tab state
  const activeTab = ref('personal')

  // Modal states
  const showEditPersonalModal = ref(false)
  const showEditProfessionalModal = ref(false)

  // Computed untuk menentukan apakah user adalah pakar atau penyuluh
  const isPakar = computed(() => {
    return userData.value?.role === 'pakar'
  })

  const isPenyuluh = computed(() => {
    return userData.value?.role === 'penyuluh'
  })

  const showProfessionalTab = computed(() => {
    return isPakar.value || isPenyuluh.value
  })

  // Tabs configuration
  const tabs = computed(() => {
    const baseTabs = [
      {
        label: 'Profil Pribadi',
        icon: 'i-lucide-user',
        value: 'personal',
      },
    ]
    return baseTabs
  })

  const handleImageError = (event: Event) => {
    const target = event?.target as HTMLImageElement | null
    if (target) {
      console.error('Profile image failed to load:', target.src)
      target.src = '/profile.webp'
    }
  }

  const handleProfileUpdate = async () => {
    await fetchUserData()
    showEditPersonalModal.value = false
  }

  const handleProfessionalUpdate = async () => {
    await fetchProfessionalData()
    showEditProfessionalModal.value = false
  }

  const openEditPersonalModal = () => {
    showEditPersonalModal.value = true
  }

  const openEditProfessionalModal = () => {
    showEditProfessionalModal.value = true
  }

  onMounted(() => {
    fetchUserData().then(() => {
      fetchProfessionalData()
    })
  })
</script>

<template>
  <div class="min-h-screen py-12 transition-colors duration-200">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-green-600 dark:bg-green-700 rounded-full mb-4 shadow-lg dark:shadow-green-900/50"
        >
          <UIcon name="i-lucide-user" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Profil Pengguna
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Kelola informasi akun Anda dengan aman.
        </p>
      </div>

      <div v-if="loading" class="text-center py-16">
        <div
          class="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-md border border-gray-100 dark:border-gray-800"
        >
          <UIcon
            name="i-lucide-refresh-cw"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600 dark:text-green-400"
          />
          <span class="text-gray-600 dark:text-gray-400"
            >Memuat profil pengguna...</span
          >
        </div>
      </div>

      <div v-else-if="error" class="max-w-2xl mx-auto">
        <div
          class="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-400 dark:border-red-600 p-4 rounded-lg transition-colors duration-200"
        >
          <div class="flex">
            <div class="shrink-0">
              <UIcon
                name="i-lucide-triangle-alert"
                class="h-5 w-5 text-red-400 dark:text-red-500"
              />
            </div>
            <div class="ml-3">
              <p class="text-red-800 dark:text-red-200 font-medium">
                Terjadi kesalahan saat memuat profil pengguna
              </p>
              <UButton
                color="error"
                variant="ghost"
                size="sm"
                class="mt-2"
                @click="fetchUserData"
              >
                Coba lagi
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="userData" class="max-w-4xl mx-auto">
        <div
          class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200 mb-6"
        >
          <div
            class="bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-6 py-8 transition-all duration-200"
          >
            <div class="flex flex-col md:flex-row items-center">
              <div class="relative mb-4 md:mb-0 md:mr-6">
                <div
                  class="w-32 h-32 rounded-full overflow-hidden bg-white dark:bg-gray-800 p-1 shadow-lg dark:shadow-black/50"
                >
                  <NuxtImg
                    :src="userData.avatar_url || '/profile.webp'"
                    :alt="userData.full_name || 'User'"
                    class="w-full h-full object-cover rounded-full"
                    @error="handleImageError"
                  />
                </div>
                <div
                  class="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-md dark:shadow-black/50 transition-all duration-200"
                >
                  <span
                    class="text-xs font-semibold text-green-600 dark:text-green-400"
                  >
                    {{ authStore.roleLabel }}
                  </span>
                </div>
              </div>

              <div class="flex-1 text-center md:text-left text-white">
                <h2 class="text-2xl font-bold mb-1">
                  {{ userData.full_name || 'Pengguna JuruTani' }}
                </h2>
                <p class="text-green-100 dark:text-green-200 text-lg mb-2">
                  @{{ userData.username || 'username' }}
                </p>
                <p class="text-green-50 dark:text-green-100">
                  {{ userData.email }}
                </p>
                <p
                  v-if="userData.phone"
                  class="text-green-50 dark:text-green-100"
                >
                  📱 {{ userData.phone }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200"
        >
          <div class="p-6">
            <UTabs
              v-model="activeTab"
              color="neutral"
              variant="link"
              :content="false"
              :items="tabs"
              class="w-full mb-6"
            />

            <div v-if="activeTab === 'personal'" class="py-4">
              <div
                v-if="userData.bio"
                class="mb-6 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-800 transition-colors duration-200"
              >
                <h3
                  class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center"
                >
                  <UIcon
                    name="i-lucide-message-circle"
                    class="w-5 h-5 mr-2 text-green-600 dark:text-green-400"
                  />
                  Tentang Saya
                </h3>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {{ userData.bio }}
                </p>
              </div>

              <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
              >
                <div class="space-y-4">
                  <h3
                    class="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-green-200 dark:border-green-800 pb-2 transition-colors duration-200"
                  >
                    Informasi Pribadi
                  </h3>

                  <div class="space-y-3">
                    <div>
                      <p
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Nama Lengkap
                      </p>
                      <p class="text-gray-800 dark:text-gray-200">
                        {{ userData.full_name || '-' }}
                      </p>
                    </div>

                    <div>
                      <p
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Username
                      </p>
                      <p class="text-gray-800 dark:text-gray-200">
                        {{ userData.username || '-' }}
                      </p>
                    </div>

                    <div>
                      <p
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Tanggal Lahir
                      </p>
                      <p class="text-gray-800 dark:text-gray-200">
                        {{ formatDate(userData.birth_date) }}
                      </p>
                    </div>

                    <div>
                      <p
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Role
                      </p>
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 transition-colors duration-200"
                      >
                        {{ authStore.roleLabel }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <h3
                    class="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-green-200 dark:border-green-800 pb-2 transition-colors duration-200"
                  >
                    Kontak
                  </h3>

                  <div class="space-y-3">
                    <div>
                      <p
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Email
                      </p>
                      <p
                        class="text-gray-800 dark:text-gray-200 wrap-break-word"
                      >
                        {{ userData.email }}
                      </p>
                    </div>

                    <div>
                      <p
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Nomor Telepon
                      </p>
                      <p class="text-gray-800 dark:text-gray-200">
                        {{ userData.phone || '-' }}
                      </p>
                    </div>

                    <div>
                      <p
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Website
                      </p>
                      <div v-if="userData.website">
                        <NuxtLink
                          v-if="isValidUrl(userData.website)"
                          :to="userData.website"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline wrap-break-word inline-flex items-center transition-colors duration-200"
                        >
                          {{ userData.website }}
                          <UIcon
                            name="i-lucide-external-link"
                            class="w-4 h-4 ml-1"
                          />
                        </NuxtLink>
                        <span
                          v-else
                          class="text-gray-800 dark:text-gray-200 wrap-break-word"
                          >{{ userData.website }}</span
                        >
                      </div>
                      <p v-else class="text-gray-800 dark:text-gray-200">-</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <h3
                    class="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-green-200 dark:border-green-800 pb-2 transition-colors duration-200"
                  >
                    Alamat
                  </h3>

                  <div>
                    <p
                      class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                    >
                      Alamat Lengkap
                    </p>
                    <p class="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {{ userData.address || 'Belum diisi' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex justify-center pt-4">
                <UButton
                  color="success"
                  size="lg"
                  icon="i-lucide-edit"
                  @click="openEditPersonalModal"
                >
                  Edit Profil Pribadi
                </UButton>
              </div>
            </div>

            <div
              v-if="showProfessionalTab"
              class="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8"
            >
              <div class="flex items-center justify-between mb-6">
                <h3
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <UIcon
                    :name="
                      isPakar ? 'i-lucide-lightbulb' : 'i-lucide-user-check'
                    "
                    class="w-6 h-6 mr-2 text-green-600 dark:text-green-400"
                  />
                  Data Profesional {{ isPakar ? 'Pakar' : 'Penyuluh' }}
                </h3>
                <UButton
                  color="success"
                  variant="soft"
                  size="sm"
                  icon="i-lucide-edit"
                  @click="openEditProfessionalModal"
                >
                  Edit Data
                </UButton>
              </div>

              <div
                v-if="professionalPending"
                class="text-gray-500 dark:text-gray-400 text-sm py-4"
              >
                Memuat data profesional...
              </div>

              <div
                v-else-if="professionalData && professionalData.data"
                class="space-y-4"
              >
                <div
                  class="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors"
                >
                  <template v-if="professionalData.type === 'pakar'">
                    <div class="mb-4">
                      <p
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Kategori Ahli
                      </p>
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 mt-1"
                      >
                        {{ (professionalData.data as any).category || '-' }}
                      </span>
                    </div>
                  </template>

                  <template v-if="professionalData.type === 'penyuluh'">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p
                          class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                          Wilayah Provinsi
                        </p>
                        <p class="text-gray-800 dark:text-gray-200 mt-1">
                          {{ (professionalData.data as any).provinces || '-' }}
                        </p>
                      </div>
                      <div>
                        <p
                          class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                          Kabupaten/Kota
                        </p>
                        <p class="text-gray-800 dark:text-gray-200 mt-1">
                          {{ (professionalData.data as any).district || '-' }}
                        </p>
                      </div>
                    </div>
                  </template>

                  <div
                    v-if="professionalData.data.note"
                    class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800"
                  >
                    <p
                      class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
                    >
                      Catatan/Ringkasan Profil
                    </p>
                    <p
                      class="text-gray-800 dark:text-gray-200 leading-relaxed text-sm p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800"
                    >
                      {{ professionalData.data.note }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="p-6 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/30 text-center"
              >
                <UIcon
                  :name="isPakar ? 'i-lucide-award' : 'i-lucide-map-pin'"
                  class="w-12 h-12 text-green-400 dark:text-green-600/50 mx-auto mb-3"
                />
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  Anda memiliki akses sebagai
                  <span
                    class="font-semibold text-green-700 dark:text-green-400"
                    >{{ authStore.roleLabel }}</span
                  >. Pastikan kelengkapan data profesional Anda terisi dengan
                  benar.
                </p>
                <UButton
                  class="mt-4"
                  color="success"
                  variant="outline"
                  size="sm"
                  @click="openEditProfessionalModal"
                >
                  Kelola Data Profesional Saya
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UModal
      v-model:open="showEditPersonalModal"
      title="Edit Profil Pribadi"
      description="Perbarui informasi data diri Anda di bawah ini."
    >
      <template #body>
        <FeaturesProfileForm
          v-if="showEditPersonalModal && userData"
          :user-data="userData"
          @update="handleProfileUpdate"
          @cancel="showEditPersonalModal = false"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="showEditProfessionalModal"
      title="Edit Data Profesional"
      description="Lengkapi atau perbarui informasi profesional Anda."
    >
      <template #body>
        <div v-if="showEditProfessionalModal">
          <FeaturesProfileExpertForm
            v-if="isPakar"
            @update="handleProfessionalUpdate"
            @cancel="showEditProfessionalModal = false"
          />
          <FeaturesProfileInstructorForm
            v-if="isPenyuluh"
            @update="handleProfessionalUpdate"
            @cancel="showEditProfessionalModal = false"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
  /* Additional custom styles for JuruTani theme */
  .container {
    max-width: 1200px;
  }

  /* Smooth transitions */
  * {
    transition: all 0.2s ease-in-out;
  }

  /* Custom scrollbar for better UX */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    background: #16a34a;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #15803d;
  }
</style>
