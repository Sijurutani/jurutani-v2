<script setup lang="ts">
  import { officeInfo } from '~/data/contact'
  import { useReveal } from '~/composables/useReveal'

  useSeoMeta({
    title: 'Hubungi JuruTani — Layanan & Kemitraan Agribisnis',
    description: 'Hubungi kontak JuruTani untuk layanan penyuluhan, penawaran kemitraan agribisnis, hingga bantuan kendala teknis. Tim kami siap merespon pertanyaan Anda.'
  })
  useReveal()

  const socialLinks = [
    {
      icon: 'i-lucide-instagram',
      label: 'Instagram',
      desc: 'Foto inspiratif & aktivitas pertanian',
      href: 'https://www.instagram.com/jurutani_/',
      bg: 'from-purple-500 via-pink-500 to-orange-500',
      borderHover: 'hover:border-purple-200 dark:hover:border-purple-800',
    },
    {
      icon: 'i-lucide-youtube',
      label: 'YouTube',
      desc: 'Video tutorial & edukasi',
      href: 'https://www.youtube.com/@Juru_Tani',
      bg: 'from-red-400 to-red-600',
      borderHover: 'hover:border-red-200 dark:hover:border-red-800',
    },
    {
      icon: 'i-lucide-message-circle',
      label: 'WhatsApp',
      desc: 'Layanan pesan cepat 24/7',
      href: 'https://api.whatsapp.com/send/?phone=6285669000010',
      bg: 'from-green-500 to-green-600',
      borderHover: 'hover:border-green-200 dark:hover:border-green-800',
    },
    {
      icon: 'i-lucide-mail',
      label: 'Email',
      desc: 'Pertanyaan bisnis & kemitraan',
      href: 'mailto:si.jurutani@gmail.com',
      bg: 'from-blue-500 to-blue-600',
      borderHover: 'hover:border-blue-200 dark:hover:border-blue-800',
    },
  ]
</script>

<template>
  <div class="min-h-screen">

    <!-- ════════ HERO ════════ -->
    <header class="pt-32 pb-12 flex flex-col items-center text-center px-5">

      <!-- Logo circle -->
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-full flex items-center justify-center shadow-lg
                    bg-white dark:bg-gray-900/60 border border-green-100 dark:border-gray-700">
          <NuxtImg
            src="/jurutani/small-transparent.webp"
            alt="JuruTani Logo"
            class="w-10 h-10"
            width="40"
            height="40"
          />
        </div>
      </div>

      <!-- Badge -->
      <div class="relative inline-flex items-center gap-[0.45rem] px-3.5 py-1.5 mb-6
                  bg-white/55 dark:bg-white/[0.08]
                  border border-white/70 dark:border-white/[0.18]
                  rounded-full backdrop-blur-md overflow-hidden
                  text-[0.7rem] font-bold tracking-[0.08em] uppercase
                  text-emerald-700 dark:text-emerald-300
                  shadow-[0_2px_12px_rgba(16,185,129,0.1)]">
        <span class="block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
        <span>Contact Us</span>
        <span
          class="absolute top-0 left-0 w-[55%] h-full pointer-events-none rounded-[inherit]"
          style="background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
                 animation: badge-sweep 3.5s ease-in-out infinite;"
          aria-hidden="true"
        />
      </div>

      <!-- Title -->
      <h1 class="text-[clamp(2.25rem,5vw,3.75rem)] font-black leading-[1.1] tracking-[-0.03em]
                 text-gray-900 dark:text-gray-50 mb-5">
        Hubungi Tim<br />
        <span class="block bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
          JuruTani
        </span>
      </h1>

      <!-- Description -->
      <p class="text-base leading-[1.7] text-gray-500 dark:text-gray-400 max-w-[38rem] mb-7">
        Kami siap membantu. Sampaikan pertanyaan, saran, atau ajakan
        kerjasama Anda melalui saluran di bawah ini.
      </p>

      <!-- Stats -->
      <div class="flex flex-wrap items-center justify-center gap-6">
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-[1.375rem] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">24/7</span>
          <span class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-gray-400">Dukungan</span>
        </div>
        <div class="w-px h-8 shrink-0" style="background: linear-gradient(to bottom, transparent, rgba(134,239,172,0.5), transparent)" />
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-[1.375rem] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">&lt; 24h</span>
          <span class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-gray-400">Respons</span>
        </div>
        <div class="w-px h-8 shrink-0" style="background: linear-gradient(to bottom, transparent, rgba(134,239,172,0.5), transparent)" />
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-[1.375rem] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">98%</span>
          <span class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-gray-400">Kepuasan</span>
        </div>
      </div>
    </header>

    <!-- ════════ CONTENT ════════ -->
    <div class="max-w-[76rem] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-24 sm:pb-32">

      <!-- ── Saluran Komunikasi ── -->
      <section>
        <div class="mb-10 app-reveal text-center max-w-2xl mx-auto">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Saluran Komunikasi
          </h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Pilih metode yang paling nyaman untuk Anda terhubung dengan kami
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink
            v-for="(s, i) in socialLinks"
            :key="s.label"
            :to="s.href"
            external
            target="_blank"
            class="app-reveal group bg-white dark:bg-gray-800/80 rounded-2xl shadow-sm p-6
                   flex flex-col items-center text-center no-underline
                   border border-gray-100 dark:border-gray-700
                   hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)]
                   active:scale-95
                   transition-all duration-300"
            :class="s.borderHover"
            :style="{ '--delay': `${i * 100}ms` }"
          >
            <!-- Icon wrapper -->
            <div
              class="p-4 rounded-2xl mb-4 shadow-lg bg-gradient-to-br
                     group-hover:scale-110 transition-transform duration-300"
              :class="s.bg"
            >
              <UIcon :name="s.icon" class="w-8 h-8 text-white" />
            </div>

            <h3 class="text-base font-bold text-gray-800 dark:text-gray-200 mb-2">
              {{ s.label }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              {{ s.desc }}
            </p>

            <!-- CTA pill -->
            <div
              class="mt-auto text-white text-xs py-2 px-6 rounded-full font-semibold
                     shadow-md group-hover:shadow-lg transition-shadow duration-300
                     bg-gradient-to-r"
              :class="s.bg"
            >
              Hubungi
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- ── Lokasi Kantor ── -->
      <section class="mt-20">
        <div class="mb-10 app-reveal text-center max-w-2xl mx-auto">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Lokasi Kantor
          </h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Mari datang dan berdiskusi dengan tim JuruTani secara langsung
          </p>
        </div>

        <div class="app-reveal bg-white dark:bg-gray-800/80 rounded-3xl shadow-lg overflow-hidden
                    border border-green-100 dark:border-gray-700
                    hover:shadow-[0_24px_48px_-12px_rgba(22,163,74,0.15)]
                    transition-shadow duration-300">
          <div class="grid lg:grid-cols-3">

            <!-- Sidebar -->
            <div class="p-8 lg:p-10 flex flex-col justify-center bg-gray-50/50 dark:bg-gray-800/30">
              <!-- Address -->
              <div class="mb-8">
                <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40
                            flex items-center justify-center mb-4
                            text-green-600 dark:text-green-400">
                  <UIcon name="i-lucide-map-pin" class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Alamat Kantor</h3>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  {{ officeInfo.address }}
                </p>
              </div>

              <!-- Hours -->
              <div class="mb-10">
                <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40
                            flex items-center justify-center mb-4
                            text-green-600 dark:text-green-400">
                  <UIcon name="i-lucide-clock" class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Jam Operasional</h3>
                <p class="text-gray-600 dark:text-gray-300 text-sm mb-1">{{ officeInfo.hours }}</p>
                <p class="text-gray-500 dark:text-gray-400 text-xs">Sabtu – Minggu: Tutup</p>
              </div>

              <UButton
                :to="officeInfo.mapLink"
                target="_blank"
                size="lg"
                block
                color="primary"
                class="shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <UIcon name="i-lucide-map" class="mr-2 w-5 h-5" />
                Buka di Google Maps
              </UButton>
            </div>

            <!-- Map iframe -->
            <div class="lg:col-span-2 relative min-h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.0446280892394!2d110.39089007501!3d-7.789999992218!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5a1c5c8c8c8d%3A0x1c8c8c8c8c8c8c8c!2sJl.%20Kusumanegara%20No.2%2C%20Yogyakarta!5e0!3m2!1sid!2sid!4v1704430000000!5m2!1sid!2sid"
                class="absolute inset-0 w-full h-full border-0 grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                :allowfullscreen="true"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Lokasi Kantor JuruTani"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style>
/* Hanya keyframe yang tidak bisa dilakukan murni Tailwind */
@keyframes badge-sweep {
  0%   { transform: translateX(-200%); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateX(280%); opacity: 0; }
}
</style>