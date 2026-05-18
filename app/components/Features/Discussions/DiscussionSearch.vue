<script setup lang="ts">
  interface Props {
    modelValue: string
    placeholder?: string
    icon?: string
    title?: string
    showTitle?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Cari...',
    icon: 'i-lucide-search',
    title: 'Cari',
    showTitle: true,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const localValue = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value),
  })
</script>

<template>
  <div>
    <div v-if="showTitle" class="flex items-center gap-2 mb-4">
      <UIcon :name="icon" class="w-5 h-5 text-green-600 dark:text-green-400" />
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        {{ title }}
      </h2>
    </div>

    <div class="relative w-full max-w-2xl mx-auto">
      <UInput
        v-model="localValue"
        type="text"
        :placeholder="placeholder"
        :leading-icon="icon"
        size="lg"
        class="w-full"
      >
        <template v-if="localValue" #trailing>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            size="xs"
            @click="localValue = ''"
          />
        </template>
      </UInput>

      <!-- Search hint -->
      <p
        v-if="localValue"
        class="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center"
      >
        Mencari:
        <span class="font-semibold text-green-600 dark:text-green-400">{{
          localValue
        }}</span>
      </p>
    </div>
  </div>
</template>
