<script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '#ui/types'
  import type { JSONContent } from '@tiptap/vue-3'
  import { toastStore } from '~/composables/useJuruTaniToast'
  import {
    uploadNewsFile,
    formatFileSize,
    validateFileType,
    fileToBase64,
  } from '~/utils/storage'
  import {
    NEWS_TIPTAP_SUGGESTION_ITEMS,
    getEmptyTiptapDoc,
    hasMeaningfulTiptapContent,
  } from '~/composables/useTiptapContent'

  interface NewsAttachment {
    name: string
    url: string
    size?: number
    type?: string
  }

  definePageMeta({
    layout: 'default',
  })

  useSeoMeta({
    title: 'Edit Berita',
    description: 'Perbarui artikel berita yang sudah ada',
  })

  const route = useRoute()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const idParam = computed(() =>
    Array.isArray(route.params.id) ? route.params.id[0] : route.params.id,
  )

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

  const getImagePathUrl = (path: string): string => {
    if (!path) return '/placeholder.webp'
    if (path.startsWith('http')) return path

    const { data } = supabase.storage.from('news-images').getPublicUrl(path)
    return data.publicUrl || '/placeholder.webp'
  }

  const suggestionItems = NEWS_TIPTAP_SUGGESTION_ITEMS
  const loading = ref(false)

  const normalizeImages = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === 'string')
  }

  const normalizeAttachments = (value: unknown): NewsAttachment[] => {
    if (!Array.isArray(value)) return []

    return value
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === 'object',
      )
      .map((item) => ({
        name: typeof item.name === 'string' ? item.name : 'Lampiran',
        url: typeof item.url === 'string' ? item.url : '',
        size: typeof item.size === 'number' ? item.size : undefined,
        type: typeof item.type === 'string' ? item.type : undefined,
      }))
      .filter((item) => !!item.url)
  }

  // 1. Fetch categories
  const { data: categories } = await useAsyncData(
    'category_news_edit',
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

  // 2. Fetch current news data
  const { data: existingNews, error: existingNewsError } = await useAsyncData(
    `news_updated_edit_${route.params.id}`,
    async () => {
      if (!idParam.value) return null

      const { data, error } = await supabase
        .from('news_updated')
        .select(
          'id,title,sub_title,content,category,link,slug,cover_image,images,attachments,status_news,deleted_at',
        )
        .eq('id', idParam.value)
        .is('deleted_at', null)
        .single()

      if (error) throw error

      return {
        ...data,
        content: (data.content as JSONContent) || getEmptyTiptapDoc(),
        images: normalizeImages(data.images),
        attachments: normalizeAttachments(data.attachments),
      }
    },
  )

  if (existingNewsError.value || !existingNews.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Berita tidak ditemukan',
    })
  }

  // 3. Form schema
  const schema = z.object({
    title: z
      .string()
      .min(1, 'Judul wajib diisi')
      .max(200, 'Judul maksimal 200 karakter'),
    sub_title: z
      .string()
      .max(300, 'Sub judul maksimal 300 karakter')
      .optional(),
    content: z
      .any()
      .refine(
        (val) => hasMeaningfulTiptapContent(val as JSONContent),
        'Konten berita wajib diisi',
      ),
    category: z.string().min(1, 'Kategori wajib dipilih'),
    link: z.string().url('URL tidak valid').optional().or(z.literal('')),
    coverImageFile: z
      .instanceof(File)
      .optional()
      .refine(
        (file) => !file || validateImageFile(file),
        'File harus berupa gambar dan maksimal 5MB',
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

  // 4. Form state
  const state = reactive<Partial<Schema>>({
    title: existingNews.value.title,
    sub_title: existingNews.value.sub_title || '',
    content: (existingNews.value.content as JSONContent) || getEmptyTiptapDoc(),
    category: existingNews.value.category || '',
    link: existingNews.value.link || '',
    coverImageFile: undefined,
    galleryFiles: [],
    attachmentFiles: [],
  })

  // 5. Existing files state
  const existingCoverImagePath = ref<string | null>(
    existingNews.value.cover_image || null,
  )
  const existingGalleryPaths = ref<string[]>(
    normalizeImages(existingNews.value.images),
  )
  const existingAttachments = ref<NewsAttachment[]>(
    normalizeAttachments(existingNews.value.attachments),
  )

  // 6. New file uploads state
  const coverImagePreview = ref<string | null>(
    existingCoverImagePath.value
      ? getImagePathUrl(existingCoverImagePath.value)
      : null,
  )
  const galleryPreviews = ref<string[]>([])
  const coverImageFile = ref<File | null>(null)
  const galleryImageFiles = ref<File[]>([])
  const attachmentFilesList = ref<File[]>([])

  watch(coverImageFile, async (newFile) => {
    if (!newFile) {
      state.coverImageFile = undefined
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

  watch(galleryImageFiles, async (newFiles) => {
    if (!newFiles || newFiles.length === 0) return

    const validFiles: File[] = []

    for (const file of newFiles) {
      if (!validateImageFile(file)) continue

      const currentGalleryCount =
        existingGalleryPaths.value.length +
        (state.galleryFiles?.length || 0) +
        validFiles.length
      if (currentGalleryCount >= NEWS_UPDATED_CONSTANTS.MAX_GALLERY_IMAGES) {
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

    galleryImageFiles.value = []
  })

  watch(attachmentFilesList, (newFiles) => {
    if (!newFiles || newFiles.length === 0) return

    const validFiles: File[] = []

    for (const file of newFiles) {
      if (!validateAttachmentFile(file)) continue

      const currentAttachmentCount =
        existingAttachments.value.length +
        (state.attachmentFiles?.length || 0) +
        validFiles.length
      if (currentAttachmentCount >= NEWS_UPDATED_CONSTANTS.MAX_ATTACHMENTS) {
        toastStore.error(
          `Maksimal ${NEWS_UPDATED_CONSTANTS.MAX_ATTACHMENTS} lampiran`,
        )
        break
      }

      validFiles.push(file)
    }

    state.attachmentFiles = [...(state.attachmentFiles || []), ...validFiles]
    attachmentFilesList.value = []
  })

  function removeExistingCoverImage() {
    existingCoverImagePath.value = null
    if (!state.coverImageFile) {
      coverImagePreview.value = null
    }
  }

  function removeExistingGalleryImage(index: number) {
    existingGalleryPaths.value = existingGalleryPaths.value.filter(
      (_, i) => i !== index,
    )
  }

  function removeExistingAttachment(index: number) {
    existingAttachments.value = existingAttachments.value.filter(
      (_, i) => i !== index,
    )
  }

  function removeGalleryImage(index: number) {
    state.galleryFiles = state.galleryFiles!.filter((_, i) => i !== index)
    galleryPreviews.value = galleryPreviews.value.filter((_, i) => i !== index)
  }

  function removeAttachment(index: number) {
    state.attachmentFiles = state.attachmentFiles!.filter((_, i) => i !== index)
  }

  function removeCoverImage() {
    state.coverImageFile = undefined
    coverImagePreview.value = existingCoverImagePath.value
      ? getImagePathUrl(existingCoverImagePath.value)
      : null
    coverImageFile.value = null
  }

  // 7. Submit handler
  async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true

    try {
      if (!event.data.title || !event.data.category) {
        toastStore.error('Judul dan kategori wajib diisi')
        loading.value = false
        return
      }

      const nextSlug =
        event.data.title.trim() === existingNews.value.title
          ? existingNews.value.slug
          : generateSlug(event.data.title)

      let coverImagePath: string | null = existingCoverImagePath.value
      if (event.data.coverImageFile) {
        coverImagePath = await uploadCoverImage(
          event.data.coverImageFile,
          nextSlug,
        )
      }

      let newImagePaths: string[] = []
      if (event.data.galleryFiles && event.data.galleryFiles.length > 0) {
        newImagePaths = await uploadGalleryImages(
          event.data.galleryFiles,
          nextSlug,
        )
      }

      let newAttachments: NewsAttachment[] = []
      if (event.data.attachmentFiles && event.data.attachmentFiles.length > 0) {
        newAttachments = await uploadAttachments(
          event.data.attachmentFiles,
          nextSlug,
        )
      }

      const payload = {
        title: event.data.title.trim(),
        sub_title: event.data.sub_title?.trim() || null,
        content: event.data.content,
        category: event.data.category,
        link: event.data.link?.trim() || null,
        cover_image: coverImagePath,
        images: [...existingGalleryPaths.value, ...newImagePaths],
        attachments: [...existingAttachments.value, ...newAttachments] as any,
        slug: nextSlug,
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from('news_updated')
        .update(payload)
        .eq('id', existingNews.value.id)

      if (updateError) {
        console.error('Database error:', updateError)
        throw updateError
      }

      toastStore.success('Berita berhasil diperbarui')
      router.push(`/update/${nextSlug}`)
    } catch (error) {
      console.error('Error updating news:', error)
      toastStore.error('Gagal memperbarui berita. Silakan coba lagi.')
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <main class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold mb-2">Edit Berita</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Perbarui artikel berita yang sudah dibuat
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
        title="Informasi Edit Berita"
        description="Perubahan akan langsung diterapkan pada data berita ini."
      />
    </div>

    <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="w-5 h-5" />
            <h2 class="text-xl font-semibold">Informasi Berita</h2>
          </div>
        </template>

        <div class="space-y-6">
          <UFormField label="Judul Berita" name="title" required>
            <UInput
              v-model="state.title"
              placeholder="Masukkan judul berita yang menarik..."
              size="lg"
              icon="i-lucide-heading"
              class="w-full"
            />
          </UFormField>

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
              <div class="absolute top-2 right-2 flex gap-2">
                <UButton
                  icon="i-lucide-x"
                  color="error"
                  size="sm"
                  @click="removeCoverImage"
                >
                  Hapus Baru
                </UButton>
                <UButton
                  v-if="existingCoverImagePath"
                  icon="i-lucide-trash"
                  color="warning"
                  size="sm"
                  @click="removeExistingCoverImage"
                >
                  Hapus Lama
                </UButton>
              </div>
            </div>
          </div>
        </UFormField>
      </UCard>

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
            <UEditorSuggestionMenu :editor="editor" :items="suggestionItems" />
          </UEditor>
        </UFormField>
      </UCard>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                v-if="existingGalleryPaths.length > 0"
                class="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div
                  v-for="(imagePath, index) in existingGalleryPaths"
                  :key="`existing-${index}`"
                  class="relative group"
                >
                  <NuxtImg
                    :src="getImagePathUrl(imagePath)"
                    :alt="`Existing Gallery ${index + 1}`"
                    class="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <UButton
                    icon="i-lucide-trash"
                    color="warning"
                    size="xs"
                    class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="removeExistingGalleryImage(index)"
                  />
                </div>
              </div>

              <div
                v-if="state.galleryFiles && state.galleryFiles.length > 0"
                class="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div
                  v-for="(file, index) in state.galleryFiles"
                  :key="`new-${index}`"
                  class="relative group"
                >
                  <NuxtImg
                    :src="galleryPreviews[index]"
                    :alt="`New Gallery ${index + 1}`"
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

              <ul v-if="existingAttachments.length > 0" class="space-y-2">
                <li
                  v-for="(file, index) in existingAttachments"
                  :key="`existing-attachment-${index}`"
                  class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div class="min-w-0 flex-1">
                    <p class="font-medium truncate">{{ file.name }}</p>
                    <p class="text-sm text-gray-500">
                      {{ formatFileSize(file.size || 0) }}
                    </p>
                  </div>
                  <UButton
                    icon="i-lucide-trash"
                    color="warning"
                    variant="ghost"
                    size="sm"
                    @click="removeExistingAttachment(index)"
                  />
                </li>
              </ul>

              <ul
                v-if="state.attachmentFiles && state.attachmentFiles.length > 0"
                class="space-y-2"
              >
                <li
                  v-for="(file, index) in state.attachmentFiles"
                  :key="`new-attachment-${index}`"
                  class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div class="min-w-0 flex-1">
                    <p class="font-medium truncate">{{ file.name }}</p>
                    <p class="text-sm text-gray-500">
                      {{ formatFileSize(file.size) }}
                    </p>
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
          <UIcon name="i-lucide-save" class="w-4 h-4" />
          Simpan Perubahan
        </UButton>
      </div>
    </UForm>
  </main>
</template>
