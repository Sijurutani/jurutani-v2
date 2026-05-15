<script setup lang="ts">
  // SEO Optimization
  useSeoMeta({
    title: 'Syarat & Ketentuan Layanan',
    description: 'Baca syarat & ketentuan layanan platform JuruTani. Ketahui dengan seksama berbagai perjanjian pengguna, aturan layanan, serta hak kewajiban Anda di sini.'
  })

  definePageMeta({
    layout: 'blank',
  })
</script>

<template>
  <div
    class="bg-gradient-to-br from-white/90 to-emerald-50/40 dark:from-neutral-900/90 dark:to-emerald-950/30 rounded-lg sm:rounded-2xl lg:rounded-[32px] shadow-sm border border-emerald-200/40 dark:border-emerald-700/30 p-4 sm:p-8 lg:p-12 overflow-hidden relative"
  >
    <!-- Decorative background elements -->
    <div
      class="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-gradient-to-br from-emerald-200/20 to-teal-200/10 dark:from-emerald-800/10 dark:to-teal-800/5 rounded-full blur-3xl opacity-40 pointer-events-none"
    />
    <div
      class="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-emerald-100/15 to-transparent dark:from-emerald-900/10 rounded-full blur-3xl opacity-30 pointer-events-none"
    />

    <!-- Header -->
    <div
      class="border-b border-emerald-200/40 dark:border-emerald-700/30 pb-5 sm:pb-8 mb-6 sm:mb-10 relative"
    >
      <h1
        class="text-2xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent mb-2 sm:mb-3"
      >
        Syarat &amp; Ketentuan
      </h1>
      <p
        class="text-xs sm:text-sm font-medium text-emerald-600/70 dark:text-emerald-400/70"
      >
        Terakhir diperbarui:
        {{
          new Date().toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }}
      </p>
    </div>

    <!-- Intro box -->
    <div
      class="mb-8 sm:mb-12 bg-gradient-to-br from-emerald-100/60 to-teal-100/40 dark:from-emerald-900/20 dark:to-teal-900/10 p-4 sm:p-8 rounded-xl sm:rounded-2xl border border-emerald-200/50 dark:border-emerald-700/40 backdrop-blur-sm"
    >
      <p
        class="text-sm sm:text-base text-emerald-900/80 dark:text-emerald-100/80 leading-relaxed mb-3"
      >
        Selamat datang di
        <strong class="text-emerald-700 dark:text-emerald-300 font-bold"
          >JuruTani</strong
        >
        (Platform Penyuluhan Digital Pertanian Indonesia), inovasi dari
        <strong class="text-emerald-700 dark:text-emerald-300 font-bold"
          >Politeknik Pembangunan Pertanian Yogyakarta Magelang</strong
        >. Dokumen ini berisi syarat dan ketentuan yang mengatur penggunaan
        platform dan semua layanan kami, termasuk konsultasi pertanian,
        marketplace, database komoditas, data cuaca, dan fitur edukasi.
      </p>
      <p
        class="text-sm sm:text-base text-emerald-900/80 dark:text-emerald-100/80 leading-relaxed"
      >
        Dengan mengakses platform ini, Anda secara otomatis setuju dengan semua
        ketentuan di bawah. Mohon membaca dengan cermat sebelum melanjutkan
        menggunakan layanan kami. Jika ada ketidakjelasan, silakan hubungi kami
        di
        <span class="text-emerald-700 dark:text-emerald-300 font-mono"
          >si.jurutani@gmail.com</span
        >.
      </p>
    </div>

    <!-- Sections -->
    <div class="space-y-6 sm:space-y-10 lg:space-y-12">
      <!-- Section 1 -->
      <section class="group">
        <h2
          class="flex items-center gap-3 sm:gap-4 text-base sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-3 sm:mb-5"
        >
          <span
            class="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800/50 dark:to-teal-800/50 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30"
            >1</span
          >
          Pengantar
        </h2>
        <div class="pl-10 sm:pl-14 space-y-3">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Dengan mengakses dan menggunakan platform
            <strong class="text-emerald-700 dark:text-emerald-300 font-semibold"
              >JuruTani</strong
            >
            ("Platform"), Anda setuju untuk terikat penuh oleh syarat dan
            ketentuan ini. Jika Anda tidak setuju dengan salah satu dari
            ketentuan ini, Anda tidak diperkenankan untuk menggunakan layanan
            kami dan harus berhenti mengakses platform.
          </p>
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Kami berhak untuk mengubah syarat dan ketentuan ini sewaktu-waktu
            tanpa pemberitahuan sebelumnya. Penggunaan platform setelah
            perubahan dianggap sebagai persetujuan Anda terhadap syarat yang
            diperbarui.
          </p>
        </div>
      </section>

      <!-- Section 2 -->
      <section class="group">
        <h2
          class="flex items-center gap-3 sm:gap-4 text-base sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-3 sm:mb-5"
        >
          <span
            class="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800/50 dark:to-teal-800/50 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30"
            >2</span
          >
          Penggunaan Layanan JuruTani
        </h2>
        <div class="pl-10 sm:pl-14 space-y-5">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 font-semibold"
          >
            JuruTani menyediakan layanan berikut:
          </p>
          <ul
            class="space-y-3 text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong class="text-emerald-700 dark:text-emerald-300"
                  >Konsultasi Pertanian Digital:</strong
                >
                Akses real-time dengan penyuluh pertanian profesional melalui
                chat, video call, dan forum diskusi</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong class="text-emerald-700 dark:text-emerald-300"
                  >Database Komoditas & Teknik Budidaya:</strong
                >
                Informasi lengkap tentang berbagai jenis tanaman, teknik
                budidaya, dan praktik terbaik pertanian</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong class="text-emerald-700 dark:text-emerald-300"
                  >Data Cuaca & Harga Pasar Real-Time:</strong
                >
                Prediksi cuaca akurat dan harga komoditas terkini untuk
                perencanaan pertanian yang optimal</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong class="text-emerald-700 dark:text-emerald-300"
                  >Marketplace Terintegrasi:</strong
                >
                Jual-beli pupuk, bibit, dan hasil panen langsung tanpa perantara
                dengan pembeli atau penjual terverifikasi</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong class="text-emerald-700 dark:text-emerald-300"
                  >Edukasi & Kursus:</strong
                >
                Materi pembelajaran, video tutorial, kursus pertanian, dan
                artikel edukatif dari ahli berpengalaman</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong class="text-emerald-700 dark:text-emerald-300"
                  >Alat Bantu Otomatis:</strong
                >
                Kalkulator pupuk, prediksi hasil panen, analisis keuntungan, dan
                tools pertanian lainnya</span
              >
            </li>
          </ul>
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 font-semibold mt-5"
          >
            Tanggung Jawab Pengguna:
          </p>
          <ul
            class="space-y-3 text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <span
                >Menjaga keamanan akun Anda dengan password yang kuat dan tidak
                membagikannya kepada orang lain.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <span
                >Memberikan informasi yang akurat dan benar saat melakukan
                registrasi dan transaksi di platform.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <span
                >Tidak menggunakan layanan untuk tindakan ilegal, manipulasi
                harga, penipuan transaksi, atau merugikan pihak lain.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <span
                >Tidak menjual, membeli, atau mendistribusikan produk palsu,
                terlarang, atau melanggar hukum melalui marketplace kami.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <span
                >Tidak mengirim spam, konten menyinggung, atau mencoba
                mengakses/meretas sistem keamanan platform kami.</span
              >
            </li>
          </ul>
          <div
            class="mt-4 p-4 bg-red-50/60 dark:bg-red-900/15 border border-red-200/50 dark:border-red-700/30 rounded-lg"
          >
            <p class="text-sm text-red-800 dark:text-red-300">
              <strong>Konsekuensi Pelanggaran:</strong> Kami berhak menangguhkan
              atau menghentikan akses pengguna, membatalkan transaksi, atau
              mengambil tindakan hukum sesuai peraturan yang berlaku tanpa
              memberikan pengembalian dana apa pun.
            </p>
          </div>
        </div>
      </section>

      <!-- Section 3 -->
      <section class="group">
        <h2
          class="flex items-center gap-3 sm:gap-4 text-base sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-3 sm:mb-5"
        >
          <span
            class="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800/50 dark:to-teal-800/50 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30"
            >3</span
          >
          Hak Kekayaan Intelektual
        </h2>
        <div class="pl-10 sm:pl-14 space-y-3">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Semua konten di platform ini, termasuk logo, teks, grafik, gambar,
            video, perangkat lunak, dan fitur lainnya adalah milik
            <strong class="text-emerald-700 dark:text-emerald-300 font-semibold"
              >JuruTani</strong
            >
            atau mitra kami, kecuali dinyatakan lain secara tegas.
          </p>
          <ul
            class="space-y-2 text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Dilarang:</strong> Menyalin, mendistribusikan, menjual,
                atau menggunakan konten tersebut tanpa izin tertulis dari
                kami.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Hak Pengguna:</strong> Konten yang Anda posting tetap
                menjadi milik Anda, namun Anda memberikan lisensi kepada
                JuruTani untuk menggunakan konten tersebut di platform.</span
              >
            </li>
          </ul>
        </div>
      </section>

      <!-- Section 4 -->
      <section class="group">
        <h2
          class="flex items-center gap-4 text-lg sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-5"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800/50 dark:to-teal-800/50 text-emerald-700 dark:text-emerald-300 text-sm font-bold shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30"
            >4</span
          >
          Tanggung Jawab &amp; Pembatasan Kewajiban
        </h2>
        <div class="pl-14 space-y-4">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Kami tidak bertanggung jawab atas kerugian, kerusakan, atau klaim
            yang timbul akibat penyalahgunaan platform ini. Penggunaan informasi
            dan layanan kami sepenuhnya menjadi risiko Anda sendiri.
          </p>
          <div
            class="bg-yellow-50/60 dark:bg-yellow-900/15 border border-yellow-200/50 dark:border-yellow-700/30 p-4 rounded-lg space-y-2"
          >
            <p
              class="font-semibold text-yellow-900 dark:text-yellow-300 text-sm"
            >
              Kami tidak memberikan jaminan:
            </p>
            <ul
              class="text-sm text-yellow-800/80 dark:text-yellow-200/80 space-y-2"
            >
              <li class="flex items-start gap-2">
                <span
                  class="h-1.5 w-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0"
                />
                Bahwa layanan akan selalu tersedia tanpa gangguan atau error
              </li>
              <li class="flex items-start gap-2">
                <span
                  class="h-1.5 w-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0"
                />
                Bahwa informasi di platform selalu akurat atau terkini
              </li>
              <li class="flex items-start gap-2">
                <span
                  class="h-1.5 w-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0"
                />
                Bahwa platform bebas dari kesalahan, bug, atau ancaman keamanan
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Section 5 -->
      <section class="group">
        <h2
          class="flex items-center gap-4 text-lg sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-5"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800/50 dark:to-teal-800/50 text-emerald-700 dark:text-emerald-300 text-sm font-bold shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30"
            >5</span
          >
          Penyelesaian Perselisihan
        </h2>
        <div class="pl-14 space-y-3">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Setiap perselisihan yang timbul dari syarat dan ketentuan ini akan
            diselesaikan sesuai dengan hukum yang berlaku di Indonesia. Anda
            setuju untuk menyelesaikan perselisihan melalui negosiasi atau
            arbitrase sebelum mengambil tindakan hukum.
          </p>
        </div>
      </section>

      <!-- Section 6 -->
      <section class="group">
        <h2
          class="flex items-center gap-4 text-lg sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-5"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800/50 dark:to-teal-800/50 text-emerald-700 dark:text-emerald-300 text-sm font-bold shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30"
            >6</span
          >
          Hubungi Kami
        </h2>
        <div class="pl-14 space-y-4">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Jika Anda memiliki pertanyaan, kekhawatiran, atau ingin melaporkan
            pelanggaran, silakan hubungi tim JuruTani melalui:
          </p>
          <div
            class="space-y-3 text-sm bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-lg border border-emerald-200/40 dark:border-emerald-700/30"
          >
            <p class="text-emerald-900/75 dark:text-emerald-100/75">
              <strong class="text-emerald-700 dark:text-emerald-300"
                >Email Utama:</strong
              >
              <span class="text-emerald-600 dark:text-emerald-400 font-mono"
                >si.jurutani@gmail.com</span
              >
            </p>
            <p class="text-emerald-900/75 dark:text-emerald-100/75">
              <strong class="text-emerald-700 dark:text-emerald-300"
                >WhatsApp/Telepon:</strong
              >
              <span class="text-emerald-600 dark:text-emerald-400 font-mono"
                >+62 856-6900-0010</span
              >
            </p>
            <p class="text-emerald-900/75 dark:text-emerald-100/75">
              <strong class="text-emerald-700 dark:text-emerald-300"
                >Lokasi Kantor:</strong
              >
              <span class="text-emerald-600 dark:text-emerald-400"
                >Jl. Kusumanegara No.2, Tahunan, Kec. Umbulharjo, Kota
                Yogyakarta, DIY 55167</span
              >
            </p>
            <p class="text-emerald-900/75 dark:text-emerald-100/75">
              <strong class="text-emerald-700 dark:text-emerald-300"
                >Jam Layanan:</strong
              >
              <span class="text-emerald-600 dark:text-emerald-400"
                >Senin - Jumat, 08.00 - 16.00 WIB</span
              >
            </p>
            <p class="text-emerald-900/75 dark:text-emerald-100/75">
              <strong class="text-emerald-700 dark:text-emerald-300"
                >Institusi:</strong
              >
              <span class="text-emerald-600 dark:text-emerald-400"
                >Politeknik Pembangunan Pertanian Yogyakarta Magelang</span
              >
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
ate>
