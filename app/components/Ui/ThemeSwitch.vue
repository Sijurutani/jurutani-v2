<script setup lang="ts">
  const colorMode = useColorMode()

  const isDark = computed({
    get() {
      return colorMode.value === 'dark'
    },
    set() {
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    }
  })
</script>

<template>
  <ClientOnly>
    <button
      aria-label="Ganti tema warna"
      class="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/60 shadow-sm overflow-hidden text-emerald-700"
      @click="isDark = !isDark"
    >
      <UIcon
        name="i-lucide-sun"
        class="absolute text-xl transition-all duration-500 transform"
        :class="isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'"
      />
      <UIcon
        name="i-lucide-moon"
        class="absolute text-xl transition-all duration-500 transform"
        :class="isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'"
      />
    </button>

    <template #fallback>
      <div class="w-10 h-10" />
    </template>
  </ClientOnly>
</template>
