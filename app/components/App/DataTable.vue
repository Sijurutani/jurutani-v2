<script setup lang="ts" generic="T extends Record<string, any>">
  /**
   * Reusable Data Table Component
   * Menggunakan UTable dari Nuxt UI dengan fitur responsive dan customizable
   */

  interface Column {
    key: string
    label: string
    sortable?: boolean
    class?: string
  }

  interface Props {
    data: T[]
    columns: Column[]
    loading?: boolean
    emptyText?: string
    searchPlaceholder?: string
    showSearch?: boolean
    searchValue?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    emptyText: 'Tidak ada data',
    searchPlaceholder: 'Cari...',
    showSearch: false,
    searchValue: '',
  })

  const emit = defineEmits<{
    'update:search': [value: string]
    'row-click': [row: T]
  }>()

  const search = computed({
    get: () => props.searchValue,
    set: (value: string) => emit('update:search', value),
  })
</script>

<template>
  <div class="data-table-wrapper">
    <!-- Search Bar -->
    <div v-if="showSearch" class="mb-4">
      <UInput
        v-model="search"
        :placeholder="searchPlaceholder"
        icon="i-lucide-search"
        size="lg"
        :ui="{
          icon: { trailing: { pointer: '' } },
          base: 'w-full',
        }"
      >
        <template #trailing>
          <UButton
            v-if="search"
            color="neutral"
            variant="link"
            icon="i-lucide-x"
            :padded="false"
            @click="search = ''"
          />
        </template>
      </UInput>
    </div>

    <!-- Table -->
    <div
      class="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg"
    >
      <UTable
        :rows="data"
        :columns="columns"
        :loading="loading"
        :empty-state="{
          icon: 'i-lucide-database',
          label: emptyText,
        }"
        :ui="{
          wrapper: 'rounded-lg',
          base: 'min-w-full',
          divide: 'divide-y divide-gray-200 dark:divide-gray-800',
          thead: 'bg-gray-50 dark:bg-gray-800/50',
          tbody: 'divide-y divide-gray-200 dark:divide-gray-800',
          tr: {
            base: 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer',
          },
          th: {
            base: 'text-left',
            padding: 'px-4 py-3.5',
            color: 'text-gray-900 dark:text-white',
            font: 'font-semibold',
            size: 'text-sm',
          },
          td: {
            base: 'whitespace-nowrap',
            padding: 'px-4 py-4',
            color: 'text-gray-700 dark:text-gray-300',
            font: '',
            size: 'text-sm',
          },
        }"
        @select="(row: T) => emit('row-click', row)"
      >
        <!-- Pass through all slots -->
        <template v-for="(_, name) in $slots" #[name]="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </UTable>
    </div>
  </div>
</template>

<style scoped>
  .data-table-wrapper {
    @apply w-full;
  }
</style>
