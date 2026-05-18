<script setup lang="ts">
  useSeoMeta({
    title: 'Chat Langsung dengan Penyuluh Pertanian',
    description: 'Konsultasi chat dengan penyuluh pertanian, dokter hewan & pakar perikanan. Dapatkan solusi cepat untuk atasi penyakit tanaman dan masalah hewan ternak.'
  })
  defineProps<{
    myId: string
  }>()
  const emit = defineEmits<{
    'new-chat': []
    'chat-admin': []
  }>()
</script>

<template>
  <div
    class="h-full flex flex-col items-center justify-center gap-3 text-muted p-6 relative"
  >
    <UIcon name="i-lucide-messages-square" class="size-12 text-dimmed" />
    <div class="text-center">
      <p class="text-base font-semibold text-highlighted">Messages</p>
      <p class="text-sm text-muted mt-1">
        Pilih percakapan di sebelah kiri atau mulai chat baru.
      </p>
    </div>

    <!-- Floating Action Bar -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 w-max max-w-[90%]">
      <div class="floating-action-bar flex items-center gap-2 p-1.5 md:p-2">
        <UButton label="Chat Baru" icon="i-lucide-plus" size="md" color="success" class="rounded-full shadow-sm px-4 md:px-6" @click="emit('new-chat')" />
        <div class="w-px h-6 bg-green-200/50 dark:bg-green-700/50 mx-1 shrink-0"></div>
        <UButton label="Bantuan Admin" icon="i-lucide-headphones" size="md" color="neutral" variant="ghost" class="rounded-full px-4 md:px-6 hover:bg-green-50 dark:hover:bg-green-900/50" @click="emit('chat-admin')" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.floating-action-bar {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid rgba(134, 239, 172, 0.35);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  background: rgba(255, 255, 255, 0.88);
  box-shadow:
    0 4px 18px -6px rgba(22, 163, 74, 0.14),
    0 1px 4px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.4s ease;
}

.floating-action-bar:hover {
  border-color: rgba(134, 239, 172, 0.65);
  box-shadow:
    0 8px 24px -10px rgba(22, 163, 74, 0.24),
    0 0 0 2px rgba(134, 239, 172, 0.16),
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

:global(.dark) .floating-action-bar {
  background: rgba(5, 46, 22, 0.85);
  border-color: rgba(22, 163, 74, 0.28);
  box-shadow:
    0 4px 18px -6px rgba(22, 163, 74, 0.2),
    0 1px 4px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

:global(.dark) .floating-action-bar:hover {
  border-color: rgba(22, 163, 74, 0.5);
  box-shadow:
    0 8px 24px -10px rgba(22, 163, 74, 0.28),
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
</style>
