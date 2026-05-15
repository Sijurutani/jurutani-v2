<script setup lang="ts">
  import { footerBottomLinks as footerLinks } from '@/data/menu'
  const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="pt-6 border-t border-green-200/20 dark:border-green-700/25">
    <div
      class="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-green-200/90"
    >
      <p>© {{ currentYear }} JuruTani. Semua Hak Dilindungi.</p>
      <div class="flex space-x-4 mt-3 md:mt-0">
        <NuxtLink
          v-for="link in footerLinks"
          :key="link.path"
          :to="link.path"
          class="hover:text-green-600 dark:hover:text-green-300 transition-colors"
        >
          {{ link.label }}
        </NuxtLink>
      </div>
    </div>
    <div
      class="mt-5 pt-4 border-t border-green-200/10 dark:border-green-700/20 text-center"
    >
      <p class="text-xs text-gray-400 dark:text-green-300/80">
        Powered by
        <NuxtLink
          to="https://polbangtanyoma.ac.id/"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium hover:text-green-600 dark:hover:text-green-300 transition-colors underline decoration-dotted"
        >
          Politeknik Pembangunan Pertanian Yogyakarta Magelang
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
