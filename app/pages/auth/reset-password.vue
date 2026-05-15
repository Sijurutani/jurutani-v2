<script setup lang="ts">
  import type { Database } from '~/types/database.types'

  // SEO Optimization
  useSeoMeta({
    title: 'Buat Kata Sandi Baru',
    description: 'Buat kombinasi kata sandi baru yang kuat guna amankan kembali akun JuruTani Anda. Pastikan kerahasiaan data demi kelancaran memakai layanan penyuluhan.'
  })

  definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
  })

  const toast = useToast()
  const authStore = useAuthStore()
  const client = useSupabaseClient<Database>()
  const router = useRouter()

  const password = ref('')
  const confirmPassword = ref('')
  const isValidSession = ref(false)
  const isCheckingSession = ref(true)
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)

  const isPasswordValid = computed(() => password.value.length >= 8)
  const isFormValid = computed(
    () =>
      isPasswordValid.value &&
      password.value === confirmPassword.value &&
      password.value.length > 0,
  )
  const isLoading = computed(() => authStore.loading)

  onMounted(async () => {
    try {
      const {
        data: { session },
      } = await client.auth.getSession()
      if (session) {
        isValidSession.value = true
      } else {
        toast.add({ title: 'Link reset password tidak valid atau sudah kadaluarsa.', color: 'error', icon: 'i-lucide-x-circle' })
        setTimeout(() => router.push('/auth/forgot-password'), 2000)
      }
    } catch {
      toast.add({ title: 'Terjadi kesalahan saat memverifikasi session.', color: 'error', icon: 'i-lucide-x-circle' })
      router.push('/auth/forgot-password')
    } finally {
      isCheckingSession.value = false
    }
  })

  const handleUpdatePassword = async () => {
    if (!isFormValid.value) {
      toast.add({ title: 'Pastikan semua field diisi dengan benar.', color: 'warning', icon: 'i-lucide-triangle-alert' })
      return
    }
    if (password.value !== confirmPassword.value) {
      toast.add({ title: 'Password konfirmasi tidak cocok.', color: 'error', icon: 'i-lucide-x-circle' })
      return
    }

    const { success, error } = await authStore.updatePassword(password.value)

    if (!success) {
      toast.add({ title: 'Gagal mengupdate password. ' + (error || ''), color: 'error', icon: 'i-lucide-x-circle' })
      return
    }

    toast.add({ title: 'Password berhasil diperbarui!', color: 'success', icon: 'i-lucide-check-circle' })
    setTimeout(() => router.push('/auth/login'), 2000)
  }
</script>

<template>
  <section class="flex flex-col space-y-5 lg:space-y-7 pb-2">
    <!-- Loading State -->
    <div
      v-if="isCheckingSession"
      class="flex flex-col items-center justify-center py-10 space-y-4"
    >
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"
      />
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Memverifikasi sesi Anda...
      </p>
    </div>

    <!-- Main Form -->
    <div v-else-if="isValidSession">
      <header class="space-y-1 lg:space-y-2 mb-5 lg:mb-7">
        <p
          class="hidden text-sm font-medium text-emerald-600 dark:text-emerald-400 sm:block"
        >
          Perbarui Akun
        </p>
        <h1
          class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl lg:text-3xl font-sans"
        >
          Reset Password
        </h1>
        <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Buat kata sandi baru untuk akun JuruTani Anda.
        </p>
      </header>

      <form
        class="space-y-4 lg:space-y-5"
        @submit.prevent="handleUpdatePassword"
      >
        <UFormField
          label="Kata Sandi Baru"
          name="password"
          required
          class="font-medium text-neutral-700 dark:text-neutral-300"
        >
          <div class="relative w-full mt-1">
            <UInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Minimal 8 karakter"
              size="lg"
              class="w-full"
              :disabled="isLoading"
              :ui="{
                rounded: 'rounded-xl',
                color: {
                  white: {
                    outline:
                      'focus:ring-emerald-500 dark:focus:ring-emerald-400',
                  },
                },
              }"
            />
            <UButton
              color="neutral"
              variant="ghost"
              type="button"
              class="absolute inset-y-0 right-3 flex items-center text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
              @click="showPassword = !showPassword"
            >
              <UIcon
                :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="h-4 w-4 sm:h-5 sm:w-5"
              />
            </UButton>
          </div>
          <p
            v-if="password && !isPasswordValid"
            class="text-[10px] sm:text-xs text-red-500 mt-1.5 font-medium"
          >
            Kata sandi minimal 8 karakter
          </p>
        </UFormField>

        <UFormField
          label="Konfirmasi Kata Sandi"
          name="confirmPassword"
          required
          class="font-medium text-neutral-700 dark:text-neutral-300"
        >
          <div class="relative w-full mt-1">
            <UInput
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Ulangi kata sandi baru"
              size="lg"
              class="w-full"
              :disabled="isLoading"
              :ui="{
                rounded: 'rounded-xl',
                color: {
                  white: {
                    outline:
                      'focus:ring-emerald-500 dark:focus:ring-emerald-400',
                  },
                },
              }"
            />
            <UButton
              color="neutral"
              variant="ghost"
              type="button"
              class="absolute inset-y-0 right-3 flex items-center text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <UIcon
                :name="
                  showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                "
                class="h-4 w-4 sm:h-5 sm:w-5"
              />
            </UButton>
          </div>
          <p
            v-if="confirmPassword && password !== confirmPassword"
            class="text-[10px] sm:text-xs text-red-500 mt-1.5 font-medium"
          >
            Kata sandi tidak cocok
          </p>
        </UFormField>

        <UButton
          type="submit"
          block
          size="lg"
          :loading="isLoading"
          :disabled="isLoading || !isFormValid"
          class="mt-1.5 w-full rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm shadow-emerald-500/20 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/50"
        >
          {{ isLoading ? 'Memperbarui...' : 'Update Password' }}
        </UButton>
      </form>

      <div
        class="pt-2 text-center border-t border-neutral-100 dark:border-neutral-800/50 mt-6"
      >
        <NuxtLink
          to="/auth/login"
          class="inline-flex items-center gap-1.5 text-[11px] sm:text-sm font-medium text-neutral-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 transition-colors"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
          Batal dan kembali ke Login
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
