<script setup lang="ts">
  import type { Database } from '~/types/database.types'
  import type { JSONContent } from '@tiptap/vue-3'

  type LearningCourse = Database['public']['Tables']['learning_courses']['Row']

  interface Props {
    course: LearningCourse
    variant?: 'default' | 'large' | 'wide'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
  })

  const supabase = useSupabaseClient()
  const imageError = ref(false)
  const imageLoading = ref(true)

  // Resolve cover image URL
  const imageUrl = computed(() => {
    const path = props.course.cover_image
    if (!path) return null
    if (path.startsWith('http')) return path
    const { data } = supabase.storage.from('courses-images').getPublicUrl(path)
    return data.publicUrl || null
  })

  // Extract plain text dari Tiptap JSONContent
  function extractText(node: any): string {
    if (!node) return ''
    if (typeof node === 'string') return node
    let text = ''
    if (node.text) text += node.text
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach((child: any) => {
        text += extractText(child)
      })
    }
    return text
  }

  // Excerpt dari description (JSONContent atau string)
  const excerpt = computed(() => {
    const raw = props.course.description
    if (!raw)
      return 'Pelajari materi pertanian yang terstruktur dan praktis dari para ahli.'

    let text = ''
    if (typeof raw === 'string') {
      try {
        text = extractText(JSON.parse(raw))
      } catch {
        text = raw
      }
    } else if (typeof raw === 'object') {
      text = extractText(raw)
    }

    text = text.trim()
    const maxLength =
      props.variant === 'large' ? 200 : props.variant === 'wide' ? 150 : 100
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  })

  const formattedCategory = computed(() => {
    if (!props.course.category) return ''
    return (
      props.course.category.charAt(0).toUpperCase() +
      props.course.category.slice(1)
    )
  })

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      peternakan: 'bg-amber-600',
      tanaman: 'bg-green-600',
      hortikultura: 'bg-emerald-600',
      perkebunan: 'bg-lime-700',
      perikanan: 'bg-blue-600',
      teknologi: 'bg-teal-600',
      bisnis: 'bg-orange-600',
      default: 'bg-emerald-600',
    }
    return colors[category.toLowerCase()] || colors.default
  }

  const formattedDate = computed(() => {
    const date = props.course.published_at || props.course.created_at
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))
  })

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
    <NuxtLink :to="`/courses/${course.slug || course.id}`" class="block h-full">
      <!-- Background Image with Gradient Overlay -->
      <figure class="absolute inset-0">
        <!-- Loading skeleton -->
        <div
          v-if="imageLoading && imageUrl && !imageError"
          class="absolute inset-0 flex items-center justify-center bg-linear-to-br from-amber-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900"
        >
          <div
            class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"
          />
        </div>

        <!-- Cover image -->
        <NuxtImg
          v-if="imageUrl && !imageError"
          :src="imageUrl"
          :alt="course.title"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          @error="handleImageError"
          @load="handleImageLoad"
        />

        <!-- Fallback -->
        <div
          v-else
          class="w-full h-full bg-linear-to-br from-amber-100 via-emerald-100 to-teal-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center"
        >
          <div class="text-center text-emerald-400 dark:text-gray-600">
            <UIcon
              name="i-lucide-graduation-cap"
              class="w-20 h-20 mb-3 opacity-50"
            />
            <p class="text-sm font-medium opacity-75">JuruTani Course</p>
          </div>
        </div>

        <!-- Gradient overlays -->
        <div
          class="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500"
        />
        <div
          class="absolute inset-0 bg-linear-to-br from-amber-900/20 via-transparent to-emerald-900/20 group-hover:from-amber-900/30 group-hover:to-emerald-900/30 transition-all duration-500"
        />
      </figure>

      <!-- Content Overlay -->
      <div class="relative h-full flex flex-col justify-end p-6 md:p-8">
        <!-- Top badges -->
        <div
          class="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2"
        >
          <!-- Category badge -->
          <span
            :class="[
              getCategoryColor(course.category ?? ''),
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl',
            ]"
          >
            <UIcon name="i-lucide-graduation-cap" class="w-3 h-3" />
            {{ formattedCategory }}
          </span>

          <!-- Course label -->
          <span
            class="inline-flex items-center gap-1 px-2 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full"
          >
            <UIcon name="i-lucide-play-circle" class="w-3 h-3" />
            Kursus
          </span>
        </div>

        <!-- Main content -->
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
            {{ course.title }}
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
              <UIcon name="i-lucide-calendar" class="w-4 h-4 text-amber-400" />
              <time :datetime="course.published_at ?? course.created_at">{{
                formattedDate
              }}</time>
            </div>
          </footer>

          <!-- Read more -->
          <div
            class="flex items-center gap-2 text-white font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          >
            <span class="text-sm">Mulai Belajar</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
            />
          </div>
        </div>

        <!-- Hover border -->
        <div
          class="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/50 rounded-2xl transition-all duration-500 pointer-events-none"
        />
      </div>
    </NuxtLink>
  </article>
</template>
