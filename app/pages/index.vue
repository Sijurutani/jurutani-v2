<script setup lang="ts">
  definePageMeta({
    layout: 'default',
    navOrder: 1,
    icon: 'i-lucide-home',
  })

  // SEO Optimization with Publisher & Author
  useSeoMeta({
    title: 'Platform Penyuluhan Pertanian Digital Indonesia',
    description: 'Platform penyuluhan digital petani Indonesia. Dapatkan edukasi gratis, konsultasi penyuluh ahli, dan info harga komoditas terkini dari Polbangtan.'
  })
</script>

<template>
  <div>
    <!-- Hero Section: always render immediately (above the fold, LCP element) -->
    <FeaturesHomeHeroSection />

    <!-- ═══ Smart Dashboard (Cuaca, Pakar, Penyuluh) ═══ -->
    <section aria-labelledby="smart-dashboard-section" class="mt-7">
      <h2 id="smart-dashboard-section" class="sr-only">
        Smart Dashboard JuruTani
      </h2>
      <FeaturesHomeSmartDashboard />
    </section>

    <!-- ═══ Promotion Section (below fold: defer rendering hingga scroll dekat) ═══ -->
    <section aria-labelledby="promotion-section" class="mt-16 perf-section">
      <h2 id="promotion-section" class="sr-only">Promosi Spesial</h2>
      <LazyFeaturesHomePromotionSection />
    </section>

    <!-- ═══ Food Price Section ═══ -->
    <section aria-labelledby="food-price-section" class="mt-16 perf-section">
      <h2 id="food-price-section" class="sr-only">Informasi Harga Pangan</h2>
      <LazyFeaturesHomeFoodPriceSection />
    </section>

    <!-- ═══ News Section ═══ -->
    <section aria-labelledby="news-section" class="mt-16 perf-section">
      <h2 id="news-section" class="sr-only">Berita dan Informasi</h2>
      <LazyFeaturesHomeNewsSection />
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
  /*
  content-visibility: auto — CSS modern yang memberitahu browser untuk melewati
  layout & rendering element yang belum terlihat di viewport.
  Dampak: browser tidak perlu mem-paint semua 5 section sekaligus saat load,
  sehingga mengurangi Main-Thread work secara signifikan.
  Tidak mempengaruhi tampilan atau UX sama sekali.
*/
  .perf-section {
    content-visibility: auto;
    /* contain-intrinsic-size: memberitahu browser perkiraan ukuran
     sebelum elemen dirender, mencegah scroll jump */
    contain-intrinsic-size: 0 400px;
  }
</style>
