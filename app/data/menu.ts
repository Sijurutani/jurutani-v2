// app/data/menu.ts — Centralized navigation & footer data
export const navs = {
  primary: [
    { title: 'Beranda', to: '/', icon: 'i-lucide-home' },
    { title: 'Layanan',icon: 'i-lucide-headset', children: [
        { title: 'Diskusi', to: '/discussions', icon: 'i-lucide-messages-square' },
        { title: 'Messages', to: '/messages', icon: 'i-lucide-message-square' },
        { title: 'Marketplace', to: '/markets', icon: 'i-lucide-shopping-bag' },
        { title: 'Cuaca', to: '/weathers', icon: 'i-lucide-cloud-sun' },
        { title: 'Harga Pangan', to: '/food-prices', icon: 'i-lucide-bar-chart-2' },
      ], },
    { title: 'Berita', to: '/update', icon: 'i-lucide-newspaper' },
    { title: 'Edukasi', icon: 'i-lucide-graduation-cap', children: [
      { title: 'Courses', to: '/courses', icon: 'i-lucide-book' },
      { title: 'Meeting', to: '/meetings', icon:'i-lucide-calendar' },
      { title: 'Video', to: '/videos', icon: 'i-lucide-video' },
      { title: 'Alat', to: '/tools', icon: 'i-lucide-wrench' },
      ], },
  ],
  secondary: [
    { title: 'Profil', to: '/profile', icon: 'i-lucide-user' },
    { title: 'Keamanan', to: '/security', icon: 'i-lucide-lock' },
    { title: 'Pengaturan', to: '/setting', icon: 'i-lucide-settings' },
    { title: 'Riwayat', to: '/history', icon: 'i-lucide-history' },
    { title: 'Kontak', to: '/contact-us', icon: 'i-lucide-phone' },
    { title: 'Bantuan', to: '/help-faqs', icon: 'i-lucide-help-circle' },
  ],
}

export const footerMenuLinks = [
  [
    { label: 'Beranda', path: '/' },
    { label: 'Tentang Kami', path: '/about-us' },
    { label: 'Berita', path: '/update' },
  ],
  [
    { label: 'Produk', path: '/markets' },
    { label: 'Komunitas', path: '/discussions/group' },
    { label: 'Kontak', path: '/contact-us' },
  ],
]

export const footerContactInfo = [
  { icon: 'i-lucide-map-pin', text: ['Jl. Kusumanegara No.2, Tahunan, Kec. Umbulharjo,','Kota Yogyakarta, Daerah Istimewa Yogyakarta 55161']},
  { icon: 'i-lucide-phone', text: '+62 856-6900-0010' },
  { icon: 'i-lucide-mail', text: 'si.jurutani@gmail.com' },
  { icon: 'i-lucide-clock', text: 'Senin - Jumat: 08.00 - 16.00 WIB' },
]

export const footerSocialMedia = [
  { name: 'WhatsApp', icon: 'i-mdi-whatsapp', url: 'https://api.whatsapp.com/send/?phone=6285669000010' },
  { name: 'TikTok', icon: 'i-simple-icons-tiktok', url: 'https://www.tiktok.com/@juru_tani' },
  { name: 'Email', icon: 'i-mdi-gmail', url: 'mailto:si.jurutani@gmail.com' },
  { name: 'Instagram', icon: 'i-mdi-instagram', url: 'https://www.instagram.com/jurutani_' },
  { name: 'YouTube', icon: 'i-mdi-youtube', url: 'https://www.youtube.com/@Juru_Tani' },
]

export const footerBottomLinks = [
  { label: 'Kebijakan Privasi', path: '/privacy-policy' },
  { label: 'Syarat & Ketentuan', path: '/terms' },
]
