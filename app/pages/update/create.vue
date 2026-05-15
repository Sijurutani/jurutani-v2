<script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '#ui/types'
  import type { JSONContent } from '@tiptap/vue-3'
  import { toastStore } from '~/composables/useJuruTaniToast'
  import {
    uploadNewsFile,
    formatFileSize,
    validateFileSize,
    validateFileType,
    fileToBase64,
  } from '~/utils/storage'
  import {
    NEWS_TIPTAP_SUGGESTION_ITEMS,
    getEmptyTiptapDoc,
    hasMeaningfulTiptapContent,
  } from '~/composables/useTiptapContent'

  definePageMeta({
    layout: 'default',
  })

  useSeoMeta({
    title: 'Buat Berita Baru',
    description: 'Buat artikel berita baru dengan editor lengkap',
  })

  const supabase = useSupabaseClient()
  const router = useRouter()

  // Konstanta lokal
  const NEWS_UPDATED_CONSTANTS = {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_GALLERY_IMAGES: 10,
    MAX_ATTACHMENTS: 5,
  }

  function generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function validateImageFile(
    file,
    maxSize = NEWS_UPDATED_CONSTANTS.MAX_IMAGE_SIZE,
  ) {
    if (!file.type.startsWith('image/')) {
      toastStore.error(`File ${file.name} bukan gambar`)
      return false
    }
    if (file.size > maxSize) {
      toastStore.error(
        `Ukuran ${file.name} terlalu besar (maks ${Math.round(maxSize / 1024 / 1024)}MB)`,
      )
      return false
    }
    return true
  }

  function validateAttachmentFile(file) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    if (!validateFileType(file, allowedTypes)) {
      toastStore.error(
        `File ${file.name} bukan format yang didukung (PDF, DOC, DOCX, XLS, XLSX)`,
      )
      return false
    }
    if (file.size > NEWS_UPDATED_CONSTANTS.MAX_ATTACHMENT_SIZE) {
      toastStore.error(`Ukuran ${file.name} terlalu besar (maks 10MB)`)
      return false
    }
    return true
  }

  async function uploadCoverImage(file, slug) {
    return await uploadNewsFile('images', slug, file)
  }

  async function uploadGalleryImages(files, slug) {
    const paths = []
    for (const file of files) {
      const url = await uploadNewsFile('gallery', slug, file)
      paths.push(url)
    }
    return paths
  }

  async function uploadAttachments(files, slug) {
    const attachments = []
    for (const file of files) {
      const url = await uploadNewsFile('attachments', slug, file)
      attachments.push({
        name: file.name,
        url,
        size: file.size,
        type: file.type,
      })
    }
    return attachments
  }

  async function createImagePreview(file) {
    return await fileToBase64(file)
  }

  async function createImagePreviews(files) {
    const previews = []
    for (const file of files) {
      try {
        const preview = await createImagePreview(file)
        previews.push(preview)
      } catch (e) {
        console.error('Error creating preview:', e)
      }
    }
    return previews
  }

  // 1. Fetch Categories
  const { data: categories } = await useAsyncData(
    'category_news_create',
    async () => {
      const { data, error } = await supabase
        .from('category_news')
        .select('name, value')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }
      return data
    },
  )

  const categoryItems = computed(() => {
    if (!categories.value) return []
    return categories.value.map((cat: any) => ({
      label: cat.name,
      value: cat.value,
    }))
  })

  // 2. Form Schema
  const schema = z.object({
    title: z
      .string()
      .min(1, 'Judul wajib diisi')
      .max(200, 'Judul maksimal 200 karakter'),
    sub_title: z
      .string()
      .max(300, 'Sub judul maksimal 300 karakter')
      .optional(),
    content: z.any().refine((val) => {
      return hasMeaningfulTiptapContent(val as JSONContent)
    }, 'Konten berita wajib diisi'),
    category: z.string().min(1, 'Kategori wajib dipilih'),
    link: z.string().url('URL tidak valid').optional().or(z.literal('')),
    coverImageFile: z
      .instanceof(File)
      .optional()
      .refine(
        (file) => !file || file.size <= NEWS_UPDATED_CONSTANTS.MAX_IMAGE_SIZE,
        'Ukuran gambar cover maksimal 5MB',
      )
      .refine(
        (file) => !file || file.type.startsWith('image/'),
        'File harus berupa gambar',
      ),
    galleryFiles: z
      .array(z.instanceof(File))
      .max(
        NEWS_UPDATED_CONSTANTS.MAX_GALLERY_IMAGES,
        `Maksimal ${NEWS_UPDATED_CONSTANTS.MAX_GALLERY_IMAGES} gambar galeri`,
      ),
    attachmentFiles: z
      .array(z.instanceof(File))
      .max(
        NEWS_UPDATED_CONSTANTS.MAX_ATTACHMENTS,
        `Maksimal ${NEWS_UPDATED_CONSTANTS.MAX_ATTACHMENTS} lampiran`,
      ),
  })

  type Schema = z.output<typeof schema>

  // 3. Form State
  const state = reactive<Partial<Schema>>({
    title: '',
    sub_title: '',
    content: getEmptyTiptapDoc(),
    category: '',
    link: '',
    coverImageFile: undefined,
    galleryFiles: [],
    attachmentFiles: [],
  })

  const loading = ref(false)

  // 4. File Upload Handlers
  const coverImagePreview = ref<string | null>(null)
  const galleryPreviews = ref<string[]>([])

  // Reactive files for UFileUpload v-model
  const coverImageFile = ref<File | null>(null)
  const galleryImageFiles = ref<File[]>([])
  const attachmentFilesList = ref<File[]>([])

  // Watch for cover image changes
  watch(coverImageFile, async (newFile) => {
    if (!newFile) {
      state.coverImageFile = undefined
      coverImagePreview.value = null
      return
    }

    if (!validateImageFile(newFile)) {
      coverImageFile.value = null
      return
    }

    state.coverImageFile = newFile
    try {
      coverImagePreview.value = await createImagePreview(newFile)
    } catch (error) {
      console.error('Error creating preview:', error)
      toastStore.error('Gagal membuat preview gambar')
    }
  })

  // Watch for gallery images changes
  watch(galleryImageFiles, async (newFiles) => {
    if (!newFiles || newFiles.length === 0) return

    const validFiles: File[] = []

    for (const file of newFiles) {
      if (!validateImageFile(file)) continue

      if (
        state.galleryFiles!.length + validFiles.length >=
        NEWS_UPDATED_CONSTANTS.MAX_GALLERY_IMAGES
      ) {
        toastStore.error(
          `Maksimal ${NEWS_UPDATED_CONSTANTS.MAX_GALLERY_IMAGES} gambar galeri`,
        )
        break
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    state.galleryFiles = [...(state.galleryFiles || []), ...validFiles]

    try {
      const previews = await createImagePreviews(validFiles)
      galleryPreviews.value = [...galleryPreviews.value, ...previews]
    } catch (error) {
      console.error('Error creating previews:', error)
    }

    // Reset the file input for next upload
    galleryImageFiles.value = []
  })

  // Watch for attachments changes
  watch(attachmentFilesList, (newFiles) => {
    if (!newFiles || newFiles.length === 0) return

    const validFiles: File[] = []

    for (const file of newFiles) {
      if (!validateAttachmentFile(file)) continue

      if (
        state.attachmentFiles!.length + validFiles.length >=
        NEWS_UPDATED_CONSTANTS.MAX_ATTACHMENTS
      ) {
        toastStore.error(
          `Maksimal ${NEWS_UPDATED_CONSTANTS.MAX_ATTACHMENTS} lampiran`,
        )
        break
      }

      validFiles.push(file)
    }

    state.attachmentFiles = [...(state.attachmentFiles || []), ...validFiles]

    // Reset the file input for next upload
    attachmentFilesList.value = []
  })

  function removeGalleryImage(index: number) {
    state.galleryFiles = state.galleryFiles!.filter((_, i) => i !== index)
    galleryPreviews.value = galleryPreviews.value.filter((_, i) => i !== index)
  }

  function removeAttachment(index: number) {
    state.attachmentFiles = state.attachmentFiles!.filter((_, i) => i !== index)
  }

  function removeCoverImage() {
    state.coverImageFile = undefined
    coverImagePreview.value = null
    coverImageFile.value = null
  }

  const suggestionItems = NEWS_TIPTAP_SUGGESTION_ITEMS

  // 5. Submit Handler
  async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true

    try {
      // Validate required fields
      if (!event.data.title || !event.data.category) {
        toastStore.error('Judul dan kategori wajib diisi')
        loading.value = false
        return
      }

      // Generate unique slug
      const slug = generateSlug(event.data.title)

      // Upload cover image
      let coverImagePath: string | null = null
      if (event.data.coverImageFile) {
        coverImagePath = await uploadCoverImage(event.data.coverImageFile, slug)
      }

      // Upload gallery images
      let imagePaths: string[] = []
      if (event.data.galleryFiles && event.data.galleryFiles.length > 0) {
        imagePaths = await uploadGalleryImages(event.data.galleryFiles, slug)
      }

      // Upload attachments
      let attachments: any[] = []
      if (event.data.attachmentFiles && event.data.attachmentFiles.length > 0) {
        attachments = await uploadAttachments(event.data.attachmentFiles, slug)
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Prepare payload - status default is 'pending' for all users
      const payload: any = {
        title: event.data.title.trim(),
        sub_title: event.data.sub_title?.trim() || null,
        content: event.data.content, // JSONContent object
        category: event.data.category,
        link: event.data.link?.trim() || null,
        status_news: 'pending', // Always pending for new submissions
        cover_image: coverImagePath,
        images: imagePaths,
        attachments: attachments,
        slug: slug,
        user_id: user?.id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Insert to database
      const { error: insertError } = await supabase
        .from('news_updated')
        .insert(payload)

      if (insertError) {
        console.error('Database error:', insertError)
        throw insertError
      }

      toastStore.success('Berita berhasil dibuat! Menunggu persetujuan admin.')
      router.push(`/update/${slug}`)
    } catch (error) {
      console.error('Error creating news:', error)
      toastStore.error('Gagal membuat berita. Silakan coba lagi.')
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <main class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold mb-2">Buat Berita Baru</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Buat artikel berita dengan rich text editor modern
          </p>
        </div>
        <UButton
          to="/update"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
        >
          Kembali
        </UButton>
      </div>

      <UAlert
        icon="i-lucide-info"
        color="primary"
        variant="soft"
        title="Informasi Pembuatan Berita"
        description="Berita yang Anda buat akan berstatus 'pending' dan menunggu persetujuan dari admin sebelum dipublikasikan."
      />
    </div>

    <!-- Form -->
    <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
      <!-- Metadata Section -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="w-5 h-5" />
            <h2 class="text-xl font-semibold">Informasi Berita</h2>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Title -->
          <UFormField label="Judul Berita" name="title" required>
            <UInput
              v-model="state.title"
              placeholder="Masukkan judul berita yang menarik..."
              size="lg"
              icon="i-lucide-heading"
              class="w-full"
            />
          </UFormField>

          <!-- Sub Title -->
          <UFormField
            label="Sub Judul"
            name="sub_title"
            hint="Opsional - Ringkasan singkat berita"
          >
            <UInput
              v-model="state.sub_title"
              placeholder="Ringkasan singkat atau tagline berita..."
              icon="i-lucide-text"
              class="w-full"
            />
          </UFormField>

          <!-- Category & Link -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Kategori" name="category" required>
              <USelect
                v-model="state.category"
                :items="categoryItems"
                placeholder="Pilih kategori berita"
                icon="i-lucide-folder"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Link Referensi" name="link" hint="Opsional">
              <UInput
                v-model="state.link"
                placeholder="https://contoh.com/referensi"
                icon="i-lucide-link"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>
      </UCard>

      <!-- Cover Image Section -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-image" class="w-5 h-5" />
            <h2 class="text-xl font-semibold">Gambar Cover</h2>
          </div>
        </template>

        <UFormField
          name="coverImageFile"
          hint="Maksimal 5MB - Format: JPG, PNG, WebP"
        >
          <div class="space-y-4">
            <UFileUpload
              v-model="coverImageFile"
              accept="image/*"
              class="min-h-32 w-full"
            />

            <div v-if="coverImagePreview" class="relative w-full max-w-md">
              <NuxtImg
                :src="coverImagePreview"
                alt="Cover Preview"
                class="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <UButton
                icon="i-lucide-x"
                color="error"
                size="sm"
                class="absolute top-2 right-2"
                @click="removeCoverImage"
              >
                Hapus
              </UButton>
            </div>
          </div>
        </UFormField>
      </UCard>

      <!-- Content Editor Section -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-file-edit" class="w-5 h-5" />
              <h2 class="text-xl font-semibold">Konten Berita</h2>
            </div>
            <UBadge color="primary" variant="soft">
              <UIcon name="i-lucide-zap" class="w-3 h-3" />
              Ketik / untuk perintah cepat
            </UBadge>
          </div>
        </template>

        <UFormField name="content" required>
          <UEditor
            v-slot="{ editor }"
            v-model="state.content"
            content-type="json"
            placeholder="Mulai menulis berita Anda di sini... Ketik / untuk perintah cepat"
            class="min-h-125 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <!-- Suggestion Menu for Slash Commands -->
            <UEditorSuggestionMenu :editor="editor" :items="suggestionItems" />
          </UEditor>
        </UFormField>
      </UCard>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Gallery Section -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-images" class="w-5 h-5" />
              <h2 class="text-xl font-semibold">Galeri Foto</h2>
            </div>
          </template>

          <UFormField
            name="galleryFiles"
            :hint="`Maksimal ${NEWS_UPDATED_CONSTANTS.MAX_GALLERY_IMAGES} gambar, 5MB per gambar`"
          >
            <div class="space-y-4">
              <UFileUpload
                v-model="galleryImageFiles"
                accept="image/*"
                multiple
                class="min-h-32 w-full"
              />

              <div
                v-if="state.galleryFiles && state.galleryFiles.length > 0"
                class="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div
                  v-for="(file, index) in state.galleryFiles"
                  :key="index"
                  class="relative group"
                >
                  <NuxtImg
                    :src="galleryPreviews[index]"
                    :alt="`Gallery ${index + 1}`"
                    class="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <UButton
                    icon="i-lucide-x"
                    color="error"
                    size="xs"
                    class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="removeGalleryImage(index)"
                  />
                  <div
                    class="absolute bottom-1 left-1 px-2 py-0.5 bg-black/70 text-white text-xs rounded"
                  >
                    {{ formatFileSize(file.size) }}
                  </div>
                </div>
              </div>
            </div>
          </UFormField>
        </UCard>

        <!-- Attachments Section -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-paperclip" class="w-5 h-5" />
              <h2 class="text-xl font-semibold">Lampiran</h2>
            </div>
          </template>

          <UFormField
            name="attachmentFiles"
            :hint="`Maksimal ${NEWS_UPDATED_CONSTANTS.MAX_ATTACHMENTS} file, 10MB per file (PDF, DOC, DOCX, XLS, XLSX)`"
          >
            <div class="space-y-4">
              <UFileUpload
                v-model="attachmentFilesList"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                multiple
                class="min-h-32 w-full"
              />

              <ul
                v-if="state.attachmentFiles && state.attachmentFiles.length > 0"
                class="space-y-2"
              >
                <li
                  v-for="(file, index) in state.attachmentFiles"
                  :key="index"
                  class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <UIcon
                      name="i-lucide-file-text"
                      class="w-5 h-5 text-primary shrink-0"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="font-medium truncate">{{ file.name }}</p>
                      <p class="text-sm text-gray-500">
                        {{ formatFileSize(file.size) }}
                      </p>
                    </div>
                  </div>
                  <UButton
                    icon="i-lucide-x"
                    color="error"
                    variant="ghost"
                    size="sm"
                    @click="removeAttachment(index)"
                  />
                </li>
              </ul>
            </div>
          </UFormField>
        </UCard>
      </div>

      <!-- Submit Actions -->
      <div
        class="flex gap-3 justify-end pt-4 sticky bottom-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
      >
        <UButton
          color="neutral"
          variant="soft"
          size="lg"
          to="/update"
          :disabled="loading"
        >
          <UIcon name="i-lucide-x" class="w-4 h-4" />
          Batal
        </UButton>

        <UButton type="submit" size="lg" :loading="loading" :disabled="loading">
          <UIcon name="i-lucide-send" class="w-4 h-4" />
          Kirim Berita
        </UButton>
      </div>
    </UForm>
  </main>
</template>
