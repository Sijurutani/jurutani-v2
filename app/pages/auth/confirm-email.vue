<!-- pages/auth/confirm-email.vue -->
<script setup lang="ts">
  definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
  })

  useSeoMeta({
    title: 'Verifikasi Email',
    description: 'Periksa inbox email Anda dan klik tautan verifikasi yang baru kami kirim. Langkah validasi ini amat diperlukan guna mengaktifkan akun platform JuruTani.'
  })

  const toast = useToast()
  const authStore = useAuthStore()
  const route = useRoute()

  const email = ref((route.query.email as string) || '')
  const canResend = ref(false)
  const countdown = ref(0)
  let countdownInterval: ReturnType<typeof setInterval> | null = null

  const isLoading = computed(() => authStore.loading)

  const startCountdown = () => {
    canResend.value = false
    countdown.value = 60
    if (countdownInterval) clearInterval(countdownInterval)
    countdownInterval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        canResend.value = true
        if (countdownInterval) clearInterval(countdownInterval)
      }
    }, 1000)
  }

  const handleResendConfirmation = async () => {
    if (!email.value) {
      toast.add({ title: 'Email tidak ditemukan. Silakan daftar kembali.', color: 'error', icon: 'i-lucide-x-circle', duration: 3000 })
      return
    }
    const result = await authStore.resendConfirmation(email.value)
    if (result.success) {
      toast.add({ title: 'Email konfirmasi telah dikirim ulang. Silakan cek kotak masuk Anda.', color: 'success', icon: 'i-lucide-check-circle', duration: 5000 })
      startCountdown()
    } else {
      toast.add({ title: result.error || 'Gagal mengirim ulang email konfirmasi.', color: 'error', icon: 'i-lucide-x-circle', duration: 3000 })
    }
  }

  onBeforeUnmount(() => {
    if (countdownInterval) clearInterval(countdownInterval)
  })

  onMounted(() => {
    startCountdown()
    if (!email.value) {
      toast.add({ title: 'Silakan daftar terlebih dahulu.', color: 'warning', icon: 'i-lucide-triangle-alert', duration: 3000 })
      navigateTo('/auth/register')
    }
  })
</script>
<template>
  <section class="flex flex-col space-y-5 lg:space-y-7 pb-2">
    <div class="text-center space-y-5 py-4">
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-500/20 mb-2"
      >
        <UIcon name="i-lucide-mail" class="h-8 w-8" />
      </div>

      <h1
        class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl lg:text-3xl font-sans"
      >
        Periksa Email Anda
      </h1>

      <div
        class="space-y-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400"
      >
        <p>Kami telah mengirimkan instruksi ke email:</p>
        <p
          class="font-medium text-emerald-600 dark:text-emerald-400 break-all bg-emerald-50 dark:bg-emerald-500/10 py-2 px-3 rounded-lg mx-auto inline-block border border-emerald-100 dark:border-emerald-500/20"
        >
          {{ email }}
        </p>
      </div>

      <div
        class="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 space-y-1.5 text-left bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800"
      >
        <p class="flex items-start gap-2">
          <UIcon
            name="i-lucide-check-circle"
            class="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5"
          />
          <span>Klik link konfirmasi di email untuk mengaktifkan akun.</span>
        </p>
        <p class="flex items-start gap-2">
          <UIcon
            name="i-lucide-info"
            class="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5"
          />
          <span>Periksa folder spam/junk jika tidak menemukan email.</span>
        </p>
        <p class="flex items-start gap-2">
          <UIcon
            name="i-lucide-clock"
            class="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5"
          />
          <span>Link akan kedaluwarsa dalam 24 jam.</span>
        </p>
      </div>

      <div class="pt-4 flex flex-col gap-3">
        <UButton
          v-if="canResend"
          @click="handleResendConfirmation"
          block
          size="lg"
          variant="outline"
          :loading="isLoading"
          :disabled="isLoading"
          class="w-full rounded-xl border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-all duration-300"
        >
          <template #leading>
            <UIcon name="i-lucide-send" class="w-4 h-4" />
          </template>
          Kirim Ulang Email
        </UButton>
        <UButton
          v-else
          block
          size="lg"
          variant="soft"
          color="neutral"
          disabled
          class="w-full rounded-xl opacity-70"
        >
          <template #leading>
            <UIcon name="i-lucide-clock" class="w-4 h-4" />
          </template>
          Kirim ulang dalam {{ countdown }}s
        </UButton>
      </div>
    </div>

    <div
      class="pt-2 text-center border-t border-neutral-100 dark:border-neutral-800/50 mt-6"
    >
      <NuxtLink
        to="/auth/login"
        class="inline-flex items-center gap-1.5 text-[11px] sm:text-sm font-medium text-neutral-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        Sudah konfirmasi? Kembali ke Login
      </NuxtLink>
    </div>
  </section>
</template>
