<script setup lang="ts">
  import type { Tables } from '~/types/database.types'

  definePageMeta({
    layout: 'default',
    middleware: ['auth'],
  })

  const supabase = useSupabaseClient()
  const authStore = useAuthStore()

  type CourseCompletion = Tables<'course_completions'>
  type LearningCourse = Tables<'learning_courses'>
  type CourseRating = Tables<'course_ratings'>
  type CourseComment = Tables<'course_comments'>
  type CourseLesson = Tables<'course_lessons'>

  type CompletionWithCourse = CourseCompletion & {
    course: LearningCourse | null
  }

  type RatingWithCourse = CourseRating & {
    course: LearningCourse | null
  }

  type CommentWithLesson = CourseComment & {
    course: Pick<LearningCourse, 'id' | 'title' | 'slug'> | null
    lesson: Pick<CourseLesson, 'id' | 'title' | 'slug'> | null
  }

  // ─── State ────────────────────────────────────────────────────────────────────
  const activeTab = ref<'completions' | 'ratings' | 'comments'>('completions')

  const completions = ref<CompletionWithCourse[]>([])
  const ratings = ref<RatingWithCourse[]>([])
  const comments = ref<CommentWithLesson[]>([])

  const loading = ref(true)
  const error = ref<string | null>(null)

  // ─── Computed ─────────────────────────────────────────────────────────────────
  // userId: user dari authStore adalah useSupabaseUser() → Ref<User | null>
  // jadi akses langsung authStore.user?.id (bukan .value?.id)
  const userId = computed(() => authStore.user?.id)

  const getCoverUrl = (path: string | null | undefined) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const { data } = supabase.storage.from('courses-images').getPublicUrl(path)
    return data.publicUrl
  }

  const formattedDate = (date: string | null | undefined) => {
    if (!date) return '-'
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))
  }

  const formattedDateTime = (date: string | null | undefined) => {
    if (!date) return '-'
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const tabs = computed(() => [
    {
      key: 'completions' as const,
      label: 'Kursus Selesai',
      icon: 'i-lucide-book-open-check',
      count: completions.value.length,
    },
    {
      key: 'ratings' as const,
      label: 'Ulasan Saya',
      icon: 'i-lucide-star',
      count: ratings.value.length,
    },
    {
      key: 'comments' as const,
      label: 'Komentar Saya',
      icon: 'i-lucide-message-square',
      count: comments.value.length,
    },
  ])

  // ─── Fetch ────────────────────────────────────────────────────────────────────
  onMounted(async () => {
    loading.value = true
    error.value = null

    try {
      const uid = userId.value
      if (!uid) throw new Error('User tidak terautentikasi')

      // 1. Completions + course data
      const { data: completionData, error: cErr } = await supabase
        .from('course_completions')
        .select('*, course:learning_courses(*)')
        .eq('user_id', uid)
        .is('invalidated_at', null)
        .order('completed_at', { ascending: false })

      if (cErr) throw cErr
      completions.value = (completionData ??
        []) as unknown as CompletionWithCourse[]

      // 2. Ratings + course data
      const { data: ratingData, error: rErr } = await supabase
        .from('course_ratings')
        .select(
          '*, course:learning_courses(id, title, slug, cover_image, category)',
        )
        .eq('user_id', uid)
        .order('updated_at', { ascending: false })

      if (rErr) throw rErr
      ratings.value = (ratingData ?? []) as unknown as RatingWithCourse[]

      // 3. Comments + course + lesson join
      const { data: commentData, error: cmErr } = await supabase
        .from('course_comments')
        .select(
          `
        *,
        course:learning_courses(id, title, slug),
        lesson:course_lessons(id, title, slug)
      `,
        )
        .eq('user_id', uid)
        .eq('is_hidden', false)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (cmErr) throw cmErr
      comments.value = (commentData ?? []) as unknown as CommentWithLesson[]
    } catch (e: any) {
      error.value = e?.message || 'Gagal memuat data'
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <div
    class="min-h-screen bg-linear-to-b from-emerald-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950"
  >
    <div class="max-w-4xl mx-auto px-4 pb-16 pt-6 lg:pt-4">
      <!-- Header -->
      <header class="mb-8">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3"
        >
          <UIcon name="i-lucide-graduation-cap" class="w-3.5 h-3.5" />
          Aktivitas Belajarku
        </div>
        <h1
          class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          Riwayat Kursus Saya
        </h1>
        <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Pantau progress belajar, ulasan, dan diskusi kamu di semua kursus
          JuruTani.
        </p>
      </header>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-500 dark:border-t-emerald-400"
        />
        <p class="mt-4 text-gray-500 dark:text-gray-400 text-sm">
          Memuat data aktivitasmu...
        </p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="max-w-md mx-auto">
        <UAlert
          color="error"
          icon="i-lucide-alert-triangle"
          title="Gagal memuat data"
          :description="error"
        />
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Stats bar -->
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="bg-white dark:bg-gray-900 rounded-xl border border-emerald-100 dark:border-emerald-900/60 px-4 py-3 text-center shadow-sm"
          >
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ tab.count }}
            </div>
            <div
              class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center justify-center gap-1"
            >
              <UIcon :name="tab.icon" class="w-3 h-3" />
              {{ tab.label }}
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div
          class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl"
        >
          <UButton
            color="neutral"
            variant="ghost"
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            "
            @click="activeTab = tab.key"
          >
            <UIcon :name="tab.icon" class="w-4 h-4" />
            <span class="hidden sm:inline">{{ tab.label }}</span>
            <span
              v-if="tab.count > 0"
              class="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
              :class="
                activeTab === tab.key
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              "
            >
              {{ tab.count }}
            </span>
          </UButton>
        </div>

        <!-- ── Tab: Completions ──────────────────────────────────────────────── -->
        <div v-if="activeTab === 'completions'">
          <div v-if="completions.length" class="space-y-3">
            <article
              v-for="item in completions"
              :key="item.course_id"
              class="bg-white dark:bg-gray-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 shadow-sm overflow-hidden flex flex-col sm:flex-row"
            >
              <!-- Cover thumbnail -->
              <div
                class="shrink-0 h-28 sm:h-auto sm:w-36 bg-emerald-100 dark:bg-emerald-900/30 relative"
              >
                <NuxtImg
                  v-if="getCoverUrl(item.course?.cover_image)"
                  :src="getCoverUrl(item.course?.cover_image)!"
                  :alt="item.course?.title"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="flex items-center justify-center h-full w-full"
                >
                  <UIcon
                    name="i-lucide-graduation-cap"
                    class="w-10 h-10 text-emerald-300 dark:text-emerald-700"
                  />
                </div>
                <!-- Completion badge -->
                <div class="absolute top-2 left-2">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow"
                  >
                    <UIcon name="i-lucide-check" class="w-3 h-3" />
                    Selesai
                  </span>
                </div>
              </div>

              <!-- Info -->
              <div
                class="flex-1 min-w-0 px-5 py-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <h2
                    class="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug"
                  >
                    {{ item.course?.title || 'Course tidak tersedia' }}
                  </h2>
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    <span
                      class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
                    >
                      <UIcon
                        name="i-lucide-calendar-check"
                        class="w-3.5 h-3.5 text-emerald-500"
                      />
                      Selesai {{ formattedDate(item.completed_at) }}
                    </span>
                    <span
                      class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
                    >
                      <UIcon
                        name="i-lucide-play-circle"
                        class="w-3.5 h-3.5 text-emerald-500"
                      />
                      {{ item.lesson_count }} lesson
                    </span>
                    <span
                      v-if="item.course?.category"
                      class="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full font-medium"
                    >
                      {{
                        item.course.category.charAt(0).toUpperCase() +
                        item.course.category.slice(1)
                      }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <!-- Rating singkat jika sudah rating -->
                  <div
                    v-if="ratings.find((r) => r.course_id === item.course_id)"
                    class="flex items-center gap-1"
                  >
                    <div class="flex items-center gap-0.5">
                      <UIcon
                        v-for="star in 5"
                        :key="star"
                        name="i-lucide-star"
                        class="w-3.5 h-3.5"
                        :class="
                          star <=
                          (ratings.find((r) => r.course_id === item.course_id)
                            ?.rating ?? 0)
                            ? 'text-amber-400'
                            : 'text-gray-200 dark:text-gray-700'
                        "
                      />
                    </div>
                    <span class="text-xs text-gray-400 dark:text-gray-500"
                      >Sudah diulas</span
                    >
                  </div>
                  <span
                    v-else
                    class="text-xs text-gray-400 dark:text-gray-500 italic"
                    >Belum diulas</span
                  >

                  <NuxtLink
                    :to="`/courses/${item.course?.slug || item.course_id}`"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                  >
                    <UIcon name="i-lucide-eye" class="w-3.5 h-3.5" />
                    Lihat Course
                  </NuxtLink>
                </div>
              </div>
            </article>
          </div>

          <!-- Empty -->
          <div v-else class="text-center py-16">
            <UIcon
              name="i-lucide-book-open"
              class="w-14 h-14 mx-auto text-gray-200 dark:text-gray-700 mb-4"
            />
            <h2
              class="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              Belum ada kursus yang selesai
            </h2>
            <p class="text-sm text-gray-400 dark:text-gray-500 mb-4">
              Mulai ikuti kursus dan selesaikan semua lessonnya.
            </p>
            <NuxtLink
              to="/courses"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
            >
              <UIcon name="i-lucide-graduation-cap" class="w-4 h-4" />
              Jelajahi Kursus
            </NuxtLink>
          </div>
        </div>

        <!-- ── Tab: Ratings ─────────────────────────────────────────────────── -->
        <div v-if="activeTab === 'ratings'">
          <div v-if="ratings.length" class="space-y-3">
            <article
              v-for="item in ratings"
              :key="`${item.course_id}-${item.user_id}`"
              class="bg-white dark:bg-gray-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 shadow-sm p-5"
            >
              <div class="flex items-start gap-4">
                <!-- Cover mini -->
                <div
                  class="shrink-0 w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 overflow-hidden"
                >
                  <NuxtImg
                    v-if="getCoverUrl((item.course as any)?.cover_image)"
                    :src="getCoverUrl((item.course as any)?.cover_image)!"
                    :alt="(item.course as any)?.title"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="flex items-center justify-center h-full">
                    <UIcon
                      name="i-lucide-graduation-cap"
                      class="w-6 h-6 text-amber-400"
                    />
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 flex-wrap">
                    <NuxtLink
                      :to="`/courses/${(item.course as any)?.slug || item.course_id}`"
                      class="text-sm font-semibold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1"
                    >
                      {{
                        (item.course as any)?.title || 'Course tidak tersedia'
                      }}
                    </NuxtLink>
                    <span
                      class="text-xs text-gray-400 dark:text-gray-500 shrink-0"
                    >
                      {{ formattedDate(item.updated_at) }}
                    </span>
                  </div>

                  <!-- Stars -->
                  <div class="flex items-center gap-1.5 mt-1.5">
                    <div class="flex items-center gap-0.5">
                      <UIcon
                        v-for="star in 5"
                        :key="star"
                        name="i-lucide-star"
                        class="w-4 h-4"
                        :class="
                          star <= item.rating
                            ? 'text-amber-400'
                            : 'text-gray-200 dark:text-gray-700'
                        "
                      />
                    </div>
                    <span
                      class="text-sm font-semibold text-amber-600 dark:text-amber-400"
                      >{{ item.rating }}/5</span
                    >
                    <span class="text-xs text-gray-400 dark:text-gray-500">
                      {{
                        [
                          '',
                          'Sangat buruk',
                          'Kurang baik',
                          'Cukup',
                          'Bagus',
                          'Sangat bagus',
                        ][item.rating]
                      }}
                    </span>
                  </div>

                  <!-- Review -->
                  <p
                    v-if="item.review"
                    class="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-2 italic"
                  >
                    "{{ item.review }}"
                  </p>
                  <p
                    v-else
                    class="mt-1.5 text-xs text-gray-400 dark:text-gray-500 italic"
                  >
                    Tidak ada ulasan tertulis.
                  </p>

                  <!-- Edit link -->
                  <div class="mt-2 flex justify-end">
                    <NuxtLink
                      :to="`/courses/${(item.course as any)?.slug || item.course_id}`"
                      class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <UIcon name="i-lucide-pencil" class="w-3 h-3" />
                      Ubah ulasan
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <!-- Empty -->
          <div v-else class="text-center py-16">
            <UIcon
              name="i-lucide-star"
              class="w-14 h-14 mx-auto text-gray-200 dark:text-gray-700 mb-4"
            />
            <h2
              class="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              Belum ada ulasan
            </h2>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Selesaikan kursus lalu berikan ulasanmu agar membantu petani lain.
            </p>
          </div>
        </div>

        <!-- ── Tab: Comments ────────────────────────────────────────────────── -->
        <div v-if="activeTab === 'comments'">
          <div v-if="comments.length" class="space-y-3">
            <article
              v-for="item in comments"
              :key="item.id"
              class="bg-white dark:bg-gray-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 shadow-sm p-5"
            >
              <!-- Breadcrumb kursus → lesson -->
              <div
                class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-3 flex-wrap"
              >
                <UIcon
                  name="i-lucide-graduation-cap"
                  class="w-3 h-3 text-emerald-500"
                />
                <NuxtLink
                  :to="`/courses/${(item.course as any)?.slug || item.course_id}`"
                  class="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {{ (item.course as any)?.title || 'Course' }}
                </NuxtLink>
                <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
                <UIcon
                  name="i-lucide-play-circle"
                  class="w-3 h-3 text-emerald-500"
                />
                <NuxtLink
                  v-if="item.lesson"
                  :to="`/courses/${(item.course as any)?.slug || item.course_id}/lessons/${(item.lesson as any)?.slug}`"
                  class="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {{ (item.lesson as any)?.title || 'Lesson' }}
                </NuxtLink>
                <!-- Reply indicator -->
                <span
                  v-if="item.parent_id"
                  class="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400"
                >
                  <UIcon name="i-lucide-corner-down-right" class="w-3 h-3" />
                  Balasan
                </span>
              </div>

              <!-- Comment bubble -->
              <div class="bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3">
                <p
                  class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line"
                >
                  {{ item.content }}
                </p>
              </div>

              <!-- Meta -->
              <div class="flex items-center justify-between mt-2 px-1">
                <span class="text-xs text-gray-400 dark:text-gray-500">
                  {{ formattedDateTime(item.created_at) }}
                </span>
                <NuxtLink
                  v-if="item.lesson"
                  :to="`/courses/${(item.course as any)?.slug || item.course_id}/lessons/${(item.lesson as any)?.slug}`"
                  class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <UIcon name="i-lucide-external-link" class="w-3 h-3" />
                  Lihat di lesson
                </NuxtLink>
              </div>
            </article>
          </div>

          <!-- Empty -->
          <div v-else class="text-center py-16">
            <UIcon
              name="i-lucide-message-circle"
              class="w-14 h-14 mx-auto text-gray-200 dark:text-gray-700 mb-4"
            />
            <h2
              class="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              Belum ada komentar
            </h2>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Mulai diskusi di setiap lesson untuk berbagi dan bertanya.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
