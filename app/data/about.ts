import type {
  HeroSection,
  IconCard,
  GalleryItem,
  FeatureCard,
  TeamCategory,
  InstitutionHighlight,
} from './types'

/**
 * About Page Data - JuruTani Platform
 * All content for about-us.vue centralized here
 */

export const aboutHero: HeroSection = {
  title: 'Si JuruTani',
  subtitle: 'Platform Inovasi Penyuluhan Digital Pertanian Indonesia',
  badge: {
    text: 'Politeknik Pembangunan Pertanian Yogyakarta Magelang',
    icon: 'i-lucide-award',
  },
}

export const logoJuruTani = '/jurutani.webp'
export const sponsorLogo = '/logo/sponsor.png'

export const galleryImages = [
  '/gallery/image1.webp',
  '/gallery/image2.webp',
  '/gallery/image3.webp',
  '/gallery/image4.webp',
  '/gallery/image5.webp',
] as const

export const galleryData: GalleryItem[] = [
  {
    src: galleryImages[0],
    title: 'Layanan Penyuluhan',
    description:
      'Konsultasi langsung dengan penyuluh pertanian digital melalui aplikasi JuruTani',
    alt: 'Layanan penyuluhan digital JuruTani',
  },
  {
    src: galleryImages[1],
    title: 'Berita Pertanian',
    description:
      'Informasi terbaru seputar pertanian, teknologi, dan kegiatan masyarakat tani',
    alt: 'Portal berita pertanian terkini',
  },
  {
    src: galleryImages[2],
    title: 'Marketplace Petani',
    description:
      'Tempat jual beli pupuk, bibit, dan hasil panen secara langsung',
    alt: 'Marketplace pertanian online',
  },
  {
    src: galleryImages[3],
    title: 'Edukasi & Artikel',
    description:
      'Bacaan informatif untuk meningkatkan pengetahuan dan keterampilan petani',
    alt: 'Konten edukasi pertanian',
  },
  {
    src: galleryImages[4],
    title: 'Kursus & Alat Bantu',
    description:
      'Belajar mandiri melalui kursus dan alat bantu seperti kalkulator pupuk atau cuaca',
    alt: 'Platform kursus dan tools pertanian',
  },
]

export const innovationPoints: IconCard[] = [
  {
    icon: 'i-lucide-message-square',
    title: 'Konsultasi Digital Real-Time',
    description:
      'Akses langsung dengan penyuluh pertanian profesional melalui chat dan video call',
  },
  {
    icon: 'i-lucide-database',
    title: 'Database Komoditas Lengkap',
    description:
      'Informasi detail tentang berbagai jenis tanaman dan teknik budidaya terbaru',
  },
  {
    icon: 'i-lucide-cloud-rain',
    title: 'Data Cuaca & Pasar Akurat',
    description:
      'Prediksi cuaca harian dan harga komoditas real-time untuk perencanaan yang lebih baik',
  },
  {
    icon: 'i-lucide-shopping-cart',
    title: 'Marketplace Terintegrasi',
    description:
      'Jual-beli pupuk, bibit, dan hasil panen langsung dengan pembeli tanpa perantara',
  },
  {
    icon: 'i-lucide-book-open',
    title: 'Edukasi & Kursus Pertanian',
    description:
      'Materi pembelajaran interaktif dari ahli dan praktisi pertanian berpengalaman',
  },
  {
    icon: 'i-lucide-calculator',
    title: 'Alat Bantu Otomatis',
    description:
      'Kalkulator pupuk, prediksi hasil, dan tools analisis untuk keputusan yang tepat',
  },
]

export const platformAdvantages: FeatureCard[] = [
  {
    icon: 'i-lucide-bar-chart-3',
    title: 'Data Terintegrasi & Real-Time',
    description:
      'Database lengkap komoditas pertanian, data cuaca akurat, harga pasar real-time, dan informasi pasar yang terupdate setiap saat dalam satu platform terpadu',
  },
  {
    icon: 'i-lucide-smartphone',
    title: 'User-Friendly untuk Semua',
    description:
      'Interface intuitif dirancang khusus untuk petani dengan berbagai tingkat literasi digital, dari yang masih konvensional hingga tech-savvy',
  },
  {
    icon: 'i-lucide-headset',
    title: 'Penyuluhan Digital 24/7',
    description:
      'Akses langsung dengan penyuluh pertanian profesional kapan saja, di mana saja melalui chat, video call, atau forum diskusi komunitas petani',
  },
  {
    icon: 'i-lucide-shopping-bag',
    title: 'Marketplace Terintegrasi',
    description:
      'Jual-beli pupuk, bibit berkualitas, hasil panen, dan produk pertanian lainnya langsung dengan pembeli tanpa perantara yang memberatkan',
  },
  {
    icon: 'i-lucide-graduation-cap',
    title: 'Edukasi Pertanian Berkualitas',
    description:
      'Kursus online, webinar, dan artikel edukatif dari ahli pertanian profesional yang dikurasi khusus untuk peningkatan skill dan pengetahuan',
  },
  {
    icon: 'i-lucide-wrench',
    title: 'Tools & Kalkulasi Otomatis',
    description:
      'Kalkulator pupuk, prediksi hasil panen, analisis keuntungan, dan tools AI yang membantu petani membuat keputusan bisnis yang lebih tepat',
  },
]

export const teamCategories: TeamCategory[] = [
  {
    icon: 'i-lucide-users',
    title: 'Mahasiswa Berprestasi',
    items: [
      'Mahasiswa terpilih dari berbagai program studi',
      'Kompetensi teknologi digital terdepan',
      'Pemahaman mendalam tentang pertanian praktis',
      'Semangat untuk menciptakan dampak sosial',
    ],
  },
  {
    icon: 'i-lucide-user-check',
    title: 'Dosen Pembimbing Berpengalaman',
    items: [
      'Ahli di bidang pertanian dan teknologi',
      'Pengalaman puluhan tahun di industri',
      'Komitmen pada inovasi berkelanjutan',
      'Mentoring profesional untuk tim mahasiswa',
    ],
  },
]

export const institutionHighlights: InstitutionHighlight[] = [
  {
    icon: 'i-lucide-graduation-cap',
    title: 'Pendidikan Vokasi',
    description: 'Program praktis berbasis industri',
  },
  {
    icon: 'i-lucide-search',
    title: 'Riset & Inovasi',
    description: 'Penelitian pertanian berkelanjutan',
  },
  {
    icon: 'i-lucide-globe',
    title: 'Pemberdayaan Masyarakat',
    description: 'Solusi nyata untuk petani lokal',
  },
]

export const visionMission = {
  vision: {
    title: 'Visi',
    icon: 'i-lucide-eye',
    content:
      'Menjadi platform penyuluhan digital pertanian terdepan di Indonesia yang menghubungkan teknologi modern dengan kearifan lokal untuk menciptakan pertanian berkelanjutan dan sejahtera.',
  },
  mission: {
    title: 'Misi',
    icon: 'i-lucide-target',
    items: [
      'Menyediakan akses mudah ke informasi pertanian berkualitas',
      'Menghubungkan petani dengan pasar yang lebih luas',
      'Memberdayakan petani melalui teknologi dan edukasi',
      'Mendorong praktik pertanian berkelanjutan',
      'Membangun komunitas petani yang solid dan saling mendukung',
    ],
  },
}

export const aboutIntro = {
  title: 'Tentang Si JuruTani',
  subtitle: 'Platform Inovasi Penyuluhan Digital Pertanian',
  content: `<strong>Si JuruTani</strong> adalah karya inovasi yang dikembangkan oleh <strong>mahasiswa dan dosen Politeknik Pembangunan Pertanian (Polbangtan) Yogyakarta Magelang</strong>, sebuah institusi pendidikan tinggi yang berada di bawah naungan <strong>Kementerian Pertanian Republik Indonesia</strong>.

Platform ini lahir dari kepedulian mendalam terhadap tantangan yang dihadapi oleh petani Indonesia di era digital. Kami menyadari bahwa petani membutuhkan solusi yang tidak hanya canggih secara teknologi, tetapi juga mudah diakses dan relevan dengan kondisi pertanian lokal.

<strong>Si JuruTani</strong> bukan sekadar aplikasi — ini adalah <strong>ekosistem digital</strong> yang dirancang untuk memberdayakan petani melalui:
- Akses <strong>penyuluhan pertanian profesional</strong> kapan saja, di mana saja
- <strong>Database lengkap</strong> informasi komoditas, teknik budidaya, dan penanganan hama
- <strong>Data real-time</strong> cuaca dan harga pasar untuk pengambilan keputusan yang lebih baik
- <strong>Marketplace</strong> yang menghubungkan petani langsung dengan pembeli
- <strong>Konten edukatif</strong> berupa artikel, video tutorial, dan kursus online
- <strong>Alat bantu praktis</strong> seperti kalkulator pupuk dan prediksi hasil panen

Kami percaya bahwa dengan menggabungkan <strong>teknologi digital terkini</strong> dan <strong>pengetahuan pertanian mendalam</strong>, Si JuruTani dapat menjadi mitra terpercaya petani Indonesia dalam meningkatkan produktivitas, efisiensi, dan kesejahteraan.

<strong>Si JuruTani</strong> adalah wujud komitmen kami untuk memajukan sektor pertanian Indonesia menuju <strong>Agriculture 4.0</strong> — pertanian yang cerdas, berkelanjutan, dan sejahtera.`,
}
