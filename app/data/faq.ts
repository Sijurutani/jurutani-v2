import type { FaqCategory, FaqData, IconCard } from './types'

/**
 * FAQ Data - Help & Support
 * Centralized FAQ content for help-faqs.vue
 */

export const faqCategories: FaqCategory[] = [
  { id: 'general', name: 'Umum', icon: 'i-lucide-info' },
  { id: 'account', name: 'Akun & Pendaftaran', icon: 'i-lucide-user-circle' },
  { id: 'farming', name: 'Kajian Pertanian', icon: 'i-lucide-sparkles' },
  { id: 'marketplace', name: 'Pemasaran', icon: 'i-lucide-shopping-bag' },
  { id: 'technical', name: 'Bantuan Teknis', icon: 'i-lucide-settings' },
]

export const faqData: FaqData = {
  general: [
    {
      question: 'Apa itu JuruTani?',
      answer:
        'JuruTani adalah platform ekosistem penyuluhan pertanian digital yang dirancang untuk memberdayakan petani Indonesia. Kami menyediakan solusi menyeluruh mulai dari pendampingan budidaya, diagnosa penyakit tanaman berbasis AI, akses ke ahli pertanian, hingga marketplace untuk menjual hasil panen dengan harga terbaik. Misi kami adalah memodernisasi pertanian melalui teknologi yang mudah digunakan.',
    },
    {
      question: 'Siapa saja yang bisa menggunakan JuruTani?',
      answer:
        'JuruTani dirancang untuk semua pelaku dalam ekosistem pertanian: Petani (baik skala kecil maupun besar), Penyuluh Pertanian, Ahli Agronomi, Pembeli Hasil Panen (Tengkulak, Retail, Industri), serta Penjual Sarana Produksi Pertanian. Platform kami juga terbuka bagi masyarakat umum yang ingin belajar bercocok tanam.',
    },
    {
      question: 'Bagaimana JuruTani dapat meningkatkan keuntungan saya?',
      answer:
        'Kami membantu meningkatkan keuntungan melalui tiga cara utama: 1) Peningkatan Produktivitas: Rekomendasi pemupukan dan pengendalian hama yang tepat mengurangi kerugian panen. 2) Efisiensi Biaya: Menghindari penggunaan input pertanian yang berlebihan. 3) Akses Pasar: Menghubungkan Anda langsung dengan pembeli untuk mendapatkan harga yang lebih adil tanpa rantai pasok yang panjang.',
    },
    {
      question: 'Apakah JuruTani tersedia di seluruh Indonesia?',
      answer:
        'Ya, aplikasi JuruTani dapat diunduh dan digunakan di seluruh Indonesia. Namun, fitur-fitur tertentu seperti marketplace lokal atau pengiriman fisik mungkin memiliki ketersediaan yang berbeda tergantung pada jaringan logistik di wilayah Anda. Layanan konsultasi digital dan fitur edukasi tersedia penuh secara nasional.',
    },
    {
      question: 'Apakah layanan JuruTani gratis?',
      answer:
        'Sebagian besar fitur inti JuruTani seperti Forum Komunitas, Ensiklopedia Tani, Diagnosa Penyakit Dasar, dan info harga pasar tersedia secara GRATIS. Kami juga menawarkan layanan Premium untuk fitur lanjutan seperti Konsultasi Prioritas dengan Pakar, Analisis Tanah Mendalam, dan fitur Manajemen Pertanian tingkat lanjut.',
    },
  ],
  account: [
    {
      question: 'Bagaimana cara mendaftar akun JuruTani?',
      answer:
        'Anda dapat mendaftar melalui aplikasi mobile (Android/iOS) atau website kami. Cukup klik tombol "Daftar", lalu pilih metode pendaftaran menggunakan Nomor Telepon, Email, atau Akun Google. Lengkapi profil Anda dengan jenis tanaman yang Anda budidayakan agar kami dapat memberikan rekomendasi yang relevan.',
    },
    {
      question: 'Apa syarat untuk mendaftar sebagai Ahli/Pakar?',
      answer:
        'Untuk menjaga kualitas konsultasi, Pakar/Ahli harus melalui proses verifikasi. Anda perlu melampirkan sertifikat keahlian, ijazah pendidikan terkait (Pertanian/Biologi/dsb), atau bukti pengalaman kerja sebagai penyuluh. Tim kami akan memverifikasi dokumen Anda dalam 2-3 hari kerja sebelum akun Pakar Anda aktif.',
    },
    {
      question: 'Saya lupa kata sandi, apa yang harus dilakukan?',
      answer:
        'Jangan khawatir. Di halaman login, klik "Lupa Kata Sandi". Masukkan email atau nomor telepon yang terdaftar. Kami akan mengirimkan kode OTP atau tautan reset kata sandi kepada Anda. Ikuti instruksi tersebut untuk membuat kata sandi baru. Pastikan Anda tidak membagikan kode OTP kepada siapapun.',
    },
    {
      question: 'Bagaimana cara mengubah profil pertanian saya?',
      answer:
        'Masuk ke menu "Profil", lalu pilih "Data Lahan". Di sana Anda bisa mengubah jenis komoditas, luas lahan, lokasi, dan metode tanam. Memperbarui data ini sangat penting agar fitur rekomendasi pemupukan dan prediksi cuaca bekerja akurat sesuai lokasi lahan Anda.',
    },
    {
      question: 'Apakah data saya aman?',
      answer:
        'Keamanan data adalah prioritas kami. Kami menggunakan enkripsi standar industri untuk melindungi data pribadi Anda. Kami tidak akan menjual data pribadi Anda ke pihak ketiga. Anda memiliki kendali penuh atas data yang Anda bagikan di forum publik.',
    },
  ],
  farming: [
    {
      question: 'Seberapa akurat fitur diagnosa penyakit tanaman?',
      answer:
        'Fitur diagnosa AI kami memiliki tingkat akurasi di atas 90% untuk penyakit-penyakit umum pada komoditas utama (Padi, Jagung, Cabai, Tomat, dsb). Namun, AI hanyalah alat bantu. Untuk kasus yang kompleks atau meragukan, kami sangat menyarankan menggunakan fitur "Tanya Pakar" untuk mendapatkan verifikasi langsung dari ahli pertanian manusia.',
    },
    {
      question: 'Apakah saya bisa berkonsultasi tentang hidroponik?',
      answer:
        'Tentu saja! JuruTani memiliki kategori khusus untuk pertanian modern termasuk Hidroponik, Aquaponik, dan Urban Farming. Kami memiliki komunitas aktif dan pakar yang spesialis di bidang teknologi pertanian modern ini.',
    },
    {
      question: 'Bagaimana cara mendapatkan rekomendasi pemupukan?',
      answer:
        'Gunakan fitur "Kalkulator Pupuk" di menu Peralatan. Masukkan jenis tanaman, usia tanaman, dan luas lahan Anda. Jika Anda memiliki data analisis tanah terbaru, masukkan juga untuk hasil yang lebih presisi. Sistem akan menghitung kebutuhan NPK dan memberikan rekomendasi takaran pupuk yang efisien.',
    },
    {
      question: 'Informasi cuaca diambil dari mana?',
      answer:
        'Data cuaca JuruTani terintegrasi dengan data satelit global dan BMKG lokal untuk memberikan prakiraan cuaca tingkat kecamatan. Kami menyediakan info curah hujan, suhu, kelembapan, dan kecepatan angin yang diperbarui setiap jam untuk membantu Anda merencanakan waktu penyemprotan atau pemupukan.',
    },
    {
      question: 'Apa itu Kalender Tanam?',
      answer:
        'Kalender Tanam adalah fitur yang membantu Anda merencanakan jadwal budidaya dari awal hingga panen. Berdasarkan jenis tanaman dan tanggal mulai, sistem akan membuatkan jadwal otomatis untuk penyemaian, pemindahan tanam, pemupukan berkala, hingga estimasi waktu panen, lengkap dengan pengingat notifikasi.',
    },
  ],
  marketplace: [
    {
      question: 'Bagaimana cara mulai berjualan hasil panen?',
      answer:
        'Masuk ke menu "Marketplace", pilih "Jual Hasil Panen". Unggah foto produk yang jelas, deskripsikan kualitas (Grade A/B/C), varietas, dan kuantitas ketersediaan. Tentukan harga (bisa per kg atau borongan) dan lokasi pengambilan. Penawaran Anda akan terlihat oleh ribuan pembeli potensial di platform kami.',
    },
    {
      question: 'Apakah JuruTani memotong komisi penjualan?',
      answer:
        'Untuk akun Basic, kami menerapkan biaya admin yang sangat kecil (sekitar 1-2%) untuk setiap transaksi yang berhasil guna pemeliharaan sistem. Untuk akun Mitra Prioritas, biaya layanan mungkin berbeda namun dengan keuntungan promosi produk yang lebih gencar.',
    },
    {
      question: 'Bagaimana sistem pembayarannya?',
      answer:
        'JuruTani menggunakan sistem Rekening Bersama (Escrow) untuk keamanan transaksi. Pembeli mentransfer uang ke rekening resmi JuruTani. Dana akan diteruskan ke Petani setelah Pembeli mengonfirmasi penerimaan barang sesuai pesanan. Ini melindungi kedua belah pihak dari penipuan.',
    },
    {
      question: 'Siapa yang menanggung ongkos kirim?',
      answer:
        'Ongkos kirim biasanya ditanggung oleh Pembeli, kecuali ada kesepakatan lain (misalnya "Harga Termasuk Ongkir"). Platform kami terintegrasi dengan beberapa logistik kargo untuk pengiriman jumlah besar, atau Anda bisa memilih opsi "Ambil di Lokasi" untuk pembeli lokal.',
    },
    {
      question: 'Bisakah saya membeli bibit dan pupuk di sini?',
      answer:
        'Ya, Marketplace JuruTani juga menyediakan sarana produksi pertanian (saprotan). Kami bermitra dengan produsen dan distributor resmi untuk menjamin keaslian benih, pupuk, dan pestisida yang dijual di platform kami. Hati-hati dengan produk palsu, belilah dari toko bercentang Official atau Terverifikasi.',
    },
  ],
  technical: [
    {
      question: 'Aplikasi sering tertutup sendiri (force close), solusinya?',
      answer:
        'Hal ini biasanya disebabkan oleh memori HP yang penuh atau cache aplikasi yang menumpuk. Coba langkah berikut: 1) Hapus Cache aplikasi JuruTani di pengaturan HP. 2) Pastikan ruang penyimpanan internal masih cukup. 3) Update aplikasi ke versi terbaru di Play Store. Jika masih bermasalah, hubungi CS kami.',
    },
    {
      question: 'Bagaimana menghubungkan sensor IoT ke aplikasi?',
      answer:
        'Masuk ke menu "Smart Farming", pilih "Tambah Perangkat". Pastikan Bluetooth dan GPS HP Anda menyala. Nyalakan perangkat sensor Anda hingga lampu indikator berkedip. Ikuti petunjuk pairing di layar. Pastikan perangkat sensor Anda kompatibel dengan ekosistem JuruTani.',
    },
    {
      question: 'Mengapa saya tidak menerima notifikasi?',
      answer:
        'Periksa pengaturan notifikasi di HP Anda, pastikan izin notifikasi untuk JuruTani sudah diaktifkan. Juga cek pengaturan di dalam aplikasi pada menu Profil > Pengaturan Notifikasi, pastikan jenis notifikasi yang Anda inginkan (misal: Pengingat Jadwal, Chat, Info Harga) sudah dalam posisi ON.',
    },
    {
      question: 'Apakah aplikasi bisa berjalan tanpa internet (Offline)?',
      answer:
        'Mode Offline terbatas tersedia untuk fitur-fitur dasar seperti melihat Panduan yang sudah diunduh atau Kalender Tanam. Namun, untuk fitur diagnosa AI, Marketplace, Cuaca, dan Forum Diskusi, Anda memerlukan koneksi internet yang stabil.',
    },
    {
      question: 'Bagaimana cara melaporkan bug atau error?',
      answer:
        'Jika menemukan error, Anda bisa menggunakan fitur "Lapor Masalah" di menu Bantuan. Sertakan screenshot masalahnya dan deskripsi singkat tentang apa yang Anda lakukan sebelum error terjadi. Laporan Anda sangat berharga bagi tim pengembang kami untuk perbaikan.',
    },
  ],
}
