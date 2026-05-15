<script setup lang="ts">
  import type { NuxtError } from '#app'

  const props = defineProps<{
    error: NuxtError
  }>()

  const is404 = computed(() => props.error.statusCode === 404)
  const is500 = computed(() => props.error.statusCode === 500)

  const handleClearError = () => clearError({ redirect: '/' })

  useSeoMeta({
    title: is404.value ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan',
  })
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-green-100 to-blue-50 dark:from-green-950 dark:via-green-900 dark:to-green-950 px-4"
  >
    <!-- Decorative blobs -->
    <div
      class="pointer-events-none fixed top-20 left-10 h-64 w-64 rounded-full bg-green-200 opacity-20 blur-3xl dark:bg-green-800"
    />
    <div
      class="pointer-events-none fixed right-10 bottom-20 h-80 w-80 rounded-full bg-blue-200 opacity-20 blur-3xl dark:bg-blue-800"
    />

    <div class="relative z-10 text-center max-w-md mx-auto">
      <!-- Logo -->
      <NuxtLink to="/" class="inline-flex mb-8">
        <NuxtImg
          src="/jurutani/small-transparent.webp"
          alt="Logo JuruTani"
          class="h-10 w-auto"
        />
      </NuxtLink>

      <!-- Error Code -->
      <div
        class="text-8xl font-black text-green-600 dark:text-green-400 leading-none mb-4 select-none"
      >
        {{ error.statusCode }}
      </div>

      <!-- Title -->
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        <template v-if="is404">
          Halaman Tidak Ditemukan 🌾
        </template>
        <template v-else-if="is500">
          Terjadi Kesalahan Server 🌧️
        </template>
        <template v-else>
          Oops! Ada yang Salah
        </template>
      </h1>

      <!-- Description -->
      <p class="text-gray-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">
        <template v-if="is404">
          Laman yang kamu cari tidak ditemukan. Mungkin sudah dipindahkan
          atau URL-nya salah ketik.
        </template>
        <template v-else>
          Sepertinya ada masalah sementara di sisi kami. Tim kami sedang
          bekerja untuk memperbaikinya.
        </template>
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <UButton
          size="lg"
          color="primary"
          icon="i-lucide-home"
          @click="handleClearError"
        >
          Kembali ke Beranda
        </UButton>
        <UButton
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-lucide-refresh-cw"
          @click="() => $router.go(0)"
        >
          Muat Ulang
        </UButton>
      </div>

      <!-- Debug info (dev only) -->
      <details
        v-if="$config.public.siteUrl?.includes('localhost') || error.statusMessage"
        class="mt-8 text-left"
      >
        <summary
          class="text-xs text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
        >
          Detail error
        </summary>
        <pre
          class="mt-2 text-xs bg-gray-100 dark:bg-gray-900 rounded-xl p-4 overflow-auto text-gray-700 dark:text-gray-300 max-h-40"
        >{{ error.message }}</pre>
      </details>
    </div>
  </div>
</template>
