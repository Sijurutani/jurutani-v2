<script setup lang="ts">
const authStore = useAuthStore()
const toast = useJuruTaniToast()

const emit = defineEmits<{
  updated: []
  cancel: []
}>()

// ─── State ────────────────────────────────────────────────────────────────────

const isDragging = ref(false)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const uploading = ref(false)
const errorMsg = ref<string | null>(null)

// ─── Computed ─────────────────────────────────────────────────────────────────

const currentAvatar = computed(
  () => imagePreview.value || authStore.avatarUrl || '//placeholder/user.webp',
)

// ─── Drag & Drop ──────────────────────────────────────────────────────────────

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) validateAndPreview(file)
}

// ─── File Handling ────────────────────────────────────────────────────────────

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 2

const validateAndPreview = (file: File) => {
  errorMsg.value = null

  if (!ALLOWED_TYPES.includes(file.type)) {
    errorMsg.value = 'Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.'
    return
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    errorMsg.value = `Ukuran file terlalu besar. Maksimal ${MAX_SIZE_MB}MB.`
    return
  }

  imageFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const onFileInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) validateAndPreview(file)
  // Reset input agar file yang sama bisa dipilih ulang
  target.value = ''
}

const resetSelection = () => {
  imageFile.value = null
  imagePreview.value = null
  errorMsg.value = null
}

// ─── Upload ───────────────────────────────────────────────────────────────────

const handleUpload = async () => {
  if (!imageFile.value) return

  uploading.value = true
  errorMsg.value = null

  try {
    const result = await authStore.uploadAvatar(imageFile.value)

    if (!result.success) {
      errorMsg.value = result.error ?? 'Gagal mengunggah foto profil.'
      return
    }

    toast.success('Foto profil berhasil diperbarui.')
    emit('updated')
  } catch (err) {
    errorMsg.value =
      err instanceof Error ? err.message : 'Terjadi kesalahan saat upload.'
  } finally {
    uploading.value = false
  }
}

const handleImageError = (event: Event) => {
  const target = event?.target as HTMLImageElement | null
  if (target) target.src = '//placeholder/user.webp'
}
</script>

<template>
  <div class="p-2 space-y-5">
    <!-- Preview Avatar -->
    <div class="flex justify-center">
      <div class="relative">
        <div
          class="w-28 h-28 rounded-full overflow-hidden ring-4 ring-green-200 dark:ring-green-800 shadow-lg"
        >
          <NuxtImg
            :src="currentAvatar"
            alt="Preview foto profil"
            class="w-full h-full object-cover transition-all duration-300"
            @error="handleImageError"
          />
        </div>
        <!-- Loading overlay saat upload -->
        <div
          v-if="uploading"
          class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center"
        >
          <UIcon name="i-lucide-loader-2" class="w-6 h-6 text-white animate-spin" />
        </div>
      </div>
    </div>

    <!-- Drag & Drop / File Picker -->
    <div
      class="relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer"
      :class="[
        isDragging
          ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
          : imageFile
            ? 'border-green-400 bg-green-50/50 dark:bg-green-950/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 hover:bg-gray-50 dark:hover:bg-gray-800/30',
      ]"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="($refs.fileInput as HTMLInputElement)?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        class="hidden"
        @change="onFileInput"
      />

      <div v-if="!imageFile" class="space-y-2">
        <UIcon
          name="i-lucide-image-up"
          class="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500"
        />
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Klik atau seret foto ke sini
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          JPG, PNG, WebP, GIF · Maksimal {{ MAX_SIZE_MB }}MB
        </p>
      </div>

      <div v-else class="space-y-2">
        <UIcon
          name="i-lucide-circle-check"
          class="w-8 h-8 mx-auto text-green-500"
        />
        <p class="text-sm font-medium text-green-700 dark:text-green-400">
          {{ imageFile.name }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ (imageFile.size / 1024 / 1024).toFixed(2) }}MB · Siap diunggah
        </p>
      </div>
    </div>

    <!-- Error message -->
    <div
      v-if="errorMsg"
      class="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300"
    >
      <UIcon name="i-lucide-circle-x" class="w-4 h-4 shrink-0 mt-0.5" />
      {{ errorMsg }}
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-between gap-3 pt-2">
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-x"
        :disabled="uploading"
        @click="emit('cancel')"
      >
        Batal
      </UButton>

      <div class="flex items-center gap-2">
        <UButton
          v-if="imageFile"
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-lucide-rotate-ccw"
          :disabled="uploading"
          @click.stop="resetSelection"
        >
          Pilih Ulang
        </UButton>
        <UButton
          color="success"
          size="sm"
          icon="i-lucide-upload"
          :loading="uploading"
          :disabled="!imageFile || uploading"
          @click.stop="handleUpload"
        >
          Simpan Foto
        </UButton>
      </div>
    </div>
  </div>
</template>
