<script setup lang="ts">


  const supabase = useSupabaseClient()
  const { getHeroData, getHomeStats } = useHomeData()

  const { data: heroData, pending: loading, error, refresh: fetchHeroData } = await getHeroData()
  const { data: counts } = await getHomeStats()

  // ── Image helpers ──────────────────────────────────────────────────────────
  const getRawImageUrl = (bucket: string, path: string): string => {
    try {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    } catch { return '' }
  }

  const getImageUrl = (imageUrl: string | null): string | null => {
    if (!imageUrl) return null
    if (imageUrl.startsWith('http')) return imageUrl
    return getRawImageUrl('hero-image', imageUrl) || null
  }

  const carouselItems = computed(() => heroData.value || [])
  const itemsCount = computed(() => carouselItems.value.length)

  // ── Carousel (Auto Swipe via VueUse useIntervalFn) ────────────────────────
  const currentSlide = ref(0)
  const isTransitioning = ref(false)

  const nextSlide = () => {
    if (isTransitioning.value || itemsCount.value === 0) return
    isTransitioning.value = true
    currentSlide.value = (currentSlide.value + 1) % itemsCount.value
    setTimeout(() => { isTransitioning.value = false }, 600)
  }

  const prevSlide = () => {
    if (isTransitioning.value || itemsCount.value === 0) return
    isTransitioning.value = true
    currentSlide.value = (currentSlide.value - 1 + itemsCount.value) % itemsCount.value
    setTimeout(() => { isTransitioning.value = false }, 600)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning.value || index === currentSlide.value) return
    isTransitioning.value = true
    currentSlide.value = index
    resetAutoplay()
    setTimeout(() => { isTransitioning.value = false }, 600)
  }

  let intervalId: ReturnType<typeof setInterval> | null = null

  const pause = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const resume = () => {
    pause()
    if (typeof window !== 'undefined') {
      intervalId = setInterval(nextSlide, 5000)
    }
  }

  const resetAutoplay = () => {
    pause()
    if (itemsCount.value > 1) resume()
  }

  watch(itemsCount, (val) => { 
    if (val > 1) resetAutoplay() 
    else pause() 
  })

  let observer: IntersectionObserver | null = null

  const stopStatsObserver = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(() => { 
    if (itemsCount.value > 1) resetAutoplay() 
    
    if (statsRef.value && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([{ isIntersecting }]) => {
          if (isIntersecting) {
            startStats()
            stopStatsObserver()
          }
        },
        { threshold: 0.3 }
      )
      observer.observe(statsRef.value)
    } else {
      startStats()
    }
  })
  
  onBeforeUnmount(() => {
    pause()
    stopStatsObserver()
  })

  // ── Stats counter animation ────────────────────────────────────────────────
  const displayCounts = reactive({ profiles: 0, instructors: 0, experts: 0 })
  const statsAnimated = ref(false)
  const statsRef = ref<HTMLElement | null>(null)

  const animateCounter = (key: keyof typeof displayCounts, to: number, dur = 1800) => {
    let cur = 0
    const inc = to / (dur / 16)
    const tick = () => {
      cur += inc
      if (cur < to) { displayCounts[key] = Math.floor(cur); requestAnimationFrame(tick) }
      else { displayCounts[key] = to }
    }
    tick()
  }

  const startStats = () => {
    if (statsAnimated.value || !counts.value) return
    statsAnimated.value = true
    setTimeout(() => animateCounter('profiles', counts.value!.profiles), 100)
    setTimeout(() => animateCounter('instructors', counts.value!.instructors), 200)
    setTimeout(() => animateCounter('experts', counts.value!.experts), 300)
  }



  // ── Quick menus ────────────────────────────────────────────────────────────
  const quickMenus = [
    { label: 'Penyuluhan', icon: 'i-lucide-book-open', to: '/discussions' },
    { label: 'Pakar', icon: 'i-lucide-lightbulb', to: '/discussions/expert' },
    { label: 'Penyuluh', icon: 'i-lucide-users', to: '/discussions/instructor' },
    { label: 'Harga Pasar', icon: 'i-lucide-trending-up', to: '/markets' },
    { label: 'Cuaca', icon: 'i-lucide-cloud-sun', to: '/weathers' },
    { label: 'Berita', icon: 'i-lucide-newspaper', to: '/update' },
  ]
</script>

<template>
  <section class="hero-section">
    <!-- ══ Carousel Background ══════════════════════════════════════════ -->
    <div class="hero-bg">
      <div v-if="loading" class="hero-bg__skeleton" />
      <div v-else-if="error" class="hero-bg__fallback" />
      <TransitionGroup v-else name="hero-fade" tag="div" class="hero-bg__slides">
        <div
          v-for="(item, index) in carouselItems"
          v-show="index === currentSlide"
          :key="item.id"
          class="hero-bg__slide"
        >
          <NuxtImg
            v-if="getImageUrl(item.image_url)"
            :src="getImageUrl(item.image_url)!"
            alt=""
            class="hero-bg__img"
            :preload="index === 0"
            :loading="index === 0 ? undefined : 'lazy'"
            @error="(e: any) => {
              const img = e.target as HTMLImageElement
              const raw = getRawImageUrl('hero-image', item.image_url || '')
              if (raw && img.src !== raw) img.src = raw
              else img.style.display = 'none'
            }"
          />
          <div
            v-else
            class="hero-bg__gradient"
            :style="{ background: ['linear-gradient(135deg,#052e16,#064e3b)', 'linear-gradient(135deg,#064e3b,#14532d)', 'linear-gradient(135deg,#14532d,#0f4c35)'][index % 3] }"
          />
        </div>
      </TransitionGroup>

      <!-- Gradient scrim — from dark bottom to transparent top -->
      <div class="hero-bg__scrim" />
    </div>

    <!-- ══ Foreground Content ═══════════════════════════════════════════ -->
    <div class="hero-content">
      <!-- LEFT: Text, Stats, Quick Access -->
      <div class="hero-left">
        <!-- Badge -->
        <div class="hero-badge">
          <span class="hero-badge__dot" />
          <span class="hero-badge__text">Platform Penyuluhan Digital</span>
          <span class="hero-badge__sweep" aria-hidden="true" />
        </div>

        <!-- Heading -->
        <h1 class="hero-heading">
          Pertanian modern
          <span class="hero-heading__accent">untuk Indonesia</span>
        </h1>

        <!-- Description -->
        <p class="hero-desc">
          JuruTani hadir sebagai solusi penyuluhan pertanian digital yang menghubungkan petani dengan penyuluh, pakar, dan pelaku usaha.
        </p>

        <!-- Stats -->
        <div ref="statsRef" class="hero-stats">
          <div class="stat-card">
            <span class="stat-value">{{ displayCounts.profiles > 0 ? `${displayCounts.profiles}+` : '500+' }}</span>
            <span class="stat-label">Petani</span>
          </div>
          <div class="stat-sep" />
          <div class="stat-card">
            <span class="stat-value">{{ displayCounts.instructors > 0 ? `${displayCounts.instructors}+` : '400+' }}</span>
            <span class="stat-label">Penyuluh</span>
          </div>
          <div class="stat-sep" />
          <div class="stat-card">
            <span class="stat-value">{{ displayCounts.experts > 0 ? `${displayCounts.experts}+` : '200+' }}</span>
            <span class="stat-label">Pakar</span>
          </div>
          <div class="stat-sep" />
          <div class="stat-card">
            <span class="stat-value">98%</span>
            <span class="stat-label">Kepuasan</span>
          </div>
        </div>

        <!-- Quick Access -->
        <div class="quick-access">
          <div class="quick-access__header">
            <span class="quick-access__label">Akses Cepat</span>
          </div>
          <div class="quick-access__grid">
            <NuxtLink
              v-for="menu in quickMenus"
              :key="menu.label"
              :to="menu.to"
              class="quick-card"
            >
              <div class="quick-card__icon">
                <UIcon :name="menu.icon" class="w-4 h-4" />
              </div>
              <span class="quick-card__label">{{ menu.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- RIGHT: Carousel image & slide content (visible on desktop) -->
      <div class="hero-right">
        <!-- Error / Empty -->
        <div v-if="!loading && (error || carouselItems.length === 0)" class="carousel-placeholder">
          <div v-if="error" class="flex flex-col items-center gap-3">
            <UIcon name="i-lucide-triangle-alert" class="w-10 h-10 text-red-400" />
            <UButton color="error" size="sm" @click="() => fetchHeroData()">Coba Lagi</UButton>
          </div>
          <div v-else class="flex flex-col items-center gap-2">
            <UIcon name="i-lucide-image" class="w-10 h-10 text-white/30" />
            <p class="text-white/50 text-sm">Konten hero belum tersedia.</p>
          </div>
        </div>

        <!-- Slide caption (desktop) -->
        <template v-if="!loading && carouselItems.length > 0">
          <div class="slide-info">
            <p class="slide-caption">{{ carouselItems[currentSlide]?.caption }}</p>
            <h2 class="slide-title">{{ carouselItems[currentSlide]?.title }}</h2>
            <p class="slide-desc">{{ carouselItems[currentSlide]?.description }}</p>
          </div>

          <UButton
            v-if="carouselItems[currentSlide]?.button_text"
            as="NuxtLink"
            :to="carouselItems[currentSlide]?.button_link"
            color="success"
            size="sm"
            trailing-icon="i-lucide-arrow-right"
            class="slide-cta"
          >
            {{ carouselItems[currentSlide]?.button_text }}
          </UButton>

          <!-- Controls -->
          <div class="carousel-controls">
            <div class="carousel-dots">
              <button
                v-for="(_, i) in carouselItems"
                :key="i"
                class="carousel-dot"
                :class="{ 'carousel-dot--active': i === currentSlide }"
                :aria-label="`Ke slide ${i + 1}`"
                @click="goToSlide(i)"
              />
            </div>
            <div class="carousel-arrows">
              <button class="carousel-arrow" aria-label="Slide sebelumnya" @click="prevSlide">
                <UIcon name="i-lucide-chevron-left" class="w-4 h-4" />
              </button>
              <span class="carousel-counter">
                {{ String(currentSlide + 1).padStart(2, '0') }}/{{ String(carouselItems.length).padStart(2, '0') }}
              </span>
              <button class="carousel-arrow" aria-label="Slide berikutnya" @click="nextSlide">
                <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ══════ SECTION ══════════════════════════════════════════════════════════ */
.hero-section {
  position: relative;
  width: 100%;
  min-height: 88vh;
  border-radius: 1.25rem;
  overflow: hidden;
  isolation: isolate;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .hero-section {
    min-height: 92vh;
    border-radius: 1.75rem;
    margin-top: 1rem;
  }
}

/* ══════ BACKGROUND ════════════════════════════════════════════════════════ */
.hero-bg,
.hero-bg__slides,
.hero-bg__slide {
  position: absolute;
  inset: 0;
}

.hero-bg__skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #052e16 0%, #064e3b 50%, #052e16 100%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.hero-bg__fallback {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #052e16, #064e3b);
}

.hero-bg__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Subtle scale-in: gambar aktif membesar pelan selama 10 detik */
  animation: hero-ken-burns 10s ease-out forwards;
}

@keyframes hero-ken-burns {
  from { transform: scale(1); }
  to   { transform: scale(1.06); }
}

.hero-bg__gradient {
  position: absolute;
  inset: 0;
}

/* Multi-layer scrim: bottom dark untuk readability, kiri lebih gelap di desktop */
.hero-bg__scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 55%, transparent 100%),
    linear-gradient(to right, rgba(0,0,0,0.65) 0%, transparent 60%);
  z-index: 1;
}

/* ══════ CONTENT ═══════════════════════════════════════════════════════════ */
.hero-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2rem 1.5rem;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .hero-content {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    padding: 5rem 6rem;
    gap: 5rem;
  }
}

/* ── LEFT ── */
.hero-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 44rem;
}

@media (min-width: 1024px) {
  .hero-left {
    gap: 2.25rem;
  }
}

/* Badge */
.hero-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.875rem;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 9999px;
  width: fit-content;
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.hero-badge__dot {
  display: block;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero-badge__text {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92);
}

.hero-badge__sweep {
  position: absolute;
  top: 0; left: 0;
  width: 55%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.45) 50%,
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

/* Heading */
.hero-heading {
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.15;
  color: #ffffff;
  letter-spacing: -0.025em;
}

@media (min-width: 768px) {
  .hero-heading { font-size: 3.25rem; }
}

@media (min-width: 1024px) {
  .hero-heading { font-size: 4rem; }
}

@media (min-width: 1280px) {
  .hero-heading { font-size: 4.75rem; }
}

.hero-heading__accent {
  display: block;
  background: linear-gradient(135deg, #4ade80, #34d399, #6ee7b7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  isolation: isolate;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Description */
.hero-desc {
  font-size: 0.9375rem;
  color: rgba(209, 213, 219, 0.9);
  line-height: 1.7;
  max-width: 34rem;
}

@media (min-width: 1024px) {
  .hero-desc {
    font-size: 1.0625rem;
    max-width: 38rem;
  }
}

/* ── Stats ── */
.hero-stats {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex-wrap: wrap;
}

@media (min-width: 1024px) {
  .hero-stats {
    gap: 1.5rem;
  }
  .stat-value {
    font-size: 1.625rem;
  }
  .stat-sep {
    height: 2.5rem;
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #4ade80;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.stat-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: rgba(209, 213, 219, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-sep {
  width: 1px;
  height: 2rem;
  background: linear-gradient(to bottom, transparent, rgba(134, 239, 172, 0.4), transparent);
  flex-shrink: 0;
}

/* ── Quick Access ── */
.quick-access {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.quick-access__header {
  display: flex;
  align-items: center;
}

.quick-access__label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(209, 213, 219, 0.65);
}

.quick-access__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quick-card {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 9999px;
  text-decoration: none;
  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.2s;
  backdrop-filter: blur(8px);
}

.quick-card:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(134, 239, 172, 0.45);
  transform: translateY(-2px);
}

.quick-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  flex-shrink: 0;
}

.quick-card__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
}

/* ── RIGHT (desktop carousel info) ── */
.hero-right {
  display: none;
  flex-direction: column;
  align-items: flex-end;
  gap: 1.25rem;
  min-width: 18rem;
  max-width: 26rem;
}

@media (min-width: 1024px) {
  .hero-right { display: flex; }
}

.carousel-placeholder {
  width: 100%;
  min-height: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-info {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slide-caption {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6ee7b7;
}

.slide-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}

.slide-desc {
  font-size: 0.8125rem;
  color: rgba(209, 213, 219, 0.85);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.slide-cta {
  align-self: flex-end;
}

/* ── Carousel controls ── */
.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.carousel-dots {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.carousel-dot {
  height: 0.375rem;
  border-radius: 9999px;
  width: 0.5rem;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 0;
}

.carousel-dot--active {
  width: 1.75rem;
  background: #4ade80;
}

.carousel-dot:not(.carousel-dot--active):hover {
  background: rgba(255, 255, 255, 0.55);
}

.carousel-arrows {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.carousel-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}

.carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(134, 239, 172, 0.5);
  transform: scale(1.08);
}

.carousel-arrow:active {
  transform: scale(0.94);
}

.carousel-counter {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(209, 213, 219, 0.8);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.03em;
  user-select: none;
}

/* ══════ TRANSITIONS ══════ */
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 0.6s ease;
  position: absolute;
  inset: 0;
}

.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}
</style>
