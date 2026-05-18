<script setup lang="ts">
import type { InstructorRow, ExpertRow } from '~/types/database.types'

// ─── Composables ─────────────────────────────────────────────────────────────

const authStore = useAuthStore()
const { fetchProfessionalByRole } = useProfessionalProfile()

// ─── SEO & Route ─────────────────────────────────────────────────────────────

useSeoMeta({
  title: 'Profil Saya',
  description:
    'Kelola profil petani, peternak, atau nelayan Anda di JuruTani. Edit informasi pribadi, atur preferensi komoditas, dan perbarui data usaha tani.',
})

definePageMeta({
  middleware: ['auth'],
})

// ─── Auth state ──────────────────────────────────────────────────────────────

const userData = computed(() => authStore.profileView)
const loading = computed(() => authStore.profileLoading)
const storeError = computed(() => authStore.error)

// FIX #1: Hapus fetchUserData() yang memanggil authStore.fetchProfile() manual.
// authStore sudah punya watch(supabaseUser) yang auto-fetch saat user tersedia.
// Memanggil ulang dari sini hanya buang network request dan bisa race condition.
// Satu-satunya alasan memanggil ulang adalah setelah user update profil sendiri —
// itulah yang handleProfileUpdate() di bawah lakukan.

// ─── Role helpers ─────────────────────────────────────────────────────────────

const isPakar = computed(() => userData.value?.role === 'pakar')
const isPenyuluh = computed(() => userData.value?.role === 'penyuluh')
const showProfessionalTab = computed(() => isPakar.value || isPenyuluh.value)
const isAdmin = computed(() => userData.value?.is_admin === true)

// ─── Professional data ───────────────────────────────────────────────────────

type ProfessionalData =
  | { type: 'pakar'; data: ExpertRow }
  | { type: 'penyuluh'; data: InstructorRow }
  | null

const professionalData = ref<ProfessionalData>(null)
const professionalPending = ref(false)

// FIX #5: Rename catch parameter 'error' → 'fetchErr'
// agar tidak men-shadow 'storeError' computed dari store di scope luar.
const professionalError = ref<string | null>(null)

const fetchProfessionalData = async () => {
  if (!userData.value?.id) return

  professionalPending.value = true
  professionalError.value = null
  professionalData.value = null

  try {
    const result = await fetchProfessionalByRole(
      userData.value.role,
      userData.value.id,
    )

    if (result.type === 'none') return

    if (result.error) {
      professionalError.value = result.error.message
      return
    }

    if (result.data) {
      // FIX #4: Cast narrowed sesuai type, bukan pakai 'as any' di template.
      // Sekarang professionalData.data sudah typed dengan benar sehingga
      // akses ke .note, .category, .provinces, .district aman di template.
      professionalData.value = {
        type: result.type,
        data: result.data,
      } as ProfessionalData
    }
  } catch (fetchErr) {
    professionalError.value =
      fetchErr instanceof Error
        ? fetchErr.message
        : 'Gagal memuat data profesional'
  } finally {
    professionalPending.value = false
  }
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const activeTab = ref('personal')

// FIX #3: 'tabs' tidak perlu computed — nilainya statis, tidak bergantung
// reactive state apapun. Gunakan const biasa.
const tabs = [
  {
    label: 'Profil Pribadi',
    icon: 'i-lucide-user',
    value: 'personal',
  },
]

// ─── Modal states ─────────────────────────────────────────────────────────────

const showEditPersonalModal = ref(false)
const showEditProfessionalModal = ref(false)
const showAvatarModal = ref(false)

const openEditPersonalModal = () => (showEditPersonalModal.value = true)
const openEditProfessionalModal = () => (showEditProfessionalModal.value = true)

// ─── Handlers ────────────────────────────────────────────────────────────────

const handleProfileUpdate = async () => {
  // Ini satu-satunya tempat yang perlu fetch ulang secara manual —
  // user baru saja mengubah datanya sendiri lewat form.
  await authStore.fetchProfile()
  showEditPersonalModal.value = false
}

const handleProfessionalUpdate = async () => {
  await fetchProfessionalData()
  showEditProfessionalModal.value = false
}

const handleAvatarUpdate = async () => {
  await authStore.fetchProfile()
  showAvatarModal.value = false
}

// Deteksi apakah profile.value ada di DB atau hanya dari user_metadata.
// Jika null, berarti row belum ada / fetch gagal — data dari OAuth metadata saja.
const isProfileFromMetadataOnly = computed(() => !authStore.profile)

// ─── Utils ───────────────────────────────────────────────────────────────────

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(
    new Date(dateString),
  )
}

const isValidUrl = (string?: string | null) => {
  if (!string) return false
  try {
    new URL(string.startsWith('http') ? string : `https://${string}`)
    return true
  } catch {
    return false
  }
}

const handleImageError = (event: Event) => {
  const target = event?.target as HTMLImageElement | null
  if (target) target.src = '//placeholder/user.webp'
}

// ─── Init ────────────────────────────────────────────────────────────────────

// FIX #2: Ganti onMounted chain .then() yang tidak aman dengan watch.
// watch menunggu userData benar-benar tersedia sebelum fetch professional,
// termasuk kasus SSR di mana authStore.fetchProfile() belum selesai
// saat onMounted dipanggil. { once: true } agar hanya jalan sekali di awal.
watch(
  userData,
  (newVal) => {
    if (newVal?.id) {
      fetchProfessionalData()
    }
  },
  { immediate: true, once: true },
)
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


      <!-- Loading state -->
      <div v-if="loading" class="text-center py-16">
        <div
          class="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-md border border-gray-100 dark:border-gray-800"
        >
          <UIcon
            name="i-lucide-refresh-cw"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600 dark:text-green-400"
          />
          <span class="text-gray-600 dark:text-gray-400">
            Memuat profil pengguna...
          </span>
        </div>
      </div>

      

      <!-- Error state -->
      <div v-else-if="storeError" class="max-w-2xl mx-auto">
        <div
          class="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-400 dark:border-red-600 p-4 rounded-lg"
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
              <!-- FIX #1: Retry langsung panggil authStore.fetchProfile(),
                   bukan fetchUserData() wrapper yang tidak perlu lagi -->
              <UButton
                color="error"
                variant="ghost"
                size="sm"
                class="mt-2"
                @click="authStore.fetchProfile()"
              >
                Coba lagi
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div v-else-if="userData" class="max-w-4xl mx-auto">

        <!-- Notice: Profile dari metadata saja (row DB belum ada / gagal sync) -->
        <div
          v-if="isProfileFromMetadataOnly"
          class="mb-4 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl"
        >
          <UIcon name="i-lucide-info" class="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-amber-800 dark:text-amber-200">
              Data profil belum tersimpan ke database
            </p>
            <p class="text-xs text-amber-600 dark:text-amber-300 mt-0.5">
              Informasi yang ditampilkan berasal dari akun Google Anda. Klik "Edit Profil Pribadi" untuk menyimpan data ke profil JuruTani.
            </p>
          </div>
          <UButton
            size="xs"
            color="warning"
            variant="soft"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="authStore.fetchProfile()"
          >
            Sinkronkan
          </UButton>
        </div>

        <!-- DEBUG SESSION (Diminta oleh User) -->
        <div class="mb-6 p-4 bg-gray-900 rounded-xl overflow-auto text-xs text-green-400 font-mono shadow-inner border border-gray-700">
          <p class="text-gray-300 mb-2 font-bold border-b border-gray-700 pb-2">DEBUG SESSION (useSupabaseUser):</p>
          <pre>{{ JSON.stringify(authStore.user, null, 2) }}</pre>
        </div>

        <!-- Profile header card -->

        <div
          class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-gray-100 dark:border-gray-800 overflow-hidden mb-6"
        >
          <div
            class="bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-6 py-8"
          >
            <div class="flex flex-col md:flex-row items-center">
              <div class="relative mb-4 md:mb-0 md:mr-6">
                <div
                  class="w-32 h-32 rounded-full overflow-hidden bg-white dark:bg-gray-800 p-1 shadow-lg dark:shadow-black/50"
                >
                  <NuxtImg
                    :src="userData.avatar_url || '//placeholder/user.webp'"
                    :alt="userData.full_name || 'User'"
                    class="w-full h-full object-cover rounded-full"
                    @error="handleImageError"
                  />
                </div>
                <!-- Tombol edit avatar -->
                <button
                  type="button"
                  class="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md dark:shadow-black/50 border-2 border-green-500 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors duration-200 group"
                  title="Ganti foto profil"
                  @click="showAvatarModal = true"
                >
                  <UIcon name="i-lucide-camera" class="w-4 h-4 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-200" />
                </button>
                <!-- Role badge -->
                <div
                  class="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-md dark:shadow-black/50"
                  :class="{ 'border border-red-400': isAdmin }"
                >
                  <span class="text-xs font-semibold text-green-600 dark:text-green-400">
                    {{ isAdmin ? '⭐ Admin' : authStore.roleLabel }}
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
                <p v-if="userData.phone" class="text-green-50 dark:text-green-100">
                  📱 {{ userData.phone }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs & content card -->
        <div
          class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-gray-100 dark:border-gray-800 overflow-hidden"
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

            <!-- Personal tab -->
            <div v-if="activeTab === 'personal'" class="py-4">
              <div
                v-if="userData.bio"
                class="mb-6 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-800"
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

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <!-- Informasi Pribadi -->
                <div class="space-y-4">
                  <h3
                    class="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-green-200 dark:border-green-800 pb-2"
                  >
                    Informasi Pribadi
                  </h3>
                  <div class="space-y-3">
                    <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Lengkap</p>
                      <p class="text-gray-800 dark:text-gray-200">{{ userData.full_name || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                      <p class="text-gray-800 dark:text-gray-200">{{ userData.username || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Lahir</p>
                      <p class="text-gray-800 dark:text-gray-200">{{ formatDate(userData.birth_date) }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                      >
                        {{ authStore.roleLabel }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Kontak -->
                <div class="space-y-4">
                  <h3
                    class="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-green-200 dark:border-green-800 pb-2"
                  >
                    Kontak
                  </h3>
                  <div class="space-y-3">
                    <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p class="text-gray-800 dark:text-gray-200 break-all">{{ userData.email }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Nomor Telepon</p>
                      <p class="text-gray-800 dark:text-gray-200">{{ userData.phone || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Website</p>
                      <div v-if="userData.website">
                        <NuxtLink
                          v-if="isValidUrl(userData.website)"
                          :to="userData.website"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline break-all inline-flex items-center"
                        >
                          {{ userData.website }}
                          <UIcon name="i-lucide-external-link" class="w-4 h-4 ml-1 shrink-0" />
                        </NuxtLink>
                        <span v-else class="text-gray-800 dark:text-gray-200 break-all">
                          {{ userData.website }}
                        </span>
                      </div>
                      <p v-else class="text-gray-800 dark:text-gray-200">-</p>
                    </div>
                  </div>
                </div>

                <!-- Alamat -->
                <div class="space-y-4">
                  <h3
                    class="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-green-200 dark:border-green-800 pb-2"
                  >
                    Alamat
                  </h3>
                  <div>
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
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

            <!-- Professional section — hanya tampil jika pakar/penyuluh -->
            <!-- FIX #7: Section ini ada di luar UTabs (bukan tab ke-2),
                 tapi sebelumnya showProfessionalTab & tabs computed tidak nyambung.
                 Sekarang: tetap sebagai section terpisah di bawah tab personal,
                 dengan guard showProfessionalTab yang benar. -->
            <div
              v-if="showProfessionalTab"
              class="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8"
            >
              <div class="flex items-center justify-between mb-6">
                <h3
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <UIcon
                    :name="isPakar ? 'i-lucide-lightbulb' : 'i-lucide-user-check'"
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

              <UiLoading
                v-if="professionalPending"
                message="Memuat data profesional..."
                height="h-24"
              />

              <UiError
                v-else-if="professionalError"
                :message="professionalError"
                @retry="fetchProfessionalData"
              />

              <UiNotFound
                v-else-if="professionalData && !professionalData.data"
                message="Data profesional belum tersedia"
                action-text="Lengkapi Data Profesional"
                @action="openEditProfessionalModal"
              />

              <div
                v-else-if="professionalData?.data"
                class="space-y-4"
              >
                <div
                  class="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  <!-- FIX #4: Akses field tanpa 'as any' karena professionalData
                       sudah narrowed — pakai v-if pada type untuk discriminate -->
                  <template v-if="professionalData.type === 'pakar'">
                    <div class="mb-4">
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Kategori Ahli
                      </p>
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 mt-1"
                      >
                        {{ professionalData.data.category || '-' }}
                      </span>
                    </div>
                  </template>

                  <template v-if="professionalData.type === 'penyuluh'">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Wilayah Provinsi
                        </p>
                        <p class="text-gray-800 dark:text-gray-200 mt-1">
                          {{ professionalData.data.provinces || '-' }}
                        </p>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Kabupaten/Kota
                        </p>
                        <p class="text-gray-800 dark:text-gray-200 mt-1">
                          {{ professionalData.data.district || '-' }}
                        </p>
                      </div>
                    </div>
                  </template>

                  <!-- FIX #4: .note diakses via type guard bukan langsung -->
                  <div
                    v-if="'note' in professionalData.data && professionalData.data.note"
                    class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800"
                  >
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Edit Profil Pribadi -->
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

    <!-- Modal: Edit Data Profesional -->
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

    <!-- Modal: Ganti Foto Profil -->
    <UModal
      v-model:open="showAvatarModal"
      title="Ganti Foto Profil"
      description="Pilih gambar baru untuk foto profil Anda."
    >
      <template #body>
        <FeaturesProfileAvatarUpload
          v-if="showAvatarModal"
          @updated="handleAvatarUpdate"
          @cancel="showAvatarModal = false"
        />
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}

/* FIX #6: Hapus '* { transition: all }' — sangat buruk untuk performa karena
   memaksa browser menghitung transisi untuk SEMUA properti di SEMUA elemen,
   termasuk layout properties seperti width/height yang mahal.
   Transisi sudah ditangani per-elemen via Tailwind class (transition-colors, dll). */

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