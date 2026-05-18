<script setup lang="ts">
  const props = defineProps<{
    modelValue: boolean
    loading?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    confirm: []
  }>()

  const isOpen = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  })
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      content: 'max-w-sm rounded-2xl',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 shrink-0">
          <UIcon name="i-lucide-log-out" class="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">
            Konfirmasi Logout
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Kamu akan keluar dari akun JuruTani
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Apakah kamu yakin ingin logout? Kamu perlu login kembali untuk mengakses semua fitur.
      </p>
    </template>

    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton
          class="flex-1"
          color="neutral"
          variant="outline"
          :disabled="loading"
          @click="isOpen = false"
        >
          Batal
        </UButton>
        <UButton
          class="flex-1"
          color="error"
          icon="i-lucide-log-out"
          :loading="loading"
          @click="emit('confirm')"
        >
          Logout
        </UButton>
      </div>
    </template>
  </UModal>
</template>
