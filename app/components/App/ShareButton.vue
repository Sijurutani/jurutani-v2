<script setup lang="ts">
  import {
    useSocialShare,
    type ShareOptions,
  } from '~/composables/useSocialShare'

  interface Props {
    title: string
    description?: string
    url: string
    hashtags?: string[]
    buttonText?: string
    buttonVariant?: 'default' | 'outline' | 'minimal'
  }

  const props = withDefaults(defineProps<Props>(), {
    buttonText: 'Bagikan',
    buttonVariant: 'default',
  })

  const { platforms, share } = useSocialShare()

  const shareOptions: ShareOptions = {
    title: props.title,
    description: props.description,
    url: props.url,
    hashtags: props.hashtags,
  }

  const handleShare = (platform: any) => {
    share(platform, shareOptions)
  }
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Share Button Trigger -->
    <UPopover :popper="{ placement: 'bottom-end' }">
      <template #default="{ open }">
        <UButton
          :variant="
            buttonVariant === 'outline'
              ? 'outline'
              : buttonVariant === 'minimal'
                ? 'ghost'
                : 'solid'
          "
          color="success"
          icon="i-lucide-share-2"
        >
          {{ buttonText }}
        </UButton>
      </template>

      <template #content>
        <div class="p-4 w-72">
          <div class="mb-3">
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-white mb-1"
            >
              Bagikan ke
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Pilih platform untuk membagikan konten ini
            </p>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <UButton
              v-for="platform in platforms"
              :key="platform.name"
              variant="ghost"
              :class="[
                platform.color,
                'flex items-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg',
              ]"
              @click="handleShare(platform)"
            >
              <UIcon :name="platform.icon" class="w-5 h-5" />
              <span class="text-sm">{{ platform.name }}</span>
            </UButton>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>
