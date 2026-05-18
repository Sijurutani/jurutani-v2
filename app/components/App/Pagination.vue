<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    currentPage: number
    totalPages: number
    totalItems?: number
    pageSize?: number
    // Konfigurasi tampilan
    maxPagesToShow?: number
    showPageInfo?: boolean
    showFirstLast?: boolean
    // Custom text
    prevText?: string
    nextText?: string
    firstText?: string
    lastText?: string
    pageInfoTemplate?: string
    // Styling
    containerClass?: string
    buttonClass?: string
    activeButtonClass?: string
    disabledButtonClass?: string
    pageInfoClass?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    maxPagesToShow: 5,
    showPageInfo: false,
    showFirstLast: false,
    prevText: '‹',
    nextText: '›',
    firstText: '«',
    lastText: '»',
    pageInfoTemplate: 'Menampilkan {start} - {end} dari {total} item',
    containerClass: 'flex justify-center items-center space-x-2 my-8',
    buttonClass: 'px-3 py-1 rounded border font-medium transition-colors',
    activeButtonClass: 'bg-green-600 text-white border-green-600',
    disabledButtonClass:
      'bg-green-100 text-green-400 border-green-200 cursor-not-allowed',
    pageInfoClass: 'text-sm text-gray-600 dark:text-gray-400 text-center mt-2',
  })

  const emit = defineEmits<{
    'update:page': [page: number]
    prev: []
    next: []
    first: []
    last: []
    goto: [page: number]
    change: [page: number]
  }>()

  // Computed untuk page numbers dengan ellipsis
  const pageNumbers = computed(() => {
    const pages: (number | string)[] = []
    const { totalPages, currentPage, maxPagesToShow } = props

    if (totalPages <= maxPagesToShow) {
      // Jika total pages sedikit, tampilkan semua
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Logic untuk ellipsis
      const halfMaxPages = Math.floor(maxPagesToShow / 2)

      // Selalu tampilkan halaman pertama
      pages.push(1)

      let startPage = Math.max(2, currentPage - halfMaxPages)
      let endPage = Math.min(totalPages - 1, currentPage + halfMaxPages)

      // Adjust jika terlalu dekat dengan awal atau akhir
      if (currentPage <= halfMaxPages + 1) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1)
      }

      if (currentPage >= totalPages - halfMaxPages) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2)
      }

      // Tambahkan ellipsis awal jika perlu
      if (startPage > 2) {
        pages.push('...')
      }

      // Tambahkan pages di tengah
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // Tambahkan ellipsis akhir jika perlu
      if (endPage < totalPages - 1) {
        pages.push('...')
      }

      // Selalu tampilkan halaman terakhir (jika > 1)
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  })

  // Computed untuk page info
  const pageInfo = computed(() => {
    if (!props.showPageInfo || !props.totalItems || !props.pageSize) return ''

    const start = (props.currentPage - 1) * props.pageSize + 1
    const end = Math.min(props.currentPage * props.pageSize, props.totalItems)

    return props.pageInfoTemplate
      .replace('{start}', start.toString())
      .replace('{end}', end.toString())
      .replace('{total}', props.totalItems.toString())
  })

  // Computed untuk status buttons
  const canGoPrev = computed(() => props.currentPage > 1)
  const canGoNext = computed(() => props.currentPage < props.totalPages)

  // Event handlers
  const handleFirst = () => {
    if (canGoPrev.value) {
      emit('update:page', 1)
      emit('first')
      emit('goto', 1)
      emit('change', 1)
    }
  }

  const handlePrev = () => {
    if (canGoPrev.value) {
      const newPage = props.currentPage - 1
      emit('update:page', newPage)
      emit('prev')
      emit('goto', newPage)
      emit('change', newPage)
    }
  }

  const handleNext = () => {
    if (canGoNext.value) {
      const newPage = props.currentPage + 1
      emit('update:page', newPage)
      emit('next')
      emit('goto', newPage)
      emit('change', newPage)
    }
  }

  const handleLast = () => {
    if (canGoNext.value) {
      emit('update:page', props.totalPages)
      emit('last')
      emit('goto', props.totalPages)
      emit('change', props.totalPages)
    }
  }

  const handleGotoPage = (page: number) => {
    if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
      emit('update:page', page)
      emit('goto', page)
      emit('change', page)
    }
  }

  // Computed untuk button classes
  const getButtonClass = (isActive = false, isDisabled = false) => {
    const baseClass = props.buttonClass
    if (isDisabled) return `${baseClass} ${props.disabledButtonClass}`
    if (isActive) return `${baseClass} ${props.activeButtonClass}`
    return `${baseClass} bg-white text-green-700 border-green-400 hover:bg-green-50  dark:border-green-600 dark:hover:bg-gray-700`
  }
</script>

<template>
  <div class="pagination-wrapper">
    <div v-if="totalPages > 1" :class="containerClass">
      <!-- First Button -->
      <UButton
        color="neutral"
        variant="ghost"
        v-if="showFirstLast"
        :class="getButtonClass(false, !canGoPrev)"
        :disabled="!canGoPrev"
        :title="'Halaman Pertama'"
        @click="handleFirst"
      >
        {{ firstText }}
      </UButton>

      <!-- Previous Button -->
      <UButton
        color="neutral"
        variant="ghost"
        :class="getButtonClass(false, !canGoPrev)"
        :disabled="!canGoPrev"
        :title="'Halaman Sebelumnya'"
        @click="handlePrev"
      >
        {{ prevText }}
      </UButton>

      <!-- Page Numbers -->
      <template v-for="(page, index) in pageNumbers" :key="`page-${index}`">
        <UButton
          color="neutral"
          variant="ghost"
          v-if="typeof page === 'number'"
          :class="getButtonClass(page === currentPage)"
          :title="`Halaman ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="handleGotoPage(page)"
        >
          {{ page }}
        </UButton>
        <span
          v-else
          class="px-2 text-green-500 dark:text-green-400 select-none"
          aria-hidden="true"
        >
          {{ page }}
        </span>
      </template>

      <!-- Next Button -->
      <UButton
        color="neutral"
        variant="ghost"
        :class="getButtonClass(false, !canGoNext)"
        :disabled="!canGoNext"
        :title="'Halaman Selanjutnya'"
        @click="handleNext"
      >
        {{ nextText }}
      </UButton>

      <!-- Last Button -->
      <UButton
        color="neutral"
        variant="ghost"
        v-if="showFirstLast"
        :class="getButtonClass(false, !canGoNext)"
        :disabled="!canGoNext"
        :title="'Halaman Terakhir'"
        @click="handleLast"
      >
        {{ lastText }}
      </UButton>
    </div>

    <!-- Page Info -->
    <div v-if="showPageInfo && pageInfo" :class="pageInfoClass">
      {{ pageInfo }}
    </div>
  </div>
</template>
