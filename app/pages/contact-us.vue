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
      icon: 'i-lucide-message-circle', // WhatsApp
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
    <!-- Hero -->
    <CommonPageHeroSection
      title="Hubungi Tim"
      title-accent="JuruTani"
      subtitle="Kami siap membantu. Sampaikan pertanyaan, saran, atau ajakan kerjasama Anda melalui saluran di bawah ini."
      :badge="{ text: 'Contact Us', icon: 'i-lucide-mail' }"
      decorative="gradient"
      align="center"
      :stats="[
        { value: '24/7', label: 'Dukungan' },
        { value: '< 24h', label: 'Respons' },
        { value: '98%', label: 'Kepuasan' },
      ]"
      class="app-reveal"
    />

    <div class="cu-wrap">
      <!-- Media Sosial & Kontak Cepat -->
      <section>
        <CommonSectionHeader
          title="Saluran Komunikasi"
          subtitle="Pilih metode yang paling nyaman untuk Anda terhubung dengan kami"
          align="center"
          class="mb-10 app-reveal"
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink
            v-for="(s, i) in socialLinks"
            :key="s.label"
            :to="s.href"
            external
            target="_blank"
            class="app-reveal social-media-card group bg-white dark:bg-gray-800/80 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center hover:-translate-y-1 active:scale-95 transition-all duration-300 border border-gray-100 dark:border-gray-700"
            :class="s.borderHover"
            :style="{ '--delay': `${i * 100}ms` }"
          >
            <div
              class="icon-wrapper p-4 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 bg-linear-to-br"
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
            <div
              class="mt-auto text-white text-xs py-2 px-6 rounded-full font-semibold shadow-md group-hover:shadow-lg transition-shadow duration-300 bg-linear-to-r"
              :class="s.bg"
            >
              Hubungi
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Informasi Kantor & Peta -->
      <section class="mt-20">
        <CommonSectionHeader
          title="Lokasi Kantor"
          subtitle="Mari datang dan berdiskusi dengan tim JuruTani secara langsung"
          align="center"
          class="mb-10 app-reveal"
        />
        <div class="app-reveal cu-map-card bg-white dark:bg-gray-800/80 rounded-3xl shadow-lg overflow-hidden border border-green-100 dark:border-gray-700">
          <div class="grid lg:grid-cols-3">
            <!-- Sidebar Office Info -->
            <div class="p-8 lg:p-10 flex flex-col justify-center bg-gray-50/50 dark:bg-gray-800/30">
              <div class="mb-8">
                <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                  <UIcon name="i-lucide-map-pin" class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Alamat Kantor</h3>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  {{ officeInfo.address }}
                </p>
              </div>

              <div class="mb-10">
                <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
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

            <!-- Map Iframe -->
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

<style scoped>
  .cu-wrap {
    max-width: 76rem;
    margin: 0 auto;
    padding: 3rem 1.25rem 6rem;
  }
  @media (min-width: 640px) {
    .cu-wrap {
      padding: 4rem 2rem 8rem;
    }
  }

  /* Social Media Grid Styling from discussions/group */
  .social-media-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .social-media-card:hover {
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.12);
  }

  .icon-wrapper {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Map Card Styling */
  .cu-map-card {
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  .cu-map-card:hover {
    box-shadow: 0 24px 48px -12px rgba(22, 163, 74, 0.15);
  }
</style>
