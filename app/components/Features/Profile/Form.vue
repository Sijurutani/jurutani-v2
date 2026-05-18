<script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'
  import type { Database } from '~/types/database.types'

  type UserData = Database['public']['Tables']['profiles']['Row']

  const authStore = useAuthStore()
  const toast = useJuruTaniToast()

  const props = defineProps<{
    userData: UserData
  }>()

  const emit = defineEmits<{
    update: []
  }>()

  // State
  const loading = ref(false)
  const imageFile = ref<File | null>(null)
  const imagePreview = ref<string | null>(null)

  // Zod Schema
  const schema = z.object({
    full_name: z.string().min(1, 'Nama lengkap wajib diisi'),
    username: z
      .string()
      .regex(/^[a-zA-Z0-9_]*$/, 'Username hanya boleh berisi huruf, angka, dan underscore')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .regex(/^[\d\s\-+()]*$/, 'Format nomor telepon tidak valid')
      .optional()
      .or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    bio: z.string().max(300, 'Bio maksimal 300 karakter').optional().or(z.literal('')),
    website: z
      .string()
      .url('Format website tidak valid')
      .optional()
      .or(z.literal('')),
    birth_date: z.string().optional().or(z.literal('')),
    avatar_url: z.string().optional().or(z.literal('')),
  })

  type Schema = z.output<typeof schema>

  // Form state
  const state = reactive<Schema>({
    full_name: props.userData.full_name || '',
    username: props.userData.username || '',
    phone: props.userData.phone || '',
    address: props.userData.address || '',
    bio: props.userData.bio || '',
    website: props.userData.website || '',
    birth_date: props.userData.birth_date || '',
    avatar_url: props.userData.avatar_url || '',
  })

  // Image handling
  const handleImageSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
    const maxSize = 2 * 1024 * 1024 // 2MB

    if (!validTypes.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.')
      return
    }

    if (file.size > maxSize) {
      toast.error('Ukuran file terlalu besar. Maksimal 2MB.')
      return
    }

    imageFile.value = file

    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const resetImage = () => {
    imageFile.value = null
    imagePreview.value = null
  }

  const resolveUserId = async () => {
    if (authStore.user?.id) return authStore.user.id

    for (let attempt = 0; attempt < 8; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      if (authStore.user?.id) return authStore.user.id
    }

    return null
  }

  // Main submit handler
  const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
    loading.value = true

    try {
      if (!props.userData?.id) {
        toast.error('Anda harus login untuk memperbarui profil.')
        return
      }

      const userId = await resolveUserId()
      if (!userId) {
        toast.error('Sesi login belum siap. Coba lagi beberapa saat.')
        return
      }

      if (userId !== props.userData.id) {
        toast.error('Tidak dapat memperbarui profil pengguna lain.')
        return
      }

      let newAvatarUrl = event.data.avatar_url || ''

      if (imageFile.value) {
        const result = await authStore.uploadAvatar(imageFile.value)
        if (!result.success) throw new Error(result.error || 'Gagal mengupload gambar profil')
        newAvatarUrl = result.data?.avatar_url || ''
        state.avatar_url = newAvatarUrl
      }

      const updates = {
        full_name: (event.data.full_name || '').trim(),
        username: (event.data.username || '').trim() || null,
        phone: (event.data.phone || '').trim() || null,
        address: (event.data.address || '').trim() || null,
        bio: (event.data.bio || '').trim() || null,
        website: (event.data.website || '').trim() || null,
        birth_date: event.data.birth_date || null,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      }

      const { success, error: updateError } = await authStore.updateProfile(updates)
      if (!success) throw new Error(updateError || 'Gagal memperbarui profil')

      emit('update')
      toast.success('Profil berhasil diperbarui.')
      resetImage()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat memperbarui profil.',
      )
    } finally {
      loading.value = false
    }
  }

  const currentAvatar = computed(() => imagePreview.value || state.avatar_url || '/profile.webp')

  const handleImageError = (event: Event) => {
    const target = event?.target as HTMLImageElement | null
    if (target) target.src = '/profile.webp'
  }
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-lg border border-gray-100 dark:border-gray-800 p-6 max-w-2xl mx-auto transition-all duration-200"
    @submit="handleSubmit"
  >
    <h2 class="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
      Edit Profil
    </h2>

    <!-- Avatar Upload -->
    <div class="mb-6">
      <label
        class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
        >Foto Profil</label
      >

      <div class="flex items-center">
        <div
          class="w-24 h-24 rounded-full overflow-hidden mr-4 bg-gray-100 dark:bg-gray-800 shrink-0"
        >
          <NuxtImg
            :src="currentAvatar"
            alt="Avatar Preview"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
        </div>

        <div class="flex flex-col">
          <input
            id="avatar"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageSelect"
          />
          <div class="flex space-x-2">
            <UButton
              color="success"
              variant="soft"
              size="sm"
              as="label"
              for="avatar"
              class="cursor-pointer"
            >
              Pilih Gambar
            </UButton>
            <UButton
              v-if="imagePreview"
              color="neutral"
              variant="soft"
              size="sm"
              type="button"
              @click="resetImage"
            >
              Batal
            </UButton>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Format: JPG, PNG, GIF. Maks. 2MB
          </p>
        </div>
      </div>
    </div>

    <!-- Form Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <!-- Full Name -->
      <div class="md:col-span-2">
        <UFormField label="Nama Lengkap" name="full_name" required>
          <UInput
            id="full_name"
            v-model="state.full_name"
            type="text"
            placeholder="Masukkan nama lengkap Anda"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Username -->
      <div>
        <UFormField label="Username" name="username">
          <UInput
            id="username"
            v-model="state.username"
            type="text"
            placeholder="username_anda"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Phone -->
      <div>
        <UFormField label="Nomor Telepon" name="phone">
          <UInput
            id="phone"
            v-model="state.phone"
            type="tel"
            placeholder="08123456789"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Birth Date -->
      <div>
        <UFormField label="Tanggal Lahir" name="birth_date">
          <UInput id="birth_date" v-model="state.birth_date" type="date" class="w-full" />
        </UFormField>
      </div>

      <!-- Website -->
      <div>
        <UFormField label="Website" name="website">
          <UInput
            id="website"
            v-model="state.website"
            type="url"
            placeholder="https://website-anda.com"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Address -->
      <div class="md:col-span-2">
        <UFormField label="Alamat" name="address">
          <UInput
            id="address"
            v-model="state.address"
            type="text"
            placeholder="Masukkan alamat lengkap Anda"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Bio -->
      <div class="md:col-span-2">
        <UFormField label="Bio" name="bio">
          <UTextarea
            id="bio"
            v-model="state.bio"
            :rows="4"
            placeholder="Ceritakan sedikit tentang diri Anda..."
            class="w-full"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ (state.bio || '').length }}/300 karakter
          </p>
        </UFormField>
      </div>
    </div>

    <!-- Buttons -->
    <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
      <UButton
        type="submit"
        color="success"
        variant="solid"
        size="lg"
        :loading="loading"
        icon="i-lucide-save"
      >
        Simpan Perubahan
      </UButton>
    </div>
  </UForm>
</template>

<style scoped>
  /* Custom scrollbar for textarea */
  textarea::-webkit-scrollbar {
    width: 6px;
  }

  textarea::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  textarea::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  textarea::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>
