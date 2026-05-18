<script setup lang="ts">
  import type { Tables } from '~/types/database.types'
  import { parseEmbeds, getEmbedSrc, getEmbedAspect } from '~/utils/embed'

  type MeetingSchedule = Tables<'meeting_schedules'>

  interface Props {
    meeting: MeetingSchedule
    variant?: 'default' | 'large' | 'wide'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
  })

  // ─── Embeds ───────────────────────────────────────────────────────────────────
  const embeds = computed(() => parseEmbeds(props.meeting.embeds))

  // Hanya embed yang bisa di-iframe
  const embeddableEmbeds = computed(() =>
    embeds.value.filter((e) => !!getEmbedSrc(e)),
  )

  // Embed yang tidak bisa di-iframe (Twitter/X dll)
  const nonEmbeddable = computed(() =>
    embeds.value.filter((e) => !getEmbedSrc(e)),
  )

  const hasEmbeds = computed(() => embeds.value.length > 0)
  const hasIframeEmbeds = computed(() => embeddableEmbeds.value.length > 0)

  // ─── Carousel state ───────────────────────────────────────────────────────────
  const activeIndex = ref(0)

  const currentEmbed = computed(
    () => embeddableEmbeds.value[activeIndex.value] ?? null,
  )
  const currentSrc = computed(() =>
    currentEmbed.value ? getEmbedSrc(currentEmbed.value) : null,
  )
  const currentAspect = computed(() =>
    currentEmbed.value
      ? getEmbedAspect(currentEmbed.value.platform)
      : 'aspect-video',
  )

  // Navigasi carousel — hentikan propagasi agar tidak trigger NuxtLink
  const goPrev = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    activeIndex.value =
      activeIndex.value === 0
        ? embeddableEmbeds.value.length - 1
        : activeIndex.value - 1
  }

  const goNext = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    activeIndex.value = (activeIndex.value + 1) % embeddableEmbeds.value.length
  }

  const goTo = (e: MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    activeIndex.value = index
  }

  // Reset carousel saat prop berubah
  watch(
    () => props.meeting.id,
    () => {
      activeIndex.value = 0
    },
  )

  // ─── Platform helpers ─────────────────────────────────────────────────────────
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
      instagram_post: 'Instagram',
      instagram_reel: 'Instagram Reel',
      facebook_post: 'Facebook',
      facebook_video: 'Facebook Video',
      tiktok: 'TikTok',
      twitter: 'Twitter/X',
    }
    return labels[platform] ?? 'Link'
  }

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      youtube: 'bg-red-600',
      instagram_post:
        'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400',
      instagram_reel:
        'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400',
      facebook_post: 'bg-blue-600',
      facebook_video: 'bg-blue-600',
      tiktok: 'bg-gray-900',
      twitter: 'bg-sky-500',
    }
    return colors[platform] ?? 'bg-emerald-600'
  }

  // Fallback background jika tidak ada embed sama sekali
  const fallbackGradient =
    'bg-linear-to-br from-emerald-700 via-teal-600 to-cyan-600'

  // ─── Excerpt ──────────────────────────────────────────────────────────────────
  const excerpt = computed(() => {
    const maxLength = props.variant === 'large' ? 180 : 120
    const text = props.meeting.content?.trim() ?? ''
    if (text)
      return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text
    const firstCaption = embeds.value[0]?.caption?.trim() ?? ''
    if (firstCaption)
      return firstCaption.length > maxLength
        ? firstCaption.substring(0, maxLength) + '...'
        : firstCaption
    return 'Ikuti kegiatan dan webinar seputar pertanian bersama komunitas JuruTani.'
  })

  const formattedDate = computed(() =>
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(props.meeting.created_at)),
  )

  // ─── Card classes ─────────────────────────────────────────────────────────────
  const cardClasses = computed(() => {
    const base =
      'group relative overflow-hidden rounded-2xl border border-emerald-100/80 dark:border-emerald-900/60 bg-white dark:bg-gray-900 shadow-sm hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer flex flex-col'
    const variants: Record<string, string> = {
      default: 'col-span-1 row-span-1',
      large: 'col-span-1 md:col-span-2 row-span-1 md:row-span-2',
      wide: 'col-span-1 md:col-span-2 row-span-1',
    }
    return `${base} ${variants[props.variant]}`
  })

  // Preview height berdasarkan variant
  const previewHeight = computed(() => {
    if (props.variant === 'large') return 'min-h-[320px] md:min-h-[420px]'
    if (props.variant === 'wide') return 'min-h-[260px]'
    return 'min-h-[220px]'
  })
</script>

<template>
  <article :class="cardClasses">
    <!-- ── Preview area (atas) ───────────────────────────────────────────── -->
    <div
      class="relative shrink-0 w-full overflow-hidden bg-gray-100 dark:bg-gray-800"
      :class="previewHeight"
    >
      <!-- CASE 1: Ada iframe embed → tampilkan carousel -->
      <template v-if="hasIframeEmbeds">
        <!-- Iframe aktif -->
        <div
          class="absolute inset-0 w-full h-full"
          :class="
            currentAspect === 'aspect-9/16'
              ? 'flex items-center justify-center'
              : ''
          "
        >
          <iframe
            v-if="currentSrc"
            :key="currentSrc"
            :src="currentSrc"
            class="w-full h-full border-0 pointer-events-none select-none"
            :class="
              currentAspect === 'aspect-9/16' ? 'max-w-45 md:max-w-55' : ''
            "
            loading="lazy"
            scrolling="no"
            allowtransparency
            :title="getPlatformLabel(currentEmbed!.platform)"
          />
        </div>

        <!-- Overlay transparan penuh — blokir semua klik ke iframe,
             biarkan klik diteruskan ke NuxtLink di bawah -->
        <div class="absolute inset-0 z-10" />

        <!-- Platform badge kiri atas -->
        <div class="absolute top-3 left-3 z-20">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 text-white text-xs font-bold rounded-full shadow-md"
            :class="getPlatformColor(currentEmbed!.platform)"
          >
            <UIcon
              :name="getPlatformIcon(currentEmbed!.platform)"
              class="w-3 h-3"
            />
            {{ getPlatformLabel(currentEmbed!.platform) }}
          </span>
        </div>

        <!-- Carousel controls — hanya muncul jika embed > 1 -->
        <template v-if="embeddableEmbeds.length > 1">
          <!-- Tombol prev -->
          <UButton
            color="neutral"
            variant="ghost"
            type="button"
            class="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            @click="goPrev"
          >
            <UIcon name="i-lucide-chevron-left" class="w-4 h-4" />
          </UButton>

          <!-- Tombol next -->
          <UButton
            color="neutral"
            variant="ghost"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            @click="goNext"
          >
            <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          </UButton>

          <!-- Dots indicator bawah -->
          <div
            class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5"
          >
            <UButton
              color="neutral"
              variant="ghost"
              v-for="(_, i) in embeddableEmbeds"
              :key="i"
              type="button"
              class="rounded-full transition-all duration-200 bg-white shadow"
              :class="
                i === activeIndex
                  ? 'w-5 h-2 opacity-100'
                  : 'w-2 h-2 opacity-50 hover:opacity-80'
              "
              @click="goTo($event, i)"
            />
          </div>

          <!-- Counter kanan atas -->
          <div class="absolute top-3 right-3 z-20">
            <span
              class="inline-flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full"
            >
              <UIcon name="i-lucide-layers" class="w-3 h-3" />
              {{ activeIndex + 1 }} / {{ embeddableEmbeds.length }}
            </span>
          </div>
        </template>

        <!-- Badge non-embeddable (Twitter dll) jika ada -->
        <div
          v-if="nonEmbeddable.length > 0"
          class="absolute bottom-3 right-3 z-20"
        >
          <span
            class="inline-flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full"
          >
            <UIcon name="i-lucide-link" class="w-3 h-3" />
            +{{ nonEmbeddable.length }} link
          </span>
        </div>
      </template>

      <!-- CASE 2: Ada embed tapi tidak bisa di-iframe (hanya Twitter dll) -->
      <template v-else-if="hasEmbeds">
        <div
          class="absolute inset-0 flex flex-col items-center justify-center gap-3"
          :class="fallbackGradient"
        >
          <div class="absolute inset-0 opacity-10">
            <div
              class="absolute top-4 right-8 w-24 h-24 rounded-full bg-white"
            />
            <div
              class="absolute bottom-4 left-8 w-16 h-16 rounded-full bg-white"
            />
          </div>
          <UIcon
            :name="getPlatformIcon(embeds[0].platform)"
            class="relative w-16 h-16 text-white/50"
          />
          <div class="relative flex flex-col items-center gap-1">
            <span class="text-xs font-semibold text-white/70">{{
              getPlatformLabel(embeds[0].platform)
            }}</span>
            <span class="text-xs text-white/50">Buka di halaman detail</span>
          </div>
        </div>

        <!-- Badge platform -->
        <div class="absolute top-3 left-3 z-10">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 text-white text-xs font-bold rounded-full shadow-md"
            :class="getPlatformColor(embeds[0].platform)"
          >
            <UIcon
              :name="getPlatformIcon(embeds[0].platform)"
              class="w-3 h-3"
            />
            {{ getPlatformLabel(embeds[0].platform) }}
          </span>
        </div>
      </template>

      <!-- CASE 3: Tidak ada embed sama sekali -->
      <template v-else>
        <div
          class="absolute inset-0 flex items-center justify-center"
          :class="fallbackGradient"
        >
          <div class="absolute inset-0 opacity-10">
            <div
              class="absolute top-0 right-0 w-40 h-40 rounded-full bg-white -translate-y-1/2 translate-x-1/2"
            />
            <div
              class="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white translate-y-1/2 -translate-x-1/2"
            />
          </div>
          <div class="relative text-center">
            <UIcon
              name="i-lucide-calendar-range"
              class="w-16 h-16 mx-auto text-white/40 mb-2"
            />
            <p class="text-xs font-semibold text-white/60">JuruTani</p>
          </div>
        </div>
      </template>

      <!-- Gradient bawah ke konten — smooth transition -->
      <div
        class="absolute bottom-0 inset-x-0 h-12 bg-linear-to-t from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"
      />
    </div>

    <!-- ── Konten (bawah) ────────────────────────────────────────────────── -->
    <NuxtLink
      :to="`/meetings/${meeting.id}`"
      class="flex flex-col flex-1 px-5 pt-3 pb-4"
    >
      <!-- Judul -->
      <h3
        :class="[
          'font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-2 transition-colors duration-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
          variant === 'large' ? 'text-xl md:text-2xl' : 'text-base md:text-lg',
        ]"
      >
        {{ meeting.title }}
      </h3>

      <!-- Excerpt -->
      <p
        v-if="variant === 'large' || variant === 'wide'"
        class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-3 flex-1"
      >
        {{ excerpt }}
      </p>
      <p
        v-else
        class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3 flex-1"
      >
        {{ excerpt }}
      </p>

      <!-- Footer meta -->
      <div
        class="flex items-center justify-between mt-auto pt-2 border-t border-emerald-100/80 dark:border-emerald-900/50"
      >
        <div
          class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500"
        >
          <UIcon
            name="i-lucide-calendar"
            class="w-3.5 h-3.5 text-emerald-500"
          />
          <time :datetime="meeting.created_at">{{ formattedDate }}</time>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-if="embeds.length > 0"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium"
          >
            <UIcon name="i-lucide-link" class="w-3 h-3" />
            {{ embeds.length }} media
          </span>
          <span
            class="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
          >
            <UIcon name="i-lucide-eye" class="w-3.5 h-3.5" />
            Lihat detail
          </span>
          <UIcon
            name="i-lucide-chevron-right"
            class="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
