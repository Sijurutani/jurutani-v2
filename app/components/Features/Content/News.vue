<script setup lang="ts">
  import type { JSONContent } from '@tiptap/vue-3'
  import type { Database } from '~/types/database.types'

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
  }

  interface Props {
    news: NewsUpdated
    variant?: 'default' | 'large' | 'wide'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
  })

  const supabase = useSupabaseClient()

  const imageError = ref(false)
  const imageLoading = ref(true)

  // Get image URL from news-images bucket
  const imageUrl = computed(() => {
    const imagePath =
      props.news.cover_image ||
      (props.news.images && props.news.images.length > 0
        ? props.news.images[0]
        : null)

    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath

    const { data } = supabase.storage
      .from('news-images')
      .getPublicUrl(imagePath)
    return data.publicUrl || null
  })

  // Extract plain text excerpt from JSONContent
  const excerpt = computed(() => {
    if (props.news.sub_title) return props.news.sub_title

    const content = props.news.content
    if (!content || typeof content !== 'object') return ''

    let text = ''
    function extractText(node: any) {
      if (node.text) text += node.text
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach((child: any) => extractText(child))
      }
    }
    extractText(content)

    text = text.trim()
    const maxLength = props.variant === 'large' ? 180 : 100
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  })

  const formattedDate = computed(() => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(props.news.created_at))
  })

  const formattedCategory = computed(() => {
    if (!props.news.category) return ''
    return (
      props.news.category.charAt(0).toUpperCase() + props.news.category.slice(1)
    )
  })

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      teknologi: 'bg-emerald-600',
      pertanian: 'bg-green-600',
      bisnis: 'bg-lime-600',
      pendidikan: 'bg-teal-600',
      kesehatan: 'bg-green-700',
      tips: 'bg-emerald-500',
      panduan: 'bg-lime-500',
      default: 'bg-green-500',
    }
    return colors[category.toLowerCase()] || colors.default
  }

  const cardClasses = computed(() => {
    const base =
      'group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cursor-pointer'
    const variants: Record<string, string> = {
      default: 'col-span-1 row-span-1 min-h-[380px]',
      large:
        'col-span-1 md:col-span-2 row-span-1 md:row-span-2 min-h-[380px] md:min-h-[580px]',
      wide: 'col-span-1 md:col-span-2 row-span-1 min-h-[380px]',
    }
    return `${base} ${variants[props.variant]}`
  })

  const handleImageError = () => {
    imageError.value = true
    imageLoading.value = false
  }
  const handleImageLoad = () => {
    imageLoading.value = false
    imageError.value = false
  }
</script>

<template>
  <article :class="cardClasses">
    <NuxtLink :to="`/update/${news.slug}`" class="block h-full">
      <!-- Background Image with Gradient Overlay -->
      <figure class="absolute inset-0">
        <!-- Loading skeleton -->
        <div
          v-if="imageLoading && imageUrl && !imageError"
          class="absolute inset-0 flex items-center justify-center bg-linear-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900"
        >
          <div
            class="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"
          />
        </div>

        <!-- Background image -->
        <NuxtImg
          v-if="imageUrl && !imageError"
          :src="imageUrl"
          :alt="`Gambar: ${news.title}`"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          @error="handleImageError"
          @load="handleImageLoad"
        />

        <!-- Fallback -->
        <div
          v-else
          class="w-full h-full bg-linear-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center"
        >
          <div class="text-center text-green-400 dark:text-gray-600">
            <UIcon
              name="i-lucide-newspaper"
              class="w-20 h-20 mb-3 opacity-50"
            />
            <p class="text-sm font-medium opacity-75">JuruTani</p>
          </div>
        </div>

        <!-- Gradient overlays -->
        <div
          class="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500"
        />
        <div
          class="absolute inset-0 bg-linear-to-br from-green-900/20 via-transparent to-emerald-900/20 group-hover:from-green-900/30 group-hover:to-emerald-900/30 transition-all duration-500"
        />
      </figure>

      <!-- Content Overlay -->
      <div class="relative h-full flex flex-col justify-end p-6 md:p-8">
        <!-- Top badges -->
        <div
          class="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2"
        >
          <!-- Category -->
          <span
            :class="[
              getCategoryColor(news.category),
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl',
            ]"
          >
            <UIcon name="i-lucide-tag" class="w-3 h-3" />
            {{ formattedCategory }}
          </span>

          <!-- Gallery badge -->
          <span
            v-if="news.images && news.images.length > 0"
            class="inline-flex items-center gap-1 px-2 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full"
          >
            <UIcon name="i-lucide-images" class="w-3 h-3" />
            {{ news.images.length }}
          </span>

          <!-- Attachments badge -->
          <span
            v-if="news.attachments && news.attachments.length > 0"
            class="inline-flex items-center gap-1 px-2 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full"
          >
            <UIcon name="i-lucide-paperclip" class="w-3 h-3" />
            {{ news.attachments.length }}
          </span>
        </div>

        <!-- Main content at bottom -->
        <div
          class="space-y-3 transform transition-transform duration-500 group-hover:translate-y-[-6px]"
        >
          <h3
            :class="[
              'font-bold text-white leading-tight line-clamp-2 transition-all duration-300',
              variant === 'large'
                ? 'text-2xl md:text-3xl'
                : 'text-xl md:text-2xl',
            ]"
          >
            {{ news.title }}
          </h3>

          <p
            v-if="variant === 'large' || variant === 'wide'"
            class="text-gray-200 text-sm md:text-base line-clamp-2 leading-relaxed"
          >
            {{ excerpt }}
          </p>

          <!-- Meta -->
          <footer
            class="flex items-center gap-4 text-xs md:text-sm text-gray-300"
          >
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="w-4 h-4 text-green-400" />
              <time :datetime="news.created_at">{{ formattedDate }}</time>
            </div>
          </footer>

          <!-- Read more -->
          <div
            class="flex items-center gap-2 text-white font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          >
            <span class="text-sm"
              >Baca Selengkapnya
              <span class="sr-only">tentang {{ news.title }}</span></span
            >
            <UIcon
              name="i-lucide-arrow-right"
              class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
            />
          </div>
        </div>

        <!-- Hover border -->
        <div
          class="absolute inset-0 border-2 border-transparent group-hover:border-green-400/50 rounded-2xl transition-all duration-500 pointer-events-none"
        />
      </div>
    </NuxtLink>
  </article>
</template>
