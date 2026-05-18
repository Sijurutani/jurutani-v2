<script setup lang="ts">
  import type { HomeBanner, HomeProduct } from '~/composables/useHomeData'
  import { getMarketPublicUrl } from '~/utils/storage'
  import { useReveal } from '~/composables/useReveal'

  useReveal()

  type ProductMarket = HomeProduct

  const props = defineProps<{
    banners: HomeBanner[]
    initialProducts: ProductMarket[]
  }>()

  // Masih butuh supabase untuk banner storage URL saja
  const supabase = useSupabaseClient()

  const banners = computed(() => props.banners)
  const bannerIndex = ref(0)
  const bannerTransitioning = ref(false)
  const bannerProgressRef = ref<HTMLElement | null>(null)
  
  const getBannerUrl = (path: string) => {
    if (!path) return '/placeholder.webp'
    if (path.startsWith('http')) return path
    try {
      // URL publik langsung (transform memerlukan Supabase Pro plan)
      const { data } = supabase.storage.from('banner-image').getPublicUrl(path)
      return data.publicUrl
    } catch {
      return '/placeholder.webp'
    }
  }

  // Autoplay
  const bannerAutoplayTimer = ref<ReturnType<typeof setInterval> | null>(null)

  const stopBannerAutoplay = () => {
    if (bannerAutoplayTimer.value) {
      clearInterval(bannerAutoplayTimer.value)
      bannerAutoplayTimer.value = null
    }
  }

  const startBannerAutoplay = () => {
    stopBannerAutoplay()
    if (banners.value.length > 1) {
      nextTick(() => animateBannerProgress())
      bannerAutoplayTimer.value = setInterval(() => {
        if (!bannerTransitioning.value) nextBanner()
      }, 4000)
    }
  }

  const goToBanner = (i: number) => {
    if (bannerTransitioning.value || i === bannerIndex.value) return
    bannerIndex.value = i
    bannerTransitioning.value = true
    nextTick(() => animateBannerProgress())
    setTimeout(() => {
      bannerTransitioning.value = false
    }, 500)
  }

  const prevBanner = () => {
    if (bannerTransitioning.value || !banners.value.length) return
    bannerIndex.value =
      (bannerIndex.value - 1 + banners.value.length) % banners.value.length
    bannerTransitioning.value = true
    nextTick(() => animateBannerProgress())
    setTimeout(() => {
      bannerTransitioning.value = false
    }, 500)
  }

  const nextBanner = () => {
    if (bannerTransitioning.value || !banners.value.length) return
    bannerIndex.value = (bannerIndex.value + 1) % banners.value.length
    bannerTransitioning.value = true
    nextTick(() => animateBannerProgress())
    setTimeout(() => {
      bannerTransitioning.value = false
    }, 500)
  }

  const animateBannerProgress = () => {
    if (!bannerProgressRef.value) return
    bannerProgressRef.value.style.transition = 'none'
    bannerProgressRef.value.style.transform = 'scaleX(0)'
    // Force reflow
    void bannerProgressRef.value.offsetWidth
    bannerProgressRef.value.style.transition = 'transform 4s linear'
    bannerProgressRef.value.style.transform = 'scaleX(1)'
  }

  // Touch swipe for banner
  const bannerTouchStartX = ref(0)
  const handleBannerTouchStart = (e: TouchEvent) => {
    bannerTouchStartX.value = e.touches[0].clientX
    stopBannerAutoplay()
  }
  const handleBannerTouchEnd = (e: TouchEvent) => {
    const delta = e.changedTouches[0].clientX - bannerTouchStartX.value
    if (Math.abs(delta) > 40) {
      if (delta > 0) prevBanner()
      else nextBanner()
    }
    setTimeout(() => startBannerAutoplay(), 200)
  }


  const products = ref<ProductMarket[]>(props.initialProducts)
  const loadingProducts = ref(false)
  const productTrackRef = ref<HTMLElement | null>(null)
  const productPageIndex = ref(0)
  const productPerPage = ref(2)

  const updateProductPerPage = () => {
    if (!productTrackRef.value || !products.value.length) return
    const card = productTrackRef.value.children[0] as HTMLElement
    if (!card) return
    const cardW = card.offsetWidth
    const trackW = productTrackRef.value.clientWidth
    productPerPage.value = Math.max(1, Math.round(trackW / cardW))
  }

  const productDotCount = computed(() =>
    Math.max(1, Math.ceil(products.value.length / productPerPage.value)),
  )

  const handleProductScroll = () => {
    if (!productTrackRef.value) return
    const { scrollLeft, clientWidth } = productTrackRef.value
    productPageIndex.value = Math.round(scrollLeft / clientWidth)
  }

  const scrollProductTo = (i: number) => {
    if (!productTrackRef.value) return
    productTrackRef.value.scrollTo({
      left: productTrackRef.value.clientWidth * i,
      behavior: 'smooth',
    })
    productPageIndex.value = i
  }

  function parseImages(images: any): string[] {
    if (!images) return []
    if (Array.isArray(images)) return images.filter((i) => typeof i === 'string')
    if (typeof images === 'string') {
      try {
        const arr = JSON.parse(images)
        return Array.isArray(arr) ? arr.filter((i) => typeof i === 'string') : []
      } catch { return [] }
    }
    return []
  }

  const getImage = (p: ProductMarket) => {
    let thumbPath = p.thumbnail_url || ''
    if (!thumbPath) {
      const imgs = parseImages(p.images)
      if (imgs.length > 0) thumbPath = imgs[0] ?? ''
    }
    if (!thumbPath) return '/product.webp'
    return getMarketPublicUrl(thumbPath) || '/product.webp'
  }

  const formatPrice = (p: ProductMarket) => {
    if (p.price_range) return p.price_range
    if (p.price == null) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(p.price)
  }

  watch(() => props.initialProducts, (val) => {
    if (val) products.value = val
  })

  onMounted(async () => {
    if (banners.value.length > 1) nextTick(() => startBannerAutoplay())
    // Set perPage setelah DOM siap
    nextTick(() => updateProductPerPage())
    window.addEventListener('resize', updateProductPerPage, { passive: true })
  })

  onBeforeUnmount(() => {
    stopBannerAutoplay()
    window.removeEventListener('resize', updateProductPerPage)
  })
</script>

<template>
  <section class="px-4 lg:px-6 flex flex-col gap-6">
    <!-- ── Section Header ── -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <!-- Badge glass sweep -->
        <div class="section-badge mb-3">
          <span class="section-badge__dot" />
          <span class="section-badge__text">JuruTani Mall</span>
          <span class="section-badge__sweep" aria-hidden="true" />
        </div>

        <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
          Penawaran &amp; Produk
        </h2>
        <p class="text-sm md:text-[15px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-xl">
          Promo spesial dan produk pertanian pilihan terbaik dari mitra terpercaya kami.
        </p>
      </div>

      <NuxtLink
        to="/markets"
        class="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold text-green-600 dark:text-green-400 border border-green-600/30 dark:border-green-400/30 rounded-full no-underline hover:bg-green-600/8 hover:border-green-600/55 transition-all duration-200 shrink-0 self-start md:self-auto"
      >
        Semua Produk
        <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
      </NuxtLink>
    </div>

    <!-- ── Banner Carousel ── -->
    <div v-if="banners.length" class="flex flex-col gap-2.5">
      <div
        class="banner-viewport relative w-full rounded-2xl overflow-hidden bg-gray-900 shadow-lg shadow-black/5 aspect-[16/8] sm:aspect-[16/6] md:aspect-[21/6]"
        @touchstart.passive="handleBannerTouchStart"
        @touchend.passive="handleBannerTouchEnd"
      >
        <TransitionGroup name="promo-banner-fade" tag="div" class="absolute inset-0">
          <div
            v-for="(banner, i) in banners"
            v-show="i === bannerIndex"
            :key="banner.id"
            class="absolute inset-0"
          >
            <NuxtImg
              :src="getBannerUrl(banner.image_url)"
              alt="Banner Promo JuruTani"
              class="w-full h-full object-cover block"
              loading="lazy"
              width="1000"
              height="350"
              decoding="async"
              @error="(e: any) => ((e.target as HTMLImageElement).src = '/placeholder.webp')"
            />
            <!-- Gradient Overlay for better contrast with arrows -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100" />
          </div>
        </TransitionGroup>

        <!-- Prev Arrow -->
        <button
          v-if="banners.length > 1"
          class="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/40 hover:border-white/50 hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label="Banner sebelumnya"
          @click="prevBanner"
        >
          <UIcon name="i-lucide-chevron-left" class="w-4 h-4" />
        </button>

        <!-- Next Arrow -->
        <button
          v-if="banners.length > 1"
          class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/40 hover:border-white/50 hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label="Banner berikutnya"
          @click="nextBanner"
        >
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
        </button>
      </div>

      <!-- Dots + Counter -->
      <div v-if="banners.length > 1" class="flex flex-col sm:flex-row items-center justify-center gap-3 px-0.5 mt-2">
        <div class="flex items-center gap-1.5">
          <button
            v-for="(_, i) in banners"
            :key="i"
            :aria-label="`Banner ${i + 1}`"
            class="banner-dot relative overflow-hidden rounded-full border-none cursor-pointer transition-all duration-400"
            :class="i === bannerIndex ? 'w-7 h-1.5 bg-green-500' : 'w-1.5 h-1.5 bg-gray-400/45 hover:bg-green-400 hover:scale-y-125'"
            @click="goToBanner(i)"
          >
            <span
              v-if="i === bannerIndex"
              ref="bannerProgressRef"
              class="absolute inset-0 bg-green-500 rounded-full origin-left scale-x-0"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- ── Loading Skeleton ── -->
    <div v-if="loadingProducts" class="flex gap-3 overflow-hidden">
      <div
        v-for="i in 4"
        :key="i"
        class="flex-none w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] aspect-[3/4] rounded-sm bg-white/10 animate-pulse"
      />
    </div>

    <!-- ── Product Carousel ── -->
    <template v-else-if="products.length">
      <div
        ref="productTrackRef"
        class="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
        @scroll.passive="handleProductScroll"
      >
        <NuxtLink
          v-for="product in products"
          :key="product.id"
          :to="`/markets/${product.slug}`"
          class="relative flex-none snap-start w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] rounded-sm overflow-hidden no-underline group cursor-pointer"
          style="aspect-ratio: 3/4;"
        >
          <!-- Fallback bg -->
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-900 to-teal-950" />

          <!-- Background Image -->
          <NuxtImg
            :src="getImage(product)"
            :alt="product.name"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            width="300"
            height="400"
            decoding="async"
            @error="(e: any) => ((e.target as HTMLImageElement).src = '/product.webp')"
          />

          <!-- Gradient scrim -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          <!-- Category badge -->
          <div
            v-if="product.category"
            class="absolute top-2.5 left-2.5 z-10 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white bg-green-600/80 backdrop-blur-sm"
          >
            {{ product.category }}
          </div>

          <!-- Info overlay -->
          <div class="absolute inset-x-0 bottom-0 z-10 p-3 flex flex-col gap-1">
            <p class="text-[12px] font-bold text-white leading-snug line-clamp-1">
              {{ product.name }}
            </p>
            <p v-if="product.excerpt" class="text-[10px] text-white/75 leading-tight line-clamp-2">
              {{ product.excerpt }}
            </p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-[13px] font-extrabold text-green-300">
                {{ formatPrice(product) }}
              </span>
              <span v-if="product.price_unit" class="text-[10px] text-white/55">
                / {{ product.price_unit }}
              </span>
            </div>
          </div>

          <!-- Hover border glow -->
          <div class="absolute inset-0 rounded-sm border border-transparent group-hover:border-green-400/40 transition-colors duration-300 pointer-events-none" />
        </NuxtLink>
      </div>

      <!-- Dots (per page) -->
      <div class="flex items-center justify-center gap-3 mt-2">
        <div v-if="productDotCount > 1" class="flex gap-1.5">
          <button
            v-for="(_, i) in productDotCount"
            :key="i"
            :aria-label="`Halaman produk ${i + 1}`"
            class="h-1.5 rounded-full border-none cursor-pointer transition-all duration-350"
            :class="i === productPageIndex ? 'w-6 bg-green-500' : 'w-1.5 bg-gray-400/50 hover:bg-green-400 hover:scale-y-125'"
            @click="scrollProductTo(i)"
          />
        </div>
      </div>
    </template>

    <!-- Empty -->
    <div v-else class="flex flex-col items-center justify-center py-10 border border-dashed border-white/20 rounded-lg">
      <UIcon name="i-lucide-package-open" class="w-8 h-8 text-gray-400 dark:text-gray-600" />
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Produk tidak ditemukan</p>
    </div>
  </section>
</template>

<style scoped>
/* Hanya CSS yang tidak bisa ditangani Tailwind */
.banner-viewport {
  aspect-ratio: 2.8 / 1;
  box-shadow: 0 8px 32px -8px rgba(0,0,0,0.2);
}
@media (min-width: 768px) {
  .banner-viewport { aspect-ratio: 4 / 1; }
}

/* Slide transition */
.promo-banner-fade-enter-active,
.promo-banner-fade-leave-active {
  transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1);
  position: absolute;
  inset: 0;
}
.promo-banner-fade-enter-from { opacity: 0; transform: scale(1.03); }
.promo-banner-fade-leave-to   { opacity: 0; transform: scale(0.97); }
.promo-banner-fade-enter-to,
.promo-banner-fade-leave-from { opacity: 1; transform: scale(1); }

/* Scrollbar hide (belum semua browser support via Tailwind) */
.scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }

/* ── Section Badge ── */
.section-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.85rem;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.25);
  border-radius: 9999px;
  overflow: hidden;
  backdrop-filter: blur(8px);
}
.section-badge__dot {
  display: block; width: 0.4rem; height: 0.4rem;
  border-radius: 50%; background: #4ade80; flex-shrink: 0;
  animation: badge-dot-pulse 2s ease-in-out infinite;
}
.section-badge__text {
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #16a34a;
}
:root.dark .section-badge__text { color: #4ade80; }
.section-badge__sweep {
  position: absolute; top: 0; left: 0; width: 55%; height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%);
  pointer-events: none;
  animation: badge-sweep 3.5s ease-in-out infinite;
}
@keyframes badge-dot-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@keyframes badge-sweep {
  0% { transform: translateX(-200%); opacity: 0; }
  10% { opacity: 1; } 90% { opacity: 1; }
  100% { transform: translateX(280%); opacity: 0; }
}
</style>


  