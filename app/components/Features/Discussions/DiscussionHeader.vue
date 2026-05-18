<script setup lang="ts">
  interface Props {
    title: string
    subtitle: string
    icon: string
    backUrl?: string
  }

  defineProps<Props>()
</script>

<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4"
  >
    <div class="flex items-center gap-4">
      <UButton
        v-if="backUrl"
        :to="backUrl"
        color="success"
        variant="ghost"
        icon="i-lucide-arrow-left"
        size="lg"
        aria-label="Kembali"
        class="rounded-full"
      />
      <div>
        <h1
          class="text-3xl md:text-4xl font-bold bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent"
        >
          {{ title }}
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {{ subtitle }}
        </p>
      </div>
    </div>
  </div>
</template>
