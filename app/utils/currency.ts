// file: utils/currency.ts

/**
 * Format angka menjadi format mata uang (Default: IDR / Rupiah)
 * * @param value Angka yang akan diformat (number atau string)
 * @param options Opsi kustomisasi format (opsional)
 * @returns String yang sudah diformat (contoh: "Rp 15.000")
 */
export const formatCurrency = (
  value: number | string | null | undefined,
  options?: {
    currency?: string
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  },
): string => {
  // Tangani nilai kosong atau tidak valid
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 'Rp 0'
  }

  const numericValue = Number(value)

  // Default opsi untuk Rupiah Indonesia
  const defaultOptions = {
    currency: 'IDR',
    locale: 'id-ID',
    minimumFractionDigits: 0, // Rupiah umumnya tidak pakai desimal (,00)
    maximumFractionDigits: 0,
  }

  const finalOptions = { ...defaultOptions, ...options }

  return new Intl.NumberFormat(finalOptions.locale, {
    style: 'currency',
    currency: finalOptions.currency,
    minimumFractionDigits: finalOptions.minimumFractionDigits,
    maximumFractionDigits: finalOptions.maximumFractionDigits,
  }).format(numericValue)
}
