<script setup lang="ts">
  // SEO Optimization
  useSeoMeta({
    title: 'Lupa Kata Sandi',
    description: 'Masukkan alamat email Anda untuk segera menerima panduan pemulihan kata sandi. Dapatkan kembali akses penuh ke fasilitas penyuluhan agribisnis JuruTani.'
  })

  definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
  })

  const toast = useToast()
  const authStore = useAuthStore()

  const email = ref('')
  const isSubmitted = ref(false)
  const isLoading = computed(() => authStore.loading)

  const resetSubmissionState = () => {
    isSubmitted.value = false
    email.value = ''
  }

  const handleResetPassword = async () => {
    if (!email.value) {
      toast.add({ title: 'Email tidak boleh kosong ...', color: 'warning', icon: 'i-lucide-triangle-alert' })
      return
    }

    const { success, error } = await authStore.resetPassword(email.value)

    if (success) {
      isSubmitted.value = true
      toast.add({ title: 'Benih reset password telah dikirim ke email Anda! 🌱', color: 'success', icon: 'i-lucide-check-circle' })
    } else {
      toast.add({ title: error || 'Gagal mengirim benih reset password. Silakan coba lagi.', color: 'error', icon: 'i-lucide-x-circle' })
    }
  }
</script>

<template>
  <section class="flex flex-col space-y-5 lg:space-y-7 pb-2">
    <div v-if="!isSubmitted">
      <header class="space-y-1 lg:space-y-2 mb-5 lg:mb-7">
        <p
          class="hidden text-sm font-medium text-emerald-600 dark:text-emerald-400 sm:block"
        >
          Pemulihan Akun
        </p>
        <h1
          class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl lg:text-3xl font-sans"
        >
          Lupa Password?
        </h1>
        <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Masukkan email Anda dan kami akan mengirimkan link untuk mereset kata
          sandi.
        </p>
      </header>

      <form
        class="space-y-4 lg:space-y-5"
        @submit.prevent="handleResetPassword"
      >
        <UFormField
          label="Alamat Email"
          name="email"
          required
          class="font-medium text-neutral-700 dark:text-neutral-300"
        >
          <UInput
            v-model="email"
            type="email"
            placeholder="nama@example.com"
            size="lg"
            autocomplete="email"
            :disabled="isLoading"
            class="w-full mt-1"
            :ui="{
              rounded: 'rounded-xl',
              color: {
                white: {
                  outline: 'focus:ring-emerald-500 dark:focus:ring-emerald-400',
                },
              },
            }"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          size="lg"
          :loading="isLoading"
          :disabled="isLoading"
          class="mt-1.5 w-full rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm shadow-emerald-500/20 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/50"
        >
          {{ isLoading ? 'Memproses...' : 'Kirim Link Reset' }}
        </UButton>
      </form>
    </div>

    <!-- Success State -->
    <div v-else class="text-center space-y-5 py-4">
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-500/20 mb-2"
      >
        <UIcon name="i-lucide-mail-check" class="h-8 w-8" />
      </div>

      <h2
        class="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl font-sans"
      >
        Cek Email Anda
      </h2>
      <div
        class="space-y-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400"
      >
        <p>
          Kami telah mengirimkan instruksi pemulihan ke <br />
          <span class="font-medium text-neutral-800 dark:text-neutral-200">{{
            email
          }}</span>
        </p>
        <p>Silakan periksa kotak masuk atau folder spam Anda.</p>
      </div>

      <div class="pt-4 flex flex-col gap-3">
        <UButton
          to="/auth/login"
          block
          size="lg"
          class="w-full rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm shadow-emerald-500/20 transition-all duration-300"
        >
          Kembali ke Login
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          type="button"
          class="text-[11px] sm:text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          @click="resetSubmissionState"
        >
          Kirim ulang link reset
        </UButton>
      </div>
    </div>

    <div
      v-if="!isSubmitted"
      class="pt-2 text-center border-t border-neutral-100 dark:border-neutral-800/50 mt-6"
    >
      <NuxtLink
        to="/auth/login"
        class="inline-flex items-center gap-1.5 text-[11px] sm:text-sm font-medium text-neutral-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        Kembali ke halaman masuk
      </NuxtLink>
    </div>
  </section>
</template>
