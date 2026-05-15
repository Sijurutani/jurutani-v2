<script setup lang="ts">
  const testimonials = [
    {
      id: 1,
      name: 'Budi Santoso',
      role: 'Petani Padi, Jawa Tengah',
      avatar: '/placeholder/user.webp',
      rating: 5,
      text: 'Sejak pakai JuruTani, saya bisa langsung konsultasi sama penyuluh tanpa harus ke kantor dinas. Hasil panen meningkat 30% tahun ini!',
    },
    {
      id: 2,
      name: 'Siti Rahayu',
      role: 'Peternak Ayam, Jawa Timur',
      avatar: '/placeholder/user.webp',
      rating: 5,
      text: 'Fitur harga pasar real-time sangat membantu saya menentukan waktu jual yang tepat. Untung makin besar karena tidak salah timing.',
    },
    {
      id: 3,
      name: 'Ahmad Fauzi',
      role: 'Petani Sayur, Sumatera Barat',
      avatar: '/placeholder/user.webp',
      rating: 5,
      text: 'Komunitas diskusinya aktif banget. Saya bisa dapat solusi masalah hama hanya dalam hitungan jam dari sesama petani dan pakar.',
    },
    {
      id: 4,
      name: 'Dewi Kusuma',
      role: 'Penyuluh Pertanian, Kalimantan',
      avatar: '/placeholder/user.webp',
      rating: 5,
      text: 'Platform ini membantu kerja saya sebagai penyuluh. Saya bisa menjangkau petani di daerah terpencil tanpa harus hadir langsung.',
    },
  ]
</script>

<template>
  <div class="max-w-6xl mx-auto px-4">
    <!-- Header -->
    <div class="text-center mb-10">
      <p class="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Testimoni</p>
      <h2 class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
        Dipercaya Ribuan Petani Indonesia
      </h2>
    </div>

    <!-- Testimonials grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div
        v-for="t in testimonials"
        :key="t.id"
        class="flex flex-col gap-4 p-5 rounded-2xl bg-white dark:bg-green-950/50 border border-green-100 dark:border-green-800/40 shadow-sm"
      >
        <!-- Stars -->
        <div class="flex gap-0.5">
          <UIcon
            v-for="i in 5"
            :key="i"
            name="i-lucide-star"
            class="w-4 h-4"
            :class="i <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'"
          />
        </div>

        <!-- Text -->
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1 italic">
          "{{ t.text }}"
        </p>

        <!-- Author -->
        <div class="flex items-center gap-3 pt-2 border-t border-green-100 dark:border-green-800/40">
          <NuxtImg
            :src="t.avatar"
            :alt="t.name"
            class="w-9 h-9 rounded-full object-cover ring-2 ring-green-200 dark:ring-green-800 shrink-0"
          />
          <div class="min-w-0">
            <p class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{{ t.name }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ t.role }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
