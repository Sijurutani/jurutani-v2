<script setup lang="ts">
  definePageMeta({ layout: 'default' })

  useSeoMeta({
    title: 'Cuaca Pertanian & Prakiraan Hujan untuk Petani',
    description: 'Pantau cuaca pertanian harian & prakiraan hujan akurat. Ketahui kondisi paling ideal untuk aktivitas tanam, semprot pupuk, serta panen di wilayah Anda.'
  })

  // ─── State ─────────────────────────────────────────────────────
  const weatherData = ref<any>(null)
  const forecastData = ref<any>(null)
  const hourlyData = ref<any>(null)
  const isLoading = ref(true)
  const isForecastLoading = ref(false)
  const isHourlyLoading = ref(false)
  const error = ref('')
  const forecastError = ref('')
  const hourlyError = ref('')

  const BASE_URL =
    process.env.OPENWEATHER_BASE_URL ||
    'https://api.openweathermap.org/data/2.5'
  const API_KEY =
    process.env.OPENWEATHER_API_KEY || '416f0ed0bb28d3110beedecf5fa9cf85'

  const orbRef = ref<HTMLElement | null>(null)
  const floatIconRef = ref<HTMLElement | null>(null)

  // ─── Helpers ───────────────────────────────────────────────────
  const fmtTime = (ts: number, tz: number) =>
    new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }).format(new Date((ts + tz) * 1000))

  const formatHour = (ts: number) =>
    new Date(ts * 1000).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

  const formatDateShort = (d: string) =>
    new Intl.DateTimeFormat('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date(d))

  const groupForecastByDay = (list: any[]) => {
    const grouped: Record<string, any> = {}
    list.forEach((item) => {
      const key = new Date(item.dt * 1000).toISOString().split('T')[0]
      if (!grouped[key])
        grouped[key] = {
          date: key,
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          main_weather: item.weather[0],
          humidity: item.main.humidity,
          wind_speed: item.wind.speed,
          pop: item.pop || 0,
        }
      grouped[key].temp_min = Math.min(
        grouped[key].temp_min,
        item.main.temp_min,
      )
      grouped[key].temp_max = Math.max(
        grouped[key].temp_max,
        item.main.temp_max,
      )
    })
    return Object.values(grouped).slice(0, 5)
  }

  // ─── API ───────────────────────────────────────────────────────
  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=id`,
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message)
      weatherData.value = data
      error.value = ''
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat cuaca'
      weatherData.value = null
    } finally {
      isLoading.value = false
    }
  }

  const fetchForecast = async (lat: number, lon: number) => {
    isForecastLoading.value = true
    isHourlyLoading.value = true
    try {
      const res = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=id`,
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message)
      forecastData.value = groupForecastByDay(data.list || [])
      hourlyData.value = (data.list || []).slice(0, 8)
      forecastError.value = ''
      hourlyError.value = ''
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Gagal memuat ramalan'
      forecastError.value = m
      hourlyError.value = m
    } finally {
      isForecastLoading.value = false
      isHourlyLoading.value = false
    }
  }

  const getLocation = () => {
    if (!import.meta.client) return
    if (!navigator.geolocation) {
      isLoading.value = false
      error.value = 'Geolocation tidak didukung'
      return
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await fetchWeather(coords.latitude, coords.longitude)
        if (!error.value) await fetchForecast(coords.latitude, coords.longitude)
      },
      () => {
        isLoading.value = false
        error.value = 'Tidak dapat mengakses lokasi'
      },
    )
  }

  // ─── Computed ──────────────────────────────────────────────────
  const localTime = computed(() =>
    weatherData.value
      ? fmtTime(weatherData.value.dt, weatherData.value.timezone)
      : '-',
  )
  const sunriseTime = computed(() =>
    weatherData.value
      ? fmtTime(weatherData.value.sys.sunrise, weatherData.value.timezone)
      : '-',
  )
  const sunsetTime = computed(() =>
    weatherData.value
      ? fmtTime(weatherData.value.sys.sunset, weatherData.value.timezone)
      : '-',
  )

  const windDir = computed(() => {
    if (!weatherData.value?.wind) return '-'
    const dirs = [
      'Utara',
      'Timur Laut',
      'Timur',
      'Tenggara',
      'Selatan',
      'Barat Daya',
      'Barat',
      'Barat Laut',
    ]
    return dirs[Math.round(weatherData.value.wind.deg / 45) % 8]
  })

  const farmingRec = computed(() => {
    if (!weatherData.value) return null
    const { temp, humidity } = weatherData.value.main
    const wind = weatherData.value.wind.speed
    const clouds = weatherData.value.clouds.all
    const main = weatherData.value.weather[0].main.toLowerCase()
    const rec: { icon: string; text: string; ok: boolean }[] = []
    let suitable = true

    if (temp > 35) {
      suitable = false
      rec.push({
        icon: 'i-lucide-thermometer',
        text: 'Suhu terlalu tinggi. Siram lebih sering, hindari penyemprotan.',
        ok: false,
      })
    } else if (temp < 15) {
      suitable = false
      rec.push({
        icon: 'i-lucide-snowflake',
        text: 'Suhu terlalu rendah. Lindungi tanaman dari embun beku.',
        ok: false,
      })
    } else
      rec.push({
        icon: 'i-lucide-sun',
        text: 'Suhu optimal untuk pertumbuhan tanaman tropis.',
        ok: true,
      })

    if (humidity > 85)
      rec.push({
        icon: 'i-lucide-droplets',
        text: 'Kelembaban tinggi — waspada serangan jamur dan hama.',
        ok: false,
      })
    else if (humidity < 40)
      rec.push({
        icon: 'i-lucide-droplets',
        text: 'Kelembaban rendah — tingkatkan frekuensi penyiraman.',
        ok: false,
      })
    else
      rec.push({
        icon: 'i-lucide-droplets',
        text: 'Kelembaban ideal untuk sebagian besar tanaman.',
        ok: true,
      })

    if (wind > 5)
      rec.push({
        icon: 'i-lucide-wind',
        text: 'Angin kencang — tunda penyemprotan pestisida/pupuk.',
        ok: false,
      })
    else
      rec.push({
        icon: 'i-lucide-wind',
        text: 'Kondisi angin baik untuk penyemprotan.',
        ok: true,
      })

    if (clouds > 80)
      rec.push({
        icon: 'i-lucide-cloud',
        text: 'Cahaya rendah — fotosintesis kurang optimal.',
        ok: false,
      })
    else if (clouds < 30)
      rec.push({
        icon: 'i-lucide-sun',
        text: 'Cahaya optimal — fotosintesis maksimal.',
        ok: true,
      })

    if (main.includes('rain') || main.includes('thunder')) {
      suitable = false
      rec.push({
        icon: 'i-lucide-cloud-rain',
        text: 'Hujan aktif — tunda pemupukan & penyemprotan.',
        ok: false,
      })
    } else if (main.includes('clear')) {
      rec.push({
        icon: 'i-lucide-sun',
        text: 'Cuaca cerah — ideal untuk pengolahan lahan.',
        ok: true,
      })
    }
    return { suitable, items: rec }
  })

  // ─── Weather background ────────────────────────────────────────
  const weatherBg = computed(() => {
    if (!weatherData.value)
      return 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1400&q=80'
    const main = weatherData.value.weather[0].main.toLowerCase()
    if (main.includes('rain'))
      return 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1400&q=80'
    if (main.includes('cloud'))
      return 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1400&q=80'
    if (main.includes('clear'))
      return 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1400&q=80'
    if (main.includes('thunder'))
      return 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1400&q=80'
    if (main.includes('mist') || main.includes('fog'))
      return 'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1400&q=80'
    return 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1400&q=80'
  })

  // ─── SVG Hourly Chart ─────────────────────────────────────────
  const chartSvgRef = ref<SVGElement | null>(null)
  const chartWidth = ref(700)

  const updateChartWidth = () => {
    if (chartSvgRef.value)
      chartWidth.value = chartSvgRef.value.clientWidth || 700
  }

  const CHART_H = 175
  const CHART_PAD_L = 36
  const CHART_PAD_R = 16
  const CHART_PAD_T = 24
  const CHART_PAD_B = 63

  const chartPoints = computed(() => {
    const data = hourlyData.value
    if (!data?.length) return []
    const temps = data.map((h: any) => h.main.temp)
    const minT = Math.min(...temps) - 2
    const maxT = Math.max(...temps) + 2
    const W = chartWidth.value
    const xStep = (W - CHART_PAD_L - CHART_PAD_R) / (data.length - 1)
    const yOf = (t: number) =>
      CHART_PAD_T +
      ((maxT - t) / (maxT - minT)) * (CHART_H - CHART_PAD_T - CHART_PAD_B)
    return data.map((h: any, i: number) => ({
      x: CHART_PAD_L + i * xStep,
      y: yOf(h.main.temp),
      temp: Math.round(h.main.temp),
      label: i === 0 ? 'Skrg' : formatHour(h.dt),
      pop: Math.round(h.pop * 100),
      icon: h.weather[0].icon,
    }))
  })

  const chartLinePath = computed(() =>
    chartPoints.value
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' '),
  )

  const chartAreaPath = computed(() => {
    const pts = chartPoints.value
    if (!pts.length) return ''
    const last = pts[pts.length - 1]
    const first = pts[0]
    return `${chartLinePath.value} L ${last.x} ${CHART_H - CHART_PAD_B} L ${first.x} ${CHART_H - CHART_PAD_B} Z`
  })

  watch(hourlyData, () => nextTick(() => updateChartWidth()))

  onMounted(() => {
    getLocation()
    nextTick(() => updateChartWidth())
    window.addEventListener('resize', updateChartWidth, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateChartWidth)
  })
</script>

<template>
  <div class="wx-page">
    <!-- ════════════════════════════════════════════
         FIXED BACKGROUND
    ═══════════════════════════════════════════════ -->
    <div
      class="wx-fixed-bg fixed inset-2 sm:inset-3 lg:inset-4 rounded-3xl overflow-hidden"
    >
      <NuxtImg
        v-if="weatherData"
        :src="weatherBg"
        alt="latar cuaca"
        class="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div
        v-else
        class="absolute inset-0 bg-linear-to-br from-green-900 via-emerald-800 to-teal-900"
      />
      <!-- Dark overlay top -->
      <div
        class="absolute inset-0 bg-linear-to-b from-black/75 via-black/40 to-transparent"
      />
      <!-- Subtle bottom darkening so lower content stays readable -->
      <div class="wx-fixed-bg__bottom" />
      <!-- Ambient orb — inside fixed-bg so it’s clipped by overflow:hidden -->
      <div
        ref="orbRef"
        class="wx-orb animate-weather-orb"
        style="
          --orb-duration: 7s;
          --orb-scale: 1.25;
          --orb-opacity: 1;
          --orb-y: 0;
        "
      />
    </div>

    <!-- ════════════════════════════════════════════
         SCROLLABLE CONTENT
    ═══════════════════════════════════════════════ -->
    <div class="wx-scroll-content">
      <!-- ── HERO: Main weather display ── -->
      <section class="wx-hero-section">
        <!-- Loading skeleton -->
        <div v-if="isLoading" class="flex flex-col gap-6 animate-pulse">
          <div class="h-8 w-48 rounded-full bg-white/15" />
          <div class="flex items-center gap-6">
            <div class="w-28 h-28 rounded-full bg-white/15" />
            <div class="flex flex-col gap-3">
              <div class="h-16 w-36 rounded-xl bg-white/15" />
              <div class="h-4 w-44 rounded-full bg-white/10" />
              <div class="h-3 w-32 rounded-full bg-white/08" />
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div v-for="i in 4" :key="i" class="h-16 rounded-2xl bg-white/10" />
          </div>
          <p class="text-center text-sm text-white/40">
            Mendeteksi lokasi &amp; memuat cuaca…
          </p>
        </div>

        <!-- Error -->
        <div
          v-else-if="error"
          class="flex flex-col items-center justify-center py-16 text-center gap-4"
        >
          <UIcon name="i-lucide-cloud-off" class="w-16 h-16 text-white/30" />
          <h2 class="text-xl font-bold text-white">Gagal Memuat Cuaca</h2>
          <p class="text-sm text-white/50 max-w-xs">{{ error }}</p>
          <UButton
            color="neutral"
            variant="ghost"
            class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white font-medium hover:bg-white/20 transition-all"
            @click="getLocation"
          >
            <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" />
            Coba Lagi
          </UButton>
        </div>

        <!-- Weather data -->
        <template v-else-if="weatherData">
          <!-- location + update -->
          <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div class="wx-badge">
              <UIcon
                name="i-lucide-map-pin"
                class="w-4 h-4 text-emerald-300 shrink-0"
              />
              <span>{{ weatherData.name }}, {{ weatherData.sys.country }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-white/50">
              <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
              Diperbarui {{ localTime }}
            </div>
          </div>

          <!-- Main: icon + temp | stat grid -->
          <div
            class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <!-- Left: temp -->
            <div class="flex items-center gap-5">
              <div
                ref="floatIconRef"
                class="wx-float-icon animate-weather-float"
                style="--float-y: -10px; --float-duration: 4s"
              >
                <NuxtImg
                  :src="`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`"
                  :alt="weatherData.weather[0].description"
                  class="w-28 h-28 drop-shadow-2xl md:w-36 md:h-36"
                  @error="
                    (e) => ((e.target as HTMLImageElement).src = '/profile.webp')
                  "
                />
              </div>
              <div>
                <div class="flex items-start">
                  <span class="wx-temp">{{
                    Math.round(weatherData.main.temp)
                  }}</span>
                  <span
                    class="mt-3 text-3xl font-light text-white/60 md:text-4xl"
                    >°C</span
                  >
                </div>
                <p class="text-lg font-medium capitalize text-white/80">
                  {{ weatherData.weather[0].description }}
                </p>
                <p class="mt-1 text-sm text-white/50">
                  Terasa {{ Math.round(weatherData.main.feels_like) }}° ·
                  {{ Math.round(weatherData.main.temp_min) }}° /
                  {{ Math.round(weatherData.main.temp_max) }}°
                </p>
              </div>
            </div>

            <!-- Right: stat pills -->
            <div
              class="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
            >
              <div class="wx-stat-pill">
                <UIcon
                  name="i-lucide-droplet"
                  class="w-5 h-5 text-blue-300 shrink-0"
                />
                <div>
                  <p class="text-xs text-white/50">Kelembaban</p>
                  <p class="text-base font-bold text-white">
                    {{ weatherData.main.humidity }}%
                  </p>
                </div>
              </div>
              <div class="wx-stat-pill">
                <UIcon
                  name="i-lucide-wind"
                  class="w-5 h-5 text-cyan-300 shrink-0"
                />
                <div>
                  <p class="text-xs text-white/50">Angin</p>
                  <p class="text-base font-bold text-white">
                    {{ weatherData.wind?.speed || 0 }} m/s
                  </p>
                  <p class="text-xs text-white/40">{{ windDir }}</p>
                </div>
              </div>
              <div class="wx-stat-pill">
                <UIcon
                  name="i-lucide-sun"
                  class="w-5 h-5 text-orange-300 shrink-0"
                />
                <div>
                  <p class="text-xs text-white/50">Matahari Terbit</p>
                  <p class="text-base font-bold text-white">
                    {{ sunriseTime }}
                  </p>
                </div>
              </div>
              <div class="wx-stat-pill">
                <UIcon
                  name="i-lucide-sunset"
                  class="w-5 h-5 text-rose-300 shrink-0"
                />
                <div>
                  <p class="text-xs text-white/50">Matahari Terbenam</p>
                  <p class="text-base font-bold text-white">{{ sunsetTime }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Detail chips -->
          <div class="flex flex-wrap gap-2 mt-6">
            <div class="wx-chip">
              <UIcon
                name="i-lucide-gauge"
                class="w-3.5 h-3.5 text-indigo-400"
              /><span>{{ weatherData.main.pressure }} hPa</span>
            </div>
            <div class="wx-chip">
              <UIcon
                name="i-lucide-eye"
                class="w-3.5 h-3.5 text-purple-400"
              /><span>{{ (weatherData.visibility / 1000).toFixed(1) }} km</span>
            </div>
            <div class="wx-chip">
              <UIcon
                name="i-lucide-cloud"
                class="w-3.5 h-3.5 text-slate-300"
              /><span>Awan {{ weatherData.clouds.all }}%</span>
            </div>
            <div class="wx-chip">
              <UIcon
                name="i-lucide-trending-up"
                class="w-3.5 h-3.5 text-emerald-400"
              /><span>Maks {{ Math.round(weatherData.main.temp_max) }}°C</span>
            </div>
            <div class="wx-chip">
              <UIcon
                name="i-lucide-trending-down"
                class="w-3.5 h-3.5 text-blue-400"
              /><span>Min {{ Math.round(weatherData.main.temp_min) }}°C</span>
            </div>
          </div>
        </template>
      </section>

      <!-- ════════════════════════════════════════════
           CONTENT PANELS (after hero)
      ═══════════════════════════════════════════════ -->
      <section v-if="weatherData && !isLoading" class="wx-content-section">
        <!-- ── 24-Hour Chart (full width) ── -->
        <div class="wx-block">
          <div class="wx-block-head">
            <div class="wx-block-icon">
              <UIcon name="i-lucide-clock" class="w-4 h-4" />
            </div>
            <div>
              <h2 class="wx-block-title">Grafik Cuaca 24 Jam</h2>
              <p class="wx-block-sub">
                Suhu &amp; peluang hujan setiap 3 jam ke depan
              </p>
            </div>
          </div>

          <div class="wx-chart-card">
            <UiLoadingData v-if="isHourlyLoading" message="Memuat grafik..." />
            <UiNotFoundData v-else-if="hourlyError" :message="hourlyError" />
            <div v-else-if="hourlyData?.length">
              <!-- Weather icons row -->
              <div class="wx-chart-icons">
                <div
                  v-for="(pt, i) in chartPoints"
                  :key="i"
                  class="wx-chart-icon-item"
                  :style="{ left: `${pt.x}px` }"
                >
                  <NuxtImg
                    :src="`https://openweathermap.org/img/wn/${hourlyData[i].weather[0].icon}@2x.png`"
                    class="w-9 h-9"
                    :alt="hourlyData[i].weather[0].description"
                  />
                </div>
              </div>

              <!-- SVG Chart -->
              <div class="wx-chart-wrap">
                <svg
                  ref="chartSvgRef"
                  class="wx-chart-svg"
                  :viewBox="`0 0 ${chartWidth} ${CHART_H}`"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="tempAreaGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stop-color="#34d399"
                        stop-opacity="0.4"
                      />
                      <stop
                        offset="100%"
                        stop-color="#34d399"
                        stop-opacity="0.02"
                      />
                    </linearGradient>
                  </defs>

                  <!-- Grid lines (Y) -->
                  <line
                    v-for="y in [0.25, 0.5, 0.75]"
                    :key="y"
                    :x1="CHART_PAD_L"
                    :y1="
                      CHART_PAD_T + y * (CHART_H - CHART_PAD_T - CHART_PAD_B)
                    "
                    :x2="chartWidth - CHART_PAD_R"
                    :y2="
                      CHART_PAD_T + y * (CHART_H - CHART_PAD_T - CHART_PAD_B)
                    "
                    stroke="currentColor"
                    stroke-opacity="0.08"
                    stroke-width="1"
                    stroke-dasharray="4 4"
                  />

                  <!-- Area fill -->
                  <path :d="chartAreaPath" fill="url(#tempAreaGrad)" />

                  <!-- Line -->
                  <path
                    :d="chartLinePath"
                    fill="none"
                    stroke="#34d399"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <!-- Dots + temp labels -->
                  <g v-for="pt in chartPoints" :key="pt.x">
                    <circle
                      :cx="pt.x"
                      :cy="pt.y"
                      r="4"
                      fill="#34d399"
                      stroke="#fff"
                      stroke-width="1.5"
                    />
                    <text
                      :x="pt.x"
                      :y="pt.y - 9"
                      text-anchor="middle"
                      font-size="10"
                      font-weight="700"
                      fill="#34d399"
                    >
                      {{ pt.temp }}°
                    </text>
                  </g>

                  <!-- X-axis labels -->
                  <text
                    v-for="pt in chartPoints"
                    :key="`lbl-${pt.x}`"
                    :x="pt.x"
                    :y="CHART_H - CHART_PAD_B + 15"
                    text-anchor="middle"
                    font-size="9"
                    fill="currentColor"
                    fill-opacity="0.5"
                  >
                    {{ pt.label }}
                  </text>

                  <!-- Precipitation % bars (at bottom) -->
                  <g v-for="pt in chartPoints" :key="`pop-${pt.x}`">
                    <rect
                      :x="pt.x - 6"
                      :y="CHART_H - CHART_PAD_B + 22"
                      width="12"
                      :height="pt.pop > 0 ? Math.max(4, pt.pop * 0.16) : 2"
                      rx="2"
                      :fill="pt.pop > 40 ? '#60a5fa' : '#93c5fd'"
                      :fill-opacity="0.6 + pt.pop * 0.004"
                    />
                    <text
                      v-if="pt.pop > 0"
                      :x="pt.x"
                      :y="CHART_H - CHART_PAD_B + 52"
                      text-anchor="middle"
                      font-size="8.5"
                      fill="#60a5fa"
                      fill-opacity="0.8"
                    >
                      {{ pt.pop }}%
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Two-column: 5-day Forecast | Farming Rec ── -->
        <div class="wx-two-col">
          <!-- LEFT: 5-Day Forecast carousel + dots -->
          <div class="wx-block">
            <div class="wx-block-head">
              <div class="wx-block-icon">
                <UIcon name="i-lucide-calendar-days" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="wx-block-title">Ramalan 5 Hari</h2>
                <p class="wx-block-sub">Prediksi cuaca harian ke depan</p>
              </div>
            </div>

            <UiLoadingData v-if="isForecastLoading" message="Memuat ramalan..." />
            <UiNotFoundData v-else-if="forecastError" :message="forecastError" />
            <div v-else-if="forecastData?.length" class="flex flex-col gap-2">
              <div
                v-for="(day, idx) in forecastData"
                :key="day.date"
                class="wx-forecast-card"
              >
                <!-- Weather bg subtle -->
                <div class="wx-forecast-card__bg">
                  <NuxtImg
                    :src="
                      idx === 0
                        ? weatherBg
                        : `https://openweathermap.org/img/wn/${day.main_weather.icon}@2x.png`
                    "
                    class="w-full h-full object-cover blur-sm"
                    loading="lazy"
                    alt=""
                  />
                </div>

                <div class="relative z-10 flex items-center gap-4 p-4">
                  <!-- Icon -->
                  <div class="wx-forecast-icon-wrap">
                    <NuxtImg
                      :src="`https://openweathermap.org/img/wn/${day.main_weather.icon}@2x.png`"
                      :alt="day.main_weather.description"
                      class="w-12 h-12"
                    />
                  </div>
                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-white">
                      {{ idx === 0 ? 'Hari Ini' : formatDateShort(day.date) }}
                    </p>
                    <p class="text-xs capitalize text-white/60 mt-0.5">
                      {{ day.main_weather.description }}
                    </p>
                    <div class="flex items-center gap-3 mt-1.5">
                      <span
                        class="flex items-center gap-1 text-xs text-blue-300"
                      >
                        <UIcon name="i-lucide-cloud-download" class="w-3 h-3" />
                        {{ Math.round(day.pop * 100) }}%
                      </span>
                      <span
                        class="flex items-center gap-1 text-xs text-white/50"
                      >
                        <UIcon name="i-lucide-droplet" class="w-3 h-3" />
                        {{ day.humidity }}%
                      </span>
                    </div>
                  </div>
                  <!-- Temp -->
                  <div class="text-right shrink-0">
                    <p class="text-2xl font-extrabold text-white">
                      {{ Math.round(day.temp_max) }}°
                    </p>
                    <p class="text-sm text-white/50">
                      {{ Math.round(day.temp_min) }}°
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: Farming Recommendation -->
          <div class="wx-block">
            <div class="wx-block-head">
              <div class="wx-block-icon">
                <UIcon name="i-lucide-tractor" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="wx-block-title">Rekomendasi Pertanian</h2>
                <p class="wx-block-sub">
                  Saran berdasarkan kondisi cuaca saat ini
                </p>
              </div>
            </div>

            <div v-if="farmingRec" class="wx-rec-panel">
              <!-- Status banner -->
              <div
                class="wx-rec-banner"
                :class="
                  farmingRec.suitable
                    ? 'wx-rec-banner--ok'
                    : 'wx-rec-banner--warn'
                "
              >
                <UIcon
                  :name="
                    farmingRec.suitable
                      ? 'i-lucide-check-circle'
                      : 'i-lucide-triangle-alert'
                  "
                  class="w-5 h-5 shrink-0"
                />
                <div>
                  <p class="font-semibold text-sm">
                    {{
                      farmingRec.suitable
                        ? 'Kondisi Optimal untuk Bertani'
                        : 'Perlu Perhatian Ekstra'
                    }}
                  </p>
                  <p class="text-xs opacity-70 mt-0.5">
                    {{ farmingRec.items.length }} poin rekomendasi
                  </p>
                </div>
              </div>

              <!-- Rec items -->
              <div class="flex flex-col gap-2 p-3">
                <div
                  v-for="(item, i) in farmingRec.items"
                  :key="i"
                  class="wx-rec-item"
                  :class="item.ok ? 'wx-rec-item--ok' : 'wx-rec-item--warn'"
                >
                  <div
                    class="wx-rec-item__icon"
                    :class="
                      item.ok
                        ? 'wx-rec-item__icon--ok'
                        : 'wx-rec-item__icon--warn'
                    "
                  >
                    <UIcon :name="item.icon" class="w-3.5 h-3.5" />
                  </div>
                  <p class="text-xs leading-relaxed text-white/80">
                    {{ item.text }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
  /* ══════════════════════════════════════════════════
   PAGE ROOT
══════════════════════════════════════════════════ */
  .wx-page {
    position: relative;
    min-height: 100vh;
    /* Prevent any child element from triggering browser-level horizontal scroll */
    overflow-x: clip;
  }

  /* Subtle dark vignette at the bottom — no color tint */
  .wx-fixed-bg__bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.25) 60%,
      rgba(0, 0, 0, 0.45) 100%
    );
    pointer-events: none;
  }

  /* Ambient glow orb — position:absolute karena berada di dalam .wx-fixed-bg */
  .wx-orb {
    position: absolute;
    top: -10%;
    right: -5%;
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      rgba(52, 211, 153, 0.12) 0%,
      transparent 65%
    );
    border-radius: 50%;
    pointer-events: none;
  }

  /* ══════════════════════════════════════════════════
   SCROLLABLE CONTENT LAYER
══════════════════════════════════════════════════ */
  .wx-scroll-content {
    position: relative;
    z-index: 2;
  }

  /* ══════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════ */
  .wx-hero-section {
    padding: 6rem 1.5rem 4rem;
    max-width: 80rem;
    margin-inline: auto;
  }

  @media (min-width: 768px) {
    .wx-hero-section {
      padding: 8rem 2.5rem 5rem;
    }
  }
  @media (min-width: 1280px) {
    .wx-hero-section {
      padding: 8rem 3rem 5rem;
    }
  }

  .wx-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 1rem;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .wx-float-icon {
    filter: drop-shadow(0 0 48px rgba(52, 211, 153, 0.25));
  }

  .wx-temp {
    font-size: clamp(4rem, 12vw, 5.5rem);
    font-weight: 800;
    color: #fff;
    line-height: 1;
    letter-spacing: -0.04em;
    text-shadow: 0 0 60px rgba(52, 211, 153, 0.3);
  }

  .wx-stat-pill {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    transition: all 0.2s ease;
  }

  .wx-stat-pill:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .wx-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.35rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s ease;
  }

  .wx-chip:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  /* ══════════════════════════════════════════════════
   CONTENT SECTION
══════════════════════════════════════════════════ */
  .wx-content-section {
    padding: 1rem 1.5rem 5rem;
    max-width: 80rem;
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    border-radius: 2rem;
  }

  @media (min-width: 768px) {
    .wx-content-section {
      padding-inline: 2.5rem;
    }
  }
  @media (min-width: 1280px) {
    .wx-content-section {
      padding-inline: 3rem;
    }
  }

  /* ── Two-column layout ── */
  .wx-two-col {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (min-width: 1024px) {
    .wx-two-col {
      grid-template-columns: 1fr 1fr;
      align-items: start;
    }
  }

  /* ══════════════════════════════════════════════════
   BLOCK HEADER — always on dark/glass bg so always white
══════════════════════════════════════════════════ */
  .wx-block {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .wx-block-head {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
  }

  .wx-block-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    color: #fff;
    flex-shrink: 0;
    margin-top: 0.125rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .wx-block-title {
    font-size: 1.0625rem;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
    margin: 0 0 0.15rem;
    letter-spacing: -0.01em;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  }

  @media (min-width: 768px) {
    .wx-block-title {
      font-size: 1.2rem;
    }
  }

  .wx-block-sub {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    line-height: 1.4;
  }

  /* ══════════════════════════════════════════════════
   CHART — glassmorphism
══════════════════════════════════════════════════ */
  .wx-chart-card {
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    overflow: hidden;
    padding: 0 0 0.5rem;
  }

  .wx-chart-icons {
    position: relative;
    height: 2.75rem;
    overflow: hidden;
  }

  .wx-chart-icon-item {
    position: absolute;
    transform: translateX(-50%);
    top: 0;
  }

  .wx-chart-wrap {
    overflow-x: auto;
    overflow-y: visible;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .wx-chart-wrap::-webkit-scrollbar {
    display: none;
  }

  .wx-chart-svg {
    display: block;
    width: 100%;
    min-width: 480px;
    color: rgba(255, 255, 255, 0.7);
    overflow: visible;
  }

  /* ══════════════════════════════════════════════════
   5-DAY FORECAST CAROUSEL — glassmorphism
══════════════════════════════════════════════════ */
  .wx-forecast-track {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    max-height: calc(4 * 5.25rem + 3 * 0.625rem);
  }

  .wx-forecast-track::-webkit-scrollbar {
    display: none;
  }

  .wx-forecast-card {
    position: relative;
    flex-shrink: 0;
    scroll-snap-align: start;
    border-radius: 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    overflow: hidden;
    transition:
      background 0.2s ease,
      transform 0.2s ease,
      border-color 0.2s ease;
  }

  .wx-forecast-card:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .wx-forecast-card__bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: 0.875rem;
    opacity: 0.15;
  }

  .wx-forecast-icon-wrap {
    flex-shrink: 0;
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.1);
    padding: 0.25rem;
  }

  /* ── Dot navigation for forecast ── */
  .wx-dot {
    height: 0.3125rem;
    width: 0.375rem;
    border-radius: 9999px;
    background: rgba(156, 163, 175, 0.45);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .wx-dot--active {
    width: 1.5rem;
    background: #7c3aed;
  }

  .wx-dot:not(.wx-dot--active):hover {
    background: #a78bfa;
    transform: scaleY(1.25);
  }

  /* ══════════════════════════════════════════════════
   FARMING RECOMMENDATION PANEL — glassmorphism
══════════════════════════════════════════════════ */
  .wx-rec-panel {
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    overflow: hidden;
  }

  .wx-rec-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .wx-rec-banner--ok {
    background: rgba(52, 211, 153, 0.15);
    color: #6ee7b7;
  }

  .wx-rec-banner--warn {
    background: rgba(251, 191, 36, 0.15);
    color: #fcd34d;
  }

  .wx-rec-item {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.625rem 0.75rem;
    border-radius: 0.625rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.2s ease;
  }

  .wx-rec-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .wx-rec-item--ok {
    border-color: rgba(52, 211, 153, 0.25);
  }
  .wx-rec-item--warn {
    border-color: rgba(251, 191, 36, 0.25);
  }

  .wx-rec-item__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 0.0625rem;
  }

  .wx-rec-item__icon--ok {
    background: rgba(52, 211, 153, 0.2);
    color: #34d399;
  }
  .wx-rec-item__icon--warn {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
  }

  /* Dark mode — no overrides needed since glassmorphism is already theme-neutral */
</style>
