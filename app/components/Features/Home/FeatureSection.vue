<script setup lang="ts">
  // Data fitur-fitur Jurutani
  const features = [
    {
      id: 1,
      title: 'Konsultasi Pertanian',
      description:
        'Konsultasi langsung dengan pakar pertanian berpengalaman untuk hasil panen terbaik',
      icon: 'i-lucide-message-circle',
      image: '/feature/consult.webp',
      url: '/discussions',
      color: 'green',
    },
    {
      id: 2,
      title: 'Alat Pertanian',
      description:
        'Hitung kebutuhan pertanian Anda dengan kalkulator kami dan dapatkan rekomendasi terbaik',
      image: '/feature/cuaca.webp',
      color: 'blue',
      url: '/tools',
      icon: 'i-lucide-sun',
    },
    {
      id: 3,
      title: 'Marketplace Hasil Tani',
      description:
        'Jual hasil pertanian Anda langsung ke konsumen tanpa perantara',
      icon: 'i-lucide-store',
      image: '/feature/markets.webp',
      url: '/markets',
      color: 'orange',
    },
    {
      id: 4,
      title: 'Kursus & Pelatihan',
      description:
        'Tingkatkan pengetahuan dan keterampilan bertani melalui kursus online dan offline',
      icon: 'i-lucide-graduation-cap',
      image: '/feature/training.webp',
      url: '/courses',
      color: 'yellow',
    },
    {
      id: 5,
      title: 'Komunitas Petani',
      description:
        'Bergabung dengan komunitas petani untuk berbagi pengalaman dan pengetahuan',
      icon: 'i-lucide-users',
      image: '/feature/comunity.webp',
      url: '/discussions/group',
      color: 'indigo',
    },
    {
      id: 6,
      title: 'Daftar Harga Pangan',
      description:
        'Cek harga pangan terbaru dan terpercaya Daerah Istimewa Yogyakarta',
      icon: 'i-lucide-list',
      image: '/feature/priceslist.webp',
      url: '/food-prices',
      color: 'green',
    },
  ]
</script>

<template>
  <section class="features-section py-16 bg-green-50 dark:bg-green-900/20 mb-8">
    <UContainer>
      <!-- Section Header -->
      <div class="mx-auto mb-6 max-w-4xl text-center">
        <div
          class="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-linear-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full"
        >
          <UIcon
            name="i-lucide-pencil"
            class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
          />
          <span
            class="text-sm font-medium text-emerald-700 dark:text-emerald-300"
            >Fitur Terbaru</span
          >
        </div>
        <h2
          class="text-3xl pb-1 md:text-4xl lg:text-5xl font-bold mb-6 bg-linear-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent"
        >
          Layanan Si JuruTani
        </h2>
        <p
          class="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto"
        >
          Solusi lengkap untuk kebutuhan pertanian modern Anda dengan teknologi
          terkini:
          <span class="font-semibold text-emerald-600 dark:text-emerald-400">
            Diskusi dengan Penyuluh</span
          >,
          <span class="font-semibold text-teal-600 dark:text-teal-400"
            >Pakar JuruTani</span
          >, hingga
          <span class="font-semibold text-cyan-600 dark:text-cyan-400">AI</span>
          yang dibuat khusus untuk menyelesaikan permasalahan pertanian.
        </p>
      </div>

      <!-- Bento Features Grid -->
      <div class="bento-features-grid">
        <div
          v-for="feature in features"
          :key="feature.id"
          class="bento-card group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
        >
          <!-- Background Image with linear Overlay -->
          <div class="absolute inset-0">
            <NuxtImg
              :src="feature.image"
              :alt="feature.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <!-- linear Overlay - Enhanced with multiple layers -->
            <div
              class="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500"
            />
            <div
              class="absolute inset-0 bg-linear-to-br from-emerald-900/20 via-transparent to-green-900/20 group-hover:from-emerald-900/30 group-hover:to-green-900/30 transition-all duration-500"
            />
          </div>

          <!-- Content Overlay -->
          <div class="relative h-full flex flex-col justify-end p-6 md:p-8">
            <!-- Icon Badge - Hidden on Mobile -->
            <div class="absolute top-4 left-4 md:top-6 md:left-6">
              <span
                :class="[
                  `hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`,
                  `bg-${feature.color}-600`,
                ]"
              >
                <UIcon :name="feature.icon" class="w-4 h-4" />
                {{ feature.title }}
              </span>
            </div>

            <!-- Main Content -->
            <div
              class="space-y-3 md:space-y-4 transform transition-transform duration-500 ggroup-hover:-translate-y-2"
            >
              <h3
                class="font-bold text-white leading-tight line-clamp-2 transition-all duration-300 text-xl md:text-2xl"
              >
                {{ feature.title }}
              </h3>
              <p
                class="text-gray-200 leading-relaxed transition-all duration-300 text-sm md:text-base line-clamp-2"
              >
                {{ feature.description }}
              </p>
              <!-- View Details Button -->
              <NuxtLink
                :to="feature.url"
                class="flex items-center gap-2 text-white font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-sm md:text-base"
              >
                <span>Pelajari Lebih Lanjut</span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
                />
              </NuxtLink>
            </div>
            <!-- Animated Border on Hover -->
            <div
              class="absolute inset-0 border-2 border-transparent group-hover:border-green-400/50 rounded-2xl transition-all duration-500 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>

<style scoped>
  .bento-features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .bento-card {
    min-height: 400px;
  }

  /* Warna untuk icon */
  .bg-green-600 {
    background-color: #2e7d32;
  }
  .bg-blue-600 {
    background-color: #1e88e5;
  }
  .bg-orange-600 {
    background-color: #f57c00;
  }
  .bg-yellow-600 {
    background-color: #fdd835;
    color: #333;
  }
  .bg-indigo-600 {
    background-color: #3949ab;
  }
  .bg-cyan-600 {
    background-color: #00acc1;
  }

  /* Line clamp for title/desc */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (max-width: 1024px) {
    .bento-features-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
  }

  @media (max-width: 640px) {
    .bento-features-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .bento-card {
      min-height: 180px;
    }
  }
</style>
