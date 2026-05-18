<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import type { SortOption } from '~/utils/enum'

  interface Props {
    sortOptions: SortOption[]
    currentSort: string
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    'update:sort': [value: string]
  }>()

  const isOpen = ref(false)
  const dropdownRef = ref(null)

  const containerRef = ref<HTMLElement | null>(null)

  const handleOutsideClick = (event: MouseEvent) => {
    if (isOpen.value && containerRef.value && !containerRef.value.contains(event.target as Node)) {
      isOpen.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleOutsideClick)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick)
  })

  const handleSortChange = (value: string) => {
    emit('update:sort', value)
    isOpen.value = false
  }

  const getCurrentSortLabel = () => {
    const option = props.sortOptions.find(
      (opt) => opt.value === props.currentSort,
    )
    return option?.label || 'Urutkan'
  }
</script>

<template>
  <div ref="containerRef" class="relative">
    <UButton
      color="neutral"
      variant="ghost"
      type="button"
      class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-400 focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 text-gray-700 dark:text-gray-300 font-medium"
      @click="isOpen = !isOpen"
    >
      <UIcon
        name="i-lucide-arrow-up-down"
        class="w-5 h-5 text-green-600 dark:text-green-400"
      />
      <span>{{ getCurrentSortLabel() }}</span>
      <UIcon
        name="i-lucide-chevron-down"
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </UButton>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="absolute left-0 md:left-auto md:right-0 mt-2 w-48 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
      >
        <div class="py-1">
          <UButton
            color="neutral"
            variant="ghost"
            v-for="option in sortOptions"
            :key="option.value"
            type="button"
            class="w-full px-4 py-2.5 text-left hover:bg-green-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-3"
            :class="{
              'bg-green-50 dark:bg-gray-700 text-green-600 dark:text-green-400 font-semibold':
                currentSort === option.value,
              'text-gray-700 dark:text-gray-300': currentSort !== option.value,
            }"
            @click="handleSortChange(option.value)"
          >
            <UIcon
              v-if="currentSort === option.value"
              name="i-lucide-check"
              class="w-5 h-5 text-green-600 dark:text-green-400"
            />
            <span class="flex-1">{{ option.label }}</span>
          </UButton>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
  /* Dropdown positioning is handled via Tailwind responsive classes */
</style>
