<script setup lang="ts">
  import type { Tables } from '~/types/database.types'
  import type { EmbedItem } from '~/utils/embed'
  import { formatDateLong } from '~/utils/dateFormatter'
  import { parseEmbeds, getEmbedSrc, getEmbedAspect } from '~/utils/embed'

  definePageMeta({
    layout: 'default',
  })

  const route = useRoute()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const routeId = computed(() =>
    Array.isArray(route.params.id) ? route.params.id[0] : route.params.id,
  )

  type MeetingSchedule = Tables<'meeting_schedules'>

  const {
    data: meeting,
    pending: loading,
    error: fetchError,
  } = await useAsyncData(
    'meeting_schedule_detail',
    async () => {
      if (!routeId.value) return null

      const { data, error } = await supabase
        .from('meeting_schedules')
        .select('*')
        .eq('id', routeId.value)
        .is('deleted_at', null)
        .is('archived_at', null)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data as MeetingSchedule
    },
    {
      watch: [routeId],
    },
  )

  const error = computed(() => fetchError.value?.message || null)
  const notFound = computed(
    () => !loading.value && !fetchError.value && !meeting.value,
  )

  const embeds = computed((): EmbedItem[] =>
    parseEmbeds(meeting.value?.embeds as any),
  )

  const content = computed(() => meeting.value?.content || '')

  const goBack = () => router.push('/meetings')

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

  watch(
    meeting,
    (data) => {
      if (!data) return

      useSeoMeta({
        title: data.title,
        description: data.content || 'Jadwal kegiatan dan meeting JuruTani.',
        url: `https://jurutani.com/meetings/${routeId.value}`,
        ogType: 'article',
      })
    },
    {
      immediate: true,
    },
  )
</script>

<template>
  <div>
    <div class="max-w-4xl mx-auto px-4 pb-16 pt-6 lg:pt-4">
      <!-- Back Button -->
      <UButton
        color="neutral"
        variant="ghost"
        type="button"
        class="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/40 mb-6 transition-colors"
        @click="goBack"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        Kembali ke daftar meetings
      </UButton>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-500 dark:border-t-emerald-400"
        />
        <p class="mt-4 text-gray-600 dark:text-gray-400">
          Memuat detail meeting...
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
          name="i-lucide-calendar-x"
          class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Meeting tidak ditemukan
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Meeting yang Anda cari mungkin sudah diarsipkan atau dihapus.
        </p>
      </div>

      <!-- Content -->
      <article
        v-else-if="meeting"
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-900/60 overflow-hidden"
      >
        <!-- Header -->
        <div
          class="px-6 pt-6 pb-4 border-b border-emerald-100 dark:border-emerald-900/50"
        >
          <div
            class="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
          >
            <UIcon name="i-lucide-calendar-range" class="w-3.5 h-3.5" />
            Jadwal Kegiatan
          </div>

          <h1
            class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight"
          >
            {{ meeting.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-medium"
            >
              <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
              {{ formatDateLong(meeting.created_at) }}
            </span>
            <span
              v-if="
                meeting.updated_at && meeting.updated_at !== meeting.created_at
              "
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium"
            >
              <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
              Diperbarui {{ formatDateLong(meeting.updated_at) }}
            </span>
            <span
              v-if="embeds.length > 0"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-medium"
            >
              <UIcon name="i-lucide-link" class="w-3.5 h-3.5" />
              {{ embeds.length }} embed terlampir
            </span>
          </div>
        </div>

        <!-- Body: Content -->
        <div class="p-6 md:p-8">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div
            v-if="content"
            class="prose prose-sm md:prose lg:prose-lg max-w-none prose-emerald prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-emerald-600 hover:prose-a:text-emerald-700 dark:prose-invert dark:prose-headings:text-white dark:prose-p:text-gray-200 dark:prose-a:text-emerald-400"
            v-html="content"
          />
          <p v-else class="text-gray-500 dark:text-gray-400 italic">
            Belum ada deskripsi rinci untuk meeting ini.
          </p>
        </div>

        <!-- Embeds Section -->
        <div v-if="embeds.length > 0" class="px-6 md:px-8 pb-8">
          <div
            class="border-t border-emerald-100 dark:border-emerald-900/50 pt-6"
          >
            <h2
              class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
            >
              <UIcon name="i-lucide-link" class="w-4 h-4 text-emerald-500" />
              Media Terlampir
              <span class="text-xs font-normal text-gray-400 dark:text-gray-500"
                >({{ embeds.length }} item)</span
              >
            </h2>

            <div class="flex flex-col gap-6">
              <div
                v-for="embed in embeds"
                :key="embed.id"
                class="rounded-xl overflow-hidden border border-emerald-100 dark:border-emerald-900/60 bg-gray-50 dark:bg-gray-800/50"
              >
                <!-- Platform label bar -->
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
                    @click.stop
                  >
                    <UIcon name="i-lucide-external-link" class="w-3 h-3" />
                    Buka di tab baru
                  </a>
                </div>

                <!-- Iframe embed (jika platform mendukung) -->
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
                    :title="`${getPlatformLabel(embed.platform)}: ${meeting.title}`"
                  />
                </div>

                <!-- Fallback: platform tidak bisa di-iframe (Twitter/X) -->
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
                    <p
                      class="text-xs text-gray-500 dark:text-gray-400 truncate"
                    >
                      {{ embed.url }}
                    </p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Platform ini tidak mendukung embed langsung — buka di tab
                      baru untuk melihat.
                    </p>
                  </div>
                  <a
                    :href="embed.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
                    @click.stop
                  >
                    <UIcon name="i-lucide-external-link" class="w-3.5 h-3.5" />
                    Buka
                  </a>
                </div>

                <!-- Caption / deskripsi postingan (jika diisi) -->
                <div
                  v-if="embed.caption"
                  class="px-4 py-3 border-t border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-gray-900"
                >
                  <p
                    class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"
                  >
                    <UIcon name="i-lucide-quote" class="w-3 h-3" />
                    Deskripsi
                  </p>
                  <p
                    class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line"
                  >
                    {{ embed.caption }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
  .prose {
    line-height: 1.75;
  }
</style>
