<script setup lang="ts">
  definePageMeta({
    layout: 'default',
    navOrder: 1,
    icon: 'i-lucide-home',
  })

  useSeoMeta({
    title: 'Platform Penyuluhan Pertanian Digital Indonesia',
    description: 'Platform penyuluhan digital petani Indonesia. Dapatkan edukasi gratis, konsultasi penyuluh ahli, dan info harga komoditas terkini dari Polbangtan.'
  })

  // ── Centralized Supabase fetching — semua data dipanggil dari sini ────────
  const {
    getHeroData, getHomeStats,
    getExperts, getInstructors,
    getBanners, getProducts,
    getFoodPrices, getLatestNews,
  } = useHomeData()

  const { data: heroData, pending: heroLoading, error: heroError, refresh: refreshHero } = await getHeroData()
  const { data: counts } = await getHomeStats()
  const { data: experts } = await getExperts()
  const { data: instructors } = await getInstructors()
  const { data: banners } = await getBanners()
  const { data: products } = await getProducts()
  const { data: foodItems, pending: foodPending } = await getFoodPrices()
  const { data: news, pending: newsPending } = await getLatestNews()
</script>

<template>
  <div>
    <!-- Hero Section: always render immediately (above the fold, LCP element) -->
    <FeaturesHomeHeroSection
      :hero-data="heroData ?? []"
      :loading="heroLoading"
      :error="heroError"
      :counts="counts"
      @refresh="refreshHero"
    />

    <!-- ═══ Smart Dashboard (Cuaca, Pakar, Penyuluh) ═══ -->
    <section aria-labelledby="smart-dashboard-section" class="mt-7">
      <h2 id="smart-dashboard-section" class="sr-only">Smart Dashboard JuruTani</h2>
      <FeaturesHomeSmartDashboard
        :experts="experts ?? []"
        :instructors="instructors ?? []"
      />
    </section>

    <!-- ═══ Promotion Section ═══ -->
    <section aria-labelledby="promotion-section" class="mt-16 perf-section">
      <h2 id="promotion-section" class="sr-only">Promosi Spesial</h2>
      <LazyFeaturesHomePromotionSection
        :banners="banners ?? []"
        :initial-products="products ?? []"
      />
    </section>

    <!-- ═══ Food Price Section ═══ -->
    <section aria-labelledby="food-price-section" class="mt-16 perf-section">
      <h2 id="food-price-section" class="sr-only">Informasi Harga Pangan</h2>
      <LazyFeaturesHomeFoodPriceSection
        :items="foodItems ?? []"
        :pending="foodPending"
      />
    </section>

    <!-- ═══ News Section ═══ -->
    <section aria-labelledby="news-section" class="mt-16 perf-section">
      <h2 id="news-section" class="sr-only">Berita dan Informasi</h2>
      <LazyFeaturesHomeNewsSection
        :news="news ?? []"
        :pending="newsPending"
      />
    </section>

    <!-- ═══ JuruTani Info Banner ═══ -->
    <section aria-labelledby="jtb-section" class="mt-16 perf-section">
      <h2 id="jtb-section" class="sr-only">Tentang JuruTani</h2>
      <LazyFeaturesHomeJuruTaniInfoBanner />
    </section>

    <!-- ═══ Testimonials Section ═══ -->
    <section aria-labelledby="testimonials-section" class="my-16 perf-section">
      <h2 id="testimonials-section" class="sr-only">Testimoni Pengguna</h2>
      <LazyFeaturesHomeTestimoni />
    </section>

    <LazyFeaturesChatbotJurutani />
  </div>
</template>

<style>
  .perf-section {
    content-visibility: auto;
    contain-intrinsic-size: 0 400px;
  }
</style>
