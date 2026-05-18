<script setup lang="ts">
  import { computed } from 'vue'

  interface CategoryItem {
    id?: string | number
    name: string
    value?: string
    [key: string]: any
  }

  interface Props {
    categories: CategoryItem[] | string[]
    currentCategory: string
    // Konfigurasi tampilan
    showAllOption?: boolean
    allOptionText?: string
    allOptionValue?: string
    // Styling options
    activeClass?: string
    inactiveClass?: string
    containerClass?: string
    // Field mapping untuk object categories
    nameField?: string
    valueField?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    showAllOption: true,
    allOptionText: 'Semua',
    allOptionValue: 'all',
    activeClass: 'bg-green-600 text-white border-green-600',
    inactiveClass:
      'bg-green-50 text-green-700 border-green-300 hover:bg-green-100',
    containerClass: 'flex flex-wrap justify-center gap-2 md:gap-4',
    nameField: 'name',
    valueField: 'value',
  })

  const emit = defineEmits<{
    'update:category': [category: string]
    change: [category: string]
  }>()

  // Computed untuk normalisasi categories
  const normalizedCategories = computed(() => {
    const items: CategoryItem[] = []

    // Tambahkan opsi "Semua" jika diaktifkan
    if (props.showAllOption) {
      items.push({
        name: props.allOptionText,
        value: props.allOptionValue,
      })
    }

    // Normalisasi categories
    const categoryItems = props.categories.map((category) => {
      if (typeof category === 'string') {
        return {
          name: category,
          value: category,
        }
      } else {
        return {
          name: category[props.nameField] || category.name,
          value:
            category[props.valueField] ||
            category.value ||
            category[props.nameField] ||
            category.name,
        }
      }
    })

    return [...items, ...categoryItems]
  })

  const formatCategory = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  const handleCategoryClick = (categoryValue: string) => {
    emit('update:category', categoryValue)
    emit('change', categoryValue)
  }
</script>

<template>
  <div class="category-filter my-6">
    <div :class="containerClass">
      <UButton
        color="neutral"
        variant="ghost"
        v-for="category in normalizedCategories"
        :key="category.value"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors border"
        :class="[
          currentCategory === category.value ? activeClass : inactiveClass,
        ]"
        @click="handleCategoryClick(category.value)"
      >
        {{ formatCategory(category.name) }}
      </UButton>
    </div>
  </div>
</template>
