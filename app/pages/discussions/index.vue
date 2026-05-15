<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted } from 'vue'
  import {
    discussionServices,
    discussionStatsFallback,
  } from '~/data/discussion'
  import { useReveal } from '~/composables/useReveal'

  useSeoMeta({
    title: 'Forum Konsultasi Petani, Peternak & Nelayan',
    description: 'Forum diskusi gratis seputar masalah budidaya, penyakit tanaman & ternak. Tanya langsung kendala agribisnis Anda dengan penyuluh ahli JuruTani di sini.'
  })
  useReveal()

  const supabase = useSupabaseClient()

  // ─── State ─────────────────────────────────────────────────────────────
  const statsRef = ref<HTMLElement | null>(null)
  const statsVisible = ref(false)
  const services = ref(discussionServices)

  // Menggabungkan variabel yang berulang menjadi satu reactive object
  const displayCounts = reactive({
    profiles: 0,
    instructors: 0,
    experts: 0,
  })

  // ─── Data Fetching (Nuxt 3 Idiomatic) ──────────────────────────────────
  const { data: counts, pending: loading } = await useAsyncData(
    'discussion-stats',
    async () => {
      const [profiles, instructors, experts] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('instructors')
          .select('id', { count: 'exact', head: true }),
        supabase.from('experts').select('id', { count: 'exact', head: true }),
      ])

      if (profiles.error || instructors.error || experts.error) {
        throw profiles.error || instructors.error || experts.error
      }

      return {
        profiles: profiles.count || discussionStatsFallback.profiles,
        instructors: instructors.count || discussionStatsFallback.instructors,
        experts: experts.count || discussionStatsFallback.experts,
      }
    },
    {
      // Langsung set nilai fallback bawaan jika fetch gagal / sedang berjalan
      default: () => ({ ...discussionStatsFallback }),
    },
  )

  // ─── Animation Logic ───────────────────────────────────────────────────
  const animateCounter = (
    key: keyof typeof displayCounts,
    to: number,
    duration = 2000,
  ) => {
    let current = 0
    const increment = to / (duration / 16)

    const updateCounter = () => {
      current += increment
      if (current < to) {
        displayCounts[key] = Math.floor(current)
        requestAnimationFrame(updateCounter)
      } else {
        displayCounts[key] = to
      }
    }

    updateCounter()
  }

  const startAnimations = () => {
    // Trigger animasi menggunakan data aktual yang didapat dari `counts.value`
    setTimeout(() => animateCounter('profiles', counts.value.profiles), 100)
    setTimeout(
      () => animateCounter('instructors', counts.value.instructors),
      200,
    )
    setTimeout(() => animateCounter('experts', counts.value.experts), 300)
  }

  // ─── Intersection Observer (Native) ────────────────────────────────────
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsVisible.value) {
          statsVisible.value = true
          startAnimations()
          if (statsRef.value) observer?.unobserve(statsRef.value)
        }
      },
      { threshold: 0.5 }
    )

    if (statsRef.value) {
      observer.observe(statsRef.value)
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  // ─── UI Helpers ────────────────────────────────────────────────────────
  const getBentoVariant = (index: number) => {
    if (index === 0) return 'large'
    if (index === 3) return 'wide'
    return 'default'
  }
</script>

<template>
  <UContainer class="py-12">
    <div class="mx-auto mb-16 max-w-4xl text-center">
      <div
        class="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-linear-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full"
      >
        <UIcon
          name="i-lucide-sparkles"
          class="w-5 h-5 text-green-600 dark:text-green-400"
        />
        <span class="text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >Platform Diskusi Pertanian #1 Indonesia</span
        >
      </div>

      <h2
        class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-linear-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent"
      >
        Forum Diskusi JuruTani
      </h2>

      <p
        class="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto"
      >
        Temukan solusi pertanian terbaik melalui diskusi interaktif dengan
        <span class="font-semibold text-emerald-600 dark:text-emerald-400"
          >penyuluh berpengalaman</span
        >,
        <span class="font-semibold text-teal-600 dark:text-teal-400"
          >pakar pertanian</span
        >, dan
        <span class="font-semibold text-cyan-600 dark:text-cyan-400"
          >komunitas petani</span
        >
        seluruh Indonesia.
      </p>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto mb-16 auto-rows-auto"
    >
      <FeaturesDiscussionsServiceCard
        v-for="(service, index) in services"
        :key="service.id"
        :service="service"
        :variant="getBentoVariant(index)"
        :index="index"
      />
    </div>

    <div class="mx-auto max-w-6xl">
      <div
        class="rounded-3xl bg-linear-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-700 p-8"
      >
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-green-100 dark:bg-green-800 rounded-full"
          >
            <UIcon
              name="i-lucide-check-circle"
              class="w-4 h-4 text-green-600 dark:text-green-400"
            />
            <span class="text-sm font-medium text-green-700 dark:text-green-300"
              >Keunggulan Platform JuruTani</span
            >
          </div>

          <h3
            class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Mengapa Memilih JuruTani?
          </h3>

          <p class="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Platform terdepan untuk konsultasi pertanian yang menghubungkan
            petani dengan para ahli dan komunitas
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center group">
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            >
              <UIcon name="i-lucide-user-check" class="w-8 h-8 text-white" />
            </div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Terverifikasi & Terpercaya
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Semua penyuluh dan pakar telah melalui proses verifikasi ketat dan
              memiliki sertifikasi resmi
            </p>
          </div>

          <div class="text-center group">
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            >
              <UIcon name="i-lucide-clock" class="w-8 h-8 text-white" />
            </div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Respon Super Cepat
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Dapatkan jawaban dalam hitungan menit dari komunitas aktif dan tim
              support 24/7
            </p>
          </div>

          <div class="text-center group">
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-amber-400 to-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            >
              <UIcon name="i-lucide-star" class="w-8 h-8 text-white" />
            </div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
              100% Gratis
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Seluruh layanan konsultasi dan diskusi tersedia gratis untuk
              mendukung kemajuan pertanian Indonesia
            </p>
          </div>
        </div>

        <div
          ref="statsRef"
          class="mt-8 pt-8 border-t border-green-200 dark:border-green-700"
        >
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div class="stats-item">
              <div
                class="text-2xl font-bold text-green-600 dark:text-green-400 transition-all duration-300"
              >
                {{
                  displayCounts.profiles > 0
                    ? `${displayCounts.profiles}+`
                    : '500+'
                }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Petani Bergabung
              </div>
            </div>
            <div class="stats-item">
              <div
                class="text-2xl font-bold text-green-600 dark:text-green-400 transition-all duration-300"
              >
                {{
                  displayCounts.instructors > 0
                    ? `${displayCounts.instructors}+`
                    : '400+'
                }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Penyuluh Aktif
              </div>
            </div>
            <div class="stats-item">
              <div
                class="text-2xl font-bold text-green-600 dark:text-green-400 transition-all duration-300"
              >
                {{
                  displayCounts.experts > 0
                    ? `${displayCounts.experts}+`
                    : '200+'
                }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Pakar Ahli
              </div>
            </div>
            <div class="stats-item">
              <div
                class="text-2xl font-bold text-green-600 dark:text-green-400"
              >
                98%
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Tingkat Kepuasan
              </div>
            </div>
          </div>

          <div v-if="loading" class="text-center mt-4">
            <div
              class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
            >
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"
              />
              Memuat data terbaru...
            </div>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  * {
    font-family: 'Inter', sans-serif;
  }

  .bg-clip-text {
    -webkit-background-clip: text;
    background-clip: text;
    /* Fix: mencegah blur akibat konflik stacking context dengan backdrop-filter */
    isolation: isolate;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .stats-item .text-2xl {
    font-variant-numeric: tabular-nums;
  }

  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }
</style>
