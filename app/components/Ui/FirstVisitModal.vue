<script setup lang="ts">
  const isOpen = ref(false)
  const firstVisit = useCookie('firstVisit', {
    maxAge: 60 * 60 * 24 * 30, // 30 hari (bukan 6 jam)
    sameSite: 'lax',
  })

  // Fungsi buka modal
  const openModal = () => {
    isOpen.value = true
  }

  // Fungsi tutup modal
  const closeModal = () => {
    isOpen.value = false
    firstVisit.value = 'visited' // cookie diset di browser
  }

  // Pastikan hanya dijalankan di sisi client
  onMounted(() => {
    if (import.meta.client) {
      if (!firstVisit.value) {
        openModal()
      } else {
        isOpen.value = false
      }
    }
  })

  // Ekspor untuk bisa dipanggil dari luar (misal parent)
  defineExpose({
    openModal,
    closeModal,
    isOpen,
  })
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :close="false"
    role="dialog"
    aria-labelledby="first-visit-title"
    aria-describedby="first-visit-description"
  >
    <template #header>
      <div class="flex justify-center w-full">
        <NuxtLink
          data-pg-name="Logo"
          class="flex items-center sm:flex-row"
          to="/"
        >
          <NuxtImg src="/jurutani_long_logo.webp" alt="Logo" class="h-10" />
        </NuxtLink>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col items-center justify-center space-y-6 p-4">
        <div class="space-y-4 text-center">
          <h1
            id="first-visit-title"
            class="text-3xl md:text-4xl font-extrabold text-emerald-800 dark:text-emerald-400 leading-tight"
          >
            Selamat Datang di JuruTani!
          </h1>
          <p
            id="first-visit-description"
            class="text-base md:text-lg text-gray-700 dark:text-gray-300"
          >
            Sijurutani adalah aplikasi penyuluhan pertanian yang dirancang untuk
            meningkatkan produktivitas dan kesejahteraan petani di seluruh
            Indonesia.
          </p>
        </div>

        <div
          class="pt-6 space-y-3 w-full flex flex-col items-center text-center"
        >
          <p
            class="text-xs md:text-sm text-green-600/70 dark:text-green-400/70 font-medium"
          >
            Sponsored by:
          </p>
          <div class="flex justify-center">
            <NuxtImg
              src="/logo/sponsor.png"
              alt="Sponsor Logo"
              class="h-12 md:h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-200 mx-auto"
            />
          </div>
        </div>

        <div
          class="pt-4 border-t border-green-200/30 dark:border-green-700/30 text-center w-full"
        >
          <p
            class="text-xs md:text-sm text-green-600/60 dark:text-green-400/60"
          >
            Powered by : <br />
            <NuxtLink
              to="https://polbangtanyoma.ac.id/"
              target="_blank"
              class="font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors underline decoration-dotted ml-1"
            >
              Politeknik Pembangunan Pertanian Yogyakarta Magelang
            </NuxtLink>
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-center w-full px-4 pb-4">
        <UButton
          color="success"
          size="xl"
          block
          class="shadow-lg"
          @click="closeModal"
        >
          Masuk ke Beranda
        </UButton>
      </div>
    </template>
  </UModal>
</template>
