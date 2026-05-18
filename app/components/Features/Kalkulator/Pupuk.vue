<script setup lang="ts">
  import { ref, computed } from 'vue'

  const luasLahan = ref<number | null>(null) // dalam hektar

  // Standar kebutuhan pupuk dasar per hektar (padi sawah)
  const ureaPerHa = 100 // kg
  const npkPerHa = 150 // kg
  const kclPerHa = 75 // kg

  const totalUrea = computed(() => (luasLahan.value || 0) * ureaPerHa)
  const totalNPK = computed(() => (luasLahan.value || 0) * npkPerHa)
  const totalKCL = computed(() => (luasLahan.value || 0) * kclPerHa)
  const totalKeseluruhan = computed(() => totalUrea.value + totalNPK.value + totalKCL.value)

  const hasResult = computed(() => !!luasLahan.value && luasLahan.value > 0)

  const fertilizers = computed(() => [
    {
      key: 'urea',
      label: 'Urea',
      desc: 'Nitrogen tinggi, dorong pertumbuhan vegetatif',
      icon: 'i-lucide-flask-conical',
      total: totalUrea.value,
      color: 'amber',
      pct: hasResult.value ? Math.round((ureaPerHa / (ureaPerHa + npkPerHa + kclPerHa)) * 100) : 0
    },
    {
      key: 'npk',
      label: 'NPK',
      desc: 'Unsur makro lengkap N-P-K seimbang',
      icon: 'i-lucide-flask-conical',
      total: totalNPK.value,
      color: 'emerald',
      pct: hasResult.value ? Math.round((npkPerHa / (ureaPerHa + npkPerHa + kclPerHa)) * 100) : 0
    },
    {
      key: 'kcl',
      label: 'KCl',
      desc: 'Kalium, perkuat batang & tahan penyakit',
      icon: 'i-lucide-flask-conical',
      total: totalKCL.value,
      color: 'purple',
      pct: hasResult.value ? Math.round((kclPerHa / (ureaPerHa + npkPerHa + kclPerHa)) * 100) : 0
    }
  ])
</script>

<template>
  <div class="pupuk-card">
    <!-- ── Decorative bg ──────────────────────────────────────────── -->
    <div class="pupuk-card__bg" aria-hidden="true" />

    <!-- ── Header ────────────────────────────────────────────────── -->
    <div class="pupuk-header">
      <div class="pupuk-header__icon">
        <UIcon name="i-lucide-flask-conical" class="w-6 h-6 text-white" />
      </div>
      <div>
        <h2 class="pupuk-header__title">Kalkulator Pupuk</h2>
        <p class="pupuk-header__sub">Hitung kebutuhan pupuk untuk hasil optimal</p>
      </div>
      <!-- status badge -->
      <div class="pupuk-header__badge ml-auto" :class="hasResult ? 'pupuk-header__badge--on' : ''">
        <span class="pupuk-header__badge-dot" />
        {{ hasResult ? 'Siap' : 'Isi luas lahan' }}
      </div>
    </div>

    <!-- ── Body ──────────────────────────────────────────────────── -->
    <div class="pupuk-body">
      <!-- Left: Input + info -->
      <div class="pupuk-left">
        <!-- Input -->
        <div class="pupuk-field">
          <label class="pupuk-label" for="pupuk-luas">
            <UIcon name="i-lucide-map" class="w-3.5 h-3.5" />
            Luas Lahan
            <span class="pupuk-label__unit">hektar</span>
          </label>
          <UInput
            id="pupuk-luas"
            v-model="luasLahan"
            type="number"
            placeholder="Contoh: 1.5"
            size="lg"
            class="pupuk-input"
          />
          <p class="pupuk-hint">Standar rekomendasi untuk tanaman padi sawah</p>
        </div>

        <!-- Standard reference table -->
        <div class="pupuk-ref">
          <div class="pupuk-ref__header">
            <UIcon name="i-lucide-book-open" class="w-4 h-4" />
            <span>Standar Pupuk / Hektar</span>
          </div>
          <div class="pupuk-ref__rows">
            <div class="pupuk-ref__row">
              <div class="pupuk-ref__dot pupuk-ref__dot--amber" />
              <span class="pupuk-ref__name">Urea</span>
              <span class="pupuk-ref__qty">{{ ureaPerHa }} kg</span>
            </div>
            <div class="pupuk-ref__row">
              <div class="pupuk-ref__dot pupuk-ref__dot--emerald" />
              <span class="pupuk-ref__name">NPK</span>
              <span class="pupuk-ref__qty">{{ npkPerHa }} kg</span>
            </div>
            <div class="pupuk-ref__row">
              <div class="pupuk-ref__dot pupuk-ref__dot--purple" />
              <span class="pupuk-ref__name">KCl</span>
              <span class="pupuk-ref__qty">{{ kclPerHa }} kg</span>
            </div>
          </div>
        </div>

        <!-- Total summary -->
        <Transition name="stat-pop">
          <div v-if="hasResult" class="pupuk-total">
            <p class="pupuk-total__label">Total Semua Pupuk</p>
            <p class="pupuk-total__value">
              {{ totalKeseluruhan.toLocaleString('id-ID') }}
              <span class="pupuk-total__unit">kg</span>
            </p>
            <p class="pupuk-total__sub">
              ≈ {{ (totalKeseluruhan / 50).toFixed(0) }} sak (@ 50 kg)
            </p>
          </div>
        </Transition>
      </div>

      <!-- Right: Results -->
      <div class="pupuk-right">
        <p class="pupuk-right__title">Hasil Kalkulasi Kebutuhan Pupuk</p>

        <div class="pupuk-items">
          <div
            v-for="(f, i) in fertilizers"
            :key="f.key"
            class="pupuk-item"
            :class="`pupuk-item--${f.color}`"
            :style="{ animationDelay: `${i * 80}ms` }"
          >
            <!-- icon -->
            <div class="pupuk-item__icon" :class="`pupuk-item__icon--${f.color}`">
              <UIcon :name="f.icon" class="w-4 h-4" />
            </div>

            <!-- info -->
            <div class="pupuk-item__body">
              <p class="pupuk-item__name">{{ f.label }}</p>
              <p class="pupuk-item__desc">{{ f.desc }}</p>
            </div>

            <!-- value -->
            <div class="pupuk-item__value-wrap">
              <Transition name="num-flip" mode="out-in">
                <p :key="f.total" class="pupuk-item__value" :class="`pupuk-item__value--${f.color}`">
                  {{ hasResult ? f.total.toLocaleString('id-ID') : '—' }}
                </p>
              </Transition>
              <p v-if="hasResult" class="pupuk-item__unit">kg</p>
            </div>
          </div>
        </div>

        <!-- Progress bars visualization -->
        <Transition name="stat-pop">
          <div v-if="hasResult" class="pupuk-bars">
            <p class="pupuk-bars__title">Proporsi Penggunaan</p>
            <div v-for="f in fertilizers" :key="`bar-${f.key}`" class="pupuk-bar-row">
              <span class="pupuk-bar-row__label">{{ f.label }}</span>
              <div class="pupuk-bar-row__track">
                <div
                  class="pupuk-bar-row__fill"
                  :class="`pupuk-bar-row__fill--${f.color}`"
                  :style="{ width: `${f.pct}%` }"
                />
              </div>
              <span class="pupuk-bar-row__pct">{{ f.pct }}%</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @reference "tailwindcss";

  /* ── Card shell ──────────────────────────────────────────────────── */
  .pupuk-card {
    @apply relative rounded-2xl overflow-hidden shadow-lg border border-green-100 bg-white;
  }

  .dark .pupuk-card {
    @apply bg-gray-900/60 border-gray-700;
  }

  .pupuk-card__bg {
    @apply absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none;
    background: radial-gradient(circle, color-mix(in srgb, theme('colors.teal.400') 10%, transparent), transparent 70%);
    transform: translate(30%, -30%);
  }

  /* ── Header ──────────────────────────────────────────────────────── */
  .pupuk-header {
    @apply relative flex items-center gap-4 px-6 pt-6 pb-5;
    @apply border-b;
    border-color: theme('colors.gray.100');
  }

  .dark .pupuk-header {
    border-color: rgba(255,255,255,0.06);
  }

  .pupuk-header__icon {
    @apply shrink-0 w-12 h-12 rounded-xl flex items-center justify-center;
    background: linear-gradient(135deg, theme('colors.teal.500'), theme('colors.cyan.500'));
    box-shadow: 0 4px 16px -4px theme('colors.teal.500');
  }

  .pupuk-header__title {
    @apply text-xl font-bold;
    color: theme('colors.gray.900');
  }

  .dark .pupuk-header__title {
    color: theme('colors.gray.50');
  }

  .pupuk-header__sub {
    @apply text-sm;
    color: theme('colors.gray.500');
  }

  .pupuk-header__badge {
    @apply flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold;
    background: theme('colors.gray.100');
    color: theme('colors.gray.500');
    transition: all 0.3s;
  }

  .dark .pupuk-header__badge {
    background: rgba(255,255,255,0.06);
    color: theme('colors.gray.400');
  }

  .pupuk-header__badge--on {
    background: color-mix(in srgb, theme('colors.teal.500') 12%, white);
    color: theme('colors.teal.700');
  }

  .dark .pupuk-header__badge--on {
    background: color-mix(in srgb, theme('colors.teal.400') 15%, transparent);
    color: theme('colors.teal.300');
  }

  .pupuk-header__badge-dot {
    @apply w-1.5 h-1.5 rounded-full;
    background: theme('colors.gray.400');
  }

  .pupuk-header__badge--on .pupuk-header__badge-dot {
    background: theme('colors.teal.500');
    box-shadow: 0 0 6px theme('colors.teal.400');
  }

  /* ── Body ────────────────────────────────────────────────────────── */
  .pupuk-body {
    @apply relative grid md:grid-cols-2 gap-0;
  }

  /* ── Left ────────────────────────────────────────────────────────── */
  .pupuk-left {
    @apply space-y-4 p-6;
    @apply border-r;
    border-color: theme('colors.gray.100');
  }

  .dark .pupuk-left {
    border-color: rgba(255,255,255,0.06);
  }

  .pupuk-field {
    @apply flex flex-col gap-1.5;
  }

  .pupuk-label {
    @apply flex items-center gap-1.5 text-sm font-semibold;
    color: theme('colors.gray.700');
  }

  .dark .pupuk-label {
    color: theme('colors.gray.300');
  }

  .pupuk-label__unit {
    @apply ml-1 text-xs font-normal px-1.5 py-0.5 rounded-md;
    background: theme('colors.gray.100');
    color: theme('colors.gray.500');
  }

  .dark .pupuk-label__unit {
    background: rgba(255,255,255,0.08);
    color: theme('colors.gray.400');
  }

  .pupuk-hint {
    @apply text-xs;
    color: theme('colors.gray.400');
  }

  /* Reference table */
  .pupuk-ref {
    @apply rounded-xl overflow-hidden;
    border: 1px solid color-mix(in srgb, theme('colors.blue.400') 20%, transparent);
    background: color-mix(in srgb, theme('colors.blue.50') 60%, white);
  }

  .dark .pupuk-ref {
    background: color-mix(in srgb, theme('colors.blue.400') 6%, transparent);
    border-color: color-mix(in srgb, theme('colors.blue.400') 15%, transparent);
  }

  .pupuk-ref__header {
    @apply flex items-center gap-2 px-4 py-2.5 text-xs font-semibold;
    color: theme('colors.blue.700');
    border-bottom: 1px solid color-mix(in srgb, theme('colors.blue.400') 15%, transparent);
  }

  .dark .pupuk-ref__header {
    color: theme('colors.blue.300');
  }

  .pupuk-ref__rows {
    @apply px-4 py-2 space-y-1.5;
  }

  .pupuk-ref__row {
    @apply flex items-center gap-2 text-xs py-1;
  }

  .pupuk-ref__dot {
    @apply w-2 h-2 rounded-full shrink-0;
  }

  .pupuk-ref__dot--amber { background: theme('colors.amber.500'); }
  .pupuk-ref__dot--emerald { background: theme('colors.emerald.500'); }
  .pupuk-ref__dot--purple { background: theme('colors.purple.500'); }

  .pupuk-ref__name {
    @apply font-medium flex-1;
    color: theme('colors.gray.700');
  }

  .dark .pupuk-ref__name {
    color: theme('colors.gray.300');
  }

  .pupuk-ref__qty {
    @apply font-bold tabular-nums;
    color: theme('colors.gray.900');
  }

  .dark .pupuk-ref__qty {
    color: theme('colors.gray.100');
  }

  /* Total card */
  .pupuk-total {
    @apply p-4 rounded-xl text-center;
    background: linear-gradient(135deg, color-mix(in srgb, theme('colors.teal.500') 8%, white), color-mix(in srgb, theme('colors.cyan.500') 6%, white));
    border: 1px solid color-mix(in srgb, theme('colors.teal.500') 20%, transparent);
  }

  .dark .pupuk-total {
    background: linear-gradient(135deg, rgba(20,184,166,0.08), rgba(6,182,212,0.06));
    border-color: rgba(20,184,166,0.2);
  }

  .pupuk-total__label {
    @apply text-xs font-semibold mb-1;
    color: theme('colors.gray.500');
  }

  .pupuk-total__value {
    @apply text-3xl font-black;
    color: theme('colors.teal.700');
    letter-spacing: -0.03em;
  }

  .dark .pupuk-total__value {
    color: theme('colors.teal.300');
  }

  .pupuk-total__unit {
    @apply text-lg font-semibold;
    color: theme('colors.teal.500');
  }

  .pupuk-total__sub {
    @apply text-xs mt-0.5;
    color: theme('colors.gray.500');
  }

  /* ── Right ───────────────────────────────────────────────────────── */
  .pupuk-right {
    @apply p-6 flex flex-col gap-4;
  }

  .pupuk-right__title {
    @apply text-sm font-semibold;
    color: theme('colors.gray.500');
  }

  .dark .pupuk-right__title {
    color: theme('colors.gray.400');
  }

  /* Fertilizer items */
  .pupuk-items {
    @apply space-y-3;
  }

  .pupuk-item {
    @apply flex items-center gap-3 p-4 rounded-xl;
    @apply border transition-all duration-300;
    animation: stat-rise 0.4s ease both;
  }

  .pupuk-item--amber {
    background: color-mix(in srgb, theme('colors.amber.400') 6%, white);
    border-color: color-mix(in srgb, theme('colors.amber.400') 20%, transparent);
  }

  .dark .pupuk-item--amber {
    background: color-mix(in srgb, theme('colors.amber.400') 8%, transparent);
    border-color: color-mix(in srgb, theme('colors.amber.400') 18%, transparent);
  }

  .pupuk-item--emerald {
    background: color-mix(in srgb, theme('colors.emerald.400') 6%, white);
    border-color: color-mix(in srgb, theme('colors.emerald.400') 20%, transparent);
  }

  .dark .pupuk-item--emerald {
    background: color-mix(in srgb, theme('colors.emerald.400') 8%, transparent);
    border-color: color-mix(in srgb, theme('colors.emerald.400') 18%, transparent);
  }

  .pupuk-item--purple {
    background: color-mix(in srgb, theme('colors.purple.400') 6%, white);
    border-color: color-mix(in srgb, theme('colors.purple.400') 20%, transparent);
  }

  .dark .pupuk-item--purple {
    background: color-mix(in srgb, theme('colors.purple.400') 8%, transparent);
    border-color: color-mix(in srgb, theme('colors.purple.400') 18%, transparent);
  }

  .pupuk-item__icon {
    @apply shrink-0 w-9 h-9 rounded-lg flex items-center justify-center;
  }

  .pupuk-item__icon--amber {
    background: color-mix(in srgb, theme('colors.amber.400') 18%, transparent);
    color: theme('colors.amber.600');
  }

  .dark .pupuk-item__icon--amber {
    color: theme('colors.amber.400');
  }

  .pupuk-item__icon--emerald {
    background: color-mix(in srgb, theme('colors.emerald.400') 18%, transparent);
    color: theme('colors.emerald.600');
  }

  .dark .pupuk-item__icon--emerald {
    color: theme('colors.emerald.400');
  }

  .pupuk-item__icon--purple {
    background: color-mix(in srgb, theme('colors.purple.400') 18%, transparent);
    color: theme('colors.purple.600');
  }

  .dark .pupuk-item__icon--purple {
    color: theme('colors.purple.400');
  }

  .pupuk-item__body {
    @apply flex-1 min-w-0;
  }

  .pupuk-item__name {
    @apply text-sm font-bold;
    color: theme('colors.gray.800');
  }

  .dark .pupuk-item__name {
    color: theme('colors.gray.100');
  }

  .pupuk-item__desc {
    @apply text-xs leading-snug;
    color: theme('colors.gray.500');
  }

  .pupuk-item__value-wrap {
    @apply text-right;
  }

  .pupuk-item__value {
    @apply text-2xl font-black leading-none tabular-nums;
    letter-spacing: -0.02em;
  }

  .pupuk-item__value--amber { color: theme('colors.amber.700'); }
  .dark .pupuk-item__value--amber { color: theme('colors.amber.300'); }

  .pupuk-item__value--emerald { color: theme('colors.emerald.700'); }
  .dark .pupuk-item__value--emerald { color: theme('colors.emerald.300'); }

  .pupuk-item__value--purple { color: theme('colors.purple.700'); }
  .dark .pupuk-item__value--purple { color: theme('colors.purple.300'); }

  .pupuk-item__unit {
    @apply text-xs;
    color: theme('colors.gray.400');
  }

  /* Progress bars */
  .pupuk-bars {
    @apply space-y-2;
  }

  .pupuk-bars__title {
    @apply text-xs font-semibold mb-3;
    color: theme('colors.gray.500');
  }

  .pupuk-bar-row {
    @apply flex items-center gap-2 text-xs;
  }

  .pupuk-bar-row__label {
    @apply w-8 font-semibold text-right;
    color: theme('colors.gray.600');
  }

  .dark .pupuk-bar-row__label {
    color: theme('colors.gray.400');
  }

  .pupuk-bar-row__track {
    @apply flex-1 h-2 rounded-full overflow-hidden;
    background: theme('colors.gray.100');
  }

  .dark .pupuk-bar-row__track {
    background: rgba(255,255,255,0.07);
  }

  .pupuk-bar-row__fill {
    @apply h-full rounded-full;
    transition: width 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .pupuk-bar-row__fill--amber {
    background: linear-gradient(90deg, theme('colors.amber.400'), theme('colors.orange.400'));
  }

  .pupuk-bar-row__fill--emerald {
    background: linear-gradient(90deg, theme('colors.emerald.400'), theme('colors.teal.400'));
  }

  .pupuk-bar-row__fill--purple {
    background: linear-gradient(90deg, theme('colors.purple.400'), theme('colors.pink.400'));
  }

  .pupuk-bar-row__pct {
    @apply w-8 tabular-nums;
    color: theme('colors.gray.500');
  }

  /* Shared animations */
  @keyframes stat-rise {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .stat-pop-enter-active {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .stat-pop-leave-active {
    transition: all 0.2s ease;
  }

  .stat-pop-enter-from,
  .stat-pop-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }

  .num-flip-enter-active,
  .num-flip-leave-active {
    transition: all 0.2s ease;
  }

  .num-flip-enter-from {
    opacity: 0;
    transform: translateY(6px);
  }

  .num-flip-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }
</style>
