<script setup lang="ts">
  const props = defineProps<{
    message?: string
    height?: string
  }>()

  const wrapperClass = computed(() => {
    return `${props.height ?? 'h-80 lg:h-96'} flex items-center justify-center`
  })
</script>
<template>
  <div :class="wrapperClass">
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"
      />
      <p class="text-green-800">{{ message || 'memuat data ...' }}</p>
    </div>
  </div>
</template>
