<script setup lang="ts">
  import { ref } from 'vue'

  useSeoMeta({
    title: 'Tools & Kalkulator Pertanian Online Gratis',
    description: 'Kalkulator agribisnis online gratis untuk petani & peternak. Hitung praktis kebutuhan pupuk, pakan ternak, jadwal tanam, serta analisis biaya usaha tani.'
  })

  // Active tab state
  const activeTab = ref('benih')

  // Tools data
  const tools = [
    {
      id: 'benih',
      title: 'Kalkulator Benih',
      description:
        'Hitung kebutuhan benih optimal berdasarkan luas lahan dan jarak tanam',
      icon: 'i-lucide-sprout',
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'pupuk',
      title: 'Kalkulator Pupuk',
      description: 'Tentukan dosis pupuk yang tepat untuk hasil panen maksimal',
      icon: 'i-lucide-beaker',
      color: 'teal',
      gradient: 'from-teal-500 to-cyan-500',
    },
  ]

  // Change tab
  const changeTab = (tabId: string) => {
    activeTab.value = tabId
  }
</script>

<template>
  <UContainer class="py-12">
    <!-- Hero Section -->
    <div class="mx-auto mb-12 max-w-4xl text-center">
      <UBadge color="success" variant="subtle" size="lg" class="mb-6">
        <template #leading>
          <UIcon name="i-lucide-calculator" class="w-4 h-4" />
        </template>
        Penghitungan Pertanian
      </UBadge>

      <h1
        class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-linear-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent"
      >
        Tools Tani JuruTani
      </h1>

      <p
        class="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto"
      >
        Gunakan kalkulator pertanian kami untuk menghitung kebutuhan
        <span class="font-semibold text-emerald-600 dark:text-emerald-400"
          >benih yang optimal</span
        >,
        <span class="font-semibold text-teal-600 dark:text-teal-400"
          >pupuk yang tepat</span
        >, dan
        <span class="font-semibold text-cyan-600 dark:text-cyan-400"
          >perhitungan pertanian lainnya</span
        >. Dapatkan hasil yang akurat untuk meningkatkan produktivitas dan
        efisiensi usaha tani Anda.
      </p>
    </div>

    <!-- Tool Cards Grid -->
    <div class="grid md:grid-cols-2 gap-6 mb-8">
      <UButton
        v-for="tool in tools"
        :key="tool.id"
        color="neutral"
        variant="ghost"
        class="group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
        :class="[
          activeTab === tool.id
            ? 'border-emerald-500 dark:border-emerald-400 bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg'
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-emerald-300 dark:hover:border-emerald-700',
        ]"
        @click="changeTab(tool.id)"
      >
        <!-- Gradient Background Effect -->
        <div
          class="absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          :class="tool.gradient"
        />

        <!-- Content -->
        <div class="relative p-6 text-left">
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div
              class="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              :class="[
                activeTab === tool.id
                  ? 'bg-linear-to-br shadow-lg ' + tool.gradient
                  : 'bg-gray-100 dark:bg-gray-800',
              ]"
            >
              <UIcon
                :name="tool.icon"
                class="w-7 h-7"
                :class="[
                  activeTab === tool.id
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400',
                ]"
              />
            </div>

            <!-- Text -->
            <div class="flex-1 min-w-0">
              <h3
                class="text-xl font-bold mb-2 transition-colors"
                :class="[
                  activeTab === tool.id
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-900 dark:text-white',
                ]"
              >
                {{ tool.title }}
              </h3>
              <p
                class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
              >
                {{ tool.description }}
              </p>
            </div>

            <!-- Active Indicator -->
            <div v-if="activeTab === tool.id" class="shrink-0">
              <div
                class="w-8 h-8 rounded-full bg-emerald-500 dark:bg-emerald-400 flex items-center justify-center shadow-lg"
              >
                <UIcon name="i-lucide-check" class="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Border Accent -->
        <div
          class="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r transition-opacity duration-300"
          :class="[
            tool.gradient,
            activeTab === tool.id
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-50',
          ]"
        />
      </UButton>
    </div>

    <!-- Calculator Content -->
    <div class="relative">
      <!-- Transition wrapper -->
      <Transition
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 transform translate-y-4"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-4"
      >
        <!-- Benih Calculator -->
        <div v-if="activeTab === 'benih'" key="benih">
          <FeaturesKalkulatorBenih />
        </div>

        <!-- Pupuk Calculator -->
        <div v-else-if="activeTab === 'pupuk'" key="pupuk">
          <FeaturesKalkulatorPupuk />
        </div>
      </Transition>
    </div>

    <!-- Info Cards -->
    <div class="mt-12 grid md:grid-cols-3 gap-6">
      <div
        class="p-6 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
      >
        <div
          class="w-12 h-12 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center mb-4"
        >
          <UIcon name="i-lucide-lightbulb" class="w-6 h-6 text-white" />
        </div>
        <h4 class="font-bold text-gray-900 dark:text-white mb-2">
          Akurat & Terpercaya
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Perhitungan berdasarkan standar agronomi dan best practice pertanian
          modern
        </p>
      </div>

      <div
        class="p-6 rounded-xl bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800"
      >
        <div
          class="w-12 h-12 rounded-lg bg-purple-500 dark:bg-purple-600 flex items-center justify-center mb-4"
        >
          <UIcon name="i-lucide-trending-up" class="w-6 h-6 text-white" />
        </div>
        <h4 class="font-bold text-gray-900 dark:text-white mb-2">
          Tingkatkan Efisiensi
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Optimasi penggunaan input untuk hasil maksimal dan biaya minimal
        </p>
      </div>

      <div
        class="p-6 rounded-xl bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800"
      >
        <div
          class="w-12 h-12 rounded-lg bg-amber-500 dark:bg-amber-600 flex items-center justify-center mb-4"
        >
          <UIcon name="i-lucide-shield-check" class="w-6 h-6 text-white" />
        </div>
        <h4 class="font-bold text-gray-900 dark:text-white mb-2">
          Gratis & Mudah
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Tidak perlu registrasi, langsung gunakan kapan saja dan dimana saja
        </p>
      </div>
    </div>
  </UContainer>
</template>

<style scoped>
  /* Smooth animations */
  button {
    transform-origin: center;
  }
</style>
