<script setup lang="ts">
  import type { JSONContent } from '@tiptap/vue-3'
  import type { Database } from '~/types/database.types'
  import { Enum } from '~/utils/enum'
  import { extractTiptapText } from '~/composables/useTiptapContent'
  import { getNewsPublicUrl, formatFileSize } from '~/utils/storage'

  type NewsUpdatedRow = Database['public']['Tables']['news_updated']['Row']

  interface NewsAttachment {
    name: string
    url: string
    size?: number
    type?: string
  }

  type NewsUpdated = Omit<
    NewsUpdatedRow,
    'content' | 'images' | 'attachments'
  > & {
    content: JSONContent
    images: string[]
    attachments: NewsAttachment[]
    profiles?: {
      id: string
      full_name: string | null
      avatar_url: string | null
    } | null
  }

  definePageMeta({
    layout: 'default',
  })

  const route = useRoute()
  const supabase = useSupabaseClient()
  const slugParam = computed(() =>
    Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug,
  )

  const getImagePathUrl = (path: string): string => {
    return getNewsPublicUrl(path) || '/placeholder.webp'
  }

  const getAttachmentUrl = (path: string): string => {
    if (!path) return ''
    if (path.startsWith('http')) return path

    const { data } = supabase.storage
      .from('news-attachments')
      .getPublicUrl(path)
    return data.publicUrl || ''
  }

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString))
  }

  // formatFileSize now imported from utils/storage

  const getFileIcon = (type: string): string => {
    if (!type) return 'i-lucide-file'
    if (type.includes('pdf')) return 'i-lucide-file-text'
    if (type.includes('word') || type.includes('document'))
      return 'i-lucide-file-text'
    if (type.includes('excel') || type.includes('sheet'))
      return 'i-lucide-table'
    if (type.includes('image')) return 'i-lucide-file-image'
    if (type.includes('video')) return 'i-lucide-file-video'
    if (type.includes('audio')) return 'i-lucide-file-audio'
    if (
      type.includes('zip') ||
      type.includes('rar') ||
      type.includes('compressed')
    )
      return 'i-lucide-file-archive'
    return 'i-lucide-file'
  }

  const downloadAttachment = (attachment: { url: string; name: string }) => {
    if (!import.meta.client) return
    const url = getAttachmentUrl(attachment.url)
    if (!url) return

    const link = document.createElement('a')
    link.href = url
    link.download = attachment.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = Enum.StatusNews.find((item) => item.value === status)

    return (
      statusConfig || {
        value: status,
        label: status,
        icon: 'i-lucide-circle',
        color: 'neutral',
      }
    )
  }

  const getExcerpt = (
    content: NewsUpdated['content'],
    maxLength: number = 160,
  ): string => {
    const text = extractTiptapText(content)
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  const normalizeImages = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === 'string')
  }

  const normalizeAttachments = (
    value: unknown,
  ): Array<{ name: string; url: string; size?: number; type?: string }> => {
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

  // Fetch news by slug
  const { data: news, error } = await useAsyncData(
    `news_updated_${route.params.slug}`,
    async () => {
      if (!slugParam.value) return null

      const { data, error } = await supabase
        .from('news_updated')
        .select(
          `
        id,
        title,
        sub_title,
        content,
        category,
        link,
        status_news,
        created_at,
        updated_at,
        published_at,
        deleted_at,
        user_id,
        cover_image,
        images,
        attachments,
        slug,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `,
        )
        .eq('slug', slugParam.value)
        .is('deleted_at', null)
        .single()

      if (error) throw error

      return {
        ...data,
        content: data.content as NewsUpdated['content'],
        images: normalizeImages(data.images),
        attachments: normalizeAttachments(data.attachments),
      } as unknown as NewsUpdated & { profiles: any }
    },
  )

  // Handle error
  if (error.value || !news.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Berita tidak ditemukan',
    })
  }

  // Get cover image URL for SEO
  const coverImageUrl = computed(() => {
    const imagePath =
      news.value.cover_image ||
      (news.value.images && news.value.images.length > 0
        ? news.value.images[0]
        : null)
    return imagePath ? getImagePathUrl(imagePath) : '/placeholder.webp'
  })

  // SEO — gunakan useRequestURL() agar SSR-safe
  const { origin: reqOrigin } = useRequestURL()
  const shareUrl = computed(() => {
    const slug = slugParam.value || ''
    return `${reqOrigin}/update/${slug}`
  })

  useSeoMeta({
    title: news.value.title,
    description: news.value.sub_title || getExcerpt(news.value.content, 160),
    ogImage: coverImageUrl.value,
    url: shareUrl.value,
    ogType: 'article',
    schema: {
      ogType: 'Article',
      data: {
        headline: news.value.title,
        datePublished: news.value.published_at || news.value.created_at,
        dateModified: news.value.updated_at,
        author: {
          name: news.value.profiles?.full_name || 'Tim JuruTani',
          url: 'https://jurutani.com',
        },
      },
    },
  })

  // Image gallery state
  const selectedImageIndex = ref(0)
  const isLightboxOpen = ref(false)

  const allImages = computed(() => {
    const images: string[] = []
    if (news.value.cover_image) {
      images.push(news.value.cover_image)
    }
    if (news.value.images && news.value.images.length > 0) {
      images.push(...news.value.images)
    }
    return images
  })

  function openLightbox(index: number) {
    selectedImageIndex.value = index
    isLightboxOpen.value = true
  }

  function closeLightbox() {
    isLightboxOpen.value = false
  }

  function nextImage() {
    if (selectedImageIndex.value < allImages.value.length - 1) {
      selectedImageIndex.value++
    }
  }

  function prevImage() {
    if (selectedImageIndex.value > 0) {
      selectedImageIndex.value--
    }
  }

  // Get status badge
  const statusBadge = computed(() => getStatusBadge(news.value.status_news))

  // Fetch similar news
  const { data: similarNews } = await useAsyncData(
    `similar_news_${route.params.slug}`,
    async () => {
      const { data, error } = await supabase
        .from('news_updated')
        .select(
          'id,slug,title,sub_title,content,category,created_at,cover_image,images,attachments',
        )
        .eq('category', news.value.category)
        .eq('status_news', 'approved')
        .is('deleted_at', null)
        .neq('id', news.value.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) return []

      return (data ?? []).map((item) => ({
        ...item,
        content: item.content as NewsUpdated['content'],
        images: normalizeImages(item.images),
        attachments: normalizeAttachments(item.attachments),
      })) as unknown as NewsUpdated[]
    },
  )
</script>

<template>
  <main class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <nav class="mb-6 text-sm">
        <ul class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <li>
            <NuxtLink to="/" class="hover:text-primary transition-colors">
              <UIcon name="i-lucide-home" class="w-4 h-4" />
            </NuxtLink>
          </li>
          <li><UIcon name="i-lucide-chevron-right" class="w-4 h-4" /></li>
          <li>
            <NuxtLink to="/update" class="hover:text-primary transition-colors">
              <UIcon name="i-lucide-newspaper" class="w-4 h-4" />
            </NuxtLink>
          </li>
          <li><UIcon name="i-lucide-chevron-right" class="w-4 h-4" /></li>
          <li class="text-gray-900 dark:text-white truncate">
            {{ news.title }}
          </li>
        </ul>
      </nav>
      <header class="mb-8">
        <!-- Category & Status badges -->
        <div class="mb-4 flex items-center gap-2 flex-wrap">
          <UBadge color="primary" variant="soft">
            <UIcon name="i-lucide-folder" class="w-3 h-3" />
            {{ news.category }}
          </UBadge>

          <UBadge :color="statusBadge.color as any" variant="soft">
            <UIcon :name="statusBadge.icon" class="w-3 h-3" />
            {{ statusBadge.label }}
          </UBadge>
        </div>

        <!-- Title -->
        <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          {{ news.title }}
        </h1>

        <!-- Sub title -->
        <p
          v-if="news.sub_title"
          class="text-xl text-gray-600 dark:text-gray-300 mb-6"
        >
          {{ news.sub_title }}
        </p>

        <!-- Meta info -->
        <div
          class="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700"
        >
          <!-- Author -->
          <div v-if="news.profiles" class="flex items-center gap-2">
            <div
              v-if="news.profiles.avatar_url"
              class="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700"
            >
              <NuxtImg
                :src="news.profiles.avatar_url"
                :alt="news.profiles.full_name"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-else
              class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <UIcon name="i-lucide-user" class="w-5 h-5 text-primary" />
            </div>
            <div>
              <p class="font-medium text-sm">
                {{ news.profiles.full_name || 'Pengguna' }}
              </p>
              <p class="text-xs text-gray-500">Penulis</p>
            </div>
          </div>

          <!-- Date -->
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <UIcon name="i-lucide-calendar" class="w-4 h-4" />
            <time class="text-sm">{{ formatDate(news.created_at) }}</time>
          </div>
        </div>
      </header>

      <!-- Cover Image -->
      <div
        v-if="news.cover_image"
        class="mb-8 rounded-xl overflow-hidden shadow-lg"
      >
        <UButton
          color="neutral"
          variant="ghost"
          type="button"
          class="group block w-full overflow-hidden rounded-none p-0! hover:bg-transparent"
          :aria-label="`Buka gambar utama ${news.title}`"
          @click="openLightbox(0)"
        >
          <NuxtImg
            :src="getImagePathUrl(news.cover_image)"
            :alt="news.title"
            class="h-auto w-full transition-opacity group-hover:opacity-95"
          />
        </UButton>
      </div>

      <!-- Content with UEditor (read-only) -->
      <article class="mb-12">
        <UEditor
          :model-value="news.content"
          :editable="false"
          content-type="json"
          class="prose prose-lg dark:prose-invert max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-0 [&_.ProseMirror]:p-0"
        />
      </article>

      <!-- Gallery -->
      <section v-if="news.images && news.images.length > 0" class="mb-12">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <UIcon name="i-lucide-images" class="w-6 h-6" />
          Galeri Foto
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <UButton
            v-for="(image, index) in news.images"
            :key="index"
            color="neutral"
            variant="ghost"
            type="button"
            class="group relative aspect-square overflow-hidden rounded-lg p-0! shadow-md transition-shadow hover:shadow-xl"
            :aria-label="`Buka galeri berita ${index + 1}`"
            @click="openLightbox(news.cover_image ? index + 1 : index)"
          >
            <NuxtImg
              :src="getImagePathUrl(image)"
              :alt="`Gallery ${index + 1}`"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div
              class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-expand"
                class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </UButton>
        </div>
      </section>

      <!-- Attachments -->
      <section
        v-if="news.attachments && news.attachments.length > 0"
        class="mb-12"
      >
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <UIcon name="i-lucide-paperclip" class="w-6 h-6" />
          Lampiran
        </h2>
        <div class="space-y-3">
          <UButton
            v-for="(attachment, index) in news.attachments"
            :key="index"
            color="neutral"
            variant="ghost"
            type="button"
            class="group w-full justify-between rounded-lg border border-gray-200 px-4 py-4 text-left transition-all hover:border-primary/50 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            @click="downloadAttachment(attachment)"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div
                class="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors"
              >
                <UIcon
                  :name="getFileIcon(attachment.type || '')"
                  class="w-6 h-6 text-primary"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p
                  class="font-medium truncate group-hover:text-primary transition-colors"
                >
                  {{ attachment.name }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ formatFileSize(attachment.size || 0) }}
                </p>
              </div>
            </div>
            <UIcon
              name="i-lucide-download"
              class="h-5 w-5 shrink-0 text-primary"
            />
          </UButton>
        </div>
      </section>

      <!-- External Link -->
      <section v-if="news.link" class="mb-12">
        <UCard>
          <div class="flex items-start gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <UIcon
                name="i-lucide-external-link"
                class="w-5 h-5 text-primary"
              />
            </div>
            <div class="flex-1">
              <p class="font-medium mb-1">Link Referensi</p>
              <a
                :href="news.link"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary hover:underline break-all text-sm"
              >
                {{ news.link }}
              </a>
            </div>
          </div>
        </UCard>
      </section>
    </div>

    <!-- Similar News - full width outside narrow content container -->
    <section class="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div class="mb-8 text-center">
        <div
          class="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-linear-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full"
        >
          <UIcon
            name="i-lucide-newspaper"
            class="w-4 h-4 text-green-600 dark:text-green-400"
          />
          <span
            class="text-sm font-medium text-emerald-700 dark:text-emerald-300"
            >Baca Juga</span
          >
        </div>
        <h2
          class="text-2xl md:text-3xl font-bold bg-linear-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent"
        >
          Berita Terkait
        </h2>
      </div>

      <!-- Grid -->
      <div
        v-if="similarNews && similarNews.length > 0"
        class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-auto"
      >
        <FeaturesUpdateCard
          v-for="item in similarNews"
          :key="item.id"
          :news="item"
        />
      </div>

      <!-- Back button -->
      <div
        v-if="similarNews && similarNews.length > 0"
        class="mt-8 flex justify-center"
      >
        <NuxtLink
          to="/update"
          class="inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold bg-linear-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5"
        >
          <span>Lihat Semua Berita</span>
          <UIcon
            name="i-lucide-arrow-right"
            class="w-4 h-4 transition-transform"
          />
        </NuxtLink>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4"
        >
          <UIcon
            name="i-lucide-newspaper"
            class="w-8 h-8 text-gray-400 dark:text-gray-600"
          />
        </div>
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Belum ada berita terkait
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          Tidak ada berita lain dalam kategori
          <span class="font-medium text-emerald-600 dark:text-emerald-400">{{
            news.category
          }}</span>
          saat ini.
        </p>
        <UButton
          to="/update"
          color="primary"
          variant="soft"
          icon="i-lucide-arrow-left"
        >
          Lihat Semua Berita
        </UButton>
      </div>
    </section>

    <!-- Lightbox -->
    <Teleport to="body">
      <div
        v-if="isLightboxOpen"
        class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        @click.self="closeLightbox"
      >
        <!-- Close button -->
        <UButton
          color="neutral"
          variant="ghost"
          class="absolute top-4 right-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors z-10"
          @click="closeLightbox"
        >
          <UIcon name="i-lucide-x" class="w-6 h-6" />
        </UButton>

        <!-- Navigation -->
        <UButton
          v-if="selectedImageIndex > 0"
          color="neutral"
          variant="ghost"
          class="absolute left-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors z-10"
          @click="prevImage"
        >
          <UIcon name="i-lucide-chevron-left" class="w-8 h-8" />
        </UButton>

        <UButton
          v-if="selectedImageIndex < allImages.length - 1"
          color="neutral"
          variant="ghost"
          class="absolute right-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors z-10"
          @click="nextImage"
        >
          <UIcon name="i-lucide-chevron-right" class="w-8 h-8" />
        </UButton>

        <!-- Image -->
        <div class="max-w-6xl max-h-[90vh] p-4">
          <NuxtImg
            :src="getImagePathUrl(allImages[selectedImageIndex])"
            :alt="`Image ${selectedImageIndex + 1}`"
            class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        <!-- Counter -->
        <div
          class="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/70 backdrop-blur-sm text-white text-sm rounded-full"
        >
          {{ selectedImageIndex + 1 }} / {{ allImages.length }}
        </div>
      </div>
    </Teleport>
  </main>
</template>
