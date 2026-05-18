<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import {
    galleryData,
    innovationPoints,
    platformAdvantages,
    visionMission,
    institutionHighlights,
    teamCategories,
  } from '~/data/about'
  import { useReveal } from '~/composables/useReveal'

  useSeoMeta({
    title: 'Tentang JuruTani — Platform Penyuluhan Digital Polbangtan',
    description: 'JuruTani adalah platform penyuluhan digital resmi bentukan Polbangtan. Kami hadir mendukung petani Indonesia lewat edukasi dan inovasi agribisnis terpadu.'
  })
  useReveal()
</script>

<template>
  <main class="min-h-screen font-sans">
    <!-- ════════ HERO ════════ -->
    <header class="pt-32 pb-12 flex flex-col items-center text-center px-5">
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

      <div
        class="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-6
               bg-white/55 dark:bg-white/[0.08]
               border border-white/70 dark:border-white/[0.18]
               rounded-full backdrop-blur-md
               text-[0.7rem] font-bold tracking-widest uppercase
               text-emerald-700 dark:text-emerald-300
               shadow-[0_2px_12px_rgba(16,185,129,0.1)]
               overflow-hidden"
      >
        <span class="block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
        <span>Platform Inovasi Pertanian</span>
        <span
          class="absolute top-0 left-0 w-[55%] h-full pointer-events-none rounded-[inherit]"
          style="background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
                 animation: badge-sweep 3.5s ease-in-out infinite;"
          aria-hidden="true"
        />
      </div>

      <h1 class="text-[clamp(2.25rem,5vw,3.75rem)] font-black leading-[1.1] tracking-tight text-gray-900 dark:text-gray-50 mb-5">
        Si JuruTani<br />
        <span class="bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
          Platform Penyuluhan Digital
        </span>
      </h1>

      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400 max-w-[38rem] mb-7">
        Inovasi dari Politeknik Pembangunan Pertanian Yogyakarta Magelang
        untuk memajukan pertanian Indonesia di era digital.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-6 mb-8">
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-[1.375rem] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">2024</span>
          <span class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-gray-400">Tahun Berdiri</span>
        </div>

        <div class="w-px h-8 flex-shrink-0" style="background: linear-gradient(to bottom, transparent, rgba(134,239,172,0.5), transparent)" />

        <div class="flex flex-col items-center gap-0.5">
          <span class="text-[1.375rem] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">6+</span>
          <span class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-gray-400">Fitur Utama</span>
        </div>

        <div class="w-px h-8 flex-shrink-0" style="background: linear-gradient(to bottom, transparent, rgba(134,239,172,0.5), transparent)" />

        <div class="flex flex-col items-center gap-0.5">
          <span class="text-[1.375rem] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">100%</span>
          <span class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-gray-400">Untuk Petani</span>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 justify-center">
        <NuxtLink
          to="/courses"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                 bg-green-600 dark:bg-green-500 text-white
                 border border-green-600 dark:border-green-500
                 hover:bg-green-700 dark:hover:bg-green-400
                 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(22,163,74,0.35)]
                 transition-all duration-200 no-underline whitespace-nowrap"
        >
          <UIcon name="i-lucide-graduation-cap" class="w-4 h-4" />
          Mulai Belajar
        </NuxtLink>
        <NuxtLink
          to="/contact-us"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                 bg-transparent text-green-700 dark:text-green-200
                 border border-green-600/40 dark:border-emerald-400/25
                 hover:bg-green-600/[0.07] dark:hover:bg-emerald-400/[0.06]
                 hover:border-green-600 dark:hover:border-emerald-400/50
                 hover:-translate-y-px
                 transition-all duration-200 no-underline whitespace-nowrap"
        >
          Hubungi Kami
        </NuxtLink>
      </div>
    </header>

    <div class="max-w-[72rem] mx-auto px-5 sm:px-8 py-16 flex flex-col gap-16">
      <!-- ════════ TENTANG ════════ -->
      <section class="grid lg:grid-cols-2 gap-10 items-start">
        <div class="app-reveal">
          <div
            class="relative inline-flex items-center gap-2 px-3.5 py-1.5 mb-6
                   bg-white/55 dark:bg-white/[0.08]
                   border border-white/70 dark:border-white/[0.18]
                   rounded-full backdrop-blur-md
                   text-[0.7rem] font-bold tracking-widest uppercase
                   text-emerald-700 dark:text-emerald-300
                   shadow-[0_2px_12px_rgba(16,185,129,0.1)]
                   overflow-hidden"
          >
            <span class="block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <UIcon name="i-lucide-sprout" class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
            <span>Platform Inovasi</span>
            <span
              class="absolute top-0 left-0 w-[55%] h-full pointer-events-none rounded-[inherit]"
              style="background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
                     animation: badge-sweep 3.5s ease-in-out infinite;"
              aria-hidden="true"
            />
          </div>

          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Apa itu <span class="bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Si JuruTani?</span>
          </h2>

          <blockquote class="text-sm sm:text-base italic font-medium text-emerald-700 dark:text-emerald-200
                              border-l-4 border-emerald-600/80 bg-emerald-50/60 dark:bg-emerald-500/10
                              rounded-r-lg px-4 py-3 mb-4">
            Menghubungkan teknologi modern dengan kearifan pertanian
            tradisional Indonesia.
          </blockquote>

          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
            <strong>Si JuruTani</strong> lahir dari mahasiswa dan dosen
            <strong>Polbangtan Yogyakarta Magelang</strong> — ekosistem
            digital yang menjembatani petani dengan penyuluh, pakar, dan pasar
            secara terpadu.
          </p>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Dengan antarmuka intuitif, petani dapat meningkatkan produktivitas
            dan keberlanjutan usaha tani secara mandiri kapan pun dan di mana
            pun.
          </p>
        </div>

        <div class="app-reveal">
          <p class="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-gray-400 mb-4">
            Inovasi Penyuluhan Digital
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="p in innovationPoints"
              :key="p.title"
              class="flex items-start gap-3 p-3 rounded-xl
                     bg-white/70 dark:bg-white/5
                     border border-emerald-100/70 dark:border-emerald-900/40
                     shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div class="w-8 h-8 rounded-lg bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <UIcon :name="p.icon" class="w-4 h-4" />
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-white mb-1">{{ p.title }}</p>
                <p class="text-[0.72rem] text-gray-600 dark:text-gray-300 leading-relaxed">{{ p.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ════════ VISI & MISI ════════ -->
      <section class="space-y-10">
        <div class="app-reveal text-center max-w-2xl mx-auto">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Visi & Misi
          </h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Arah dan komitmen JuruTani dalam memajukan pertanian Indonesia
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-5">
          <div class="app-reveal p-7 rounded-2xl bg-white dark:bg-white/5 border border-emerald-100/70 dark:border-emerald-900/40 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center">
                <UIcon :name="visionMission.vision.icon" class="w-5 h-5 text-white" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ visionMission.vision.title }}
              </h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ visionMission.vision.content }}
            </p>
          </div>

          <div class="app-reveal p-7 rounded-2xl bg-white dark:bg-white/5 border border-emerald-100/70 dark:border-emerald-900/40 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <UIcon :name="visionMission.mission.icon" class="w-5 h-5 text-white" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ visionMission.mission.title }}
              </h3>
            </div>
            <ul class="space-y-2.5">
              <li
                v-for="item in visionMission.mission.items"
                :key="item"
                class="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
              >
                <span class="w-5 h-5 rounded-full bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <UIcon name="i-lucide-check" class="w-3 h-3" />
                </span>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ════════ KEUNGGULAN ════════ -->
      <section class="space-y-10">
        <div class="app-reveal text-center max-w-2xl mx-auto">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Keunggulan Kompetitif
          </h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Fitur unggulan yang dirancang khusus untuk kebutuhan petani Indonesia
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="f in platformAdvantages"
            :key="f.title"
            class="app-reveal p-6 rounded-2xl border border-emerald-100/70 dark:border-emerald-900/40
                   bg-white dark:bg-white/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center mb-4">
              <UIcon :name="f.icon" class="w-5 h-5 text-white" />
            </div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-2">
              {{ f.title }}
            </h3>
            <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ f.description }}
            </p>
          </div>
        </div>
      </section>

      <!-- ════════ GALERI ════════ -->
      <section class="space-y-10">
        <div class="app-reveal text-center max-w-2xl mx-auto">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Galeri Inovasi
          </h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Perjalanan pengembangan JuruTani sebagai platform penyuluhan digital
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 app-reveal">
          <div
            v-for="(item, i) in galleryData"
            :key="i"
            class="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-emerald-950/60"
            :class="{ 'sm:col-span-2 lg:col-span-2': i === 0 }"
          >
            <NuxtImg
              :src="item.src"
              :alt="item.alt || item.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div class="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p class="text-sm font-bold text-white mb-1">{{ item.title }}</p>
              <p class="text-xs text-white/80 leading-relaxed">{{ item.description }}</p>
            </div>
            <span class="absolute top-3 left-3 text-[0.65rem] font-bold text-white px-2.5 py-1 rounded-full bg-black/50 backdrop-blur">
              {{ item.title }}
            </span>
          </div>
        </div>
      </section>

      <!-- ════════ INSTITUSI ════════ -->
      <section class="app-reveal rounded-2xl border border-emerald-100/70 dark:border-emerald-900/40 bg-white dark:bg-white/5 overflow-hidden">
        <div class="flex flex-wrap items-center gap-5 p-7 bg-emerald-50/70 dark:bg-white/5 border-b border-emerald-100/70 dark:border-emerald-900/40">
          <NuxtImg
            src="/logo/polbangtanyoma.webp"
            alt="Polbangtan Yogyakarta Magelang"
            class="h-16 w-auto object-contain"
          />
          <div>
            <h2 class="text-base font-bold text-gray-900 dark:text-white mb-1">
              Polbangtan Yogyakarta Magelang
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Politeknik Pembangunan Pertanian — Kementerian Pertanian RI
            </p>
          </div>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          <div
            v-for="h in institutionHighlights"
            :key="h.title"
            class="text-center p-4 rounded-xl bg-emerald-50/60 dark:bg-white/5 border border-emerald-100/70 dark:border-emerald-900/40"
          >
            <div class="w-9 h-9 rounded-lg bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3">
              <UIcon :name="h.icon" class="w-4 h-4" />
            </div>
            <p class="text-sm font-bold text-gray-900 dark:text-white mb-1">{{ h.title }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-300">{{ h.description }}</p>
          </div>
        </div>
      </section>

      <!-- ════════ TIM ════════ -->
      <section class="space-y-10">
        <div class="app-reveal text-center max-w-2xl mx-auto">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Tim Pengembang
          </h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Mahasiswa dan Dosen Polbangtan Yogyakarta Magelang
          </p>
        </div>

        <div class="app-reveal relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-10">
          <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
          <div class="grid md:grid-cols-2 gap-4 relative z-10">
            <div
              v-for="team in teamCategories"
              :key="team.title"
              class="p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <UIcon :name="team.icon" class="w-5 h-5 text-white" />
                </div>
                <h4 class="text-sm font-bold text-white">{{ team.title }}</h4>
              </div>
              <ul class="space-y-2">
                <li v-for="item in team.items" :key="item" class="flex items-start gap-2 text-[0.82rem] text-emerald-100/90 leading-relaxed">
                  <UIcon name="i-lucide-check" class="w-3.5 h-3.5 text-emerald-200 shrink-0 mt-0.5" />
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ════════ CTA ════════ -->
      <section>
        <div
          class="app-reveal relative overflow-hidden rounded-3xl text-center
                 bg-gray-50 dark:bg-gradient-to-br dark:from-green-950 dark:via-[#052e16] dark:to-[#022c22]
                 border border-gray-100 dark:border-emerald-900/30
                 dark:shadow-[0_20px_60px_-12px_rgba(5,46,22,0.5),0_0_0_1px_rgba(134,239,172,0.06)]"
        >
          <div class="absolute w-[300px] h-[300px] top-[-90px] right-[-30px] rounded-full border border-emerald-400/10 pointer-events-none" />
          <div class="absolute w-[180px] h-[180px] bottom-[-55px] left-[-35px] rounded-full border border-emerald-400/10 pointer-events-none" />
          <div
            class="absolute inset-0 opacity-[0.03] pointer-events-none"
            style="background-image: radial-gradient(circle at 1px 1px, rgba(134,239,172,0.8) 1px, transparent 0); background-size: 24px 24px;"
          />

          <div class="relative z-10 px-8 py-10">
            <div class="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-4
                        bg-white/55 dark:bg-white/[0.08]
                        border border-white/70 dark:border-white/[0.18]
                        rounded-full backdrop-blur-md
                        text-[0.7rem] font-bold tracking-widest uppercase
                        text-emerald-700 dark:text-emerald-300
                        overflow-hidden">
              <span class="block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span>Bergabunglah Bersama Kami</span>
              <span
                class="absolute top-0 left-0 w-[55%] h-full pointer-events-none rounded-[inherit]"
                style="background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
                       animation: badge-sweep 3.5s ease-in-out infinite;"
                aria-hidden="true"
              />
            </div>

            <h2 class="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-tight leading-[1.15] text-gray-900 dark:text-gray-50 mb-3.5">
              Siap Memajukan<br />
              <span class="bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Pertanian Indonesia?
              </span>
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-200 leading-[1.65] max-w-[30rem] mx-auto mb-7">
              Bergabunglah dengan ribuan petani yang telah merasakan manfaat JuruTani.
            </p>
            <div class="flex flex-wrap gap-3 justify-center">
              <NuxtLink
                to="/auth/register"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                       bg-green-600 dark:bg-green-500 text-white
                       border border-green-600 dark:border-green-500
                       hover:bg-green-700 dark:hover:bg-green-400
                       hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(22,163,74,0.35)]
                       transition-all duration-200 no-underline whitespace-nowrap"
              >
                <UIcon name="i-lucide-user-plus" class="w-4 h-4" />
                Daftar Gratis
              </NuxtLink>
              <NuxtLink
                to="/contact-us"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                       bg-transparent text-green-700 dark:text-green-200
                       border border-green-600/40 dark:border-emerald-400/25
                       hover:bg-green-600/[0.07] dark:hover:bg-emerald-400/[0.06]
                       hover:border-green-600 dark:hover:border-emerald-400/50
                       hover:-translate-y-px
                       transition-all duration-200 no-underline whitespace-nowrap"
              >
                <UIcon name="i-lucide-mail" class="w-4 h-4" />
                Hubungi Kami
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style>
@keyframes badge-sweep {
  0% { transform: translateX(-200%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateX(280%); opacity: 0; }
}
</style>
