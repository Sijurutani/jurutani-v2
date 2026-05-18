<script setup lang="ts">
  import { computed, ref } from 'vue'

  interface Course {
    id: string
    slug: string
    title: string
    description?: string
    category?: string
    duration?: string
    instructor?: string
    image_url?: string
    link_youtube?: string
    created_at: string
  }

  interface Props {
    course: Course
    variant?: 'default' | 'large' | 'wide'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
  })

  const imageError = ref(false)
  const imageLoading = ref(true)

  // Extract YouTube thumbnail
  const youtubeThumbnail = computed(() => {
    if (!props.course.link_youtube) return null

    try {
      const url = new URL(props.course.link_youtube)
      let videoId = null

      if (url.hostname.includes('youtube.com')) {
        videoId = url.searchParams.get('v')
      } else if (url.hostname.includes('youtu.be')) {
        videoId = url.pathname.slice(1)
      }

      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
    } catch (e) {
      console.error('Invalid YouTube URL:', e)
    }

    return null
  })

  const thumbnailUrl = computed(() => {
    // Prioritize YouTube thumbnail
    if (youtubeThumbnail.value) return youtubeThumbnail.value

    // Fallback to image_url
    if (props.course.image_url) {
      if (props.course.image_url.startsWith('http')) {
        return props.course.image_url
      }
    }

    return '/course.png'
  })

  const handleImageLoad = () => {
    imageLoading.value = false
    imageError.value = false
  }

  const handleImageError = () => {
    imageLoading.value = false
    imageError.value = true
  }

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-green-600'

    const colors: Record<string, string> = {
      pertanian: 'bg-green-600',
      peternakan: 'bg-blue-600',
      teknologi: 'bg-purple-600',
      budidaya: 'bg-emerald-600',
      default: 'bg-lime-600',
    }

    return colors[category.toLowerCase()] || colors.default
  }

  // Card classes based on variant
  const cardClasses = computed(() => {
    const base =
      'group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:scale-[1.02] cursor-pointer'

    const variants = {
      default: 'col-span-1',
      large: 'col-span-1 md:col-span-2',
      wide: 'col-span-1 md:col-span-2',
    }

    return `${base} ${variants[props.variant]}`
  })
</script>

<template>
  <NuxtLink :to="`/educations/${course.slug}`" :class="cardClasses">
    <!-- Thumbnail with Play Overlay -->
    <div class="relative aspect-video bg-gray-900 overflow-hidden">
      <!-- Loading State -->
      <div
        v-if="imageLoading && !imageError"
        class="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-800 to-gray-900"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"
        />
      </div>

      <!-- Thumbnail Image -->
      <NuxtImg
        v-if="!imageError"
        :src="thumbnailUrl"
        :alt="course.title"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
        @error="handleImageError"
        @load="handleImageLoad"
      />

      <!-- Fallback -->
      <div
        v-else
        class="w-full h-full bg-linear-to-br from-green-900 to-emerald-900 flex items-center justify-center"
      >
        <UIcon name="i-lucide-play-circle" class="w-20 h-20 text-white/50" />
      </div>

      <!-- Gradient Overlay -->
      <div
        class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"
      />

      <!-- Play Button Overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div
          class="w-16 h-16 md:w-20 md:h-20 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl"
        >
          <UIcon
            name="i-lucide-play"
            class="w-8 h-8 md:w-10 md:h-10 text-green-600 dark:text-green-400 ml-1"
          />
        </div>
      </div>

      <!-- Category Badge -->
      <div class="absolute top-4 left-4">
        <span
          :class="[
            getCategoryColor(course.category),
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm',
          ]"
        >
          <UIcon name="i-lucide-graduation-cap" class="w-3 h-3" />
          {{ course.category || 'Edukasi' }}
        </span>
      </div>

      <!-- Duration Badge -->
      <div v-if="course.duration" class="absolute top-4 right-4">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/70 text-white text-xs font-bold rounded-full backdrop-blur-sm"
        >
          <UIcon name="i-lucide-clock" class="w-3 h-3" />
          {{ course.duration }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 md:p-6">
      <!-- Title -->
      <h3
        :class="[
          'font-bold text-gray-900 dark:text-white leading-tight mb-3 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300',
          variant === 'large' ? 'text-xl md:text-2xl' : 'text-lg md:text-xl',
        ]"
      >
        {{ course.title }}
      </h3>

      <!-- Description (only for large variant) -->
      <p
        v-if="variant === 'large' && course.description"
        class="text-gray-600 dark:text-gray-400 text-sm md:text-base mb-4 line-clamp-2"
      >
        {{ course.description }}
      </p>

      <!-- Meta Info -->
      <div
        class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
      >
        <div v-if="course.instructor" class="flex items-center gap-2">
          <UIcon
            name="i-lucide-user"
            class="w-4 h-4 text-green-600 dark:text-green-400"
          />
          <span class="font-medium">{{ course.instructor }}</span>
        </div>

        <div class="flex items-center gap-1 ml-auto">
          <span class="text-xs">Tonton Sekarang</span>
          <UIcon
            name="i-lucide-arrow-right"
            class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </div>
    </div>

    <!-- Animated Border on Hover -->
    <div
      class="absolute inset-0 border-2 border-transparent group-hover:border-green-400/50 rounded-2xl transition-all duration-500 pointer-events-none"
    />
  </NuxtLink>
</template>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
