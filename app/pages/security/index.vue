<script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'
  import { useJuruTaniToast } from '@/composables/useJuruTaniToast'

  const supabase = useSupabaseClient()
  const toast = useJuruTaniToast()

  // SEO Meta
  useSeoMeta({
    title: 'Keamanan Akun',
    description: 'Kelola keamanan akun JuruTani Anda. Atur verifikasi dua langkah, ganti kata sandi, dan lindungi akses ke layanan penyuluhan digital Anda.'
  })

  const schema = z.object({
    newPassword: z.string()
      .min(6, 'Password minimal 6 karakter')
      .refine(val => {
        let score = 0
        if (val.length >= 8) score++
        if (/[a-z]/.test(val)) score++
        if (/[A-Z]/.test(val)) score++
        if (/[0-9]/.test(val)) score++
        if (/[^A-Za-z0-9]/.test(val)) score++
        return score >= 3
      }, 'Password terlalu lemah. Gunakan kombinasi huruf besar, kecil, angka, dan simbol.'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  })

  type Schema = z.output<typeof schema>

  // Form state
  const state = reactive<Schema>({
    newPassword: '',
    confirmPassword: '',
  })

  const loading = ref(false)
  const showNewPassword = ref(false)
  const showConfirmPassword = ref(false)

  // Password strength calculation
  const passwordStrength = computed(() => {
    const password = state.newPassword
    let score = 0

    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    return score
  })

  const passwordStrengthText = computed(() => {
    const score = passwordStrength.value
    if (score === 0) return ''
    if (score <= 2) return 'Lemah'
    if (score <= 4) return 'Sedang'
    return 'Kuat'
  })

  const passwordStrengthColor = computed(() => {
    const score = passwordStrength.value
    if (score <= 2) return 'bg-red-500'
    if (score <= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  })

  const passwordStrengthTextColor = computed(() => {
    const score = passwordStrength.value
    if (score <= 2) return 'text-red-600'
    if (score <= 4) return 'text-yellow-600'
    return 'text-green-600'
  })

  const passwordStrengthWidth = computed(() => {
    const score = passwordStrength.value
    return `${Math.min(score * 16.67, 100)}%`
  })

  // Form validation
  const isFormValid = computed(() => state.newPassword.length >= 6 && state.newPassword === state.confirmPassword)

  const handleChangePassword = async (event: FormSubmitEvent<Schema>) => {
    loading.value = true

    try {
      const { error } = await supabase.auth.updateUser({
        password: event.data.newPassword,
      })

      if (error) {
        let errorMessage = 'Gagal mengganti password'

        if (error.message.includes('rate_limit')) {
          errorMessage =
            'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.'
        } else if (error.message.includes('weak_password')) {
          errorMessage =
            'Password terlalu lemah. Gunakan password yang lebih kuat.'
        } else if (error.message.includes('same_password')) {
          errorMessage = 'Password baru tidak boleh sama dengan password lama.'
        }

        toast.error(errorMessage)
      } else {
        toast.success('Password berhasil diperbarui! Akun Anda sekarang lebih aman.')
        state.newPassword = ''
        state.confirmPassword = ''

        // Optional: redirect after success
        // setTimeout(() => {
        //   navigateTo('/profile')
        // }, 2000)
      }
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('Terjadi kesalahan sistem. Silakan coba lagi.')
    } finally {
      loading.value = false
    }
  }

  // Auto-focus new password input on mount
  onMounted(() => {
    const passwordInput = document.getElementById('newPassword')
    if (passwordInput) {
      passwordInput.focus()
    }
  })
</script>

<template>
  <main class="min-h-screen font-sans">
    <!-- ════════ HERO ════════ -->
    <header class="pt-32 pb-12 flex flex-col items-center text-center px-5">
      <!-- Logo circle -->
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-white dark:bg-gray-900/60 border border-green-100 dark:border-gray-700">
          <NuxtImg
            src="/jurutani/small-transparent.webp"
            alt="JuruTani Logo"
            class="w-10 h-10"
            width="40"
            height="40"
          />
        </div>
      </div>

      <!-- Badge -->
      <div class="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-6
                  bg-white/55 dark:bg-white/[0.08]
                  border border-white/70 dark:border-white/[0.18]
                  rounded-full backdrop-blur-md
                  text-[0.7rem] font-bold tracking-widest uppercase
                  text-emerald-700 dark:text-emerald-300
                  shadow-[0_2px_12px_rgba(16,185,129,0.1)]
                  overflow-hidden">
        <span class="block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
        <span>Keamanan</span>
        <span
          class="absolute top-0 left-0 w-[55%] h-full pointer-events-none rounded-[inherit]"
          style="background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
                 animation: badge-sweep 3.5s ease-in-out infinite;"
          aria-hidden="true"
        />
      </div>

      <!-- Title -->
      <h1 class="text-[clamp(2.25rem,5vw,3.75rem)] font-black leading-[1.1] tracking-tight text-gray-900 dark:text-gray-50 mb-5">
        Keamanan<br />
        <span class="bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
          Akun
        </span>
      </h1>

      <!-- Description -->
      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400 max-w-[38rem]">
        Pastikan akun Anda terlindungi dengan mengganti password secara berkala menggunakan kombinasi yang kuat.
      </p>
    </header>

    <div class="max-w-md mx-auto px-5 sm:px-8 pb-20 sm:pb-24">
      <!-- Form Card -->
      <div class="p-7 rounded-2xl bg-white dark:bg-white/5 border border-emerald-100/70 dark:border-emerald-900/40 shadow-sm relative overflow-hidden transition-all duration-200">
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-50" />
        <div class="relative z-10">
          <UForm :schema="schema" :state="state" class="space-y-6" @submit="handleChangePassword">
            <!-- Password Strength Info -->
            <div
              class="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border-l-4 border-blue-400 dark:border-blue-600 transition-colors duration-200"
            >
              <div class="flex items-start">
                <UIcon
                  name="i-lucide-info"
                  class="w-5 h-5 text-blue-400 dark:text-blue-500 mt-0.5 mr-2 shrink-0"
                />
                <div>
                  <p
                    class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1"
                  >
                    Tips Password Kuat
                  </p>
                  <ul
                    class="text-sm text-blue-800 dark:text-blue-200 space-y-1"
                  >
                    <li>• Minimal 8 karakter</li>
                    <li>• Kombinasi huruf besar, kecil, dan angka</li>
                    <li>• Gunakan simbol (!@#$%)</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- New Password Input -->
            <UFormField label="Password Baru" name="newPassword" required>
              <UInput
                id="newPassword"
                v-model="state.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Masukkan password baru"
                leading-icon="i-lucide-lock"
                class="w-full"
              >
                <template #trailing>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    :icon="showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    size="xs"
                    @click="showNewPassword = !showNewPassword"
                  />
                </template>
              </UInput>
              <!-- Password Strength Indicator -->
              <div v-if="state.newPassword" class="mt-2">
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all duration-300"
                      :class="passwordStrengthColor"
                      :style="{ width: passwordStrengthWidth }"
                    />
                  </div>
                  <span class="text-sm font-medium dark:text-gray-300" :class="passwordStrengthTextColor">
                    {{ passwordStrengthText }}
                  </span>
                </div>
              </div>
            </UFormField>

            <!-- Confirm Password Input -->
            <UFormField label="Konfirmasi Password" name="confirmPassword" required>
              <UInput
                id="confirmPassword"
                v-model="state.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Ulangi password baru"
                leading-icon="i-lucide-lock"
                class="w-full"
              >
                <template #trailing>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    :icon="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    size="xs"
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </UInput>
              <!-- Password Match Indicator -->
              <div v-if="state.confirmPassword" class="flex items-center mt-2">
                <UIcon
                  :name="state.newPassword === state.confirmPassword ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
                  :class="state.newPassword === state.confirmPassword ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'"
                  class="w-4 h-4 mr-2"
                />
                <span
                  :class="state.newPassword === state.confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                  class="text-sm font-medium"
                >
                  {{ state.newPassword === state.confirmPassword ? 'Password cocok' : 'Password tidak cocok' }}
                </span>
              </div>
            </UFormField>

            <!-- Submit Button -->
            <UButton
              color="success"
              type="submit"
              :loading="loading"
              icon="i-lucide-shield-check"
              class="w-full"
            >
              Simpan Password
            </UButton>
          </UForm>

          <!-- Footer -->
          <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800/50 transition-colors duration-200">
          <div class="flex items-center justify-between text-sm">
            <UButton
              color="neutral"
              variant="ghost"
              type="button"
              class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 flex items-center"
              @click="$router.back()"
            >
              <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-1" />
              Kembali
            </UButton>
            <div class="flex items-center text-gray-500 dark:text-gray-400">
              <UIcon name="i-lucide-shield-check" class="w-4 h-4 mr-1" />
              <span>Enkripsi 256-bit</span>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
@keyframes badge-sweep {
  0% { transform: translateX(-200%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateX(280%); opacity: 0; }
}
</style>
