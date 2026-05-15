export interface DiscussionService {
  id: string
  title: string
  subtitle: string
  description: string
  icon: string
  image: string
  route: string
}

export const discussionServices: DiscussionService[] = [
  {
    id: 'instructor',
    title: 'Bicara dengan Penyuluh',
    subtitle: 'Konsultasi Langsung',
    description:
      'Dapatkan panduan praktis dari penyuluh pertanian berpengalaman untuk mengatasi masalah budidaya, hama penyakit, dan teknik bertani modern.',
    icon: 'i-lucide-user-plus',
    image: '/services/penyuluhjurutani.webp',
    route: '/discussions/instructor',
  },
  {
    id: 'expert',
    title: 'Tanya ke Pakar',
    subtitle: 'Konsultasi Ahli',
    description:
      'Konsultasi mendalam dengan ahli pertanian bersertifikat untuk analisis ilmiah, diagnosa penyakit tanaman, dan rekomendasi teknologi terbaru.',
    icon: 'i-lucide-user-check',
    image: '/services/pakarjurutani.webp',
    route: '/discussions/expert',
  },
  {
    id: 'community',
    title: 'Forum Komunitas',
    subtitle: 'Berbagi Pengalaman',
    description:
      'Bergabung dengan komunitas petani dari seluruh Indonesia untuk berbagi tips sukses, pengalaman lapangan, dan inovasi pertanian.',
    icon: 'i-lucide-users',
    image: '/services/komunitasjurutani.webp',
    route: '/discussions/group',
  },
  {
    id: 'chat',
    title: 'Room Chat Tematik',
    subtitle: 'Diskusi Real-time',
    description:
      'Diskusi langsung dalam room chat khusus berdasarkan komoditas seperti padi, sayuran, buah-buahan, dan peternakan untuk solusi cepat.',
    icon: 'i-lucide-message-circle',
    image: '/services/chatjurutani.webp',
    route: '/messages',
  },
  {
    id: 'chat-admin',
    title: 'Support Center',
    subtitle: 'Bantuan Langsung',
    description:
      'Hubungi tim support JuruTani untuk bantuan teknis aplikasi, keluhan layanan, atau pertanyaan umum dengan respon prioritas.',
    icon: 'i-lucide-headset',
    image: '/services/admin.webp',
    route: '/messages?admin=1',
  },
]

export const discussionStatsFallback = {
  profiles: 500,
  instructors: 400,
  experts: 200,
}
