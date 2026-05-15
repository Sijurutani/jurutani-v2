<script setup lang="ts">
  // Initialize the reveal-on-scroll composable (auto-imported from ~/composables/useReveal.ts)
  useReveal()
</script>

<template>
  <div class="relative">
    <UiFirstVisitModal />
    <div
      class="fixed inset-0 z-0 bg-linear-to-b from-green-50 via-green-100 to-blue-50 dark:from-green-950 dark:via-green-800 dark:to-green-950 pointer-events-none"
    />

    <!-- Decorative blur circles -->
    <div
      class="ambient-orb animate-orb-drift pointer-events-none fixed top-20 left-10 h-72 w-72 rounded-full bg-green-200 opacity-20 blur-3xl dark:bg-green-800"
    />
    <div
      class="ambient-orb ambient-orb--slow animate-orb-drift pointer-events-none fixed right-10 bottom-20 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl dark:bg-blue-800"
    />
    <div
      class="ambient-orb ambient-orb--reverse animate-orb-drift pointer-events-none fixed top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-green-100 opacity-10 blur-2xl dark:bg-green-700"
    />

    <div
      class="relative z-10 min-h-screen flex flex-col bg-transparent text-green-900 dark:text-green-100"
    >
      <LayoutNavigation />

      <UMain class="app-reveal">
        <slot />
      </UMain>

      <div class="app-reveal app-reveal--2">
        <LayoutFooter />
      </div>
    </div>
  </div>
</template>
