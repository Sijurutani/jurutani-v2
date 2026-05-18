<script setup lang="ts">
  import { ref, watch } from 'vue'

  interface Props {
    modelValue?: string
    placeholder?: string
    debounce?: number
    disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: 'Cari berita, artikel, atau topik...',
    debounce: 300,
    disabled: false,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    search: [value: string]
  }>()

  const searchQuery = ref(props.modelValue)
  let debounceTimer: NodeJS.Timeout | null = null

  // Watch for external changes
  watch(
    () => props.modelValue,
    (newValue) => {
      searchQuery.value = newValue
    },
  )

  // Handle input with debounce - more responsive
  const handleInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    searchQuery.value = value
    emit('update:modelValue', value)

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Set new timer - triggers search on server
    debounceTimer = setTimeout(() => {
      emit('search', value)
    }, props.debounce)
  }

  // Clear search immediately
  const clearSearch = () => {
    searchQuery.value = ''
    emit('update:modelValue', '')
    emit('search', '')

    // Clear any pending debounce
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
  }
</script>

<template>
  <div class="relative w-full max-w-2xl mx-auto">
    <UInput
      :model-value="searchQuery"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      leading-icon="i-lucide-search"
      size="lg"
      class="w-full"
      :ui="{ base: 'rounded-xl focus:ring-green-500/10' }"
      @update:model-value="
        (val) => {
          searchQuery = val
          handleInput({ target: { value: val } } as any)
        }
      "
    >
      <template v-if="searchQuery" #trailing>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          size="xs"
          @click="clearSearch"
        />
      </template>
    </UInput>
  </div>

  <!-- Search hint -->
  <p
    v-if="searchQuery"
    class="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center"
  >
    Mencari:
    <span class="font-semibold text-green-600 dark:text-green-400">{{
      searchQuery
    }}</span>
  </p>
</template>
