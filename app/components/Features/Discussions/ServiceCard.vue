<script setup lang="ts">
  import { computed, ref } from 'vue'
  import type { DiscussionService } from '~/data/discussion'

  interface Props {
    service: DiscussionService
    variant?: 'default' | 'large' | 'wide' | 'tall'
    index?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    index: 0,
  })

  // Bento grid variants
  const cardClasses = computed(() => {
    const base =
      'group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cursor-pointer'

    const variants = {
      default: 'col-span-1 row-span-1 min-h-[320px]',
      large:
        'col-span-1 md:col-span-2 row-span-1 md:row-span-2 min-h-[320px] md:min-h-[500px]',
      wide: 'col-span-1 md:col-span-2 row-span-1 min-h-[320px]',
      tall: 'col-span-1 row-span-1 md:row-span-2 min-h-[320px] md:min-h-[500px]',
    }

    return `${base} ${variants[props.variant]}`
  })

  const contentClasses = computed(() => {
    if (props.variant === 'large') {
      return 'p-8 md:p-10'
    }
    return 'p-6 md:p-8'
  })
</script>

<template>
  <NuxtLink :to="service.route" :class="cardClasses">
    <!-- Background Image with Gradient Overlay -->
    <div class="absolute inset-0">
      <NuxtImg
        :src="service.image"
        :alt="service.title"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <!-- Gradient Overlay -->
      <div
        class="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"
      />

      <!-- Additional color tint -->
      <div
        class="absolute inset-0 bg-linear-to-br from-green-900/20 via-transparent to-emerald-900/20 group-hover:from-green-900/30 group-hover:to-emerald-900/30 transition-all duration-500"
      />
    </div>

    <!-- Content Overlay -->
    <div
      :class="[
        'relative h-full flex flex-col justify-between text-white',
        contentClasses,
      ]"
    >
      <!-- Header: Icon & Subtitle -->
      <div class="flex items-start justify-between">
        <div
          class="bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/10 group-hover:bg-white/30 transition-colors"
        >
          <UIcon :name="service.icon" class="w-6 h-6 text-white" />
        </div>
        <div
          class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10"
        >
          <span class="text-xs font-medium">{{ service.subtitle }}</span>
        </div>
      </div>

      <div
        class="space-y-4 transform transition-transform duration-500 group-hover:translate-y-[-8px]"
      >
        <div>
          <!-- Title -->
          <h3
            :class="[
              'font-bold mb-2 leading-tight',
              variant === 'large'
                ? 'text-2xl md:text-4xl'
                : 'text-xl md:text-2xl',
            ]"
          >
            {{ service.title }}
          </h3>

          <!-- Description -->
          <p
            :class="[
              'text-gray-100 opacity-90 leading-relaxed',
              variant === 'large'
                ? 'text-base md:text-lg'
                : 'text-sm md:text-base line-clamp-3',
            ]"
          >
            {{ service.description }}
          </p>
        </div>

        <!-- Action Button -->
        <div
          class="flex items-center gap-2 text-white font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
        >
          <span class="text-sm md:text-base">Mulai Diskusi</span>
          <UIcon
            name="i-lucide-arrow-right"
            class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
          />
        </div>
      </div>
    </div>

    <!-- Animated Border on Hover -->
    <div
      class="absolute inset-0 border-2 border-transparent group-hover:border-green-400/50 rounded-2xl transition-all duration-500 pointer-events-none"
    />
  </NuxtLink>
</template>

<style scoped>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
