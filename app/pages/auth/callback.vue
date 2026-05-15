<script setup lang="ts">
  import { toastStore } from '~/composables/useJuruTaniToast'

  definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
    ssr: false,
  })

  useSeoMeta({
    title: 'Memproses',
    description: 'Sistem JuruTani sedang memproses autentikasi akun Anda secara aman. Mohon tunggu beberapa saat selagi kami menyiapkan akses masuk ke beranda platform.'
  })

  const authStore = useAuthStore()
  const loading = ref(true)
  const statusMessage = ref('Memproses login...')

  onMounted(async () => {
    try {
      // Beri waktu @nuxtjs/supabase menyelesaikan pertukaran session secara internal
      // Module ini sudah handle PKCE + exchangeCodeForSession otomatis di background
      let attempts = 0
      const maxAttempts = 20 // maksimal 10 detik (20 x 500ms)

      const waitForSession = () =>
        new Promise<void>((resolve) => {
          const check = async () => {
            attempts++
            const user = authStore.user

            if (user) {
              resolve()
              return
            }

            if (attempts >= maxAttempts) {
              resolve() // resolve agar tidak hang, user akan null → redirect ke login
              return
            }

            setTimeout(check, 500)
          }
          check()
        })

      statusMessage.value = 'Memverifikasi akun...'
      await waitForSession()

      const user = authStore.user

      if (!user) {
        toastStore.error(
          'Login gagal atau sesi tidak ditemukan. Silakan coba lagi.',
          5000,
        )
        await navigateTo('/auth/login?error=oauth_failed')
        return
      }

      statusMessage.value = 'Memuat profil...'
      await authStore.fetchProfile(user.id)

      const fullName =
        authStore.displayName || user.email?.split('@')[0] || 'Petani Hebat'
      toastStore.success(`Selamat datang, ${fullName}!`, 3000)

      statusMessage.value = 'Mengarahkan...'
      await navigateTo('/')
    } catch (err: any) {
      toastStore.error(
        'Terjadi kesalahan: ' + (err?.message || 'Error tidak diketahui'),
        5000,
      )
      await navigateTo('/auth/login?error=callback_failed')
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <section
    v-if="loading"
    class="flex flex-col items-center justify-center py-12 space-y-5"
  >
    <div class="relative flex h-16 w-16 items-center justify-center">
      <div
        class="absolute inset-0 rounded-full border-[3px] border-emerald-100 dark:border-emerald-500/20"
      />
      <div
        class="absolute inset-0 animate-spin rounded-full border-[3px] border-emerald-500 border-t-transparent"
      />
      <UIcon name="i-lucide-loader-2" class="h-6 w-6 text-emerald-500" />
    </div>

    <div class="text-center space-y-1.5">
      <h2
        class="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white font-sans"
      >
        {{ statusMessage }}
      </h2>
      <p class="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400">
        Mohon tunggu sebentar, kami sedang menyiapkan akun Anda.
      </p>
    </div>
  </section>
</template>
