<script setup lang="ts">
  import { ref } from 'vue'

  useSeoMeta({
    title: 'Tools & Kalkulator Pertanian Online Gratis',
    description:
      'Kalkulator agribisnis online gratis untuk petani & peternak. Hitung praktis kebutuhan pupuk, pakan ternak, jadwal tanam, serta analisis biaya usaha tani.'
  })

  const activeTab = ref('benih')

  const tools = [
    {
      id: 'benih',
      title: 'Kalkulator Benih',
      label: 'Benih',
      description:
        'Hitung kebutuhan benih optimal berdasarkan luas lahan dan jarak tanam',
      icon: 'i-lucide-sprout',
      gradient: 'from-emerald-500 to-teal-500',
      accentColor: 'emerald'
    },
    {
      id: 'pupuk',
      title: 'Kalkulator Pupuk',
      label: 'Pupuk',
      description: 'Tentukan dosis pupuk yang tepat untuk hasil panen maksimal',
      icon: 'i-lucide-flask-conical',
      gradient: 'from-teal-500 to-cyan-600',
      accentColor: 'teal'
    }
  ]

  const stats = [
    {
      icon: 'i-lucide-zap',
      value: '< 1 detik',
      label: 'Hasil Kalkulasi',
      sub: 'Instan & akurat',
      color: 'amber'
    },
    {
      icon: 'i-lucide-book-open',
      value: 'SNI',
      label: 'Standar Acuan',
      sub: 'Agronomi Indonesia',
      color: 'blue'
    },
    {
      icon: 'i-lucide-shield-check',
      value: '100%',
      label: 'Gratis',
      sub: 'Tanpa registrasi',
      color: 'emerald'
    },
    {
      icon: 'i-lucide-trending-up',
      value: '2+',
      label: 'Jenis Kalkulator',
      sub: 'Terus bertambah',
      color: 'purple'
    }
  ]

  const changeTab = (tabId: string) => {
    activeTab.value = tabId
  }

  const activeTool = computed(
    () => tools.find((t) => t.id === activeTab.value) || tools[0]
  )
</script>

<template>
  <div class="tools-page">
    <UContainer class="pt-24 pb-16 relative z-10">
      <!-- ── Hero ──────────────────────────────────────────────────── -->
      <div class="tools-hero">
        <div class="tools-hero__badge">
          <span class="tools-hero__badge-dot" />
          <span>Tools Pertanian</span>
          <span class="tools-hero__badge-sweep" aria-hidden="true" />
        </div>

        <h1 class="tools-hero__title">
          Hitung Cerdas,<br />
          <span class="tools-hero__title--accent">Tani Produktif</span>
        </h1>

        <p class="tools-hero__desc">
          Kalkulator pertanian berbasis standar agronomi Indonesia — bantu Anda
          merencanakan lahan, mengoptimalkan biaya input, dan meningkatkan hasil
          panen.
        </p>
      </div>

      <!-- ── Tab Switcher ───────────────────────────────────────────── -->
      <div class="tools-tabs" role="tablist" aria-label="Pilih kalkulator">
        <button
          v-for="tool in tools"
          :key="tool.id"
          class="tools-tab"
          :class="{ 'tools-tab--active': activeTab === tool.id }"
          role="tab"
          :aria-selected="activeTab === tool.id"
          :id="`tab-${tool.id}`"
          :aria-controls="`panel-${tool.id}`"
          @click="changeTab(tool.id)"
        >
          <!-- icon pill -->
          <span class="tools-tab__icon" :class="[`tools-tab__icon--${tool.accentColor}`, activeTab === tool.id && 'tools-tab__icon--on']">
            <UIcon :name="tool.icon" class="w-5 h-5" />
          </span>

          <span class="tools-tab__body">
            <span class="tools-tab__title">{{ tool.title }}</span>
            <span class="tools-tab__desc">{{ tool.description }}</span>
          </span>

          <!-- active check -->
          <Transition name="tab-check">
            <span v-if="activeTab === tool.id" class="tools-tab__check">
              <UIcon name="i-lucide-check" class="w-3.5 h-3.5 text-white" />
            </span>
          </Transition>

          <!-- active underline -->
          <span class="tools-tab__line" :class="`tools-tab__line--${tool.accentColor}`" />
        </button>
      </div>

      <!-- ── Calculator Panel ──────────────────────────────────────── -->
      <div
        :id="`panel-${activeTab}`"
        role="tabpanel"
        :aria-labelledby="`tab-${activeTab}`"
        class="tools-panel"
      >
        <Transition name="calc-fade" mode="out-in">
          <FeaturesKalkulatorBenih v-if="activeTab === 'benih'" key="benih" />
          <FeaturesKalkulatorPupuk v-else-if="activeTab === 'pupuk'" key="pupuk" />
        </Transition>
      </div>

      <!-- ── Stat Cards ─────────────────────────────────────────────── -->
      <div class="tools-stats">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="tools-stat"
          :style="{ animationDelay: `${i * 80}ms` }"
        >
          <div class="tools-stat__icon" :class="`tools-stat__icon--${stat.color}`">
            <UIcon :name="stat.icon" class="w-5 h-5" />
          </div>
          <p class="tools-stat__value">{{ stat.value }}</p>
          <p class="tools-stat__label">{{ stat.label }}</p>
          <p class="tools-stat__sub">{{ stat.sub }}</p>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<style scoped>
  @reference "tailwindcss";

  /* ── Page shell ──────────────────────────────────────────────────── */
  .tools-page {
    @apply relative;
  }

  /* ── Hero ────────────────────────────────────────────────────────── */
  .tools-hero {
    @apply text-center mb-12 max-w-3xl mx-auto;
  }

  /* Glass sweep badge — sama persis seperti hero-badge di HeroSection */
  .tools-hero__badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.35rem 0.875rem;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.7);
    border-radius: 9999px;
    width: fit-content;
    overflow: hidden;
    backdrop-filter: blur(8px);
    @apply mb-6 text-xs font-bold tracking-widest uppercase;
    color: theme('colors.emerald.700');
    box-shadow: 0 2px 12px rgba(16, 185, 129, 0.1);
  }

  .dark .tools-hero__badge {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.18);
    color: theme('colors.emerald.300');
    box-shadow: 0 2px 12px rgba(52, 211, 153, 0.15);
  }

  .tools-hero__badge-dot {
    display: block;
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: theme('colors.emerald.500');
    flex-shrink: 0;
    animation: dot-pulse 2s ease-in-out infinite;
  }

  @keyframes dot-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }

  .tools-hero__badge-sweep {
    position: absolute;
    top: 0;
    left: 0;
    width: 55%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.55) 50%,
      transparent 100%
    );
    border-radius: inherit;
    pointer-events: none;
    animation: badge-sweep 3.5s ease-in-out infinite;
  }

  @keyframes badge-sweep {
    0%   { transform: translateX(-200%); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateX(280%); opacity: 0; }
  }

  .tools-hero__title {
    @apply text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-5;
    color: theme('colors.gray.900');
    letter-spacing: -0.03em;
  }

  .dark .tools-hero__title {
    color: theme('colors.gray.50');
  }

  .tools-hero__title--accent {
    background: linear-gradient(135deg, theme('colors.emerald.500'), theme('colors.teal.400'), theme('colors.cyan.500'));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tools-hero__desc {
    @apply text-base md:text-lg leading-relaxed max-w-2xl mx-auto;
    color: theme('colors.gray.500');
  }

  .dark .tools-hero__desc {
    color: theme('colors.gray.400');
  }

  /* ── Tab Switcher ────────────────────────────────────────────────── */
  .tools-tabs {
    @apply grid grid-cols-2 gap-4 mb-8;
  }

  .tools-tab {
    @apply relative flex items-start gap-4 p-5 rounded-2xl text-left cursor-pointer overflow-hidden border border-green-100 bg-white transition-all duration-300;
  }

  .dark .tools-tab {
    @apply bg-gray-900/60 border-gray-700;
  }

  .tools-tab:hover {
    @apply shadow-lg border-emerald-300;
    transform: translateY(-2px);
  }

  .dark .tools-tab:hover {
    @apply bg-gray-800/80 border-emerald-500/50;
  }

  .tools-tab--active {
    @apply shadow-xl;
    border-color: theme('colors.emerald.400') !important;
    background: linear-gradient(135deg, color-mix(in srgb, theme('colors.emerald.500') 8%, white), color-mix(in srgb, theme('colors.teal.500') 6%, white)) !important;
    transform: translateY(-2px);
  }

  .dark .tools-tab--active {
    background: linear-gradient(135deg, rgba(52,211,153,0.1), rgba(20,184,166,0.08)) !important;
    border-color: rgba(52,211,153,0.5) !important;
    box-shadow: 0 8px 32px -8px rgba(52,211,153,0.2), 0 0 0 1px rgba(52,211,153,0.15) inset !important;
  }

  /* icon pill */
  .tools-tab__icon {
    @apply shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300;
    background: theme('colors.gray.100');
    color: theme('colors.gray.500');
  }

  .dark .tools-tab__icon {
    background: rgba(255,255,255,0.07);
    color: theme('colors.gray.400');
  }

  .tools-tab__icon--on,
  .tools-tab--active .tools-tab__icon {
    background: linear-gradient(135deg, theme('colors.emerald.500'), theme('colors.teal.500')) !important;
    color: white !important;
    box-shadow: 0 4px 16px -4px theme('colors.emerald.500');
  }

  /* text */
  .tools-tab__body {
    @apply flex flex-col gap-1 flex-1 min-w-0 pt-0.5;
  }

  .tools-tab__title {
    @apply text-sm sm:text-base font-bold leading-tight;
    color: theme('colors.gray.900');
    transition: color 0.2s;
  }

  .dark .tools-tab__title {
    color: theme('colors.gray.100');
  }

  .tools-tab--active .tools-tab__title {
    color: theme('colors.emerald.700');
  }

  .dark .tools-tab--active .tools-tab__title {
    color: theme('colors.emerald.300');
  }

  .tools-tab__desc {
    @apply text-xs leading-relaxed;
    color: theme('colors.gray.500');
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* check badge */
  .tools-tab__check {
    @apply shrink-0 w-6 h-6 rounded-full flex items-center justify-center;
    background: linear-gradient(135deg, theme('colors.emerald.500'), theme('colors.teal.500'));
    box-shadow: 0 2px 8px rgba(16,185,129,0.4);
  }

  /* active bottom line */
  .tools-tab__line {
    @apply absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full;
    background: linear-gradient(90deg, theme('colors.emerald.500'), theme('colors.teal.400'));
    opacity: 0;
    transition: opacity 0.3s;
    transform-origin: left;
  }

  .tools-tab--active .tools-tab__line {
    opacity: 1;
  }

  /* check enter/leave animation */
  .tab-check-enter-active,
  .tab-check-leave-active {
    transition: all 0.2s ease;
  }

  .tab-check-enter-from,
  .tab-check-leave-to {
    opacity: 0;
    transform: scale(0.5);
  }

  /* ── Calculator Panel ────────────────────────────────────────────── */
  .tools-panel {
    @apply mb-12;
  }

  /* Smooth fade — leave cepat, enter tenang */
  .calc-fade-leave-active {
    transition: opacity 0.15s ease;
  }

  .calc-fade-enter-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
  }

  .calc-fade-enter-from {
    opacity: 0;
    transform: scale(0.99);
  }

  .calc-fade-leave-to {
    opacity: 0;
  }

  /* ── Stat Cards — glassmorphism blur ────────────────────────────── */
  .tools-stats {
    @apply grid grid-cols-2 md:grid-cols-4 gap-4;
  }

  .tools-stat {
    @apply relative flex flex-col items-center text-center p-5 rounded-2xl overflow-hidden transition-all duration-300 border border-green-100 bg-white shadow-sm;
    animation: stat-rise 0.5s ease both;
  }

  .dark .tools-stat {
    @apply bg-gray-900/60 border-gray-700 shadow-md;
  }

  .tools-stat:hover {
    transform: translateY(-3px);
    @apply shadow-lg border-emerald-300 bg-white;
  }

  .dark .tools-stat:hover {
    @apply bg-gray-800/80 border-gray-600 shadow-lg;
  }

  @keyframes stat-rise {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .tools-stat__icon {
    @apply w-10 h-10 rounded-xl flex items-center justify-center mb-3;
  }

  .tools-stat__icon--emerald {
    background: color-mix(in srgb, theme('colors.emerald.500') 15%, transparent);
    color: theme('colors.emerald.600');
  }

  .dark .tools-stat__icon--emerald {
    background: color-mix(in srgb, theme('colors.emerald.400') 15%, transparent);
    color: theme('colors.emerald.400');
  }

  .tools-stat__icon--amber {
    background: color-mix(in srgb, theme('colors.amber.500') 15%, transparent);
    color: theme('colors.amber.600');
  }

  .dark .tools-stat__icon--amber {
    background: color-mix(in srgb, theme('colors.amber.400') 15%, transparent);
    color: theme('colors.amber.400');
  }

  .tools-stat__icon--blue {
    background: color-mix(in srgb, theme('colors.blue.500') 15%, transparent);
    color: theme('colors.blue.600');
  }

  .dark .tools-stat__icon--blue {
    background: color-mix(in srgb, theme('colors.blue.400') 15%, transparent);
    color: theme('colors.blue.400');
  }

  .tools-stat__icon--purple {
    background: color-mix(in srgb, theme('colors.purple.500') 15%, transparent);
    color: theme('colors.purple.600');
  }

  .dark .tools-stat__icon--purple {
    background: color-mix(in srgb, theme('colors.purple.400') 15%, transparent);
    color: theme('colors.purple.400');
  }

  .tools-stat__value {
    @apply text-2xl font-black mb-0.5;
    color: theme('colors.gray.900');
    letter-spacing: -0.02em;
  }

  .dark .tools-stat__value {
    color: theme('colors.gray.50');
  }

  .tools-stat__label {
    @apply text-sm font-semibold mb-0.5;
    color: theme('colors.gray.700');
  }

  .dark .tools-stat__label {
    color: theme('colors.gray.300');
  }

  .tools-stat__sub {
    @apply text-xs;
    color: theme('colors.gray.400');
  }
</style>
