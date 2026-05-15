<script setup lang="ts">
  // Props
  const props = defineProps({
    message: {
      type: String,
      default: 'Tidak ada data tersedia',
    },
    actionText: {
      type: String,
      default: 'Coba Lagi',
    },
    showAction: {
      type: Boolean,
      default: true,
    },
    imageSrc: {
      type: String,
      default: '/placeholder/user.webp',
    },
  })

  // Emits
  const emit = defineEmits(['action'])

  // Methods
  const handleAction = () => {
    emit('action')
  }
</script>

<template>
  <div class="text-center py-12">
    <!-- Image -->
    <div class="mb-6">
      <NuxtImg
        v-if="imageSrc"
        :src="imageSrc"
        alt="Empty state"
        class="w-32 h-32 mx-auto object-contain opacity-60"
      />
      <div
        v-else
        class="w-32 h-32 mx-auto flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
      >
        <UIcon name="i-lucide-folder-open" class="w-12 h-12 text-gray-400" />
      </div>
    </div>

    <!-- Message -->
    <div class="space-y-2 mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
        {{ message }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Coba periksa kembali atau hubungi admin
      </p>
    </div>

    <!-- Action Button -->
    <UButton
      v-if="showAction"
      color="primary"
      variant="soft"
      @click="handleAction"
    >
      {{ actionText }}
    </UButton>
  </div>
</template>
