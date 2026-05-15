export const Enum = {
  // ─── Sorting ────────────────────────────────────────────────────────────────
  SortOptions: [
    { value: 'created_at-desc', label: 'Terbaru', icon: 'i-lucide-arrow-down' },
    { value: 'created_at-asc', label: 'Terlama', icon: 'i-lucide-arrow-up' },
    { value: 'name-asc', label: 'A - Z', icon: 'i-lucide-sort-alpha-asc' },
    { value: 'name-desc', label: 'Z - A', icon: 'i-lucide-sort-alpha-desc' },
  ] satisfies { value: string; label: string; icon: string }[],

  // ─── Status: News / News Updated ────────────────────────────────────────────
  StatusNews: [
    {
      value: 'pending',
      label: 'Pending',
      color: 'neutral',
      icon: 'i-lucide-clock',
    },
    {
      value: 'approved',
      label: 'Approved',
      color: 'success',
      icon: 'i-lucide-circle-check',
    },
    {
      value: 'rejected',
      label: 'Rejected',
      color: 'error',
      icon: 'i-lucide-circle-x',
    },
    {
      value: 'archived',
      label: 'Archived',
      color: 'warning',
      icon: 'i-lucide-archive',
    },
  ] satisfies { value: string; label: string; color: string; icon: string }[],

  // ─── Status: Products / Product Markets ─────────────────────────────────────
  StatusProducts: [
    {
      value: 'pending',
      label: 'Pending',
      color: 'neutral',
      icon: 'i-lucide-clock',
    },
    {
      value: 'approved',
      label: 'Approved',
      color: 'success',
      icon: 'i-lucide-circle-check',
    },
    {
      value: 'rejected',
      label: 'Rejected',
      color: 'error',
      icon: 'i-lucide-circle-x',
    },
    {
      value: 'archived',
      label: 'Archived',
      color: 'warning',
      icon: 'i-lucide-archive',
    },
  ] satisfies { value: string; label: string; color: string; icon: string }[],

  // ─── Status: Markets (legacy & product_markets) ─────────────────────────────
  StatusMarkets: [
    {
      value: 'pending',
      label: 'Pending',
      color: 'neutral',
      icon: 'i-lucide-clock',
    },
    {
      value: 'approved',
      label: 'Approved',
      color: 'success',
      icon: 'i-lucide-circle-check',
    },
    {
      value: 'rejected',
      label: 'Rejected',
      color: 'error',
      icon: 'i-lucide-circle-x',
    },
    {
      value: 'archived',
      label: 'Archived',
      color: 'warning',
      icon: 'i-lucide-archive',
    },
  ] satisfies { value: string; label: string; color: string; icon: string }[],

  // ─── Status: Courses ────────────────────────────────────────────────────────
  StatusCourses: [
    {
      value: 'pending',
      label: 'Pending',
      color: 'neutral',
      icon: 'i-lucide-clock',
    },
    {
      value: 'approved',
      label: 'Approved',
      color: 'success',
      icon: 'i-lucide-circle-check',
    },
    {
      value: 'rejected',
      label: 'Rejected',
      color: 'error',
      icon: 'i-lucide-circle-x',
    },
    {
      value: 'archived',
      label: 'Archived',
      color: 'warning',
      icon: 'i-lucide-archive',
    },
  ] satisfies { value: string; label: string; color: string; icon: string }[],

  // ─── Status: Learning Courses & Lessons ─────────────────────────────────────
  StatusLearning: [
    {
      value: 'pending',
      label: 'Pending',
      color: 'neutral',
      icon: 'i-lucide-clock',
    },
    {
      value: 'approved',
      label: 'Approved',
      color: 'success',
      icon: 'i-lucide-circle-check',
    },
    {
      value: 'rejected',
      label: 'Rejected',
      color: 'error',
      icon: 'i-lucide-circle-x',
    },
    {
      value: 'archived',
      label: 'Archived',
      color: 'warning',
      icon: 'i-lucide-archive',
    },
    { value: 'draft', label: 'Draft', color: 'neutral', icon: 'i-lucide-file' },
  ] satisfies { value: string; label: string; color: string; icon: string }[],

  // ─── Status: Meetings ───────────────────────────────────────────────────────
  StatusMeetings: [
    {
      value: 'pending',
      label: 'Pending',
      color: 'neutral',
      icon: 'i-lucide-clock',
    },
    {
      value: 'approved',
      label: 'Approved',
      color: 'success',
      icon: 'i-lucide-circle-check',
    },
    {
      value: 'rejected',
      label: 'Rejected',
      color: 'error',
      icon: 'i-lucide-circle-x',
    },
    {
      value: 'archived',
      label: 'Archived',
      color: 'warning',
      icon: 'i-lucide-archive',
    },
  ] satisfies { value: string; label: string; color: string; icon: string }[],

  // ─── Status: Videos ─────────────────────────────────────────────────────────
  StatusVideos: [
    {
      value: 'pending',
      label: 'Pending',
      color: 'neutral',
      icon: 'i-lucide-clock',
    },
    {
      value: 'approved',
      label: 'Approved',
      color: 'success',
      icon: 'i-lucide-circle-check',
    },
    {
      value: 'rejected',
      label: 'Rejected',
      color: 'error',
      icon: 'i-lucide-circle-x',
    },
    {
      value: 'archived',
      label: 'Archived',
      color: 'warning',
      icon: 'i-lucide-archive',
    },
  ] satisfies { value: string; label: string; color: string; icon: string }[],

  // ─── User Roles ─────────────────────────────────────────────────────────────
  UserRole: [
    {
      value: 'admin',
      label: 'Admin',
      color: 'error',
      icon: 'i-lucide-shield-user',
    },
    {
      value: 'pakar',
      label: 'Pakar',
      color: 'success',
      icon: 'i-lucide-brain',
    },
    {
      value: 'penyuluh',
      label: 'Penyuluh',
      color: 'warning',
      icon: 'i-lucide-book-open',
    },
    {
      value: 'petani',
      label: 'Petani',
      color: 'neutral',
      icon: 'i-lucide-user',
    },
  ] satisfies { value: string; label: string; color: string; icon: string }[],

  // ─── Course Categories ──────────────────────────────────────────────────────
  CourseCategories: [
    {
      value: 'pertanian_pangan',
      label: 'Pertanian Pangan',
      icon: 'i-lucide-wheat',
    },
    { value: 'perkebunan', label: 'Perkebunan', icon: 'i-lucide-tree-palm' },
    { value: 'peternakan', label: 'Peternakan', icon: 'i-lucide-tangent' },
    { value: 'perikanan', label: 'Perikanan', icon: 'i-lucide-fish' },
    { value: 'hortikultura', label: 'Hortikultura', icon: 'i-lucide-flower' },
    { value: 'kehutanan', label: 'Kehutanan', icon: 'i-lucide-trees' },
    {
      value: 'agroteknologi',
      label: 'Agroteknologi',
      icon: 'i-lucide-flask-conical',
    },
  ] satisfies { value: string; label: string; icon: string }[],

  // ─── Product/Market Categories ──────────────────────────────────────────────
  ProductTypes: [
    {
      value: 'hasil pertanian',
      label: 'Hasil Pertanian',
      color: 'success',
      icon: 'i-lucide-wheat',
    },
    {
      value: 'alat pertanian',
      label: 'Alat Pertanian',
      color: 'info',
      icon: 'i-lucide-tool',
    },
    {
      value: 'pupuk',
      label: 'Pupuk',
      color: 'warning',
      icon: 'i-lucide-flask-conical',
    },
    {
      value: 'bibit',
      label: 'Bibit',
      color: 'success',
      icon: 'i-lucide-seedling',
    },
    {
      value: 'hortikultura',
      label: 'Hortikultura',
      color: 'neutral',
      icon: 'i-lucide-flower-2',
    },
    {
      value: 'perkebunan',
      label: 'Perkebunan',
      color: 'warning',
      icon: 'i-lucide-tree-palm',
    },
    {
      value: 'perikanan',
      label: 'Perikanan',
      color: 'info',
      icon: 'i-lucide-fish',
    },
    {
      value: 'peternakan',
      label: 'Peternakan',
      color: 'error',
      icon: 'i-lucide-beef',
    },
  ] satisfies { value: string; label: string; color: string; icon: string }[],

  // ─── Food Price Categories ──────────────────────────────────────────────────
  FoodPriceCategories: [
    {
      value: 'hortikultura',
      label: 'Hortikultura',
      icon: 'i-lucide-flower-2',
      color: 'success',
    },
    {
      value: 'perkebunan',
      label: 'Perkebunan',
      icon: 'i-lucide-trees',
      color: 'warning',
    },
    {
      value: 'perikanan',
      label: 'Perikanan',
      icon: 'i-lucide-fish',
      color: 'info',
    },
    {
      value: 'peternakan',
      label: 'Peternakan',
      icon: 'i-lucide-beef',
      color: 'error',
    },
    {
      value: 'pertanian_pangan',
      label: 'Pertanian Pangan',
      icon: 'i-lucide-wheat',
      color: 'neutral',
    },
  ] satisfies { value: string; label: string; icon: string; color: string }[],

  // ─── Embed Platforms (Social Media) ─────────────────────────────────────────
  EmbedPlatforms: [
    {
      value: 'instagram_post',
      label: 'Instagram Post',
      icon: 'i-simple-icons-instagram',
      color: 'error',
    },
    {
      value: 'instagram_reel',
      label: 'Instagram Reel',
      icon: 'i-simple-icons-instagram',
      color: 'error',
    },
    {
      value: 'facebook_post',
      label: 'Facebook Post',
      icon: 'i-simple-icons-facebook',
      color: 'info',
    },
    {
      value: 'facebook_video',
      label: 'Facebook Video',
      icon: 'i-simple-icons-facebook',
      color: 'info',
    },
    {
      value: 'youtube',
      label: 'YouTube',
      icon: 'i-simple-icons-youtube',
      color: 'error',
    },
    {
      value: 'tiktok',
      label: 'TikTok',
      icon: 'i-simple-icons-tiktok',
      color: 'neutral',
    },
    {
      value: 'twitter',
      label: 'Twitter / X',
      icon: 'i-simple-icons-x',
      color: 'neutral',
    },
  ] satisfies { value: string; label: string; icon: string; color: string }[],

  // ─── Lesson Embed Platforms (YouTube + Google Drive) ────────────────────────
  LessonEmbedPlatforms: [
    {
      value: 'youtube',
      label: 'YouTube',
      icon: 'i-simple-icons-youtube',
      color: 'error',
    },
    {
      value: 'gdrive_doc',
      label: 'Google Docs',
      icon: 'i-simple-icons-googledocs',
      color: 'info',
    },
    {
      value: 'gdrive_sheet',
      label: 'Google Sheets',
      icon: 'i-simple-icons-googlesheets',
      color: 'success',
    },
    {
      value: 'gdrive_slide',
      label: 'Google Slides',
      icon: 'i-simple-icons-googleslides',
      color: 'warning',
    },
    {
      value: 'gdrive_video',
      label: 'Google Drive Video',
      icon: 'i-simple-icons-googledrive',
      color: 'neutral',
    },
    {
      value: 'gdrive_pdf',
      label: 'Google Drive PDF',
      icon: 'i-simple-icons-googledrive',
      color: 'error',
    },
  ] satisfies { value: string; label: string; icon: string; color: string }[],

  // ─── Price Units ────────────────────────────────────────────────────────────
  PriceUnits: [
    { value: '/kg', label: 'Per Kg' },
    { value: '/gram', label: 'Per Gram' },
    { value: '/liter', label: 'Per Liter' },
    { value: '/buah', label: 'Per Buah' },
    { value: '/ikat', label: 'Per Ikat' },
    { value: '/karung', label: 'Per Karung' },
    { value: '/kotak', label: 'Per Kotak' },
    { value: '/ton', label: 'Per Ton' },
    { value: '/ekor', label: 'Per Ekor' },
    { value: '/botol', label: 'Per Botol' },
  ] satisfies { value: string; label: string }[],
} as const

// ─── Type Exports ─────────────────────────────────────────────────────────────
export type SortOption = (typeof Enum.SortOptions)[number]
export type StatusNews = (typeof Enum.StatusNews)[number]
export type StatusProducts = (typeof Enum.StatusProducts)[number]
export type StatusMarkets = (typeof Enum.StatusMarkets)[number]
export type StatusVideos = (typeof Enum.StatusVideos)[number]
export type StatusCourses = (typeof Enum.StatusCourses)[number]
export type StatusLearning = (typeof Enum.StatusLearning)[number]
export type StatusMeetings = (typeof Enum.StatusMeetings)[number]
export type UserRole = (typeof Enum.UserRole)[number]
export type CourseCategory = (typeof Enum.CourseCategories)[number]['value']
export type LessonEmbedPlatform =
  (typeof Enum.LessonEmbedPlatforms)[number]['value']
export type EmbedPlatform = (typeof Enum.EmbedPlatforms)[number]['value']
export type ProductType = (typeof Enum.ProductTypes)[number]['value']
export type FoodPriceCategory =
  (typeof Enum.FoodPriceCategories)[number]['value']
export type PriceUnit = (typeof Enum.PriceUnits)[number]['value']
