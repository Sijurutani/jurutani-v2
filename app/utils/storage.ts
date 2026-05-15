/**
 * Storage Utility Functions
 * Handles file uploads, downloads, and deletions for Supabase Storage buckets
 */
import type { Database } from '~/types/database.types'

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type NewsFolder = 'images' | 'gallery' | 'attachments'
export type MarketFolder = 'thumbnail' | 'gallery' | 'attachments'
export type CourseFolder = 'covers' | 'content'
export type ProductMarketFolder = 'thumbnails' | 'gallery' | 'attachments'

// ─────────────────────────────────────────────────────────────────────────────
// News Storage (bucket: news-images)
//   images     → images/[newsId]/filename
//   gallery    → gallery/[newsId]/filename
//   attachments→ attachments/[newsId]/filename
// ─────────────────────────────────────────────────────────────────────────────

const BUCKET_NEWS = 'news-images'

/**
 * Upload a file to Supabase Storage (news-images bucket)
 */
export async function uploadNewsFile(
  folder: NewsFolder,
  newsId: string,
  file: File,
): Promise<string> {
  const supabase = useSupabaseClient<Database>()
  const ext = file.name.split('.').pop() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  const path = `${folder}/${newsId}/${timestamp}_${random}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_NEWS)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(BUCKET_NEWS).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Get public URL from a stored path (handles both full URLs and relative paths)
 */
export function getNewsPublicUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const supabase = useSupabaseClient<Database>()
  const { data } = supabase.storage.from(BUCKET_NEWS).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete a file from Supabase Storage by its full public URL or storage path
 */
export async function deleteNewsFile(urlOrPath: string): Promise<void> {
  const supabase = useSupabaseClient<Database>()
  const storagePrefix = `/storage/v1/object/public/${BUCKET_NEWS}/`
  const path = urlOrPath.includes(storagePrefix)
    ? urlOrPath.split(storagePrefix)[1]!
    : urlOrPath
  await supabase.storage.from(BUCKET_NEWS).remove([path])
}

// ─────────────────────────────────────────────────────────────────────────────
// Markets Storage  (bucket: markets)
//   thumbnail  → [marketId]/filename
//   gallery    → [marketId]/gallery/filename
//   attachments→ [marketId]/attachments/filename
// ─────────────────────────────────────────────────────────────────────────────

const BUCKET_MARKETS = 'markets'

/**
 * Upload a file to Supabase Storage (markets bucket)
 * folder: 'thumbnail' (cover), 'gallery', 'attachments'
 * Returns the public URL of the uploaded file.
 */
export async function uploadMarketFile(
  folder: 'thumbnail' | 'gallery' | 'attachments',
  marketId: string,
  file: File,
): Promise<string> {
  const supabase = useSupabaseClient<Database>()
  const ext = file.name.split('.').pop() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  const filename = `${timestamp}_${random}.${ext}`
  const path =
    folder === 'thumbnail'
      ? `${marketId}/${filename}`
      : `${marketId}/${folder}/${filename}`

  const { error } = await supabase.storage
    .from(BUCKET_MARKETS)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(BUCKET_MARKETS).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Get public URL from a stored path (handles both full URLs and relative paths)
 */
export function getMarketPublicUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const supabase = useSupabaseClient<Database>()
  const { data } = supabase.storage.from(BUCKET_MARKETS).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete a file from Supabase Storage by its full public URL or storage path
 */
export async function deleteMarketFile(urlOrPath: string): Promise<void> {
  const supabase = useSupabaseClient<Database>()
  // Extract path from full URL if needed
  const storagePrefix = `/storage/v1/object/public/${BUCKET_MARKETS}/`
  const path = urlOrPath.includes(storagePrefix)
    ? urlOrPath.split(storagePrefix)[1]!
    : urlOrPath
  await supabase.storage.from(BUCKET_MARKETS).remove([path])
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Markets Storage (bucket: product-markets-images)
//   thumbnails → thumbnails/[slug]/filename
//   gallery    → gallery/[slug]/filename
//   attachments→ attachments/[slug]/filename (bucket: product-markets-attachments)
// ─────────────────────────────────────────────────────────────────────────────

const BUCKET_PRODUCT_MARKETS_IMAGES = 'product-markets-images'
const BUCKET_PRODUCT_MARKETS_ATTACHMENTS = 'product-markets-attachments'

/**
 * Upload a file to product markets images bucket
 */
export async function uploadProductMarketFile(
  folder: ProductMarketFolder,
  slug: string,
  file: File,
): Promise<string> {
  const supabase = useSupabaseClient<Database>()
  const ext = file.name.split('.').pop() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  const path = `${folder}/${slug}/${timestamp}_${random}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_PRODUCT_MARKETS_IMAGES)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage
    .from(BUCKET_PRODUCT_MARKETS_IMAGES)
    .getPublicUrl(path)
  return data.publicUrl
}

/**
 * Upload an attachment file to product markets attachments bucket
 */
export async function uploadProductMarketAttachment(
  slug: string,
  file: File,
): Promise<{ url: string; name: string; type: string; size: number }> {
  const supabase = useSupabaseClient<Database>()
  const ext = file.name.split('.').pop() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  const path = `attachments/${slug}/${timestamp}_${random}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_PRODUCT_MARKETS_ATTACHMENTS)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage
    .from(BUCKET_PRODUCT_MARKETS_ATTACHMENTS)
    .getPublicUrl(path)

  return {
    url: data.publicUrl,
    name: file.name,
    type: file.type,
    size: file.size,
  }
}

/**
 * Get public URL for product market images
 */
export function getProductMarketPublicUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const supabase = useSupabaseClient<Database>()
  const { data } = supabase.storage
    .from(BUCKET_PRODUCT_MARKETS_IMAGES)
    .getPublicUrl(path)
  return data.publicUrl
}

/**
 * Get public URL for product market attachments
 */
export function getProductMarketAttachmentUrl(
  path: string | null,
): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const supabase = useSupabaseClient<Database>()
  const { data } = supabase.storage
    .from(BUCKET_PRODUCT_MARKETS_ATTACHMENTS)
    .getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete a file from product markets storage
 */
export async function deleteProductMarketFile(
  urlOrPath: string,
  isAttachment: boolean = false,
): Promise<void> {
  const supabase = useSupabaseClient<Database>()
  const bucket = isAttachment
    ? BUCKET_PRODUCT_MARKETS_ATTACHMENTS
    : BUCKET_PRODUCT_MARKETS_IMAGES
  const storagePrefix = `/storage/v1/object/public/${bucket}/`
  const path = urlOrPath.includes(storagePrefix)
    ? urlOrPath.split(storagePrefix)[1]!
    : urlOrPath
  await supabase.storage.from(bucket).remove([path])
}

// ─────────────────────────────────────────────────────────────────────────────
// Courses Storage (bucket: courses-images)
//   covers  → covers/[courseId]/filename
// ─────────────────────────────────────────────────────────────────────────────

const BUCKET_COURSES = 'courses-images'

// ─────────────────────────────────────────────────────────────────────────────
// Food Prices Storage (bucket: food-images)
//   [foodId]/filename
// ─────────────────────────────────────────────────────────────────────────────

const BUCKET_FOOD_IMAGES = 'food-images'

function normalizeFoodImagePath(urlOrPath: string): string {
  const storagePrefix = `/storage/v1/object/public/${BUCKET_FOOD_IMAGES}/`
  const withoutPublicPrefix = urlOrPath.includes(storagePrefix)
    ? urlOrPath.split(storagePrefix)[1]!
    : urlOrPath

  return withoutPublicPrefix
    .replace(/^\/+/, '')
    .replace(new RegExp(`^${BUCKET_FOOD_IMAGES}/`), '')
}

/**
 * Upload a food image to Supabase Storage (food-images bucket)
 * Path format: [foodId]/[filename]
 */
export async function uploadFoodImage(
  foodId: string,
  file: File,
): Promise<string> {
  const supabase = useSupabaseClient<Database>()
  const ext = file.name.split('.').pop() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  const path = `${foodId}/${timestamp}_${random}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_FOOD_IMAGES)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(BUCKET_FOOD_IMAGES).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Get public URL for a food image path.
 * Accepts:
 * - full URL
 * - storage path with bucket prefix (food-images/[foodId]/filename)
 * - storage path without bucket prefix ([foodId]/filename)
 */
export function getFoodPublicUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path

  const supabase = useSupabaseClient<Database>()
  const normalizedPath = normalizeFoodImagePath(path)
  const { data } = supabase.storage
    .from(BUCKET_FOOD_IMAGES)
    .getPublicUrl(normalizedPath)
  return data.publicUrl
}

/**
 * Delete a food image from Supabase Storage by URL or path.
 */
export async function deleteFoodImage(urlOrPath: string): Promise<void> {
  const supabase = useSupabaseClient<Database>()
  const path = normalizeFoodImagePath(urlOrPath)
  await supabase.storage.from(BUCKET_FOOD_IMAGES).remove([path])
}

export async function uploadCourseFile(
  folder: CourseFolder,
  courseId: string,
  file: File,
): Promise<string> {
  const supabase = useSupabaseClient<Database>()
  const ext = file.name.split('.').pop() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  const path = `${folder}/${courseId}/${timestamp}_${random}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_COURSES)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(BUCKET_COURSES).getPublicUrl(path)
  return data.publicUrl
}

export function getCoursePublicUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const supabase = useSupabaseClient<Database>()
  const { data } = supabase.storage.from(BUCKET_COURSES).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteCourseFile(urlOrPath: string): Promise<void> {
  const supabase = useSupabaseClient<Database>()
  const storagePrefix = `/storage/v1/object/public/${BUCKET_COURSES}/`
  const path = urlOrPath.includes(storagePrefix)
    ? urlOrPath.split(storagePrefix)[1]!
    : urlOrPath
  await supabase.storage.from(BUCKET_COURSES).remove([path])
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic Storage Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => file.type.includes(type))
}

/**
 * Generate unique filename with timestamp
 */
export function generateFilename(originalName: string): string {
  const ext = originalName.split('.').pop() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  return `${timestamp}_${random}.${ext}`
}

/**
 * Convert file to base64 (for previews)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
