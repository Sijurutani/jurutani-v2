<script setup lang="ts">
  // SEO Optimization
  useSeoMeta({
    title: 'Kebijakan Privasi — Perlindungan Data Pengguna JuruTani',
    description: 'Kebijakan privasi JuruTani menjelaskan cara komprehensif kami dalam mengumpulkan, memproses, dan senantiasa melindungi data pribadi pengguna platform ini.'
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
        Kebijakan Privasi
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
        <strong class="text-emerald-700 dark:text-emerald-300 font-bold"
          >JuruTani</strong
        >
        (Platform Penyuluhan Digital Pertanian Indonesia) sangat menghargai
        privasi dan keamanan data Anda. Kami adalah inovasi dari
        <strong class="text-emerald-700 dark:text-emerald-300 font-bold"
          >Politeknik Pembangunan Pertanian Yogyakarta Magelang</strong
        >
        yang berkomitmen untuk melindungi informasi pribadi sesuai standar
        internasional dan regulasi Indonesia.
      </p>
      <p
        class="text-sm sm:text-base text-emerald-900/80 dark:text-emerald-100/80 leading-relaxed"
      >
        Kebijakan privasi ini menjelaskan secara detail bagaimana kami
        mengumpulkan, menggunakan, menyimpan, melindungi, dan membagikan
        informasi pribadi Anda saat menggunakan platform konsultasi pertanian,
        marketplace, database komoditas, layanan cuaca, dan fitur edukasi kami.
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
          Informasi yang Kami Kumpulkan
        </h2>
        <div class="pl-10 sm:pl-14 space-y-4">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 font-semibold"
          >
            Kami mengumpulkan berbagai jenis informasi untuk memberikan layanan
            JuruTani yang optimal:
          </p>
          <ul
            class="space-y-3 text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <div>
                <span
                  class="font-semibold text-emerald-700 dark:text-emerald-300"
                  >Data Registrasi & Profil:</span
                >
                Nama lengkap, email, nomor telepon, alamat, tanggal lahir, foto
                profil, informasi pertanian (jenis tanaman yang diusahakan, luas
                lahan, lokasi pertanian), dan preferensi layanan.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <div>
                <span
                  class="font-semibold text-emerald-700 dark:text-emerald-300"
                  >Data Konsultasi & Interaksi:</span
                >
                Riwayat pertanyaan konsultasi, chat dengan penyuluh, video call
                records, forum discussions, dan feedback yang Anda berikan.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <div>
                <span
                  class="font-semibold text-emerald-700 dark:text-emerald-300"
                  >Data Transaksi Marketplace:</span
                >
                Riwayat pembelian/penjualan, alamat pengiriman, metode
                pembayaran, detail produk yang dijual/dibeli, rating pembeli dan
                penjual.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <div>
                <span
                  class="font-semibold text-emerald-700 dark:text-emerald-300"
                  >Data Aktivitas Platform:</span
                >
                Log penggunaan aplikasi, halaman yang dikunjungi, fitur yang
                digunakan, durasi sesi, waktu login/logout, dan interaksi dengan
                konten edukasi.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <div>
                <span
                  class="font-semibold text-emerald-700 dark:text-emerald-300"
                  >Data Lokasi:</span
                >
                Dengan izin eksplisit Anda, kami mengakses data GPS untuk
                rekomendasi berbasis lokasi, data cuaca lokal, dan harga pasar
                di wilayah Anda.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <div>
                <span
                  class="font-semibold text-emerald-700 dark:text-emerald-300"
                  >Data Teknis & Perangkat:</span
                >
                Alamat IP, jenis browser, sistem operasi, jenis perangkat,
                identifikasi perangkat unik, user agent, cookie, dan teknologi
                pelacakan serupa.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <div>
                <span
                  class="font-semibold text-emerald-700 dark:text-emerald-300"
                  >Data Statistik Kunjungan:</span
                >
                Jumlah pengunjung harian/bulanan/tahunan, data pengunjung
                kemarin, total pengunjung, total pengguna terdaftar, dan jumlah
                pengguna yang sedang online (real-time presence tracking).
              </div>
            </li>
          </ul>
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
          Penggunaan Informasi
        </h2>
        <div class="pl-10 sm:pl-14 space-y-4">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Informasi yang kami kumpulkan digunakan untuk tujuan-tujuan spesifik
            JuruTani berikut:
          </p>
          <ul
            class="space-y-3 text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Menyediakan Layanan Konsultasi:</strong> Mengelola akun
                Anda, menghubungkan dengan penyuluh pertanian, memfasilitasi
                chat/video call, dan memberikan rekomendasi berbasis data
                pertanian Anda.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Marketplace & Transaksi:</strong> Memproses
                pembelian/penjualan di marketplace, mengelola pembayaran,
                pengiriman, dan verifikasi seller/buyer.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Personalisasi & Rekomendasi:</strong> Menyesuaikan
                konten komoditas, harga pasar, data cuaca, dan rekomendasi
                berdasarkan lokasi dan preferensi pertanian Anda.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Edukasi & Pembelajaran:</strong> Menyediakan konten
                edukatif yang relevan, kursus pertanian, video tutorial, dan
                alat bantu seperti kalkulator pupuk.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Komunikasi & Notifikasi:</strong> Mengirim update harga
                komoditas, peringatan cuaca, notifikasi marketplace, dan
                informasi layanan penting lainnya.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Analitik & Perbaikan:</strong> Menganalisis penggunaan
                platform untuk meningkatkan fitur, performa, dan user experience
                berdasarkan perilaku pengguna.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Keamanan & Kepatuhan:</strong> Mencegah penipuan,
                melindungi sistem kami, menegakkan ketentuan layanan, dan
                mematuhi regulasi hukum Indonesia.</span
              >
            </li>
          </ul>
        </div>
      </section>

      <!-- Section 3 -->
      <section class="group">
        <h2
          class="flex items-center gap-4 text-lg sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-5"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800/50 dark:to-teal-800/50 text-emerald-700 dark:text-emerald-300 text-sm font-bold shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30"
            >3</span
          >
          Keamanan Data
        </h2>
        <div class="pl-14 space-y-4">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Kami menggunakan teknologi enkripsi tingkat enterprise dan praktik
            terbaik industri untuk menjaga keamanan data Anda:
          </p>
          <ul
            class="space-y-2 text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span>Enkripsi SSL/TLS untuk semua data dalam transit</span>
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span>Penyimpanan terenkripsi untuk data sensitif</span>
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                >Kontrol akses berbasis peran dan authentikasi
                multi-faktor</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span>Audit keamanan reguler dan penetration testing</span>
            </li>
          </ul>
          <div
            class="mt-4 p-4 bg-blue-50/60 dark:bg-blue-900/15 border border-blue-200/50 dark:border-blue-700/30 rounded-lg"
          >
            <p class="text-sm text-blue-800 dark:text-blue-300">
              <strong>Catatan:</strong> Meskipun kami berkomitmen melindungi
              data Anda, tidak ada sistem keamanan yang 100% sempurna. Kami
              tidak dapat menjamin keamanan absolut dari semua ancaman.
            </p>
          </div>
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
          Berbagi Data
        </h2>
        <div class="pl-14 space-y-4">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Kami tidak menjual data pribadi Anda kepada pihak ketiga. Namun,
            kami dapat berbagi informasi dalam situasi berikut:
          </p>
          <ul
            class="space-y-3 text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Partner Layanan:</strong> Penyedia layanan yang
                membantu kami menjalankan platform (hosting, payment gateway,
                analytics).</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Kepatuhan Hukum:</strong> Jika diminta oleh otoritas
                hukum atau pengadilan yang berwenang.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Perlindungan Hak:</strong> Untuk melindungi hak,
                keamanan, atau properti kami dan pengguna lain.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="h-1.5 w-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 mt-2 shrink-0"
              />
              <span
                ><strong>Data Agregat:</strong> Kami dapat membagikan data yang
                telah diagregasi atau dianonimkan untuk riset dan
                pemasaran.</span
              >
            </li>
          </ul>
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
          Hak Anda
        </h2>
        <div class="pl-14 space-y-4">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Anda memiliki kontrol penuh atas data pribadi Anda. Anda dapat:
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
                ><strong>Akses:</strong> Meminta salinan data pribadi yang kami
                miliki tentang Anda.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <span
                ><strong>Koreksi:</strong> Memperbarui atau memperbaiki
                informasi yang tidak akurat.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <span
                ><strong>Penghapusan:</strong> Meminta penghapusan data pribadi
                Anda (dengan batasan tertentu).</span
              >
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <span
                ><strong>Portabilitas:</strong> Menerima data dalam format yang
                dapat dibaca mesin.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-lucide-check-circle-2"
                class="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <span
                ><strong>Opt-Out:</strong> Menolak komunikasi pemasaran atau
                pemrosesan data tertentu.</span
              >
            </li>
          </ul>
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed mt-3"
          >
            Untuk melakukan salah satu dari permintaan di atas, hubungi kami
            melalui detail kontak di bawah.
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
          Retensi Data
        </h2>
        <div class="pl-14 space-y-3">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Kami menyimpan data pribadi Anda selama Anda memiliki akun aktif.
            Setelah penghapusan akun, kami akan menghapus data dalam waktu 30
            hari, kecuali kami diminta untuk mempertahankannya oleh hukum atau
            untuk tujuan bisnis yang sah.
          </p>
        </div>
      </section>

      <!-- Section 7 -->
      <section class="group">
        <h2
          class="flex items-center gap-4 text-lg sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-5"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800/50 dark:to-teal-800/50 text-emerald-700 dark:text-emerald-300 text-sm font-bold shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30"
            >7</span
          >
          Perubahan Kebijakan
        </h2>
        <div class="pl-14 space-y-3">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu.
            Perubahan signifikan akan diumumkan melalui email atau notifikasi di
            platform. Penggunaan berkelanjutan setelah perubahan berarti Anda
            menerima kebijakan yang diperbarui.
          </p>
        </div>
      </section>

      <!-- Section 8 -->
      <section class="group">
        <h2
          class="flex items-center gap-4 text-lg sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-5"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800/50 dark:to-teal-800/50 text-emerald-700 dark:text-emerald-300 text-sm font-bold shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30"
            >8</span
          >
          Hubungi Kami
        </h2>
        <div class="pl-14 space-y-4">
          <p
            class="text-sm sm:text-base text-emerald-900/75 dark:text-emerald-100/75 leading-relaxed"
          >
            Jika Anda memiliki pertanyaan, kekhawatiran, atau ingin menjalankan
            hak privasi Anda, silakan hubungi tim JuruTani:
          </p>
          <div
            class="space-y-3 text-sm bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-lg border border-emerald-200/40 dark:border-emerald-700/30"
          >
            <p class="text-emerald-900/75 dark:text-emerald-100/75">
              <strong class="text-emerald-700 dark:text-emerald-300"
                >Email Privasi:</strong
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
                >Jam Operasional:</strong
              >
              <span class="text-emerald-600 dark:text-emerald-400"
                >Senin - Jumat, 08.00 - 16.00 WIB</span
              >
            </p>
            <p class="text-emerald-900/75 dark:text-emerald-100/75">
              <strong class="text-emerald-700 dark:text-emerald-300"
                >Institusi Penyelenggara:</strong
              >
              <span class="text-emerald-600 dark:text-emerald-400"
                >Politeknik Pembangunan Pertanian Yogyakarta Magelang</span
              >
            </p>
          </div>
          <p
            class="text-xs sm:text-sm text-emerald-900/60 dark:text-emerald-100/60 mt-4 italic"
          >
            Kami berkomitmen merespons permintaan privasi Anda dalam waktu 30
            hari kerja sesuai dengan peraturan perundang-undangan Indonesia yang
            berlaku.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
