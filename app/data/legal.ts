import type { LegalPageData } from './types'

/**
 * Legal Pages Data - Privacy Policy & Terms of Service
 * Centralized legal content for privacy-policy.vue and terms.vue
 */

export const privacyPolicyData: LegalPageData = {
  pageType: 'privacy',
  icon: 'i-lucide-shield',
  title: 'Kebijakan Privasi',
  lastUpdated: '5 Mei 2026',
  intro:
    'JuruTani menghargai privasi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat menggunakan platform kami.',
  sections: [
    {
      id: 'information-collection',
      title: 'Informasi yang Kami Kumpulkan',
      icon: 'i-lucide-database',
      type: 'list',
      content: [
        '<strong>Data Pribadi:</strong> Nama, email, nomor telepon, dan informasi lain yang diberikan saat registrasi.',
        '<strong>Data Aktivitas:</strong> Log penggunaan aplikasi dan interaksi pengguna.',
        '<strong>Data Lokasi:</strong> Jika Anda mengizinkan, kami dapat mengakses lokasi untuk fitur tertentu.',
      ],
    },
    {
      id: 'information-usage',
      title: 'Penggunaan Informasi',
      icon: 'i-lucide-settings',
      type: 'nested',
      content: [
        'Informasi digunakan untuk:',
        'Menyediakan dan mengelola layanan JuruTani',
        'Meningkatkan pengalaman pengguna',
        'Mengirim notifikasi atau informasi terkait',
      ],
    },
    {
      id: 'data-security',
      title: 'Keamanan Data',
      icon: 'i-lucide-lock',
      type: 'text',
      content:
        'Kami menggunakan teknologi enkripsi dan praktik terbaik untuk menjaga keamanan data Anda.',
    },
    {
      id: 'user-rights',
      title: 'Hak Anda',
      icon: 'i-lucide-user-check',
      type: 'text',
      content:
        'Anda dapat meminta akses, koreksi, atau penghapusan data pribadi Anda kapan saja.',
    },
    {
      id: 'policy-changes',
      title: 'Perubahan Kebijakan',
      icon: 'i-lucide-refresh-cw',
      type: 'text',
      content:
        'Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan akan diumumkan di halaman ini.',
    },
  ],
}

export const termsOfServiceData: LegalPageData = {
  pageType: 'terms',
  icon: 'i-lucide-file-text',
  title: 'Syarat & Ketentuan',
  lastUpdated: '20 Juli 2026',
  intro:
    'Selamat datang di <strong>JuruTani</strong>. Dokumen ini berisi syarat dan ketentuan yang mengatur penggunaan platform dan layanan kami. Mohon membaca dengan seksama sebelum menggunakan platform kami.',
  sections: [
    {
      id: 'introduction',
      title: 'Pengantar',
      icon: 'i-lucide-info',
      type: 'text',
      content:
        'Dengan mengakses dan menggunakan platform <strong>JuruTani</strong>, Anda setuju untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju dengan salah satu dari ketentuan ini, Anda tidak diperkenankan untuk menggunakan layanan kami.',
    },
    {
      id: 'service-usage',
      title: 'Penggunaan Layanan',
      icon: 'i-lucide-check-circle',
      type: 'list',
      content: [
        'Anda bertanggung jawab atas keamanan akun Anda, termasuk kata sandi dan semua aktivitas yang terjadi di dalamnya.',
        'Dilarang menggunakan layanan untuk tindakan yang melanggar hukum atau merugikan pihak lain.',
        'Kami berhak menangguhkan atau menghentikan akses pengguna yang melanggar ketentuan ini.',
      ],
    },
    {
      id: 'intellectual-property',
      title: 'Hak Kekayaan Intelektual',
      icon: 'i-lucide-shield-check',
      type: 'text',
      content:
        'Semua konten di platform ini termasuk logo, teks, grafik, dan perangkat lunak adalah milik <strong>JuruTani</strong> kecuali dinyatakan lain. Dilarang menyalin, mendistribusikan, atau menggunakan konten tersebut tanpa izin tertulis dari kami.',
    },
    {
      id: 'responsibility',
      title: 'Tanggung Jawab',
      icon: 'i-lucide-alert-triangle',
      type: 'nested',
      content: [
        'Kami tidak bertanggung jawab atas kerugian yang timbul akibat penyalahgunaan platform ini oleh pihak ketiga. Penggunaan informasi dan layanan kami sepenuhnya menjadi risiko Anda sendiri.',
        '<strong>JuruTani</strong> tidak memberikan jaminan bahwa:',
        'Layanan akan selalu tersedia tanpa gangguan',
        'Layanan akan bebas dari kesalahan atau bug',
      ],
    },
    {
      id: 'terms-changes',
      title: 'Perubahan Ketentuan',
      icon: 'i-lucide-refresh-ccw',
      type: 'text',
      content:
        'Kami berhak memperbarui syarat dan ketentuan ini tanpa pemberitahuan sebelumnya. Dengan terus menggunakan platform kami setelah perubahan tersebut, Anda dianggap telah menyetujui syarat dan ketentuan yang telah diperbarui.',
    },
  ],
}
