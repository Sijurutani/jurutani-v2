/**
 * useWeatherData
 * Composable untuk fetch data cuaca dari OpenWeatherMap API.
 * - Menggunakan $fetch (ofetch) yang SSR-aware
 * - Semua browser API dijaga dengan import.meta.client
 * - Type-safe dengan interface OpenWeatherResponse
 */

// ─── Type Definitions ──────────────────────────────────────────────────────────

export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface WeatherMain {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  pressure: number
  humidity: number
}

export interface WeatherWind {
  speed: number
  deg: number
  gust?: number
}

export interface WeatherResponse {
  name: string
  sys: { country: string; sunrise: number; sunset: number }
  weather: WeatherCondition[]
  main: WeatherMain
  wind: WeatherWind
  visibility: number
  dt: number
  timezone: number
}

// ─── Composable ────────────────────────────────────────────────────────────────

// Koordinat default: Jakarta Pusat
const DEFAULT_LAT = -6.2088
const DEFAULT_LON = 106.8456

export const useWeatherData = () => {
  const weatherData = ref<WeatherResponse | null>(null)
  const isLoading = ref(false)
  const error = ref('')

  const config = useRuntimeConfig()
  const BASE =
    (config.public.openweatherBaseUrl || 'https://api.openweathermap.org/data/2.5') + '/weather'
  const KEY = config.public.openweatherApiKey as string | undefined

  // ── Core fetch ────────────────────────────────────────────────────────────
  const fetchByCoords = async (lat: number, lon: number): Promise<void> => {
    if (!KEY) {
      error.value = 'API key cuaca belum dikonfigurasi'
      return
    }

    isLoading.value = true
    error.value = ''

    try {
      const data = await $fetch<WeatherResponse>(BASE, {
        params: {
          lat,
          lon,
          appid: KEY,
          units: 'metric',
          lang: 'id',
        },
      })
      weatherData.value = data
    } catch (e: unknown) {
      weatherData.value = null
      if (e instanceof Error) {
        error.value = e.message
      } else {
        error.value = 'Gagal mengambil data cuaca'
      }
    } finally {
      isLoading.value = false
    }
  }

  // ── Fallback ke Jakarta ───────────────────────────────────────────────────
  const fetchDefault = (): void => {
    fetchByCoords(DEFAULT_LAT, DEFAULT_LON)
  }

  // ── Geolocation user ─────────────────────────────────────────────────────
  const requestLocation = (): void => {
    if (!import.meta.client) return

    if (!navigator.geolocation) {
      error.value = 'Geolocation tidak didukung browser ini'
      return
    }

    isLoading.value = true
    error.value = ''

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchByCoords(pos.coords.latitude, pos.coords.longitude)
      },
      (geoError) => {
        isLoading.value = false
        if (geoError.code === geoError.PERMISSION_DENIED) {
          error.value = 'Izin lokasi ditolak. Menampilkan cuaca default.'
          fetchDefault()
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          error.value = 'Lokasi tidak tersedia. Menampilkan cuaca default.'
          fetchDefault()
        } else {
          error.value = 'Gagal mendapatkan lokasi'
          fetchDefault()
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300_000, // 5 menit cache geolocation
      },
    )
  }

  return {
    weatherData: readonly(weatherData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    requestLocation,
    fetchDefault,
    fetchByCoords,
  }
}
