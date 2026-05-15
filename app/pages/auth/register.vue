<!-- pages/auth/register.vue -->
<script setup lang="ts">
  // SEO Optimization
  useSeoMeta({
    title: 'Daftar Gratis',
    description: 'Buat akun JuruTani secara gratis dan jadilah bagian dari komunitas tani digital. Nikmati ragam akses edukasi, fitur konsultasi ahli, dan info komoditas.'
  })

  definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
  })

  const toast = useToast()
  const authStore = useAuthStore()

  const form = ref({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })

  const showPassword = ref(false)
  const showConfirmPassword = ref(false)

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
  }
  const toggleConfirmPasswordVisibility = () => {
    showConfirmPassword.value = !showConfirmPassword.value
  }

  const passwordStrength = computed(() => {
    const p = form.value.password
    if (!p) return { score: 0, text: '', color: '' }
    const score = [
      p.length >= 8,
      /[a-z]/.test(p),
      /[A-Z]/.test(p),
      /\d/.test(p),
      /[!@#$%^&*(),.?":{}|<>]/.test(p),
    ].filter(Boolean).length
    if (score <= 2) return { score, text: 'Lemah', color: 'text-red-500' }
    if (score <= 3) return { score, text: 'Sedang', color: 'text-yellow-500' }
    if (score <= 4) return { score, text: 'Kuat', color: 'text-green-500' }
    return { score, text: 'Sangat Kuat', color: 'text-green-600' }
  })

  const passwordsMatch = computed(() => {
    if (!form.value.confirmPassword) return null
    return form.value.password === form.value.confirmPassword
  })

  const isLoading = computed(() => authStore.loading)

  const handleRegister = async () => {
    const { fullName, email, password, confirmPassword, agreeTerms } =
      form.value

    if (!fullName || !email || !password || !confirmPassword) {
      toast.add({ title: 'Semua field harus diisi.', color: 'warning', icon: 'i-lucide-triangle-alert', duration: 3000 })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.add({ title: 'Format email tidak valid.', color: 'warning', icon: 'i-lucide-triangle-alert', duration: 3000 })
      return
    }
    if (password.length < 8) {
      toast.add({ title: 'Kata sandi harus minimal 8 karakter.', color: 'warning', icon: 'i-lucide-triangle-alert', duration: 3000 })
      return
    }
    if (password !== confirmPassword) {
      toast.add({ title: 'Kata sandi dan konfirmasi kata sandi tidak cocok.', color: 'warning', icon: 'i-lucide-triangle-alert', duration: 3000 })
      return
    }
    if (!agreeTerms) {
      toast.add({ title: 'Anda harus menyetujui syarat dan ketentuan.', color: 'warning', icon: 'i-lucide-triangle-alert', duration: 3000 })
      return
    }

    const result = await authStore.signUp(email, password, fullName)

    if (result.success) {
      toast.add({ title: 'Pendaftaran berhasil! Silakan periksa email Anda.', color: 'success', icon: 'i-lucide-check-circle', duration: 3000 })
      await navigateTo({ path: '/auth/confirm-email', query: { email } })
    } else {
      toast.add({ title: result.error || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.', color: 'error', icon: 'i-lucide-x-circle', duration: 5000 })
    }
  }

  const handleSocialLogin = async () => {
    const { success, error } =
      await authStore.signInWithSocialProvider('google')
    if (!success) {
      toast.add({ title: error || 'Login dengan Google gagal.', color: 'error', icon: 'i-lucide-x-circle', duration: 3000 })
    }
  }
</script>
<template>
  <section class="flex flex-col space-y-4 lg:space-y-6 pb-2">
    <header class="space-y-1 lg:space-y-2">
      <p
        class="hidden text-sm font-medium text-emerald-600 dark:text-emerald-400 sm:block"
      >
        Registrasi akun
      </p>
      <h1
        class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl lg:text-3xl font-sans"
      >
        Buat akun baru
      </h1>
      <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
        Gabung ke JuruTani dan kelola aktivitas pertanianmu.
      </p>
    </header>

    <form class="space-y-3 lg:space-y-5" @submit.prevent="handleRegister">
      <UFormField
        label="Nama lengkap"
        name="fullName"
        required
        class="font-medium text-neutral-700 dark:text-neutral-300"
      >
        <UInput
          v-model="form.fullName"
          placeholder="Contoh: Budi Santoso"
          size="md"
          autocomplete="name"
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
        label="Email"
        name="email"
        required
        class="font-medium text-neutral-700 dark:text-neutral-300"
      >
        <UInput
          v-model="form.email"
          type="email"
          placeholder="nama@example.com"
          size="md"
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
        <div class="relative mt-1 w-full">
          <UInput
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Minimal 8 karakter"
            size="md"
            autocomplete="new-password"
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

        <div v-if="form.password" class="mt-1.5">
          <div
            class="mb-1 flex items-center justify-between text-[11px] sm:text-xs"
          >
            <span class="text-neutral-500 dark:text-neutral-400"
              >Kekuatan kata sandi</span
            >
            <span :class="[passwordStrength.color, 'font-medium']">{{
              passwordStrength.text
            }}</span>
          </div>
          <div
            class="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
          >
            <div
              class="h-full rounded-full transition-all duration-300 ease-out"
              :class="{
                'bg-red-400 dark:bg-red-500': passwordStrength.score <= 2,
                'bg-amber-400 dark:bg-amber-500': passwordStrength.score === 3,
                'bg-emerald-400 dark:bg-emerald-500':
                  passwordStrength.score >= 4,
              }"
              :style="{ width: `${(passwordStrength.score / 5) * 100}%` }"
            />
          </div>
        </div>
      </UFormField>

      <UFormField
        label="Konfirmasi kata sandi"
        name="confirmPassword"
        required
        class="font-medium text-neutral-700 dark:text-neutral-300"
      >
        <div class="relative mt-1 w-full">
          <UInput
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Ulangi kata sandi"
            size="md"
            autocomplete="new-password"
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
              showConfirmPassword
                ? 'Sembunyikan konfirmasi kata sandi'
                : 'Tampilkan konfirmasi kata sandi'
            "
            @click="toggleConfirmPasswordVisibility"
          >
            <UIcon
              :name="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              class="h-4 w-4 sm:h-5 sm:w-5"
            />
          </UButton>
        </div>

        <p
          v-if="form.confirmPassword"
          class="mt-1.5 flex items-center gap-1.5 text-[11px] sm:text-xs font-medium"
        >
          <UIcon
            :name="
              passwordsMatch ? 'i-lucide-check-circle' : 'i-lucide-circle-x'
            "
            :class="passwordsMatch ? 'text-emerald-500' : 'text-red-500'"
            class="h-3.5 w-3.5"
          />
          <span
            :class="
              passwordsMatch
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            "
          >
            {{
              passwordsMatch
                ? 'Kata sandi sudah cocok'
                : 'Kata sandi belum cocok'
            }}
          </span>
        </p>
      </UFormField>

      <div class="pt-0.5">
        <UCheckbox
          v-model="form.agreeTerms"
          name="agreeTerms"
          :disabled="isLoading"
          color="emerald"
          class="items-start"
        >
          <template #label>
            <span
              class="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 leading-tight"
            >
              Saya menyetujui
              <NuxtLink
                to="/terms"
                class="font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >Syarat & Ketentuan</NuxtLink
              >
              dan
              <NuxtLink
                to="/privacy-policy"
                class="font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >Kebijakan Privasi</NuxtLink
              >
            </span>
          </template>
        </UCheckbox>
      </div>

      <UButton
        type="submit"
        block
        size="md"
        :loading="isLoading"
        :disabled="isLoading || !form.agreeTerms || passwordsMatch === false"
        class="mt-1.5 w-full rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm shadow-emerald-500/20 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/50 lg:size-lg"
      >
        {{ isLoading ? 'Mendaftar...' : 'Daftar sekarang' }}
      </UButton>
    </form>

    <p
      class="text-center text-[11px] sm:text-sm text-neutral-500 dark:text-neutral-400 pt-1"
    >
      Sudah punya akun?
      <NuxtLink
        to="/auth/login"
        class="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 ml-1"
      >
        Masuk sekarang
      </NuxtLink>
    </p>
  </section>
</template>

<style scoped>
  /* Maintained clean styles without gradients */
</style>
