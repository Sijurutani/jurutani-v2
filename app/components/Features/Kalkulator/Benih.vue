<script setup lang="ts">
  import { ref, computed } from 'vue'

  const luasLahan = ref<number | null>(null) // m2
  const jarakBaris = ref<number | null>(null) // cm
  const jarakTanam = ref<number | null>(null) // cm
  const benihPerLubang = ref<number | null>(1)
  const cadanganPersen = ref<number | null>(10) // %
  const dayaTumbuhPersen = ref<number | null>(85) // %

  const isComplete = computed(
    () =>
      !!luasLahan.value &&
      !!jarakBaris.value &&
      !!jarakTanam.value &&
      !!benihPerLubang.value &&
      !!cadanganPersen.value &&
      !!dayaTumbuhPersen.value
  )

  const jumlahLubang = computed<number>(() => {
    if (!luasLahan.value || !jarakBaris.value || !jarakTanam.value) return 0
    return (luasLahan.value * 10000) / (jarakBaris.value * jarakTanam.value)
  })

  const totalKebutuhanBenih = computed<number>(() => {
    if (!isComplete.value) return 0
    const totalBenih =
      (jumlahLubang.value * benihPerLubang.value!) /
      (dayaTumbuhPersen.value! / 100)
    return totalBenih * (1 + cadanganPersen.value! / 100)
  })
</script>

<template>
  <div class="benih-card">
    <!-- ── Decorative bg ──────────────────────────────────────────── -->
    <div class="benih-card__bg" aria-hidden="true" />

    <!-- ── Header ────────────────────────────────────────────────── -->
    <div class="benih-header">
      <div class="benih-header__icon">
        <UIcon name="i-lucide-sprout" class="w-6 h-6 text-white" />
      </div>
      <div>
        <h2 class="benih-header__title">Kalkulator Benih</h2>
        <p class="benih-header__sub">Hitung kebutuhan benih untuk lahan Anda</p>
      </div>
      <!-- progress pill -->
      <div class="benih-header__progress ml-auto">
        <span
          class="benih-progress-dot"
          :class="luasLahan ? 'benih-progress-dot--on' : ''"
        />
        <span
          class="benih-progress-dot"
          :class="jarakBaris && jarakTanam ? 'benih-progress-dot--on' : ''"
        />
        <span
          class="benih-progress-dot"
          :class="benihPerLubang ? 'benih-progress-dot--on' : ''"
        />
        <span
          class="benih-progress-dot"
          :class="cadanganPersen && dayaTumbuhPersen ? 'benih-progress-dot--on' : ''"
        />
      </div>
    </div>

    <!-- ── Form + Result ──────────────────────────────────────────── -->
    <div class="benih-body">
      <!-- Left: Inputs -->
      <div class="benih-inputs">
        <!-- Luas Lahan -->
        <div class="benih-field">
          <label class="benih-label" for="benih-luas">
            <UIcon name="i-lucide-map" class="w-3.5 h-3.5" />
            Luas Lahan
            <span class="benih-label__unit">m²</span>
          </label>
          <UInput
            id="benih-luas"
            v-model="luasLahan"
            type="number"
            placeholder="Contoh: 1000"
            size="lg"
            class="benih-input"
          />
        </div>

        <!-- Jarak Tanam -->
        <div class="benih-field">
          <label class="benih-label">
            <UIcon name="i-lucide-grid-3x3" class="w-3.5 h-3.5" />
            Jarak Tanam
            <span class="benih-label__unit">cm × cm</span>
          </label>
          <div class="flex items-center gap-2">
            <UInput
              id="benih-baris"
              v-model="jarakBaris"
              type="number"
              placeholder="Baris"
              size="lg"
              class="benih-input"
            />
            <span class="benih-times">×</span>
            <UInput
              id="benih-tanam"
              v-model="jarakTanam"
              type="number"
              placeholder="Tanam"
              size="lg"
              class="benih-input"
            />
          </div>
          <p class="benih-hint">Contoh: 25 × 25 cm</p>
        </div>

        <!-- Benih per Lubang -->
        <div class="benih-field">
          <label class="benih-label" for="benih-perlubang">
            <UIcon name="i-lucide-bean" class="w-3.5 h-3.5" />
            Benih per Lubang
            <span class="benih-label__unit">butir</span>
          </label>
          <UInput
            id="benih-perlubang"
            v-model="benihPerLubang"
            type="number"
            placeholder="Contoh: 1"
            size="lg"
            class="benih-input"
          />
        </div>

        <!-- Cadangan + Daya Tumbuh side-by-side -->
        <div class="grid grid-cols-2 gap-3">
          <div class="benih-field">
            <label class="benih-label" for="benih-cadangan">
              <UIcon name="i-lucide-package-plus" class="w-3.5 h-3.5" />
              Cadangan
              <span class="benih-label__unit">%</span>
            </label>
            <UInput
              id="benih-cadangan"
              v-model="cadanganPersen"
              type="number"
              placeholder="10"
              size="lg"
              class="benih-input"
            />
          </div>

          <div class="benih-field">
            <label class="benih-label" for="benih-dayatumbuh">
              <UIcon name="i-lucide-leaf" class="w-3.5 h-3.5" />
              Daya Tumbuh
              <span class="benih-label__unit">%</span>
            </label>
            <UInput
              id="benih-dayatumbuh"
              v-model="dayaTumbuhPersen"
              type="number"
              placeholder="85"
              size="lg"
              class="benih-input"
            />
          </div>
        </div>
      </div>

      <!-- Right: Results -->
      <div class="benih-results">
        <!-- Intermediate stat: jumlah lubang -->
        <Transition name="stat-pop">
          <div v-if="jumlahLubang > 0" class="benih-stat">
            <div class="benih-stat__icon">
              <UIcon name="i-lucide-circle-dot" class="w-4 h-4" />
            </div>
            <div>
              <p class="benih-stat__label">Jumlah Lubang Tanam</p>
              <p class="benih-stat__value">
                {{ Math.round(jumlahLubang).toLocaleString('id-ID') }}
                <span class="benih-stat__unit">lubang</span>
              </p>
            </div>
          </div>
        </Transition>

        <!-- Main result -->
        <div class="benih-result" :class="{ 'benih-result--active': isComplete }">
          <!-- glow -->
          <div class="benih-result__glow" aria-hidden="true" />

          <div class="flex items-center gap-2 mb-3">
            <UIcon
              name="i-lucide-calculator"
              class="w-4 h-4"
              :class="isComplete ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-600'"
            />
            <p class="benih-result__label">Total Kebutuhan Benih</p>
          </div>

          <Transition name="num-flip" mode="out-in">
            <p
              :key="Math.round(totalKebutuhanBenih)"
              class="benih-result__number"
              :class="isComplete ? 'benih-result__number--active' : ''"
            >
              {{ isComplete ? Math.round(totalKebutuhanBenih).toLocaleString('id-ID') : '—' }}
              <span v-if="isComplete" class="benih-result__unit">butir</span>
            </p>
          </Transition>

          <p v-if="!isComplete" class="benih-result__hint">
            Lengkapi semua field untuk melihat hasil
          </p>
          <p v-else class="benih-result__note">
            Termasuk {{ cadanganPersen }}% cadangan &amp; faktor daya tumbuh
            {{ dayaTumbuhPersen }}%
          </p>
        </div>

        <!-- Tips -->
        <div class="benih-tip">
          <UIcon name="i-lucide-lightbulb" class="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Atur jarak tanam sesuai varietas. Padi sawah umum: <strong>25×25 cm</strong> atau
            <strong>30×20 cm</strong>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @reference "tailwindcss";

  /* ── Card shell ──────────────────────────────────────────────────── */
  .benih-card {
    @apply relative rounded-2xl overflow-hidden shadow-lg border border-green-100 bg-white;
  }

  .dark .benih-card {
    @apply bg-gray-900/60 border-gray-700;
  }

  .benih-card__bg {
    @apply absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none;
    background: radial-gradient(circle, color-mix(in srgb, theme('colors.emerald.400') 12%, transparent), transparent 70%);
    transform: translate(30%, -30%);
  }

  /* ── Header ──────────────────────────────────────────────────────── */
  .benih-header {
    @apply relative flex items-center gap-4 px-6 pt-6 pb-5;
    @apply border-b;
    border-color: theme('colors.gray.100');
  }

  .dark .benih-header {
    border-color: rgba(255,255,255,0.06);
  }

  .benih-header__icon {
    @apply shrink-0 w-12 h-12 rounded-xl flex items-center justify-center;
    background: linear-gradient(135deg, theme('colors.emerald.500'), theme('colors.teal.500'));
    box-shadow: 0 4px 16px -4px theme('colors.emerald.500');
  }

  .benih-header__title {
    @apply text-xl font-bold;
    color: theme('colors.gray.900');
  }

  .dark .benih-header__title {
    color: theme('colors.gray.50');
  }

  .benih-header__sub {
    @apply text-sm;
    color: theme('colors.gray.500');
  }

  .benih-header__progress {
    @apply flex items-center gap-1.5;
  }

  .benih-progress-dot {
    @apply w-2 h-2 rounded-full transition-all duration-300;
    background: theme('colors.gray.200');
  }

  .dark .benih-progress-dot {
    background: rgba(255,255,255,0.1);
  }

  .benih-progress-dot--on {
    background: linear-gradient(135deg, theme('colors.emerald.500'), theme('colors.teal.400'));
    box-shadow: 0 0 6px theme('colors.emerald.400');
  }

  /* ── Body ────────────────────────────────────────────────────────── */
  .benih-body {
    @apply relative grid md:grid-cols-2 gap-0;
  }

  /* ── Inputs ──────────────────────────────────────────────────────── */
  .benih-inputs {
    @apply space-y-4 p-6;
    @apply border-r;
    border-color: theme('colors.gray.100');
  }

  .dark .benih-inputs {
    border-color: rgba(255,255,255,0.06);
  }

  .benih-field {
    @apply flex flex-col gap-1.5;
  }

  .benih-label {
    @apply flex items-center gap-1.5 text-sm font-semibold;
    color: theme('colors.gray.700');
  }

  .dark .benih-label {
    color: theme('colors.gray.300');
  }

  .benih-label__unit {
    @apply ml-1 text-xs font-normal px-1.5 py-0.5 rounded-md;
    background: theme('colors.gray.100');
    color: theme('colors.gray.500');
  }

  .dark .benih-label__unit {
    background: rgba(255,255,255,0.08);
    color: theme('colors.gray.400');
  }

  .benih-times {
    @apply text-lg font-bold shrink-0;
    color: theme('colors.gray.400');
  }

  .benih-hint {
    @apply text-xs;
    color: theme('colors.gray.400');
  }

  /* ── Results ─────────────────────────────────────────────────────── */
  .benih-results {
    @apply p-6 flex flex-col gap-4;
  }

  /* Intermediate stat */
  .benih-stat {
    @apply flex items-center gap-3 p-4 rounded-xl;
    background: color-mix(in srgb, theme('colors.emerald.500') 6%, white);
    border: 1px solid color-mix(in srgb, theme('colors.emerald.500') 15%, transparent);
  }

  .dark .benih-stat {
    background: color-mix(in srgb, theme('colors.emerald.400') 8%, transparent);
    border-color: color-mix(in srgb, theme('colors.emerald.400') 20%, transparent);
  }

  .benih-stat__icon {
    @apply w-8 h-8 rounded-lg flex items-center justify-center shrink-0;
    background: color-mix(in srgb, theme('colors.emerald.500') 15%, transparent);
    color: theme('colors.emerald.600');
  }

  .dark .benih-stat__icon {
    color: theme('colors.emerald.400');
  }

  .benih-stat__label {
    @apply text-xs font-medium;
    color: theme('colors.gray.500');
  }

  .benih-stat__value {
    @apply text-lg font-bold;
    color: theme('colors.gray.900');
  }

  .dark .benih-stat__value {
    color: theme('colors.gray.50');
  }

  .benih-stat__unit {
    @apply text-sm font-normal;
    color: theme('colors.gray.500');
  }

  /* Main result card */
  .benih-result {
    @apply relative flex-1 flex flex-col p-5 rounded-2xl overflow-hidden;
    @apply border-2 transition-all duration-500;
    border-color: theme('colors.gray.200');
    background: theme('colors.gray.50');
    min-height: 160px;
  }

  .dark .benih-result {
    background: rgba(255,255,255,0.03);
    border-color: rgba(255,255,255,0.08);
  }

  .benih-result--active {
    border-color: theme('colors.emerald.300');
    background: linear-gradient(135deg, color-mix(in srgb, theme('colors.emerald.500') 5%, white), color-mix(in srgb, theme('colors.teal.500') 4%, white));
  }

  .dark .benih-result--active {
    background: linear-gradient(135deg, rgba(52,211,153,0.08), rgba(20,184,166,0.06));
    border-color: rgba(52,211,153,0.35);
    box-shadow: 0 0 24px -8px rgba(52,211,153,0.2) inset;
  }

  .benih-result__glow {
    @apply absolute inset-0 pointer-events-none;
    background: radial-gradient(circle at 80% 20%, color-mix(in srgb, theme('colors.emerald.400') 20%, transparent), transparent 60%);
    opacity: 0;
    transition: opacity 0.5s;
  }

  .benih-result--active .benih-result__glow {
    opacity: 1;
  }

  .benih-result__label {
    @apply text-sm font-semibold;
    color: theme('colors.gray.600');
  }

  .dark .benih-result__label {
    color: theme('colors.gray.400');
  }

  .benih-result__number {
    @apply text-5xl font-black leading-none mb-2;
    color: theme('colors.gray.300');
    letter-spacing: -0.03em;
    transition: color 0.4s;
  }

  .benih-result__number--active {
    color: theme('colors.emerald.700');
  }

  .dark .benih-result__number--active {
    color: theme('colors.emerald.300');
  }

  .benih-result__unit {
    @apply text-2xl font-semibold;
    color: theme('colors.emerald.500');
  }

  .benih-result__hint {
    @apply text-xs;
    color: theme('colors.gray.400');
  }

  .benih-result__note {
    @apply text-xs;
    color: theme('colors.emerald.600');
  }

  .dark .benih-result__note {
    color: theme('colors.emerald.400');
  }

  /* Tip box */
  .benih-tip {
    @apply flex gap-2 p-3 rounded-xl text-xs leading-relaxed;
    background: color-mix(in srgb, theme('colors.amber.400') 8%, white);
    border: 1px solid color-mix(in srgb, theme('colors.amber.400') 20%, transparent);
    color: theme('colors.amber.700');
  }

  .dark .benih-tip {
    background: color-mix(in srgb, theme('colors.amber.400') 8%, transparent);
    border-color: color-mix(in srgb, theme('colors.amber.400') 15%, transparent);
    color: theme('colors.amber.300');
  }

  /* Animations */
  .stat-pop-enter-active {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .stat-pop-leave-active {
    transition: all 0.2s ease;
  }

  .stat-pop-enter-from,
  .stat-pop-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(-4px);
  }

  .num-flip-enter-active,
  .num-flip-leave-active {
    transition: all 0.2s ease;
  }

  .num-flip-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }

  .num-flip-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }
</style>
