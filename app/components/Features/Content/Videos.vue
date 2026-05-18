<script setup lang="ts">
  import type { Database } from '~/types/database.types'

  type VideoRow = Database['public']['Tables']['videos']['Row']

  interface Props {
    video: VideoRow
    variant?: 'default' | 'large' | 'wide' | 'tall'
    index?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    index: 0,
  })

  // State management
  const imageError = ref(false)
  const imageLoading = ref(true)

  // YouTube utilities
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  const videoId = computed(() => getYouTubeId(props.video.link_yt))

  const thumbnailUrl = computed(() => {
    if (!videoId.value) return null
    // Use maxresdefault for highest quality, fallback to hqdefault if not available
    return `https://img.youtube.com/vi/${videoId.value}/maxresdefault.jpg`
  })

  const embedUrl = computed(() => {
    if (!videoId.value) return ''
    return `https://www.youtube.com/embed/${videoId.value}?autoplay=1&rel=0&modestbranding=1`
  })

  const isValidVideo = computed(() => !!videoId.value)

  // Formatting utilities
  const formattedDate = computed(() => {
    const date = new Date(props.video.created_at)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  })

  const formattedCategory = computed(() => {
    const cat = props.video.category ?? ''
    return cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Video'
  })

  const excerpt = computed(() => {
    const desc = props.video.description ?? ''
    const maxLength = props.variant === 'large' ? 180 : 100
    return desc.length > maxLength ? desc.substring(0, maxLength) + '...' : desc
  })

  // Image handlers
  const handleImageError = () => {
    imageError.value = true
    imageLoading.value = false
  }

  const handleImageLoad = () => {
    imageLoading.value = false
    imageError.value = false
  }

  // Category color coding
  const getCategoryColor = (category: string) => {
    const colors = {
      pertanian: 'bg-green-600',
      peternakan: 'bg-emerald-600',
      teknologi: 'bg-teal-600',
      tutorial: 'bg-lime-600',
      tips: 'bg-green-700',
      panduan: 'bg-emerald-500',
      default: 'bg-green-500',
    }
    return colors[category.toLowerCase()] || colors.default
  }

  // Bento grid variants
  const cardClasses = computed(() => {
    const base =
      'group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cursor-pointer'

    const variants = {
      default: 'col-span-1 row-span-1 min-h-[400px]',
      large:
        'col-span-1 md:col-span-2 row-span-1 md:row-span-2 min-h-[400px] md:min-h-[600px]',
      wide: 'col-span-1 md:col-span-2 row-span-1 min-h-[400px]',
      tall: 'col-span-1 row-span-1 md:row-span-2 min-h-[400px] md:min-h-[600px]',
    }

    return `${base} ${variants[props.variant]}`
  })

  const contentClasses = computed(() => {
    if (props.variant === 'large') {
      return 'p-8 md:p-10'
    }
    return 'p-6 md:p-8'
  })

  // Navigation
  const viewDetails = () => {
    navigateTo(`/videos/${props.video.slug}`)
  }
</script>

<template>
  <div :class="cardClasses" @click="viewDetails">
    <!-- Background Image/Thumbnail with Gradient Overlay -->
    <div class="absolute inset-0">
      <!-- Loading State -->
      <div
        v-if="imageLoading && thumbnailUrl && !imageError"
        class="absolute inset-0 flex items-center justify-center bg-linear-to-br from-green-50 to-pink-100 dark:from-gray-800 dark:to-gray-900"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"
        />
      </div>

      <!-- Thumbnail Image -->
      <NuxtImg
        v-if="thumbnailUrl && !imageError"
        :src="thumbnailUrl"
        :alt="video.title"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
        @error="handleImageError"
        @load="handleImageLoad"
      />

      <!-- Fallback Background -->
      <div
        v-if="!thumbnailUrl || imageError"
        class="w-full h-full bg-linear-to-br from-green-100 via-pink-100 to-orange-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center"
      >
        <div class="text-center text-green-400 dark:text-gray-600">
          <UIcon name="i-lucide-video" class="w-20 h-20 mb-3 opacity-50" />
          <p class="text-sm font-medium opacity-75">Video JuruTani</p>
        </div>
      </div>

      <!-- Play Button Overlay -->
      <div
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          class="w-16 h-16 md:w-20 md:h-20 bg-green-600/90 hover:bg-green-600 rounded-full flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 shadow-2xl"
        >
          <UIcon
            name="i-lucide-play"
            class="w-8 h-8 md:w-10 md:h-10 text-white ml-1"
          />
        </div>
      </div>

      <!-- Gradient Overlay - Enhanced with multiple layers -->
      <div
        class="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500"
      />

      <!-- Additional gradient for better text readability -->
      <div
        class="absolute inset-0 bg-linear-to-br from-green-900/20 via-transparent to-green-900/20 group-hover:from-green-900/30 group-hover:to-green-900/30 transition-all duration-500"
      />
    </div>

    <!-- Content Overlay -->
    <div :class="['relative h-full flex flex-col justify-end', contentClasses]">
      <!-- Category Badge -->
      <div class="absolute top-4 left-4 md:top-6 md:left-6">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
        >
          <UIcon name="i-lucide-video" class="w-3 h-3" />
          {{ formattedCategory }}
        </span>
      </div>

      <!-- Main Content -->
      <div
        class="space-y-3 md:space-y-4 transform transition-transform duration-500 group-hover:translate-y-[-8px]"
      >
        <!-- Title -->
        <h3
          :class="[
            'font-bold text-white leading-tight line-clamp-2 transition-all duration-300',
            variant === 'large'
              ? 'text-2xl md:text-4xl'
              : 'text-xl md:text-2xl',
          ]"
        >
          {{ video.title }}
        </h3>

        <!-- Excerpt - Show more on large variant -->
        <p
          v-if="variant === 'large' || variant === 'wide'"
          :class="[
            'text-gray-200 leading-relaxed transition-all duration-300',
            variant === 'large'
              ? 'text-base md:text-lg line-clamp-3'
              : 'text-sm md:text-base line-clamp-2',
          ]"
        >
          {{ excerpt }}
        </p>

        <!-- Meta Info -->
        <div class="flex items-center gap-4 text-xs md:text-sm text-gray-300">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-calendar" class="w-4 h-4 text-green-400" />
            <span>{{ formattedDate }}</span>
          </div>
          <div v-if="isValidVideo" class="flex items-center gap-2">
            <UIcon name="i-lucide-play-circle" class="w-4 h-4 text-green-400" />
            <span class="font-medium">Video</span>
          </div>
        </div>

        <!-- Watch Video Button -->
        <div
          class="flex items-center gap-2 text-white font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
        >
          <UIcon name="i-lucide-play-circle" class="w-5 h-5" />
          <span class="text-sm md:text-base">Tonton Video</span>
          <UIcon
            name="i-lucide-arrow-right"
            class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
          />
        </div>
      </div>

      <!-- Animated Border on Hover -->
      <div
        class="absolute inset-0 border-2 border-transparent group-hover:border-green-400/50 rounded-2xl transition-all duration-500 pointer-events-none"
      />
    </div>
  </div>
</template>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
