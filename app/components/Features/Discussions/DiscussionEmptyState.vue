<script setup lang="ts">
  interface Props {
    message: string
    filterText?: string
    showResetButton?: boolean
    icon?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    icon: 'i-lucide-inbox',
    showResetButton: false,
  })

  const emit = defineEmits<{
    reset: []
  }>()

  const handleReset = () => {
    emit('reset')
  }
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16">
    <UIcon
      :name="icon"
      class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
    />
    <p class="text-gray-600 dark:text-gray-400 text-center max-w-sm">
      {{ message }}
      <span v-if="filterText" class="font-semibold">{{ filterText }}</span>
    </p>
    <UButton
      v-if="showResetButton"
      color="success"
      variant="soft"
      class="mt-4"
      @click="handleReset"
    >
      Reset Filter
    </UButton>
  </div>
</template>
