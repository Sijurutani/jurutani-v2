<script setup lang="ts">
  import { footerSocialMedia as socialMedia } from '@/data/menu'

  const playStoreUrl =
    'https://play.google.com/store/apps/details?id=com.jurutani.app'

  const sponsors = [
    {
      name: 'Kementerian Pertanian RI',
      src: '/logo/kementan.webp',
      url: 'https://www.pertanian.go.id/',
    },
    {
      name: 'Polbangtan Yogyakarta Magelang',
      src: '/logo/polbangtanyoma.webp',
      url: 'https://polbangtanyoma.ac.id/',
    },
    {
      name: 'BPPSDMP Kementan',
      src: '/logo/BPPSDMP.png',
      url: 'https://bppsdmp.pertanian.go.id/',
    },
  ]
</script>

<template>
  <div class="space-y-8">
    <!-- Download + Social Row -->
    <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-4">
        <span
          class="hidden sm:flex text-sm text-gray-500 dark:text-green-300/70 items-center gap-2"
        >
          <UIcon name="i-lucide-smartphone" class="w-5 h-5" />
          Download Aplikasi:
        </span>
        <NuxtLink
          :to="playStoreUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="ps-badge text-[#166534] dark:text-[#bbf7d0] bg-[#f0fdf4]/50 dark:bg-black/40 border-green-500/15 dark:border-green-500/15 hover:border-green-500/40 dark:hover:border-green-500/40 hover:shadow-[0_4px_12px_rgba(34,197,94,0.1)]"
        >
          <UIcon name="i-mdi-google-play" class="w-5 h-5" />
          <div class="text-left">
            <span class="text-[10px] leading-tight block opacity-60"
              >GET IT ON</span
            >
            <span class="text-sm font-semibold leading-tight block"
              >Google Play</span
            >
          </div>
        </NuxtLink>
      </div>

      <div class="flex items-center gap-3">
        <span
          class="hidden sm:inline-block text-sm text-gray-500 dark:text-green-300/70 mr-1"
          >Temukan Kami:</span
        >
        <NuxtLink
          v-for="social in socialMedia"
          :key="social.name"
          :to="social.url"
          :target="social.name !== 'Email' ? '_blank' : undefined"
          rel="noopener noreferrer"
          :aria-label="social.name"
          class="social-btn text-[#16a34a] dark:text-[#86efac] bg-[#f0fdf4]/60 dark:bg-black/30 border-green-500/12 dark:border-green-500/15 hover:text-[#15803d] dark:hover:text-[#4ade80] hover:border-green-500/35 dark:hover:border-green-400/20 dark:hover:bg-green-500/12 hover:shadow-[0_6px_16px_rgba(34,197,94,0.12)]"
        >
          <UIcon :name="social.icon" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </div>

    <div class="border-t border-green-200/20 dark:border-green-700/25" />

    <!-- Sponsors -->
    <div class="text-center">
      <p
        class="text-xs text-gray-400 dark:text-green-400/60 uppercase tracking-[0.2em] font-semibold mb-6"
      >
        Didukung Oleh
      </p>
      <div class="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
        <NuxtLink
          v-for="sponsor in sponsors"
          :key="sponsor.name"
          :to="sponsor.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="sponsor.name"
          class="sponsor-img"
        >
          <NuxtImg
            :src="sponsor.src"
            :alt="sponsor.name"
            class="h-12 sm:h-14 w-auto object-contain sponsor-img dark:brightness-150 dark:saturate-50"
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .ps-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.625rem;
    border: 1px solid rgba(34, 197, 94, 0.15);
    transition: all 0.25s ease;
  }
  .ps-badge:hover {
    transform: translateY(-1px);
  }

  .social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.625rem;
    border: 1px solid rgba(34, 197, 94, 0.12);
    transition: all 0.25s ease;
  }
  .social-btn:hover {
    transform: translateY(-2px) scale(1.06);
  }

  .sponsor-img {
    opacity: 0.65;
    transition: all 0.3s ease;
  }
  .sponsor-img:hover {
    opacity: 1;
    transform: scale(1.06);
  }
</style>
