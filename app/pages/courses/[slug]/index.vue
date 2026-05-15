<script setup lang="ts">
  import type { Tables } from '~/types/database.types'

  definePageMeta({
    layout: 'default',
  })

  const route = useRoute()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()

  type LearningCourse = Tables<'learning_courses'>
  type CourseLesson = Tables<'course_lessons'>
  type CourseRating = Tables<'course_ratings'> & {
    profile?: {
      full_name: string | null
      username: string | null
      avatar_url: string | null
    } | null
  }

  // ─── State ────────────────────────────────────────────────────────────────────
  const course = ref<LearningCourse | null>(null)
  const lessons = ref<CourseLesson[]>([])
  const ratings = ref<CourseRating[]>([])
  const myRating = ref<CourseRating | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const notFound = ref(false)

  // Rating form
  const ratingInput = ref(0)
  const reviewInput = ref('')
  const ratingHover = ref(0)
  const submittingRating = ref(false)
  const ratingError = ref<string | null>(null)
  const ratingSuccess = ref(false)
  const showLoginPrompt = ref(false)

  // ─── Computed ─────────────────────────────────────────────────────────────────
  const isLoggedIn = computed(() => !!authStore.user)
  const userId = computed(() => authStore.user?.id)

  const avgRating = computed(() => {
    if (!ratings.value.length) return 0
    const sum = ratings.value.reduce((acc, r) => acc + r.rating, 0)
    return Math.round((sum / ratings.value.length) * 10) / 10
  })

  const ratingDistribution = computed(() => {
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: ratings.value.filter((r) => r.rating === star).length,
      pct: ratings.value.length
        ? Math.round(
            (ratings.value.filter((r) => r.rating === star).length /
              ratings.value.length) *
              100,
          )
        : 0,
    }))
    return dist
  })

  const getCoverUrl = (path: string | null) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const { data } = supabase.storage.from('courses-images').getPublicUrl(path)
    return data.publicUrl
  }

  const formattedCategory = computed(() => {
    if (!course.value?.category) return ''
    return (
      course.value.category.charAt(0).toUpperCase() +
      course.value.category.slice(1)
    )
  })

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      peternakan:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      tanaman:
        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      hortikultura:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      perkebunan:
        'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300',
      perikanan:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      teknologi:
        'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
      bisnis:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    }
    return (
      map[cat.toLowerCase()] ??
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
    )
  }

  const formattedDate = (date: string | null) => {
    if (!date) return '-'
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))
  }

  const getAvatarUrl = (avatarPath: string | null | undefined) => {
    return avatarPath || null
  }

  // ─── Fetch ────────────────────────────────────────────────────────────────────
  loading.value = true
  error.value = null
  notFound.value = false
  try {
    const slug = route.params.slug as string

    // 1. Course
    const { data: courseData, error: cErr } = await supabase
      .from('learning_courses')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'approved')
      .is('deleted_at', null)
      .is('archived_at', null)
      .single()

    if (cErr) {
      if (cErr.code === 'PGRST116') {
        notFound.value = true
      } else {
        throw cErr
      }
    } else {
      course.value = courseData

      // 2. Lessons (hanya field yang diperlukan untuk list)
      const { data: lessonsData, error: lErr } = await supabase
        .from('course_lessons')
        .select(
          'id, title, slug, order_index, status, published_at, created_at',
        )
        .eq('course_id', courseData.id)
        .eq('status', 'approved')
        .is('deleted_at', null)
        .order('order_index', { ascending: true })

      if (lErr) throw lErr
      lessons.value = (lessonsData ?? []) as any[]

      // 3. Ratings + profile join
      const { data: ratingsData, error: rErr } = await supabase
        .from('course_ratings')
        .select('*, profile:profiles(full_name, username, avatar_url)')
        .eq('course_id', courseData.id)
        .order('created_at', { ascending: false })

      if (rErr) throw rErr
      ratings.value = (ratingsData ?? []) as CourseRating[]

      // 4. My rating (jika login)
      if (userId.value) {
        const mine = ratings.value.find((r) => r.user_id === userId.value)
        if (mine) {
          myRating.value = mine
          ratingInput.value = mine.rating
          reviewInput.value = mine.review ?? ''
        }
      }

      useSeoMeta({
        title: courseData.title,
        description: 'Course pertanian dari JuruTani.',
        ogImage: getCoverUrl(courseData.cover_image) || '/jurutani.webp',
        url: `https://jurutani.com/courses/${slug}`,
        ogType: 'article',
      })
    }
  } catch (e: any) {
    error.value = e?.message || 'Terjadi kesalahan'
  } finally {
    loading.value = false
  }

  // ─── Rating Handlers ──────────────────────────────────────────────────────────
  const handleRatingClick = (star: number) => {
    if (!isLoggedIn.value) {
      showLoginPrompt.value = true
      return
    }
    ratingInput.value = star
  }

  const submitRating = async () => {
    if (!isLoggedIn.value) {
      showLoginPrompt.value = true
      return
    }
    if (!ratingInput.value) {
      ratingError.value = 'Pilih bintang rating terlebih dahulu.'
      return
    }
    if (!course.value) return

    submittingRating.value = true
    ratingError.value = null
    ratingSuccess.value = false

    try {
      const payload = {
        course_id: course.value.id,
        user_id: userId.value!,
        rating: ratingInput.value,
        review: reviewInput.value.trim() || null,
      }

      if (myRating.value) {
        // Update existing
        const { error: uErr } = await supabase
          .from('course_ratings')
          .update({
            rating: payload.rating,
            review: payload.review,
            updated_at: new Date().toISOString(),
          })
          .eq('course_id', course.value.id)
          .eq('user_id', userId.value!)

        if (uErr) throw uErr
      } else {
        // Insert new
        const { error: iErr } = await supabase
          .from('course_ratings')
          .insert(payload)

        if (iErr) throw iErr
      }

      // Refresh ratings
      const { data: refreshed } = await supabase
        .from('course_ratings')
        .select('*, profile:profiles(full_name, username, avatar_url)')
        .eq('course_id', course.value.id)
        .order('created_at', { ascending: false })

      ratings.value = (refreshed ?? []) as CourseRating[]
      myRating.value =
        ratings.value.find((r) => r.user_id === userId.value) ?? null
      ratingSuccess.value = true
    } catch (e: any) {
      ratingError.value = e?.message || 'Gagal menyimpan rating.'
    } finally {
      submittingRating.value = false
    }
  }

  const goBack = () => router.push('/courses')
</script>

<template>
  <div>
    <div class="max-w-5xl mx-auto px-4 pb-16 pt-6 lg:pt-4">
      <!-- Back -->
      <UButton
        color="neutral"
        variant="ghost"
        type="button"
        class="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/40 mb-6 transition-colors"
        @click="goBack"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        Kembali ke daftar kursus
      </UButton>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 dark:border-amber-800 border-t-amber-500 dark:border-t-amber-400"
        />
        <p class="mt-4 text-gray-600 dark:text-gray-400">
          Memuat detail kursus...
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

      <!-- Not Found -->
      <div v-else-if="notFound" class="max-w-md mx-auto text-center py-16">
        <UIcon
          name="i-lucide-book-x"
          class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Kursus tidak ditemukan
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Kursus yang Anda cari mungkin sudah diarsipkan atau dihapus.
        </p>
      </div>

      <!-- Content -->
      <div v-else-if="course" class="space-y-6">
        <!-- ── Hero Card ───────────────────────────────────────────────────── -->
        <article
          class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-amber-100 dark:border-amber-900/40 overflow-hidden"
        >
          <!-- Cover image -->
          <div class="relative h-52 md:h-72 bg-amber-100 dark:bg-amber-900/30">
            <NuxtImg
              v-if="getCoverUrl(course.cover_image)"
              :src="getCoverUrl(course.cover_image)!"
              :alt="course.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex items-center justify-center h-full">
              <UIcon
                name="i-lucide-graduation-cap"
                class="w-20 h-20 text-amber-300 dark:text-amber-700 opacity-60"
              />
            </div>
            <div
              class="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"
            />

            <!-- Overlay badges -->
            <div class="absolute top-4 left-4 flex items-center gap-2">
              <span
                v-if="course.category"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md"
                :class="getCategoryColor(course.category)"
              >
                <UIcon name="i-lucide-graduation-cap" class="w-3 h-3" />
                {{ formattedCategory }}
              </span>
            </div>

            <!-- Title overlay -->
            <div class="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-8">
              <h1
                class="text-2xl md:text-3xl font-bold text-white drop-shadow leading-tight"
              >
                {{ course.title }}
              </h1>
            </div>
          </div>

          <!-- Stats bar -->
          <div
            class="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 border-b border-amber-100 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20"
          >
            <div
              class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
            >
              <UIcon
                name="i-lucide-play-circle"
                class="w-3.5 h-3.5 text-amber-500"
              />
              <span
                ><span class="font-semibold text-gray-900 dark:text-white">{{
                  lessons.length
                }}</span>
                lesson</span
              >
            </div>
            <div
              class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
            >
              <UIcon name="i-lucide-star" class="w-3.5 h-3.5 text-amber-500" />
              <span>
                <span class="font-semibold text-gray-900 dark:text-white">{{
                  avgRating || '-'
                }}</span>
                <span class="ml-1">({{ ratings.length }} ulasan)</span>
              </span>
            </div>
            <div
              class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
            >
              <UIcon
                name="i-lucide-calendar"
                class="w-3.5 h-3.5 text-amber-500"
              />
              <span
                >Diterbitkan
                {{
                  formattedDate(course.published_at ?? course.created_at)
                }}</span
              >
            </div>
            <div
              v-if="
                course.updated_at && course.updated_at !== course.created_at
              "
              class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500"
            >
              <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
              <span>Diperbarui {{ formattedDate(course.updated_at) }}</span>
            </div>
          </div>

          <!-- Description -->
          <div class="p-6 md:p-8">
            <h2
              class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
            >
              <UIcon name="i-lucide-book-open" class="w-4 h-4 text-amber-500" />
              Tentang Kursus
            </h2>
            <AppContentViewer :content="course.description" prose="base" />
          </div>
        </article>

        <!-- ── Lessons List ────────────────────────────────────────────────── -->
        <section
          class="bg-white dark:bg-gray-900 rounded-2xl shadow border border-emerald-100 dark:border-emerald-900/60 overflow-hidden"
        >
          <div
            class="px-6 py-4 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between"
          >
            <h2
              class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
            >
              <UIcon
                name="i-lucide-list-ordered"
                class="w-4 h-4 text-emerald-500"
              />
              Daftar Lesson
              <span class="text-xs font-normal text-gray-400 dark:text-gray-500"
                >({{ lessons.length }} lesson)</span
              >
            </h2>
          </div>

          <div
            v-if="lessons.length"
            class="divide-y divide-emerald-50 dark:divide-emerald-900/30"
          >
            <NuxtLink
              v-for="(lesson, index) in lessons"
              :key="lesson.id"
              :to="`/courses/${course.slug || course.id}/lessons/${lesson.slug}`"
              class="flex items-center gap-4 px-6 py-4 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 transition-colors group"
            >
              <!-- Number badge -->
              <span
                class="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm font-bold group-hover:bg-emerald-500 group-hover:text-white transition-colors"
              >
                {{ index + 1 }}
              </span>

              <!-- Title -->
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors"
                >
                  {{ lesson.title }}
                </p>
                <p
                  v-if="lesson.published_at"
                  class="text-xs text-gray-400 dark:text-gray-500 mt-0.5"
                >
                  {{ formattedDate(lesson.published_at) }}
                </p>
              </div>

              <UIcon
                name="i-lucide-chevron-right"
                class="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0"
              />
            </NuxtLink>
          </div>

          <div v-else class="px-6 py-10 text-center">
            <UIcon
              name="i-lucide-book-dashed"
              class="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-3"
            />
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Belum ada lesson untuk kursus ini.
            </p>
          </div>
        </section>

        <!-- ── Ratings ─────────────────────────────────────────────────────── -->
        <section
          class="bg-white dark:bg-gray-900 rounded-2xl shadow border border-emerald-100 dark:border-emerald-900/60 overflow-hidden"
        >
          <div
            class="px-6 py-4 border-b border-emerald-100 dark:border-emerald-900/50"
          >
            <h2
              class="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
            >
              <UIcon name="i-lucide-star" class="w-4 h-4 text-amber-500" />
              Rating & Ulasan
            </h2>
          </div>

          <div class="p-6 md:p-8 space-y-8">
            <!-- Rating summary -->
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <!-- Big number -->
              <div class="text-center min-w-[80px]">
                <div class="text-5xl font-bold text-gray-900 dark:text-white">
                  {{ avgRating || '—' }}
                </div>
                <div class="flex items-center justify-center gap-0.5 mt-1">
                  <UIcon
                    v-for="star in 5"
                    :key="star"
                    name="i-lucide-star"
                    class="w-4 h-4"
                    :class="
                      star <= Math.round(avgRating)
                        ? 'text-amber-400'
                        : 'text-gray-200 dark:text-gray-700'
                    "
                  />
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {{ ratings.length }} ulasan
                </div>
              </div>

              <!-- Distribution bars -->
              <div class="flex-1 w-full space-y-1.5">
                <div
                  v-for="d in ratingDistribution"
                  :key="d.star"
                  class="flex items-center gap-2"
                >
                  <span
                    class="text-xs text-gray-500 dark:text-gray-400 w-3 text-right"
                    >{{ d.star }}</span
                  >
                  <UIcon
                    name="i-lucide-star"
                    class="w-3 h-3 text-amber-400 shrink-0"
                  />
                  <div
                    class="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden"
                  >
                    <div
                      class="h-full bg-amber-400 rounded-full transition-all duration-500"
                      :style="{ width: `${d.pct}%` }"
                    />
                  </div>
                  <span
                    class="text-xs text-gray-400 dark:text-gray-500 w-6 text-right"
                    >{{ d.count }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Rating form -->
            <div
              class="border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-5 bg-emerald-50/40 dark:bg-emerald-950/20"
            >
              <h3
                class="text-sm font-semibold text-gray-900 dark:text-white mb-3"
              >
                {{ myRating ? 'Ubah Ulasan Kamu' : 'Berikan Ulasanmu' }}
              </h3>

              <!-- Login prompt -->
              <div v-if="showLoginPrompt && !isLoggedIn" class="mb-3">
                <UAlert
                  color="warning"
                  icon="i-lucide-lock"
                  title="Login diperlukan"
                  description="Kamu perlu login untuk memberikan rating."
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
              </div>

              <!-- Star input -->
              <div class="flex items-center gap-1 mb-3">
                <UButton
                  color="neutral"
                  variant="ghost"
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="p-0.5 transition-transform hover:scale-110"
                  @click="handleRatingClick(star)"
                  @mouseenter="isLoggedIn && (ratingHover = star)"
                  @mouseleave="ratingHover = 0"
                >
                  <UIcon
                    name="i-lucide-star"
                    class="w-7 h-7 transition-colors"
                    :class="
                      star <= (ratingHover || ratingInput)
                        ? 'text-amber-400'
                        : 'text-gray-200 dark:text-gray-700'
                    "
                  />
                </UButton>
                <span
                  v-if="ratingInput"
                  class="ml-2 text-sm font-medium text-amber-600 dark:text-amber-400"
                >
                  {{
                    [
                      '',
                      'Sangat buruk',
                      'Kurang baik',
                      'Cukup',
                      'Bagus',
                      'Sangat bagus',
                    ][ratingInput]
                  }}
                </span>
              </div>

              <!-- Review textarea -->
              <textarea
                v-model="reviewInput"
                rows="3"
                placeholder="Tulis ulasanmu di sini (opsional)..."
                class="w-full text-sm rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none transition"
                :disabled="!isLoggedIn"
                @focus="!isLoggedIn && (showLoginPrompt = true)"
              />

              <UAlert
                v-if="ratingError"
                color="error"
                icon="i-lucide-alert-circle"
                :title="ratingError"
                class="mt-3"
              />
              <UAlert
                v-if="ratingSuccess"
                color="success"
                icon="i-lucide-check-circle"
                title="Rating berhasil disimpan!"
                class="mt-3"
              />

              <div class="flex items-center justify-between mt-3">
                <span
                  v-if="myRating"
                  class="text-xs text-gray-400 dark:text-gray-500 italic"
                >
                  Kamu sudah pernah memberi rating — ini akan mengubahnya.
                </span>
                <span v-else class="text-xs text-gray-400 dark:text-gray-500" />
                <UButton
                  color="neutral"
                  variant="ghost"
                  type="button"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="submittingRating || !ratingInput"
                  @click="
                    isLoggedIn ? submitRating() : (showLoginPrompt = true)
                  "
                >
                  <UIcon
                    v-if="submittingRating"
                    name="i-lucide-loader"
                    class="w-4 h-4 animate-spin"
                  />
                  <UIcon v-else name="i-lucide-send" class="w-4 h-4" />
                  {{
                    submittingRating
                      ? 'Menyimpan...'
                      : myRating
                        ? 'Perbarui Rating'
                        : 'Kirim Rating'
                  }}
                </UButton>
              </div>
            </div>

            <!-- Rating list -->
            <div v-if="ratings.length" class="space-y-4">
              <div
                v-for="r in ratings"
                :key="`${r.course_id}-${r.user_id}`"
                class="flex gap-3"
              >
                <!-- Avatar -->
                <div class="shrink-0">
                  <NuxtImg
                    v-if="getAvatarUrl(r.profile?.avatar_url)"
                    :src="getAvatarUrl(r.profile?.avatar_url)!"
                    :alt="r.profile?.full_name ?? 'User'"
                    class="w-9 h-9 rounded-full object-cover border-2 border-emerald-100 dark:border-emerald-900"
                  />
                  <div
                    v-else
                    class="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center"
                  >
                    <UIcon
                      name="i-lucide-user"
                      class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      class="text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      {{
                        r.profile?.full_name ||
                        r.profile?.username ||
                        'Pengguna'
                      }}
                    </span>
                    <!-- Stars -->
                    <div class="flex items-center gap-0.5">
                      <UIcon
                        v-for="star in 5"
                        :key="star"
                        name="i-lucide-star"
                        class="w-3 h-3"
                        :class="
                          star <= r.rating
                            ? 'text-amber-400'
                            : 'text-gray-200 dark:text-gray-700'
                        "
                      />
                    </div>
                    <!-- My badge -->
                    <span
                      v-if="r.user_id === userId"
                      class="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-medium"
                    >
                      Ulasanmu
                    </span>
                  </div>
                  <p
                    v-if="r.review"
                    class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
                  >
                    {{ r.review }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {{
                      new Intl.DateTimeFormat('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }).format(new Date(r.updated_at))
                    }}
                  </p>
                </div>
              </div>
            </div>

            <p
              v-else
              class="text-sm text-gray-400 dark:text-gray-500 text-center py-4"
            >
              Belum ada ulasan. Jadilah yang pertama!
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
