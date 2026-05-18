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
  <div class="px-4 lg:px-6 flex flex-col gap-4">
    <!-- Section Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <!-- Badge glass sweep -->
        <div class="section-badge mb-3">
          <span class="section-badge__dot" />
          <span class="section-badge__text">Testimoni</span>
          <span class="section-badge__sweep" aria-hidden="true" />
        </div>
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
          Dipercaya Ribuan Petani Indonesia
        </h2>
        <p class="text-sm md:text-[15px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-xl">
          Bergabunglah bersama petani, penyuluh, dan pakar yang telah merasakan manfaat JuruTani.
        </p>
      </div>
    </div>

    <!-- Testimonials grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="t in testimonials"
        :key="t.id"
        class="flex flex-col gap-4 p-5 rounded-2xl bg-white dark:bg-green-950/30 border border-green-100/70 dark:border-green-800/30 shadow-sm hover:shadow-md hover:border-green-200 dark:hover:border-green-700 hover:-translate-y-0.5 transition-all duration-300 group"
      >
        <!-- Stars -->
        <div class="flex gap-0.5">
          <UIcon
            v-for="i in 5"
            :key="i"
            name="i-lucide-star"
            class="w-3.5 h-3.5 transition-colors"
            :class="i <= t.rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'"
          />
        </div>

        <!-- Quote text -->
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1 italic">
          "{{ t.text }}"
        </p>

        <!-- Author -->
        <div class="flex items-center gap-3 pt-3 border-t border-green-100 dark:border-green-800/30">
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

<style scoped>
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
