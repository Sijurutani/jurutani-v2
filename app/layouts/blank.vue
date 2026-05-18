<script setup lang="ts">

  const router = useRouter()
  
  const isScrolled = ref(false)

  const handleScroll = () => {
    isScrolled.value = window.scrollY > 20
  }

  onMounted(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  // Initialize the new reveal-on-scroll composable
  useReveal()

  const handleBack = () => {
    if (!import.meta.client) return
    // Jika ada history sebelumnya di router (tidak buka tab baru/refresh langsung di halaman ini)
    if (window.history.state && window.history.state.back) {
      router.back()
    } else {
      // Fallback jika tidak ada riwayat
      router.push('/')
    }
  }
</script>

<template>
  <div class="relative font-sans text-green-900 dark:text-green-100">
    <div class="fixed inset-0 z-0 bg-linear-to-b from-green-50 via-green-100 to-blue-50 dark:from-green-950 dark:via-green-800 dark:to-green-950 pointer-events-none" />
    <div class="ambient-orb animate-orb-drift pointer-events-none fixed top-20 left-10 h-72 w-72 rounded-full bg-green-200 opacity-20 blur-3xl dark:bg-green-800" />
    <div class="ambient-orb ambient-orb--slow animate-orb-drift pointer-events-none fixed right-10 bottom-20 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl dark:bg-blue-800" />
    <div class="ambient-orb ambient-orb--reverse animate-orb-drift pointer-events-none fixed top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-green-100 opacity-10 blur-2xl dark:bg-green-700" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- ═══════════════════════ FLOATING NAVBAR ═══════════════════════ -->
      <div
      class="fixed top-0 left-0 right-0 z-60 flex items-center justify-center"
      style="isolation: isolate"
      :class="isScrolled ? 'pt-3' : 'pt-4'"
    >
      <nav
        class="transition-all duration-500 ease-out rounded-full px-4 py-2 flex items-center gap-3"
        :class="[
          isScrolled
            ? 'bg-white/85 dark:bg-emerald-950/85 border border-emerald-200/50 dark:border-emerald-700/40 shadow-lg shadow-emerald-900/10 backdrop-blur-xl'
            : 'bg-white/70 dark:bg-emerald-950/70 border border-emerald-200/30 dark:border-emerald-700/30 shadow-md shadow-emerald-900/5 backdrop-blur-md',
        ]"
        role="navigation"
        aria-label="Page navigation"
      >
        <!-- Back Button -->
        <UButton
          color="neutral"
          variant="ghost"
          class="group flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-800/40 focus-visible:ring-2 focus-visible:ring-emerald-400 dark:focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-emerald-950"
          aria-label="Kembali"
          @click="handleBack"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="h-4 w-4 text-emerald-600 dark:text-emerald-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-200 transition-colors"
          />
        </UButton>

        <!-- Divider -->
        <div class="h-5 w-px bg-emerald-200/40 dark:bg-emerald-700/40" />

        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex items-center shrink-0 transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-400 dark:focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-emerald-950 rounded-lg px-1"
          aria-label="Kembali ke beranda"
        >
          <NuxtImg
            src="/jurutani/long-transparent.webp"
            alt="Logo JuruTani"
            class="h-7 w-auto"
            loading="eager"
            preload
          />
        </NuxtLink>

        <!-- Divider -->
        <div class="h-5 w-px bg-emerald-200/40 dark:bg-emerald-700/40" />

        <!-- Dark Mode Switch -->
        <UiDarkModeSwitch />
      </nav>
    </div>

    <!-- Main Content Slot -->
    <main
      class="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-8 sm:pb-16 app-reveal app-reveal--2"
    >
      <slot />
    </main>

    <!-- Footer -->
    <footer
      class="py-8 text-center text-sm text-emerald-700/70 dark:text-emerald-300/70 border-t border-emerald-200/30 dark:border-emerald-700/30"
    >
      <p>
        &copy; {{ new Date().getFullYear() }}
        <span class="font-semibold text-emerald-700 dark:text-emerald-300"
          >JuruTani</span
        >. All rights reserved.
      </p>
    </footer>
    </div>
  </div>
</template>
