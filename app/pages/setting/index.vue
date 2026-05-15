<script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'
  import { toastStore } from '~/composables/useJuruTaniToast'

  const authStore = useAuthStore()
  const supabase = useSupabaseClient()

  // SEO Meta
  useSeoMeta({
    title: 'Pengaturan Akun',
    description: 'Atur preferensi komoditas, notifikasi harga pangan, dan pengaturan akun penyuluhan JuruTani sesuai kebutuhan usaha tani Anda.'
  })

  const currentUser = computed(() => authStore.user)

  // Zod schemas
  const emailSchema = z.object({
    newEmail: z.string().email('Format email tidak valid').min(1, 'Email wajib diisi'),
    confirmEmail: z.string().email('Format email tidak valid').min(1, 'Email konfirmasi wajib diisi'),
  }).refine(data => data.newEmail === data.confirmEmail, {
    message: 'Email konfirmasi tidak cocok',
    path: ['confirmEmail'],
  }).refine(data => data.newEmail.toLowerCase() !== (currentUser.value?.email || '').toLowerCase(), {
    message: 'Email baru harus berbeda dengan email saat ini',
    path: ['newEmail'],
  })

  type EmailSchema = z.output<typeof emailSchema>

  const resetSchema = z.object({
    resetEmail: z.string().email('Format email tidak valid').min(1, 'Email wajib diisi'),
  })

  type ResetSchema = z.output<typeof resetSchema>

  // Form states
  const emailState = reactive<EmailSchema>({
    newEmail: '',
    confirmEmail: '',
  })

  const resetState = reactive<{ resetEmail: string }>({
    resetEmail: '',
  })

  const isLoadingChangeEmail = ref(false)
  const isLoadingResetPassword = ref(false)
  const successMessage = ref('')

  // Handle change email
  const handleChangeEmail = async (event: FormSubmitEvent<EmailSchema>) => {
    successMessage.value = ''
    isLoadingChangeEmail.value = true

    try {
      const { error } = await supabase.auth.updateUser({
        email: event.data.newEmail.toLowerCase().trim(),
      })

      if (error) {
        let errorMessage = 'Gagal mengubah email'
        if (error.message.includes('rate_limit')) errorMessage = 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.'
        else if (error.message.includes('email_address_invalid')) errorMessage = 'Format email tidak valid'
        else if (error.message.includes('email_address_taken')) errorMessage = 'Email sudah digunakan oleh akun lain'
        toastStore.error(errorMessage)
      } else {
        successMessage.value = 'Link konfirmasi berhasil dikirim ke email baru Anda. Silakan cek kotak masuk dan klik link konfirmasi.'
        toastStore.success('Email berhasil diubah! Cek email baru untuk konfirmasi.')
        emailState.newEmail = ''
        emailState.confirmEmail = ''
      }
    } catch (error) {
      toastStore.error('Terjadi kesalahan sistem. Silakan coba lagi.')
    } finally {
      isLoadingChangeEmail.value = false
    }
  }

  // Handle reset password
  const handleResetPassword = async (event: FormSubmitEvent<ResetSchema>) => {
    successMessage.value = ''
    isLoadingResetPassword.value = true

    try {
      const { success, error } = await authStore.resetPassword(event.data.resetEmail.toLowerCase().trim())

      if (!success) {
        let errorMessage = 'Gagal mengirim link reset password'
        if (error && error.includes('rate_limit')) errorMessage = 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.'
        else if (error && error.includes('user_not_found')) errorMessage = 'Email tidak terdaftar di sistem'
        toastStore.error(errorMessage)
      } else {
        successMessage.value = 'Link reset password berhasil dikirim ke email Anda. Silakan cek kotak masuk.'
        toastStore.success('Link reset password berhasil dikirim!')
        resetState.resetEmail = ''
      }
    } catch (error: any) {
      toastStore.error('Terjadi kesalahan sistem. Silakan coba lagi.')
    } finally {
      isLoadingResetPassword.value = false
    }
  }

  onMounted(async () => {
    await authStore.fetchProfile()
    if (currentUser.value?.email) {
      resetState.resetEmail = currentUser.value.email
    }
  })

  watch(currentUser, (user) => {
    if (user?.email && !resetState.resetEmail) {
      resetState.resetEmail = user.email
    }
  })
</script>

<template>
  <div class="min-h-screen py-12 px-4 transition-colors duration-200">
    <div class="max-w-2xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-green-600 dark:bg-green-700 rounded-full mb-4 shadow-lg dark:shadow-green-900/50"
        >
          <UIcon name="i-lucide-shield" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Pengaturan Akun
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Kelola pengaturan email akun JuruTani Anda dengan aman.
        </p>
      </div>

      <div class="space-y-6">
        <!-- Email Settings -->
        <div
          class="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-md border border-gray-200 dark:border-gray-800 p-6 transition-all duration-200"
        >
          <div class="flex items-center mb-6">
            <UIcon
              name="i-lucide-mail"
              class="w-6 h-6 text-green-600 dark:text-green-400 mr-3"
            />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Pengaturan Email
            </h3>
          </div>

          <!-- Current Email Display -->
          <div
            class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-green-400 dark:border-green-600 transition-colors duration-200"
          >
            <p
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email Saat Ini
            </p>
            <p class="text-gray-900 dark:text-white font-medium">
              {{ currentUser?.email || 'Tidak ada email' }}
            </p>
          </div>

          <!-- Change Email Form -->
          <UForm :schema="emailSchema" :state="emailState" class="space-y-4" @submit="handleChangeEmail">
            <UFormField label="Email Baru" name="newEmail" required>
              <UInput
                id="newEmail"
                v-model="emailState.newEmail"
                type="email"
                placeholder="masukkan@email.baru"
                leading-icon="i-lucide-mail"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Konfirmasi Email Baru" name="confirmEmail" required>
              <UInput
                id="confirmEmail"
                v-model="emailState.confirmEmail"
                type="email"
                placeholder="konfirmasi email baru"
                leading-icon="i-lucide-mail"
                class="w-full"
              />
            </UFormField>

            <UButton
              color="success"
              type="submit"
              :loading="isLoadingChangeEmail"
              class="w-full"
            >
              Ubah Email
            </UButton>
          </UForm>
        </div>

        <!-- Password Settings -->
        <div
          class="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-md border border-gray-200 dark:border-gray-800 p-6 transition-all duration-200"
        >
          <div class="flex items-center mb-6">
            <UIcon
              name="i-lucide-key"
              class="w-6 h-6 text-green-600 dark:text-green-400 mr-3"
            />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Pengaturan Password
            </h3>
          </div>

          <UForm :schema="resetSchema" :state="resetState" class="space-y-4" @submit="handleResetPassword">
            <div class="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800 mb-4 transition-colors duration-200">
              <div class="flex items-start">
                <UIcon name="i-lucide-info" class="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 mr-2 shrink-0" />
                <div class="text-sm text-green-800 dark:text-green-200">
                  <p class="font-medium mb-1">Reset Password</p>
                  <p>Kami akan mengirim link reset password ke email Anda.</p>
                </div>
              </div>
            </div>

            <UFormField label="Email Akun" name="resetEmail" required>
              <UInput
                id="resetEmail"
                v-model="resetState.resetEmail"
                type="email"
                placeholder="email@akun.anda"
                leading-icon="i-lucide-mail"
                class="w-full"
              />
            </UFormField>

            <UButton
              color="success"
              type="submit"
              :loading="isLoadingResetPassword"
              class="w-full"
            >
              Kirim Link Reset Password
            </UButton>
          </UForm>
        </div>

        <!-- Success Messages -->
        <div
          v-if="successMessage"
          class="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800 transition-colors duration-200"
        >
          <div class="flex">
            <div class="shrink-0 mt-0.5 mr-2">
              <UIcon
                name="i-lucide-check-circle"
                class="h-5 w-5 text-green-500 dark:text-green-400"
              />
            </div>
            <p class="text-sm text-green-800 dark:text-green-200">
              {{ successMessage }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
