/**
 * Utils untuk memformat tanggal dengan beberapa format yang umum digunakan
 */

/**
 * Format tanggal menjadi string dengan format "DD MMM YYYY" dalam Bahasa Indonesia
 * Contoh: 15 Jan 2023
 *
 * @param dateString - ISO date string atau Date object
 * @returns string dengan format tanggal yang sudah diformat
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return '-'

  const date = new Date(dateString)

  // Cek apakah tanggal valid
  if (isNaN(date.getTime())) return '-'

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}

/**
 * Format tanggal menjadi string dengan format lengkap "DD MMMM YYYY" dalam Bahasa Indonesia
 * Contoh: 15 Januari 2023
 *
 * @param dateString - ISO date string atau Date object
 * @returns string dengan format tanggal lengkap
 */
export function formatDateLong(dateString: string | Date): string {
  if (!dateString) return '-'

  const date = new Date(dateString)

  // Cek apakah tanggal valid
  if (isNaN(date.getTime())) return '-'

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}

/**
 * Format tanggal menjadi string dengan format "DD MMM YYYY, HH:MM" dalam Bahasa Indonesia
 * Contoh: 15 Jan 2023, 14:30
 *
 * @param dateString - ISO date string atau Date object
 * @returns string dengan format tanggal dan waktu
 */
export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return '-'

  const date = new Date(dateString)

  // Cek apakah tanggal valid
  if (isNaN(date.getTime())) return '-'

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  // Format waktu dengan leading zeros untuk jam dan menit
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day} ${month} ${year}, ${hours}:${minutes}`
}

/**
 * Format tanggal relatif (seperti "5 menit yang lalu", "kemarin", dll)
 *
 * @param dateString - ISO date string atau Date object
 * @returns string dengan format waktu relatif
 */
export function formatRelativeTime(dateString: string | Date): string {
  if (!dateString) return '-'

  const date = new Date(dateString)

  // Cek apakah tanggal valid
  if (isNaN(date.getTime())) return '-'

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  // Kurang dari 1 menit
  if (diffInSeconds < 60) {
    return 'Baru saja'
  }

  // Kurang dari 1 jam
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} menit yang lalu`
  }

  // Kurang dari 1 hari
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} jam yang lalu`
  }

  // Kurang dari 2 hari
  if (diffInSeconds < 172800) {
    return 'Kemarin'
  }

  // Kurang dari 1 minggu
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} hari yang lalu`
  }

  // Lebih dari 1 minggu, gunakan format standar
  return formatDate(date)
}

/**
 * Format tanggal menjadi string dengan format "YYYY-MM-DD"
 * Cocok untuk input type="date"
 *
 * @param dateString - ISO date string atau Date object
 * @returns string dengan format YYYY-MM-DD
 */
export function formatDateForInput(dateString?: string | Date): string {
  if (!dateString) {
    // Default ke tanggal hari ini jika tidak ada input
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const date = new Date(dateString)

  // Cek apakah tanggal valid
  if (isNaN(date.getTime())) return ''

  return date.toISOString().split('T')[0]
}
