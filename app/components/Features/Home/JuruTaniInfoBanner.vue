<script setup lang="ts">
  const features = [
    {
      icon: 'i-lucide-book-open',
      title: 'Edukasi Pertanian',
      description: 'Akses ratusan materi penyuluhan, video tutorial, dan kursus online gratis dari para ahli pertanian Indonesia.',
    },
    {
      icon: 'i-lucide-users',
      title: 'Komunitas Petani',
      description: 'Terhubung dan berdiskusi dengan sesama petani, penyuluh, dan pakar dari seluruh penjuru Indonesia.',
    },
    {
      icon: 'i-lucide-shopping-bag',
      title: 'Marketplace',
      description: 'Jual dan beli hasil panen, bibit, pupuk, dan peralatan pertanian langsung dari tangan pertama.',
    },
    {
      icon: 'i-lucide-bot',
      title: 'AI Asisten Tani',
      description: 'Konsultasi 24 jam dengan AI yang memahami dunia pertanian — dari tanam, hama, hingga panen.',
    },
  ]
</script>

<template>
  <div class="px-4 lg:px-6">
    <!-- Section Badge -->
    <div class="section-badge mb-3">
      <span class="section-badge__dot" />
      <span class="section-badge__text">Platform Terpercaya</span>
      <span class="section-badge__sweep" aria-hidden="true" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <!-- Left: Image / Illustration -->
      <div class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 aspect-[4/3] border border-green-100 dark:border-green-800/30 shadow-xl shadow-green-500/5">
        <NuxtImg
          src="/jurutani/small-transparent.webp"
          alt="JuruTani Platform"
          class="w-full h-full object-contain p-8"
          loading="lazy"
        />
        <!-- Decorative circles -->
        <div class="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border-2 border-green-300/30 dark:border-green-600/30" />
        <div class="absolute top-4 left-4 w-20 h-20 rounded-full border border-green-300/20 dark:border-green-600/20" />
        <!-- Subtle glow -->
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-green-400/10 pointer-events-none" />
      </div>

      <!-- Right: Content -->
      <div class="flex flex-col gap-6">
        <div>
          <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-50 tracking-tight leading-tight mb-3">
            Satu Platform,<br />Semua Kebutuhan Pertanianmu
          </h2>
          <p class="text-sm md:text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
            JuruTani hadir sebagai mitra digital petani Indonesia — menggabungkan teknologi modern dengan kearifan lokal untuk pertanian yang lebih produktif dan sejahtera.
          </p>
        </div>

        <!-- Features grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="feat in features"
            :key="feat.title"
            class="flex gap-3 p-4 rounded-2xl bg-white dark:bg-green-950/30 border border-green-100/70 dark:border-green-800/30 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all duration-200 group"
          >
            <div class="flex-shrink-0 w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
              <UIcon :name="feat.icon" class="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-0.5">{{ feat.title }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ feat.description }}</p>
            </div>
          </div>
        </div>

        <div>
          <NuxtLink
            to="/about-us"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl no-underline transition-colors shadow-lg shadow-green-500/25"
          >
            Pelajari Selengkapnya
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Section Badge ── */
.section-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.85rem;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.25);
  border-radius: 9999px;
  overflow: hidden;
  backdrop-filter: blur(8px);
}
.section-badge__dot {
  display: block; width: 0.4rem; height: 0.4rem;
  border-radius: 50%; background: #4ade80; flex-shrink: 0;
  animation: badge-dot-pulse 2s ease-in-out infinite;
}
.section-badge__text {
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #16a34a;
}
:root.dark .section-badge__text { color: #4ade80; }
.section-badge__sweep {
  position: absolute; top: 0; left: 0; width: 55%; height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%);
  pointer-events: none;
  animation: badge-sweep 3.5s ease-in-out infinite;
}
@keyframes badge-dot-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@keyframes badge-sweep {
  0% { transform: translateX(-200%); opacity: 0; }
  10% { opacity: 1; } 90% { opacity: 1; }
  100% { transform: translateX(280%); opacity: 0; }
}
</style>
