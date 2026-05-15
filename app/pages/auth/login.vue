<script setup lang="ts">
  // SEO Optimization
  useSeoMeta({
    title: 'Masuk ke JuruTani',
    description: 'Akses akun JuruTani untuk menikmati semua fasilitas penyuluhan digital kami. Mari bertumbuh bersama komunitas petani & peternak di seluruh Indonesia.'
  })

  definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
  })

  const toast = useToast()
  const route = useRoute()
  const authStore = useAuthStore()

  const form = ref({
    email: '',
    password: '',
    remember: false,
  })

  const showPassword = ref(false)

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
  }

  const handleLogin = async () => {
    if (!form.value.email || !form.value.password) {
      toast.add({ title: 'Email dan kata sandi harus diisi.', color: 'warning', icon: 'i-lucide-triangle-alert', duration: 3000 })
      return
    }

    const { success, error, data } = await authStore.signIn(
      form.value.email,
      form.value.password,
    )

    if (success) {
      const fullName = data?.user?.user_metadata?.full_name as
        | string
        | undefined
      const fallbackName = data?.user?.email?.split('@')[0]
      const name = fullName || fallbackName || 'Petani Hebat'
      toast.add({ title: `Selamat datang, ${name}!`, color: 'success', icon: 'i-lucide-check-circle', duration: 3000 })
      const redirect = route.query.redirect as string | undefined
      await navigateTo(redirect || '/')
    } else {
      toast.add({ title: error || 'Email atau kata sandi tidak valid.', color: 'error', icon: 'i-lucide-x-circle', duration: 3000 })
    }
  }

  const handleSocialLogin = async () => {
    const { success, error } = await authStore.signInWithSocialProvider('google')
    if (!success) {
      toast.add({ title: error || 'Login dengan Google gagal.', color: 'error', icon: 'i-lucide-x-circle', duration: 3000 })
    }
  }

  // Expose loading for template
  const isLoading = computed(() => authStore.loading)
</script>

<template>
  <section class="flex flex-col space-y-5 lg:space-y-7 pb-2">
    <header class="space-y-1 lg:space-y-2">
      <p
        class="hidden text-sm font-medium text-emerald-600 dark:text-emerald-400 sm:block"
      >
        Akses akun
      </p>
      <h1
        class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl lg:text-3xl font-sans"
      >
        Selamat datang kembali
      </h1>
      <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
        Masuk untuk melanjutkan aktivitas di JuruTani.
      </p>
    </header>

    <form class="space-y-4 lg:space-y-5" @submit.prevent="handleLogin">
      <UFormField
        label="Email"
        name="email"
        required
        class="font-medium text-neutral-700 dark:text-neutral-300"
      >
        <UInput
          v-model="form.email"
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

      <UFormField
        label="Kata sandi"
        name="password"
        required
        class="font-medium text-neutral-700 dark:text-neutral-300"
      >
        <div class="relative w-full mt-1">
          <UInput
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Masukkan kata sandi"
            size="lg"
            autocomplete="current-password"
            :disabled="isLoading"
            class="w-full"
            :ui="{
              rounded: 'rounded-xl',
              color: {
                white: {
                  outline: 'focus:ring-emerald-500 dark:focus:ring-emerald-400',
                },
              },
            }"
          />
          <UButton
            color="neutral"
            variant="ghost"
            type="button"
            class="absolute inset-y-0 right-3 flex items-center text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
            :aria-label="
              showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
            "
            @click="togglePasswordVisibility"
          >
            <UIcon
              :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              class="h-4 w-4 sm:h-5 sm:w-5"
            />
          </UButton>
        </div>
      </UFormField>

      <div class="flex items-center justify-between pt-0.5">
        <UCheckbox
          v-model="form.remember"
          label="Ingat saya"
          name="remember"
          :disabled="isLoading"
          color="emerald"
          class="text-[11px] sm:text-sm"
        />
        <NuxtLink
          to="/auth/forgot-password"
          class="text-[11px] sm:text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Lupa kata sandi?
        </NuxtLink>
      </div>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="isLoading"
        :disabled="isLoading"
        class="mt-1.5 w-full rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm shadow-emerald-500/20 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/50"
      >
        {{ isLoading ? 'Memproses...' : 'Masuk sekarang' }}
      </UButton>
    </form>

    <div class="relative flex items-center py-1.5">
      <span class="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      <span
        class="px-4 text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider"
        >Atau</span
      >
      <span class="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
    </div>

    <UButton
      variant="outline"
      block
      size="lg"
      color="neutral"
      :disabled="isLoading"
      class="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm"
      @click="handleSocialLogin"
    >
      <UIcon name="i-mdi-google" class="h-4 w-4 sm:h-5 sm:w-5" />
      <span class="font-medium text-sm sm:text-base">Masuk dengan Google</span>
    </UButton>

    <p
      class="text-center text-[11px] sm:text-sm text-neutral-500 dark:text-neutral-400 pt-1"
    >
      Belum punya akun?
      <NuxtLink
        to="/auth/register"
        class="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 ml-1"
      >
        Daftar sekarang
      </NuxtLink>
    </p>
  </section>
</template>

<style scoped>
  .auth-social-btn {
    transition: all 0.2s ease;
  }
  .auth-social-btn:hover {
    transform: translateY(-2px);
  }
</style>
