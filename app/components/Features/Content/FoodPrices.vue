<script setup lang="ts">
  import { formatCurrency, type FoodPrice } from '~/data/food-prices'
  import { getFoodPublicUrl } from '~/utils/storage'

  interface Props {
    product: FoodPrice
    compact?: boolean
  }

  const props = defineProps<Props>()

  const productImage = computed(() => {
    if (!props.product.image) return ''
    return getFoodPublicUrl(props.product.image) || props.product.image
  })
</script>

<template>
  <NuxtLink
    :to="`/food-prices/${product.slug}`"
    class="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300"
  >
    <!-- Image -->
    <div
      class="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800"
    >
      <NuxtImg
        :src="productImage"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />

      <!-- Stock Badge -->
      <div v-if="!compact" class="absolute top-3 right-3">
        <UBadge
          :color="
            product.stock?.toLowerCase().includes('tersedia')
              ? 'success'
              : 'warning'
          "
          variant="solid"
          size="xs"
          class="shadow-md"
        >
          {{ product.stock || 'N/A' }}
        </UBadge>
      </div>
    </div>

    <!-- Content -->
    <div :class="compact ? 'p-4' : 'p-5'">
      <h3
        class="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
        :class="compact ? 'text-sm' : 'text-base'"
      >
        {{ product.name }}
      </h3>

      <div
        class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3"
      >
        <UIcon name="i-lucide-users" class="w-4 h-4 shrink-0" />
        <span class="truncate">{{ product.producer }}</span>
      </div>

      <div
        v-if="!compact && product.description"
        class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2"
      >
        {{ product.description }}
      </div>

      <div class="flex items-center justify-between">
        <div>
          <div
            class="font-bold text-emerald-600 dark:text-emerald-400"
            :class="compact ? 'text-base' : 'text-lg'"
          >
            {{ formatCurrency(product.price) }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-500">
            per {{ product.unit }}
          </div>
        </div>

        <UIcon
          name="i-lucide-arrow-right"
          class="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"
        />
      </div>

      <div
        v-if="!compact && product.district"
        class="mt-3 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500"
      >
        <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
        <span>{{ product.district }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
