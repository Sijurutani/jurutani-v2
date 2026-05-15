<script setup lang="ts">
  import type { Tables } from '~/types/database.types'
  import { parseEmbeds, getEmbedSrc, getEmbedAspect } from '~/utils/embed'

  definePageMeta({
    layout: 'default',
  })

  const route = useRoute()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()
  const courseSlug = computed(() =>
    Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug,
  )
  const routeLessonSlug = computed(() =>
    Array.isArray(route.params.lessonSlug)
      ? route.params.lessonSlug[0]
      : route.params.lessonSlug,
  )

  type LearningCourse = Tables<'learning_courses'>
  type CourseLesson = Tables<'course_lessons'>

  interface CommentWithProfile {
    id: string
    course_id: string
    lesson_id: string
    user_id: string
    content: string
    parent_id: string | null
    is_hidden: boolean
    created_at: string
    updated_at: string
    deleted_at: string | null
    profile?: {
      full_name: string | null
      username: string | null
      avatar_url: string | null
    } | null
    replies?: CommentWithProfile[]
  }

  // ─── State ────────────────────────────────────────────────────────────────────
  const course = ref<LearningCourse | null>(null)
  const lessons = ref<CourseLesson[]>([])
  const lesson = ref<CourseLesson | null>(null)
  const comments = ref<CommentWithProfile[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Comment form
  const commentInput = ref('')
  const submittingComment = ref(false)
  const commentError = ref<string | null>(null)
  const showLoginPrompt = ref(false)

  // Reply state
  const replyingTo = ref<CommentWithProfile | null>(null)
  const replyInput = ref('')
  const submittingReply = ref(false)
  const replyError = ref<string | null>(null)

  // ─── Computed ─────────────────────────────────────────────────────────────────
  const isLoggedIn = computed(() => !!authStore.user)
  const userId = computed(() => authStore.user?.id)

  // Embeds dari lesson
  const embeds = computed(() => parseEmbeds(lesson.value?.embeds))

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      youtube: 'i-lucide-youtube',
      instagram_post: 'i-lucide-instagram',
      instagram_reel: 'i-lucide-instagram',
      facebook_post: 'i-lucide-facebook',
      facebook_video: 'i-lucide-facebook',
      tiktok: 'i-lucide-music',
      twitter: 'i-lucide-twitter',
    }
    return icons[platform] ?? 'i-lucide-link'
  }

  const getPlatformLabel = (platform: string) => {
    const labels: Record<string, string> = {
      youtube: 'YouTube',
      instagram_post: 'Instagram Post',
      instagram_reel: 'Instagram Reel',
      facebook_post: 'Facebook',
      facebook_video: 'Facebook Video',
      tiktok: 'TikTok',
      twitter: 'Twitter / X',
    }
    return labels[platform] ?? 'Link'
  }

  const currentIndex = computed(() => {
    if (!lesson.value) return -1
    return lessons.value.findIndex((l) => l.id === lesson.value?.id)
  })
  const hasPrev = computed(() => currentIndex.value > 0)
  const hasNext = computed(
    () =>
      currentIndex.value >= 0 && currentIndex.value < lessons.value.length - 1,
  )

  // Build nested comment tree
  const commentTree = computed(() => {
    const roots: CommentWithProfile[] = []
    const map = new Map<string, CommentWithProfile>()

    // Clone + init replies
    comments.value.forEach((c) => {
      map.set(c.id, { ...c, replies: [] })
    })

    map.forEach((c) => {
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id)!.replies!.push(c)
      } else {
        roots.push(c)
      }
    })

    return roots
  })

  const getAvatarUrl = (avatarPath: string | null | undefined) => {
    return avatarPath || null
  }

  const formattedDate = (date: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))

  // ─── Navigation ───────────────────────────────────────────────────────────────
  const goPrev = () => {
    if (!hasPrev.value) return
    const prev = lessons.value[currentIndex.value - 1]
    router.push(`/courses/${route.params.slug}/lessons/${prev.slug}`)
  }
  const goNext = () => {
    if (!hasNext.value) return
    const next = lessons.value[currentIndex.value + 1]
    router.push(`/courses/${route.params.slug}/lessons/${next.slug}`)
  }
  const goBack = () => router.push(`/courses/${route.params.slug}`)

  // ─── Fetch ────────────────────────────────────────────────────────────────────
  const fetchComments = async (courseId: string, lessonId: string) => {
    const { data, error: cErr } = await supabase
      .from('course_comments')
      .select('*, profile:profiles(full_name, username, avatar_url)')
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .eq('is_hidden', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (cErr) throw cErr
    comments.value = (data ?? []) as CommentWithProfile[]
  }

  const loadLessonPage = async ({ smoothScroll = false } = {}) => {
    loading.value = true
    error.value = null
    try {
      const slug = courseSlug.value
      const lessonSlug = routeLessonSlug.value

      if (!slug || !lessonSlug) {
        error.value = 'Lesson tidak ditemukan.'
        lesson.value = null
        comments.value = []
        return
      }

      // 1. Course
      const { data: courseData, error: cErr } = await supabase
        .from('learning_courses')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'approved')
        .is('deleted_at', null)
        .is('archived_at', null)
        .single()
      if (cErr) throw cErr
      course.value = courseData

      // 2. All lessons (for prev/next navigation)
      const { data: lessonsData, error: lErr } = await supabase
        .from('course_lessons')
        .select('id, title, slug, order_index')
        .eq('course_id', courseData.id)
        .eq('status', 'approved')
        .is('deleted_at', null)
        .order('order_index', { ascending: true })
      if (lErr) throw lErr
      lessons.value = (lessonsData ?? []) as CourseLesson[]

      // 3. This lesson (full content)
      const found = lessons.value.find((l) => l.slug === lessonSlug)
      if (!found) {
        error.value = 'Lesson tidak ditemukan.'
        lesson.value = null
        comments.value = []
        return
      }

      const { data: lessonFull, error: lfErr } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', found.id)
        .single()
      if (lfErr) throw lfErr
      lesson.value = lessonFull as CourseLesson

      // 4. Comments
      await fetchComments(courseData.id, found.id)

      useSeoMeta({
        title: `${lessonFull.title} – ${courseData.title}`,
        description: 'Lesson dari course JuruTani.',
        url: `https://jurutani.com/courses/${slug}/lessons/${lessonSlug}`,
        ogType: 'article',
      })

      if (smoothScroll && import.meta.client) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (e: any) {
      error.value = e?.message || 'Terjadi kesalahan'
    } finally {
      loading.value = false
    }
  }

  await loadLessonPage()

  // Watch route change (navigasi lesson)
  watch(
    [courseSlug, routeLessonSlug],
    async ([newCourseSlug, newLessonSlug], [oldCourseSlug, oldLessonSlug]) => {
      if (newCourseSlug === oldCourseSlug && newLessonSlug === oldLessonSlug) {
        return
      }

      await loadLessonPage({ smoothScroll: true })
    },
  )

  // ─── Comment Handlers ─────────────────────────────────────────────────────────
  const submitComment = async () => {
    if (!isLoggedIn.value) {
      showLoginPrompt.value = true
      return
    }
    if (!commentInput.value.trim()) return
    if (!course.value || !lesson.value) return

    submittingComment.value = true
    commentError.value = null
    try {
      const { error: iErr } = await supabase.from('course_comments').insert({
        course_id: course.value.id,
        lesson_id: lesson.value.id,
        user_id: userId.value!,
        content: commentInput.value.trim(),
        parent_id: null,
      })
      if (iErr) throw iErr
      commentInput.value = ''
      await fetchComments(course.value.id, lesson.value.id)
    } catch (e: any) {
      commentError.value = e?.message || 'Gagal mengirim komentar.'
    } finally {
      submittingComment.value = false
    }
  }

  const startReply = (comment: CommentWithProfile) => {
    if (!isLoggedIn.value) {
      showLoginPrompt.value = true
      return
    }
    replyingTo.value = comment
    replyInput.value = ''
    replyError.value = null
  }

  const cancelReply = () => {
    replyingTo.value = null
    replyInput.value = ''
    replyError.value = null
  }

  const toggleReply = (comment: CommentWithProfile) => {
    if (replyingTo.value?.id === comment.id) {
      cancelReply()
      return
    }

    startReply(comment)
  }

  const submitReply = async () => {
    if (!isLoggedIn.value) {
      showLoginPrompt.value = true
      return
    }
    if (!replyInput.value.trim() || !replyingTo.value) return
    if (!course.value || !lesson.value) return

    submittingReply.value = true
    replyError.value = null
    try {
      const { error: iErr } = await supabase.from('course_comments').insert({
        course_id: course.value.id,
        lesson_id: lesson.value.id,
        user_id: userId.value!,
        content: replyInput.value.trim(),
        parent_id: replyingTo.value.id,
      })
      if (iErr) throw iErr
      cancelReply()
      await fetchComments(course.value.id, lesson.value.id)
    } catch (e: any) {
      replyError.value = e?.message || 'Gagal mengirim balasan.'
    } finally {
      submittingReply.value = false
    }
  }
</script>

<template>
  <div>
    <div class="max-w-4xl mx-auto px-4 pb-16 pt-6 lg:pt-4">
      <!-- Back -->
      <UButton
        color="neutral"
        variant="ghost"
        type="button"
        class="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/40 mb-4 transition-colors"
        @click="goBack"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        Kembali ke kursus
      </UButton>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-500 dark:border-t-emerald-400"
        />
        <p class="mt-4 text-gray-600 dark:text-gray-400">Memuat lesson...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="max-w-md mx-auto">
        <UAlert
          color="error"
          icon="i-lucide-alert-triangle"
          title="Gagal memuat lesson"
          :description="error"
        />
      </div>

      <!-- Content -->
      <div v-else-if="lesson" class="space-y-6">
        <!-- ── Lesson Header ───────────────────────────────────────────────── -->
        <header>
          <p
            class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5"
          >
            <UIcon name="i-lucide-graduation-cap" class="w-3.5 h-3.5" />
            {{ course?.title }}
          </p>
          <div class="flex items-start justify-between gap-4">
            <h1
              class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight"
            >
              {{ lesson.title }}
            </h1>
            <!-- Lesson position -->
            <span
              class="shrink-0 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full whitespace-nowrap"
            >
              {{ currentIndex + 1 }} / {{ lessons.length }}
            </span>
          </div>
        </header>

        <!-- ── Lesson Content ──────────────────────────────────────────────── -->
        <article
          class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-emerald-100 dark:border-emerald-900/60 p-6 md:p-8"
        >
          <AppContentViewer :content="lesson.content" prose="lg" />
        </article>

        <!-- ── Embeds ──────────────────────────────────────────────────────── -->
        <section v-if="embeds.length > 0" class="space-y-4">
          <h2
            class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 px-1"
          >
            <UIcon name="i-lucide-link" class="w-4 h-4 text-emerald-500" />
            Media Lesson
            <span class="text-xs font-normal text-gray-400 dark:text-gray-500"
              >({{ embeds.length }} item)</span
            >
          </h2>

          <div
            v-for="embed in embeds"
            :key="embed.id"
            class="rounded-xl overflow-hidden border border-emerald-100 dark:border-emerald-900/60 bg-white dark:bg-gray-900 shadow"
          >
            <!-- Platform bar -->
            <div
              class="flex items-center justify-between px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-100 dark:border-emerald-900/50"
            >
              <span
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
              >
                <UIcon
                  :name="getPlatformIcon(embed.platform)"
                  class="w-3.5 h-3.5"
                />
                {{ getPlatformLabel(embed.platform) }}
              </span>
              <a
                :href="embed.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <UIcon name="i-lucide-external-link" class="w-3 h-3" />
                Buka di tab baru
              </a>
            </div>

            <!-- Iframe embed -->
            <div
              v-if="getEmbedSrc(embed)"
              class="w-full"
              :class="getEmbedAspect(embed.platform)"
            >
              <iframe
                :src="getEmbedSrc(embed)!"
                class="w-full h-full border-0"
                loading="lazy"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowfullscreen
                :title="`${getPlatformLabel(embed.platform)}: ${lesson.title}`"
              />
            </div>

            <!-- Fallback: tidak bisa di-iframe (Twitter/X) -->
            <div v-else class="flex items-center gap-4 p-4">
              <div
                class="shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center"
              >
                <UIcon
                  :name="getPlatformIcon(embed.platform)"
                  class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate"
                >
                  {{ getPlatformLabel(embed.platform) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ embed.url }}
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Platform ini tidak mendukung embed langsung — buka di tab
                  baru.
                </p>
              </div>
              <a
                :href="embed.url"
                target="_blank"
                rel="noopener noreferrer"
                class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
              >
                <UIcon name="i-lucide-external-link" class="w-3.5 h-3.5" />
                Buka
              </a>
            </div>

            <!-- Caption jika ada -->
            <div
              v-if="embed.caption"
              class="px-4 py-3 border-t border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-gray-900"
            >
              <p
                class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"
              >
                <UIcon name="i-lucide-quote" class="w-3 h-3" />
                Keterangan
              </p>
              <p
                class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line"
              >
                {{ embed.caption }}
              </p>
            </div>
          </div>
        </section>

        <!-- ── Prev / Next ─────────────────────────────────────────────────── -->
        <div class="flex items-center justify-between gap-4">
          <UButton
            color="neutral"
            variant="ghost"
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!hasPrev"
            @click="goPrev"
          >
            <UIcon name="i-lucide-chevron-left" class="w-4 h-4" />
            Sebelumnya
          </UButton>

          <!-- Lesson dots (mini map) -->
          <div class="hidden sm:flex items-center gap-1.5">
            <UButton
              v-for="(l, i) in lessons"
              :key="l.id"
              color="neutral"
              variant="ghost"
              type="button"
              class="min-h-0 min-w-0 rounded-full p-0! transition-all duration-200"
              :class="
                i === currentIndex
                  ? 'h-2 w-4 bg-emerald-500 hover:bg-emerald-500'
                  : 'h-2 w-2 bg-gray-200 hover:bg-emerald-300 dark:bg-gray-700'
              "
              :aria-label="`Buka lesson ${l.title}`"
              :aria-current="i === currentIndex ? 'step' : undefined"
              @click="
                router.push(`/courses/${route.params.slug}/lessons/${l.slug}`)
              "
            />
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :class="
              hasNext
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            "
            :disabled="!hasNext && currentIndex !== lessons.length - 1"
            @click="hasNext ? goNext() : goBack()"
          >
            {{ hasNext ? 'Berikutnya' : 'Selesai' }}
            <UIcon
              :name="hasNext ? 'i-lucide-chevron-right' : 'i-lucide-check'"
              class="w-4 h-4"
            />
          </UButton>
        </div>

        <!-- ── Comments ────────────────────────────────────────────────────── -->
        <section
          class="bg-white dark:bg-gray-900 rounded-2xl shadow border border-emerald-100 dark:border-emerald-900/60 overflow-hidden"
        >
          <div
            class="px-6 py-4 border-b border-emerald-100 dark:border-emerald-900/50"
          >
            <h2
              class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
            >
              <UIcon
                name="i-lucide-message-square"
                class="w-4 h-4 text-emerald-500"
              />
              Diskusi
              <span class="text-xs font-normal text-gray-400 dark:text-gray-500"
                >({{ comments.length }} komentar)</span
              >
            </h2>
          </div>

          <div class="p-6 space-y-6">
            <!-- Login prompt -->
            <UAlert
              v-if="showLoginPrompt && !isLoggedIn"
              color="warning"
              icon="i-lucide-lock"
              title="Login untuk berkomentar"
              description="Kamu perlu login untuk ikut berdiskusi di sini."
            >
              <template #actions>
                <NuxtLink
                  to="/login"
                  class="text-xs font-medium text-amber-700 dark:text-amber-300 underline"
                >
                  Login sekarang
                </NuxtLink>
              </template>
            </UAlert>

            <!-- Main comment form -->
            <div class="flex gap-3">
              <div
                class="shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center"
              >
                <UIcon
                  name="i-lucide-user"
                  class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div class="flex-1">
                <textarea
                  v-model="commentInput"
                  rows="3"
                  placeholder="Tulis komentar atau pertanyaan kamu..."
                  class="w-full text-sm rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none transition"
                  @focus="!isLoggedIn && (showLoginPrompt = true)"
                />
                <UAlert
                  v-if="commentError"
                  color="error"
                  :title="commentError"
                  class="mt-2"
                />
                <div class="flex justify-end mt-2">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    type="button"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="submittingComment || !commentInput.trim()"
                    @click="
                      isLoggedIn ? submitComment() : (showLoginPrompt = true)
                    "
                  >
                    <UIcon
                      v-if="submittingComment"
                      name="i-lucide-loader"
                      class="w-4 h-4 animate-spin"
                    />
                    <UIcon v-else name="i-lucide-send" class="w-4 h-4" />
                    {{ submittingComment ? 'Mengirim...' : 'Kirim' }}
                  </UButton>
                </div>
              </div>
            </div>

            <!-- Comment list -->
            <div v-if="commentTree.length" class="space-y-5">
              <div
                v-for="comment in commentTree"
                :key="comment.id"
                class="flex gap-3"
              >
                <!-- Avatar -->
                <div class="shrink-0">
                  <NuxtImg
                    v-if="getAvatarUrl(comment.profile?.avatar_url)"
                    :src="getAvatarUrl(comment.profile?.avatar_url)!"
                    :alt="comment.profile?.full_name ?? 'User'"
                    class="w-8 h-8 rounded-full object-cover border-2 border-emerald-100 dark:border-emerald-900"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center"
                  >
                    <UIcon
                      name="i-lucide-user"
                      class="w-4 h-4 text-emerald-500 dark:text-emerald-400"
                    />
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <!-- Comment bubble -->
                  <div
                    class="bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3"
                  >
                    <div class="flex items-center gap-2 mb-1">
                      <span
                        class="text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        {{
                          comment.profile?.full_name ||
                          comment.profile?.username ||
                          'Pengguna'
                        }}
                      </span>
                      <span
                        v-if="comment.user_id === userId"
                        class="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                      >
                        Kamu
                      </span>
                    </div>
                    <p
                      class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line"
                    >
                      {{ comment.content }}
                    </p>
                  </div>

                  <!-- Meta + actions -->
                  <div class="flex items-center gap-3 mt-1.5 px-1">
                    <span class="text-xs text-gray-400 dark:text-gray-500">{{
                      formattedDate(comment.created_at)
                    }}</span>
                    <UButton
                      color="neutral"
                      variant="ghost"
                      type="button"
                      class="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      @click="toggleReply(comment)"
                    >
                      {{ replyingTo?.id === comment.id ? 'Batal' : 'Balas' }}
                    </UButton>
                  </div>

                  <!-- Reply form -->
                  <div
                    v-if="replyingTo?.id === comment.id"
                    class="mt-3 flex gap-2.5"
                  >
                    <div
                      class="shrink-0 w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center"
                    >
                      <UIcon
                        name="i-lucide-corner-down-right"
                        class="w-3.5 h-3.5 text-teal-600 dark:text-teal-400"
                      />
                    </div>
                    <div class="flex-1">
                      <textarea
                        v-model="replyInput"
                        rows="2"
                        :placeholder="`Balas ${comment.profile?.full_name || 'komentar ini'}...`"
                        class="w-full text-sm rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 text-gray-900 dark:text-white placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none transition"
                        autofocus
                      />
                      <UAlert
                        v-if="replyError"
                        color="error"
                        :title="replyError"
                        class="mt-1.5"
                      />
                      <div class="flex justify-end mt-1.5">
                        <UButton
                          color="neutral"
                          variant="ghost"
                          type="button"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                          :disabled="submittingReply || !replyInput.trim()"
                          @click="submitReply"
                        >
                          <UIcon
                            v-if="submittingReply"
                            name="i-lucide-loader"
                            class="w-3.5 h-3.5 animate-spin"
                          />
                          <UIcon
                            v-else
                            name="i-lucide-send"
                            class="w-3.5 h-3.5"
                          />
                          {{ submittingReply ? 'Mengirim...' : 'Balas' }}
                        </UButton>
                      </div>
                    </div>
                  </div>

                  <!-- Nested replies -->
                  <div
                    v-if="comment.replies && comment.replies.length"
                    class="mt-3 space-y-3 pl-2 border-l-2 border-emerald-100 dark:border-emerald-900/60"
                  >
                    <div
                      v-for="reply in comment.replies"
                      :key="reply.id"
                      class="flex gap-2.5"
                    >
                      <!-- Reply avatar -->
                      <div class="shrink-0">
                        <NuxtImg
                          v-if="getAvatarUrl(reply.profile?.avatar_url)"
                          :src="getAvatarUrl(reply.profile?.avatar_url)!"
                          :alt="reply.profile?.full_name ?? 'User'"
                          class="w-7 h-7 rounded-full object-cover border-2 border-teal-100 dark:border-teal-900"
                        />
                        <div
                          v-else
                          class="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center"
                        >
                          <UIcon
                            name="i-lucide-user"
                            class="w-3.5 h-3.5 text-teal-500 dark:text-teal-400"
                          />
                        </div>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div
                          class="bg-teal-50/60 dark:bg-teal-900/20 rounded-xl px-3.5 py-2.5"
                        >
                          <div class="flex items-center gap-2 mb-0.5">
                            <span
                              class="text-xs font-semibold text-gray-900 dark:text-white"
                            >
                              {{
                                reply.profile?.full_name ||
                                reply.profile?.username ||
                                'Pengguna'
                              }}
                            </span>
                            <span
                              v-if="reply.user_id === userId"
                              class="text-xs px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300"
                            >
                              Kamu
                            </span>
                          </div>
                          <p
                            class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line"
                          >
                            {{ reply.content }}
                          </p>
                        </div>
                        <span
                          class="text-xs text-gray-400 dark:text-gray-500 px-1 mt-1 block"
                        >
                          {{ formattedDate(reply.created_at) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-8">
              <UIcon
                name="i-lucide-message-circle"
                class="w-10 h-10 mx-auto text-gray-200 dark:text-gray-700 mb-3"
              />
              <p class="text-sm text-gray-400 dark:text-gray-500">
                Belum ada komentar. Mulai diskusi!
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
