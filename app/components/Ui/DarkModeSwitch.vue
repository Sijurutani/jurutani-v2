<script setup lang="ts">
  // UiDarkModeSwitch — wrapper dari UiThemeSwitch
  // Nama ini digunakan di Navigation.vue, blank.vue, dan auth.vue
  const colorMode = useColorMode()

  const isDark = computed({
    get() {
      return colorMode.value === 'dark'
    },
    set() {
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    },
  })
</script>

<template>
  <ClientOnly>
    <button
      :aria-label="isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'"
      class="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 bg-white/40 hover:bg-white/60 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/60 dark:border-white/20 shadow-sm overflow-hidden text-emerald-700 dark:text-emerald-300 hover:scale-105 active:scale-95"
      @click="isDark = !isDark"
    >
      <UIcon
        name="i-lucide-sun"
        class="absolute text-lg transition-all duration-400 transform"
        :class="isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'"
      />
      <UIcon
        name="i-lucide-moon"
        class="absolute text-lg transition-all duration-400 transform"
        :class="isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'"
      />
    </button>

    <template #fallback>
      <div class="w-9 h-9 rounded-xl bg-white/20 animate-pulse" />
    </template>
  </ClientOnly>
</template>
