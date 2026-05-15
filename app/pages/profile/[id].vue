<script setup lang="ts">
  import type { Database } from '~/types/database.types'

  const route = useRoute()
  const profileId = route.params.id as string
  const supabase = useSupabaseClient<Database>()
  const authStore = useAuthStore()

  // Navigation guards usually handle if it shouldn't be accessed, but we can do a simple check
  if (authStore.user?.id === profileId) {
    navigateTo('/profile')
  }

  // Fetch Profile Data for this specific user
  const {
    data: userData,
    pending,
    error,
  } = await useAsyncData(`profile-${profileId}`, async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (error) throw error
    return data
  })

  const { data: professionalData, pending: professionalPending } =
    await useAsyncData(
      `prof-${profileId}`,
      async () => {
        if (!userData.value) return null
        const role = userData.value.role

        if (role === 'pakar') {
          const { data } = await supabase
            .from('experts')
            .select('*')
            .eq('user_id', profileId)
            .maybeSingle()
          return { type: 'pakar', data }
        } else if (role === 'penyuluh') {
          const { data } = await supabase
            .from('instructors')
            .select('*')
            .eq('user_id', profileId)
            .maybeSingle()
          return { type: 'penyuluh', data }
        }
        return null
      },
      { watch: [userData] },
    )

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-'
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
    }).format(new Date(dateString))
  }

  const userRoleLabel = computed(() => {
    return (
      Enum.UserRole.find((r) => r.value === userData.value?.role)?.label ||
      'Pengguna'
    )
  })

  const isValidUrl = (string?: string | null) => {
    if (!string) return false
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`)
      return true
    } catch (_) {
      return false
    }
  }

  const toast = useToast()
  const { createOrGetConversation } = useMessages()

  const handleChat = async () => {
    if (!userData.value) return
    if (!authStore.isAuthenticated) {
      await navigateTo('/auth/login')
      return
    }
    try {
      const conversationId = await createOrGetConversation(userData.value.id)
      await navigateTo(`/messages/${conversationId}`)
    } catch (e: any) {
      toast.add({
        title: 'Gagal membuka chat',
        description: e?.message,
        color: 'error',
      })
    }
  }
</script>

<template>
  <div class="min-h-screen py-12 transition-colors duration-200">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="pending" class="text-center py-16">
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

      <!-- Error State -->
      <div
        v-else-if="error || !userData"
        class="max-w-2xl mx-auto text-center py-16"
      >
        <UIcon
          name="i-lucide-user-minus"
          class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4 mx-auto"
        />
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Pengguna Tidak Ditemukan
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Profil yang Anda cari tidak tersedia atau terjadi kesalahan sistem.
        </p>
        <UButton to="/profile" color="neutral" variant="solid"
          >Kembali ke Profil Saya</UButton
        >
      </div>

      <!-- Profile Content -->
      <div v-else class="max-w-4xl mx-auto">
        <!-- Profile Header Card -->
        <div
          class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200 mb-6"
        >
          <div
            class="bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-6 py-8 transition-all duration-200"
          >
            <div class="flex flex-col md:flex-row items-center">
              <!-- Profile Image -->
              <div class="relative mb-4 md:mb-0 md:mr-6">
                <div
                  class="w-32 h-32 rounded-full overflow-hidden bg-white dark:bg-gray-800 p-1 shadow-lg dark:shadow-black/50 shrink-0"
                >
                  <NuxtImg
                    :src="userData.avatar_url || 'profile.webp'"
                    :alt="userData.full_name || 'User'"
                    class="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div
                  class="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-md dark:shadow-black/50 transition-all duration-200"
                >
                  <span
                    class="text-xs font-semibold text-green-600 dark:text-green-400"
                  >
                    {{ userRoleLabel }}
                  </span>
                </div>
              </div>

              <!-- User Info -->
              <div class="flex-1 text-center md:text-left text-white">
                <h2 class="text-2xl font-bold mb-1">
                  {{ userData.full_name || 'Pengguna JuruTani' }}
                </h2>
                <p class="text-green-100 dark:text-green-200 text-lg mb-2">
                  @{{ userData.username || 'username' }}
                </p>
              </div>

              <!-- Action Area -->
              <div class="mt-6 md:mt-0 flex">
                <UButton
                  color="neutral"
                  variant="solid"
                  size="lg"
                  icon="i-lucide-message-square"
                  @click="handleChat"
                >
                  Mulai Chat
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail Information -->
        <div
          class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200 p-6"
        >
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
              Tentang
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ userData.bio }}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Personal Info -->
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
                    @{{ userData.username || '-' }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Email
                  </p>
                  <p class="text-gray-800 dark:text-gray-200 wrap-break-word">
                    {{ userData.email || '-' }}
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
                    Alamat
                  </p>
                  <p class="text-gray-800 dark:text-gray-200">
                    {{ userData.address || '-' }}
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
                    Bergabung Sejak
                  </p>
                  <p class="text-gray-800 dark:text-gray-200">
                    {{ formatDate(userData.created_at) }}
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

            <!-- Professional Info -->
            <div
              v-if="['pakar', 'penyuluh'].includes(userData.role || '')"
              class="space-y-4"
            >
              <h3
                class="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-green-200 dark:border-green-800 pb-2 transition-colors duration-200"
              >
                Bidang Profesional
              </h3>

              <div
                v-if="professionalPending"
                class="text-gray-500 dark:text-gray-400 text-sm"
              >
                Memuat data profesional...
              </div>
              <div
                v-else-if="professionalData && professionalData.data"
                class="space-y-3"
              >
                <!-- Pakar fields -->
                <template v-if="professionalData.type === 'pakar'">
                  <div>
                    <p
                      class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Kategori Ahli
                    </p>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200"
                    >
                      {{ (professionalData.data as any).category || '-' }}
                    </span>
                  </div>
                </template>

                <!-- Penyuluh fields -->
                <template v-if="professionalData.type === 'penyuluh'">
                  <div>
                    <p
                      class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Wilayah Provinsi
                    </p>
                    <p class="text-gray-800 dark:text-gray-200">
                      {{ (professionalData.data as any).provinces || '-' }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Kabupaten/Kota
                    </p>
                    <p class="text-gray-800 dark:text-gray-200">
                      {{ (professionalData.data as any).district || '-' }}
                    </p>
                  </div>
                </template>

                <!-- Shared Note field -->
                <div v-if="professionalData.data.note">
                  <p
                    class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                  >
                    Catatan/Ringkasan Profil
                  </p>
                  <p
                    class="text-gray-800 dark:text-gray-200 leading-relaxed text-sm p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800"
                  >
                    {{ professionalData.data.note }}
                  </p>
                </div>
              </div>
              <div
                v-else
                class="space-y-3 text-sm text-gray-600 dark:text-gray-400 italic"
              >
                Data spesifik profesional belum ditambahkan oleh pengguna.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .container {
    max-width: 1200px;
  }
  * {
    transition: all 0.2s ease-in-out;
  }
</style>
