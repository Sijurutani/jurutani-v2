<script setup lang="ts">
  const authStore = useAuthStore()

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 11) return 'Pagi'
    if (hour >= 11 && hour < 15) return 'Siang'
    if (hour >= 15 && hour < 19) return 'Sore'
    return 'Malam'
  }

  const greeting = ref(getGreeting())
  const playStoreUrl =
    'https://play.google.com/store/apps/details?id=com.jurutani.app'

  let greetingInterval: ReturnType<typeof setInterval> | null = null
  onMounted(() => {
    greetingInterval = setInterval(() => {
      greeting.value = getGreeting()
    }, 60000)
  })
  onBeforeUnmount(() => {
    if (greetingInterval) clearInterval(greetingInterval)
  })


  const handleImageError = (event: Event) => {
    const target = event?.target as HTMLImageElement | null
    if (target) target.src = '/placeholder/user.webp'
  }
</script>

<template>
  <div class="cta-card">
    <!-- Decorative ring overlays -->
    <div class="cta-deco-ring cta-deco-ring--1" />
    <div class="cta-deco-ring cta-deco-ring--2" />
    <div class="cta-dot-grid" />

    <div
      class="relative z-10 flex items-center justify-between gap-6 p-8 sm:p-10"
    >
      <!-- Left: Content -->
      <div class="flex-1 min-w-0">
        <!-- Authenticated -->
        <template v-if="authStore.isAuthenticated">
          <div class="flex items-center gap-4 mb-2">
            <div
              class="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-green-400/30 shrink-0 shadow-lg"
            >
              <NuxtImg
                :src="authStore.avatarUrl"
                :alt="authStore.displayName"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-green-300/70">
                Selamat {{ greeting }} 👋
              </p>
              <p class="text-xl sm:text-2xl font-bold text-white">
                {{ authStore.displayName }}
              </p>
            </div>
          </div>
          <p class="text-green-200/50 text-sm mt-2">
            Semangat bertani hari ini! Jelajahi fitur terbaru untuk
            produktivitas pertanian Anda.
          </p>
        </template>

        <!-- Guest -->
        <template v-else>
          <p class="cta-eyebrow">
            <span
              class="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-2 animate-pulse"
            />
            PLATFORM PENYULUHAN DIGITAL
          </p>
          <h2
            class="text-2xl sm:text-3xl font-extrabold text-white leading-tight mt-3"
          >
            Mulai Perjalanan<br />
            <span class="text-green-400">Tani-mu</span> Sekarang
          </h2>
          <p class="text-green-200/50 text-sm mt-3 max-w-md">
            Bergabung dengan ribuan petani digital Indonesia. Konsultasi pakar,
            harga pangan realtime, dan edukasi modern.
          </p>
          <div class="flex flex-wrap items-center gap-3 mt-5">
            <NuxtLink to="/auth/login" class="cta-btn cta-btn--primary">
              <UIcon name="i-lucide-log-in" class="w-4 h-4" />
              Masuk / Daftar
            </NuxtLink>
            <NuxtLink
              :to="playStoreUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="cta-btn cta-btn--ghost"
            >
              <UIcon name="i-mdi-google-play" class="w-4 h-4" />
              Play Store
            </NuxtLink>
          </div>
        </template>
      </div>

      <!-- Right: Globe -->
            <!-- Right: Globe -->
      <div class="cta-globe-area hidden sm:flex">
        <div class="globe">
          <div class="globe__sphere animate-globe-spin--normal">
            <div class="globe__grid animate-globe-spin--reverse" />
            <div class="globe__highlight" />
          </div>
          <div class="globe__orbit globe__orbit--1" />
          <div class="globe__orbit globe__orbit--2 animate-globe-orbit" />
          <div class="globe__orbit globe__orbit--3" />
          <div class="globe__dot globe__dot--1 animate-globe-dot" />
          <div
            class="globe__dot globe__dot--2 animate-globe-dot"
            style="animation-delay: 1s"
          />
          <div
            class="globe__dot globe__dot--3 animate-globe-dot"
            style="animation-delay: 2s"
          />
          <div class="globe__glow animate-globe-glow" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .cta-card {
    position: relative;
    overflow: hidden;
    border-radius: 1.5rem;
    background: linear-gradient(135deg, #14532d 0%, #052e16 60%, #022c22 100%);
    box-shadow:
      0 20px 60px -12px rgba(5, 46, 22, 0.5),
      0 0 0 1px rgba(134, 239, 172, 0.08);
  }

  /* Decorative rings inside the card */
  .cta-deco-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(134, 239, 172, 0.07);
    pointer-events: none;
  }
  .cta-deco-ring--1 {
    width: 320px;
    height: 320px;
    top: -100px;
    right: -40px;
  }
  .cta-deco-ring--2 {
    width: 200px;
    height: 200px;
    bottom: -60px;
    left: -40px;
  }

  .cta-dot-grid {
    position: absolute;
    inset: 0;
    opacity: 0.025;
    background-image: radial-gradient(
      circle at 1px 1px,
      rgba(134, 239, 172, 0.8) 1px,
      transparent 0
    );
    background-size: 24px 24px;
    pointer-events: none;
  }

  .cta-eyebrow {
    display: inline-flex;
    align-items: center;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #86efac;
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.4rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }
  .cta-btn--primary {
    background: #22c55e;
    color: #052e16;
  }
  .cta-btn--primary:hover {
    background: #4ade80;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.35);
  }
  .cta-btn--ghost {
    background: transparent;
    color: #bbf7d0;
    border: 1px solid rgba(134, 239, 172, 0.25);
  }
  .cta-btn--ghost:hover {
    border-color: rgba(134, 239, 172, 0.5);
    background: rgba(134, 239, 172, 0.06);
    transform: translateY(-1px);
  }

  /* ═══ Globe ═══ */
  .cta-globe-area {
    flex-shrink: 0;
    width: 220px;
    height: 220px;
    align-items: center;
    justify-content: center;
  }

  .globe {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .globe__sphere {
    width: 55%;
    height: 55%;
    border-radius: 50%;
    position: relative;
    background: radial-gradient(circle at 35% 35%, #166534, #052e16 75%);
    box-shadow:
      inset -15px -15px 30px rgba(0, 0, 0, 0.5),
      inset 8px 8px 20px rgba(134, 239, 172, 0.06),
      0 0 50px rgba(34, 197, 94, 0.12);
    overflow: hidden;
    will-change: transform;
  }

  .globe__grid {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background:
      repeating-conic-gradient(
        from 0deg,
        transparent 0deg 9deg,
        rgba(134, 239, 172, 0.035) 9deg 10deg
      ),
      repeating-linear-gradient(
        0deg,
        transparent 0 16px,
        rgba(134, 239, 172, 0.05) 16px 17px
      );
    will-change: transform;
  }

  .globe__highlight {
    position: absolute;
    width: 35%;
    height: 35%;
    top: 15%;
    left: 20%;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(134, 239, 172, 0.12) 0%,
      transparent 70%
    );
    filter: blur(6px);
  }

  .globe__orbit {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(134, 239, 172, 0.08);
  }
  .globe__orbit--1 {
    width: 75%;
    height: 75%;
  }
  .globe__orbit--2 {
    width: 90%;
    height: 90%;
    border-style: dashed;
    border-color: rgba(134, 239, 172, 0.05);
  }
  .globe__orbit--3 {
    width: 100%;
    height: 100%;
    border-color: rgba(134, 239, 172, 0.04);
  }

  .globe__dot {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
  }
  .globe__dot--1 {
    top: 18%;
    right: 12%;
  }
  .globe__dot--2 {
    bottom: 28%;
    left: 8%;
  }
  .globe__dot--3 {
    bottom: 12%;
    right: 22%;
  }

  .globe__glow {
    position: absolute;
    width: 115%;
    height: 115%;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(34, 197, 94, 0.06) 0%,
      transparent 55%
    );
    will-change: opacity;
  }
  @media (prefers-reduced-motion) {
    .globe__sphere,
    .globe__grid,
    .globe__orbit,
    .globe__dot,
    .globe__glow {
      animation: none;
    }
  }
</style>
