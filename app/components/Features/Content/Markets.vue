<script setup lang="ts">
  import { computed, ref } from 'vue'
  import type { Database } from '~/types/database.types'
  import { getMarketPublicUrl } from '~/utils/storage'

  type ProductMarket = Database['public']['Tables']['product_markets']['Row']

  interface Props {
    product: ProductMarket
    variant?: 'default' | 'large' | 'wide'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
  })

  const imageError = ref(false)
  const imageLoading = ref(true)

  // Get main image (thumbnail or first gallery image)

  function parseImages(images: any): string[] {
    if (!images) return []
    if (Array.isArray(images))
      return images.filter((i) => typeof i === 'string')
    if (typeof images === 'string') {
      try {
        const arr = JSON.parse(images)
        return Array.isArray(arr)
          ? arr.filter((i) => typeof i === 'string')
          : []
      } catch {
        return []
      }
    }
    return []
  }

  const mainImage = computed(() => {
    const imagePath =
      props.product.thumbnail_url ||
      (parseImages(props.product.images).length > 0
        ? parseImages(props.product.images)[0]
        : null)
    if (!imagePath) return '/product.webp'
    const url = getMarketPublicUrl(imagePath)
    return url || '/product.webp'
  })

  // Format price (simple, IDR)
  const formattedPrice = computed(() => {
    if (props.product.price == null) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(props.product.price)
  })

  // Get excerpt
  const excerpt = computed(() => {
    if (props.product.excerpt) return props.product.excerpt
    // Extract from content (assume JSONContent or string)
    let text = ''
    function extractText(node: any) {
      if (!node) return
      if (typeof node === 'string') text += node
      if (typeof node === 'object') {
        if (node.text) text += node.text
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach((child: any) => extractText(child))
        }
      }
    }
    if (props.product.content) {
      if (typeof props.product.content === 'string') {
        try {
          const parsed = JSON.parse(props.product.content)
          extractText(parsed)
        } catch {
          extractText(props.product.content)
        }
      } else {
        extractText(props.product.content)
      }
    }
    text = text.trim()
    const maxLength = props.variant === 'large' ? 180 : 100
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  })

  const formattedCategory = computed(() => {
    return props.product.category
      ? props.product.category.charAt(0).toUpperCase() +
          props.product.category.slice(1)
      : ''
  })

  const handleImageError = () => {
    imageError.value = true
    imageLoading.value = false
  }

  const handleImageLoad = () => {
    imageLoading.value = false
    imageError.value = false
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'hasil pertanian': 'bg-green-600',
      'alat pertanian': 'bg-blue-600',
      pupuk: 'bg-yellow-600',
      bibit: 'bg-emerald-600',
      default: 'bg-lime-600',
    }
    return colors[category.toLowerCase()] || colors.default
  }

  // Card classes based on variant
  const cardClasses = computed(() => {
    const base =
      'group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cursor-pointer'

    const variants = {
      default: 'col-span-1 row-span-1 min-h-[380px]',
      large:
        'col-span-1 md:col-span-2 row-span-1 md:row-span-2 min-h-[380px] md:min-h-[580px]',
      wide: 'col-span-1 md:col-span-2 row-span-1 min-h-[380px]',
    }

    return `${base} ${variants[props.variant]}`
  })

  const contentClasses = computed(() => {
    if (props.variant === 'large') {
      return 'p-8 md:p-10'
    }
    return 'p-6 md:p-8'
  })

  // Count total images
  const totalImages = computed(() => {
    let count = 0
    if (props.product.thumbnail_url) count++
    count += parseImages(props.product.images).length
    return count
  })

  // Count attachments
  const totalAttachments = computed(() => {
    // attachments: Json (array of {name, url, ...})
    let arr: any[] = []
    if (Array.isArray(props.product.attachments))
      arr = props.product.attachments
    else if (typeof props.product.attachments === 'string') {
      try {
        arr = JSON.parse(props.product.attachments)
      } catch {}
    }
    return arr.length
  })

  // Check marketplace links
  const hasMarketplaceLinks = computed(() => {
    // links: Json (array of {shopee_link, tokopedia_link, tiktok_link})
    let arr: any[] = []
    if (Array.isArray(props.product.links)) arr = props.product.links
    else if (typeof props.product.links === 'string') {
      try {
        arr = JSON.parse(props.product.links)
      } catch {}
    }
    if (!arr || arr.length === 0) return false
    return arr.some(
      (link) => link.shopee_link || link.tokopedia_link || link.tiktok_link,
    )
  })
</script>

<template>
  <article :class="cardClasses">
    <NuxtLink :to="`/markets/${product.slug}`" class="block h-full">
      <!-- Background Image with Gradient Overlay -->
      <figure class="absolute inset-0">
        <!-- Loading State -->
        <div
          v-if="imageLoading && mainImage !== '/product.webp' && !imageError"
          class="absolute inset-0 flex items-center justify-center bg-linear-to-br from-emerald-50 to-green-100 dark:from-gray-800 dark:to-gray-900"
        >
          <div
            class="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"
          />
        </div>

        <!-- Background Image -->
        <NuxtImg
          v-if="mainImage !== '/product.webp' && !imageError"
          :src="mainImage"
          :alt="product.name"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          @error="handleImageError"
          @load="handleImageLoad"
        />

        <!-- Fallback Background -->
        <div
          v-else
          class="w-full h-full bg-linear-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center"
        >
          <div class="text-center text-green-400 dark:text-gray-600">
            <UIcon
              name="i-lucide-shopping-bag"
              class="w-20 h-20 mb-3 opacity-50"
            />
            <p class="text-sm font-medium opacity-75">Produk Tani</p>
          </div>
        </div>

        <!-- Gradient Overlays -->
        <div
          class="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500"
        />
        <div
          class="absolute inset-0 bg-linear-to-br from-emerald-900/20 via-transparent to-green-900/20 group-hover:from-emerald-900/30 group-hover:to-green-900/30 transition-all duration-500"
        />
      </figure>

      <!-- Content Overlay -->
      <div
        :class="['relative h-full flex flex-col justify-end', contentClasses]"
      >
        <!-- Top Badges -->
        <div
          class="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2"
        >
          <!-- Category Badge -->
          <span
            :class="[
              getCategoryColor(product.category),
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl',
            ]"
          >
            <UIcon name="i-lucide-tag" class="w-3 h-3" />
            {{ formattedCategory }}
          </span>

          <!-- Images count badge -->
          <span
            v-if="totalImages > 0"
            class="inline-flex items-center gap-1 px-2 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full"
          >
            <UIcon name="i-lucide-images" class="w-3 h-3" />
            {{ totalImages }}
          </span>

          <!-- Attachments badge -->
          <span
            v-if="totalAttachments > 0"
            class="inline-flex items-center gap-1 px-2 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full"
          >
            <UIcon name="i-lucide-paperclip" class="w-3 h-3" />
            {{ totalAttachments }}
          </span>
        </div>

        <!-- Main Content -->
        <div
          class="space-y-3 md:space-y-4 transform transition-transform duration-500 group-hover:-translate-y-1.5"
        >
          <!-- Title -->
          <h3
            :class="[
              'font-bold text-white leading-tight line-clamp-2 transition-all duration-300',
              variant === 'large'
                ? 'text-2xl md:text-3xl'
                : 'text-xl md:text-2xl',
            ]"
          >
            {{ product.name }}
          </h3>

          <!-- Price -->
          <div class="flex items-baseline gap-2">
            <span
              :class="[
                'font-bold text-green-400 transition-all duration-300',
                variant === 'large'
                  ? 'text-2xl md:text-3xl'
                  : 'text-xl md:text-2xl',
              ]"
            >
              {{ formattedPrice }}
            </span>
            <span v-if="product.price_unit" class="text-xs text-gray-300">{{
              product.price_unit
            }}</span>
          </div>

          <!-- Excerpt -->
          <p
            v-if="variant === 'large' || variant === 'wide'"
            class="text-gray-200 text-sm md:text-base line-clamp-2 leading-relaxed"
          >
            {{ excerpt }}
          </p>

          <!-- Seller Info -->
          <div
            v-if="product.seller"
            class="flex items-center gap-2 text-xs md:text-sm text-gray-300"
          >
            <UIcon name="i-lucide-user" class="w-4 h-4 text-green-400" />
            <span class="font-medium">{{ product.seller }}</span>
          </div>

          <!-- Marketplace Links Badges -->
          <div v-if="hasMarketplaceLinks" class="flex flex-wrap gap-2">
            <span
              v-if="product.links?.some((l) => l.shopee_link)"
              class="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/80 text-white text-xs font-medium rounded-full backdrop-blur-sm"
            >
              <UIcon name="i-lucide-shopping-bag" class="w-3 h-3" />
              Shopee
            </span>
            <span
              v-if="product.links?.some((l) => l.tokopedia_link)"
              class="inline-flex items-center gap-1 px-2 py-1 bg-green-500/80 text-white text-xs font-medium rounded-full backdrop-blur-sm"
            >
              <UIcon name="i-lucide-store" class="w-3 h-3" />
              Tokopedia
            </span>
            <span
              v-if="product.links?.some((l) => l.tiktok_link)"
              class="inline-flex items-center gap-1 px-2 py-1 bg-gray-900/80 text-white text-xs font-medium rounded-full backdrop-blur-sm"
            >
              <UIcon name="i-lucide-music" class="w-3 h-3" />
              TikTok
            </span>
          </div>

          <!-- Read More Button -->
          <div
            class="flex items-center gap-2 text-white font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          >
            <span class="text-sm">Lihat Detail Produk</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
            />
          </div>
        </div>

        <!-- Hover Border -->
        <div
          class="absolute inset-0 border-2 border-transparent group-hover:border-green-400/50 rounded-2xl transition-all duration-500 pointer-events-none"
        />
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
