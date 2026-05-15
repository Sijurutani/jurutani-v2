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
  <div class="max-w-6xl mx-auto px-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <!-- Left: Image / Illustration -->
      <div class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-900/40 aspect-[4/3]">
        <NuxtImg
          src="/jurutani/small-transparent.webp"
          alt="JuruTani Platform"
          class="w-full h-full object-contain p-8"
          loading="lazy"
        />
        <!-- Decorative circle -->
        <div class="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border-2 border-green-300/30 dark:border-green-600/30" />
        <div class="absolute top-4 left-4 w-20 h-20 rounded-full border border-green-300/20 dark:border-green-600/20" />
      </div>

      <!-- Right: Content -->
      <div class="flex flex-col gap-6">
        <div>
          <p class="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Platform Terpercaya</p>
          <h2 class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-4">
            Satu Platform, Semua<br />Kebutuhan Pertanianmu
          </h2>
          <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            JuruTani hadir sebagai mitra digital petani Indonesia — menggabungkan teknologi modern dengan kearifan lokal untuk pertanian yang lebih produktif dan sejahtera.
          </p>
        </div>

        <!-- Features list -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="feat in features"
            :key="feat.title"
            class="flex gap-3 p-4 rounded-2xl bg-white dark:bg-green-950/50 border border-green-100 dark:border-green-800/40"
          >
            <div class="flex-shrink-0 w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <UIcon :name="feat.icon" class="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-0.5">{{ feat.title }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ feat.description }}</p>
            </div>
          </div>
        </div>

        <div>
          <UButton
            to="/about-us"
            size="lg"
            color="primary"
            icon="i-lucide-arrow-right"
            trailing
          >
            Pelajari Selengkapnya
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
