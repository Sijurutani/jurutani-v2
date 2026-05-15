<script setup lang="ts">
  useSeoMeta({
    title: 'Chat Langsung dengan Penyuluh Pertanian',
    description: 'Konsultasi chat dengan penyuluh pertanian, dokter hewan & pakar perikanan. Dapatkan solusi cepat untuk atasi penyakit tanaman dan masalah hewan ternak.'
  })
  defineProps<{
    myId: string
  }>()
</script>

<template>
  <div
    class="h-full flex flex-col items-center justify-center gap-3 text-muted p-6"
  >
    <UIcon name="i-lucide-messages-square" class="size-12 text-dimmed" />
    <div class="text-center">
      <p class="text-base font-semibold text-highlighted">Messages</p>
      <p class="text-sm text-muted mt-1">
        Pilih percakapan di sebelah kiri atau mulai chat baru.
      </p>
    </div>
  </div>
</template>
