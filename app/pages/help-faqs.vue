<script setup lang="ts">
  import { faqCategories, faqData } from '~/data/faq'
  import { useReveal } from '~/composables/useReveal'

  useSeoMeta({
    title: 'Pusat Bantuan & Panduan Penggunaan',
    description: 'Pusat bantuan platform JuruTani. Temukan kumpulan FAQ, panduan tutorial fitur, serta kontak bantuan teknis bagi seluruh pengguna layanan penyuluhan kami.'
  })
  useReveal()

  const categories = faqCategories.map((cat, index) => ({
    ...cat,
    id: cat.id,
    label: cat.name,
    number: `0${index + 1}`,
  }))

  const scrollToFaqs = () => {
    if (!import.meta.client) return
    document.getElementById('faq-content')?.scrollIntoView({ behavior: 'smooth' })
  }
</script>

<template>
  <div class="font-sans">

    <!-- ════════ HERO ════════ -->
    <header class="pt-32 pb-12 flex flex-col items-center text-center px-5">

      <!-- Logo circle -->
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-white dark:bg-gray-900/60 border border-green-100 dark:border-gray-700">
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
      <div class="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-6
                  bg-white/55 dark:bg-white/[0.08]
                  border border-white/70 dark:border-white/[0.18]
                  rounded-full backdrop-blur-md
                  text-[0.7rem] font-bold tracking-widest uppercase
                  text-emerald-700 dark:text-emerald-300
                  shadow-[0_2px_12px_rgba(16,185,129,0.1)]
                  overflow-hidden">
        <span class="block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
        <span>Pusat Bantuan</span>
        <!-- sweep shimmer — pure CSS via inline style because Tailwind has no built-in keyframe for this -->
        <span
          class="absolute top-0 left-0 w-[55%] h-full pointer-events-none rounded-[inherit]"
          style="background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
                 animation: badge-sweep 3.5s ease-in-out infinite;"
          aria-hidden="true"
        />
      </div>

      <!-- Title -->
      <h1 class="text-[clamp(2.25rem,5vw,3.75rem)] font-black leading-[1.1] tracking-tight text-gray-900 dark:text-gray-50 mb-5">
        Semua Jawaban yang<br />
        <span class="bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
          Anda Butuhkan
        </span>
      </h1>

      <!-- Description -->
      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400 max-w-[38rem] mb-7">
        Temukan jawaban lengkap, panduan langkah demi langkah, dan solusi
        untuk setiap pertanyaan seputar platform JuruTani.
      </p>

      <!-- Stats -->
      <div class="flex flex-wrap items-center justify-center gap-6 mb-8">
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-[1.375rem] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">10K+</span>
          <span class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-gray-400">Pertanyaan</span>
        </div>

        <div class="w-px h-8 flex-shrink-0" style="background: linear-gradient(to bottom, transparent, rgba(134,239,172,0.5), transparent)" />

        <div class="flex flex-col items-center gap-0.5">
          <span class="text-[1.375rem] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">98%</span>
          <span class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-gray-400">Kepuasan</span>
        </div>

        <div class="w-px h-8 flex-shrink-0" style="background: linear-gradient(to bottom, transparent, rgba(134,239,172,0.5), transparent)" />

        <div class="flex flex-col items-center gap-0.5">
          <span class="text-[1.375rem] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">24/7</span>
          <span class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-gray-400">Dukungan</span>
        </div>
      </div>

      <!-- Scroll CTA -->
      <button
        class="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5
               rounded-full border border-gray-200 dark:border-gray-700
               bg-white/50 dark:bg-white/[0.05]
               text-gray-600 dark:text-gray-300
               text-[0.8125rem] font-semibold
               hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20
               transition-colors duration-200 cursor-pointer"
        @click="scrollToFaqs"
      >
        <UIcon name="i-lucide-chevrons-down" class="w-4 h-4" />
        Lihat Semua Pertanyaan
      </button>
    </header>

    <!-- ════════ FAQ CONTENT ════════ -->
    <div id="faq-content" class="max-w-[52rem] mx-auto px-5 sm:px-8 pt-8 pb-20 sm:pb-22 flex flex-col gap-14">

      <!-- Category sections -->
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="app-reveal"
      >
        <!-- Category header -->
        <div class="flex items-center gap-3.5 mb-3.5">
          <!-- Number badge — Solar Flare gradient -->
          <span class="shrink-0 inline-flex items-center justify-center w-[2.375rem] h-[2.375rem]
                       rounded-lg text-white text-xs font-extrabold tracking-[0.04em]"
                style="background: linear-gradient(90deg, #ffaa00, #ff6600, #eb001a)">
            {{ cat.number }}
          </span>

          <div class="flex items-center gap-2">
            <UIcon :name="cat.icon" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 class="text-[1.0625rem] font-bold tracking-tight leading-snug text-emerald-600 dark:text-emerald-400">
              {{ cat.label }}
            </h2>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px bg-gray-100 dark:bg-gray-800 mb-4 rounded-sm" />

        <!-- Accordion items -->
        <AppFaqAccordion :items="faqData[cat.id]" />
      </div>

      <!-- ════════ CTA BOX ════════ -->
      <div class="app-reveal relative overflow-hidden rounded-3xl text-center
                  bg-gray-50 dark:bg-gradient-to-br dark:from-green-950 dark:via-[#052e16] dark:to-[#022c22]
                  border border-gray-100 dark:border-emerald-900/30
                  dark:shadow-[0_20px_60px_-12px_rgba(5,46,22,0.5),0_0_0_1px_rgba(134,239,172,0.06)]">

        <!-- Decorative rings -->
        <div class="absolute w-[300px] h-[300px] top-[-90px] right-[-30px] rounded-full
                    border border-emerald-400/10 pointer-events-none" />
        <div class="absolute w-[180px] h-[180px] bottom-[-55px] left-[-35px] rounded-full
                    border border-emerald-400/10 pointer-events-none" />

        <!-- Dot grid -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
             style="background-image: radial-gradient(circle at 1px 1px, rgba(134,239,172,0.8) 1px, transparent 0); background-size: 24px 24px;" />

        <!-- Inner -->
        <div class="relative z-10 px-8 py-10">

          <!-- Logo -->
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
          <div class="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-4
                      bg-white/55 dark:bg-white/[0.08]
                      border border-white/70 dark:border-white/[0.18]
                      rounded-full backdrop-blur-md
                      text-[0.7rem] font-bold tracking-widest uppercase
                      text-emerald-700 dark:text-emerald-300
                      overflow-hidden">
            <span class="block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span>Masih Bingung?</span>
            <span class="absolute top-0 left-0 w-[55%] h-full pointer-events-none rounded-[inherit]"
                  style="background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
                         animation: badge-sweep 3.5s ease-in-out infinite;"
                  aria-hidden="true" />
          </div>

          <!-- Heading -->
          <h2 class="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-tight leading-[1.15]
                     text-gray-900 dark:text-gray-50 mb-3.5">
            Kami siap membantu<br />
            <span class="bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Anda
            </span>
          </h2>

          <!-- Sub -->
          <p class="text-sm text-gray-500 dark:text-gray-200 leading-[1.65] max-w-[30rem] mx-auto mb-7">
            Jika pertanyaan Anda belum terjawab, hubungi tim support kami atau
            bertanya langsung ke komunitas petani JuruTani.
          </p>

          <!-- Buttons -->
          <div class="flex flex-wrap gap-3 justify-center">
            <NuxtLink
              to="/contact-us"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                     bg-green-600 dark:bg-green-500 text-white
                     border border-green-600 dark:border-green-500
                     hover:bg-green-700 dark:hover:bg-green-400
                     hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(22,163,74,0.35)]
                     transition-all duration-200 no-underline whitespace-nowrap"
            >
              <UIcon name="i-lucide-send" class="w-4 h-4" />
              Hubungi Support
            </NuxtLink>

            <NuxtLink
              to="/discussions"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                     bg-transparent text-green-700 dark:text-green-200
                     border border-green-600/40 dark:border-emerald-400/25
                     hover:bg-green-600/[0.07] dark:hover:bg-emerald-400/[0.06]
                     hover:border-green-600 dark:hover:border-emerald-400/50
                     hover:-translate-y-px
                     transition-all duration-200 no-underline whitespace-nowrap"
            >
              <UIcon name="i-lucide-users" class="w-4 h-4" />
              Tanya Komunitas
            </NuxtLink>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style>
/* Hanya keyframe animasi yang tidak bisa dilakukan murni Tailwind */
@keyframes badge-sweep {
  0%   { transform: translateX(-200%); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateX(280%); opacity: 0; }
}
</style>