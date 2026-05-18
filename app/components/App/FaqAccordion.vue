<script setup lang="ts">
  import type { FaqItem } from '~/data/types'

  const props = withDefaults(
    defineProps<{
      items?: FaqItem[]
    }>(),
    {
      items: () => [],
    },
  )

  const openIndex = ref<number | null>(props.items.length > 0 ? 0 : null)

  watch(
    () => props.items,
    (items) => {
      openIndex.value = items.length > 0 ? 0 : null
    },
  )

  const toggleItem = (index: number) => {
    openIndex.value = openIndex.value === index ? null : index
  }
</script>

<template>
  <div class="grid gap-3">
    <article
      v-for="(item, index) in items"
      :key="item.question"
      class="relative overflow-hidden border rounded-2xl transition-all duration-200"
      :class="[
        openIndex === index 
          ? 'border-emerald-500/30 dark:border-emerald-300/30 shadow-xl shadow-emerald-900/5 dark:shadow-black/30 -translate-y-px bg-gradient-to-br from-white/95 to-emerald-50/80 dark:from-slate-900/95 dark:to-emerald-950/80' 
          : 'border-emerald-600/15 dark:border-emerald-300/15 shadow-md shadow-slate-200/50 dark:shadow-black/20 bg-gradient-to-br from-white/90 to-emerald-50/60 dark:from-slate-900/90 dark:to-emerald-950/60 hover:border-emerald-500/30 dark:hover:border-emerald-300/30 hover:shadow-xl hover:shadow-emerald-900/5 dark:hover:shadow-black/30 hover:-translate-y-px'
      ]"
    >
      <button
        class="w-full min-h-[4.25rem] flex items-center gap-3 sm:gap-3.5 p-3.5 sm:p-4 border-0 bg-transparent text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:-outline-offset-4"
        type="button"
        :aria-expanded="openIndex === index"
        :aria-controls="`faq-panel-${index}`"
        @click="toggleItem(index)"
      >
        <span 
          class="size-9 hidden sm:inline-flex items-center justify-center rounded-xl shrink-0 transition-colors"
          :class="openIndex === index ? 'bg-emerald-500 text-white dark:bg-emerald-400 dark:text-slate-900' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'"
        >
          <UIcon name="i-lucide-sprout" class="size-4" />
        </span>

        <span class="flex-1 min-w-0 text-[0.95rem] sm:text-base font-bold leading-snug break-words" :class="openIndex === index ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-100'">
          {{ item.question }}
        </span>

        <span 
          class="size-8 inline-flex items-center justify-center rounded-full shrink-0 transition-all duration-200"
          :class="openIndex === index ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-200 rotate-180' : 'bg-white/60 text-emerald-600 dark:bg-white/5 dark:text-emerald-400'"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-chevron-down" class="size-4" />
        </span>
      </button>

      <Transition name="faq-panel">
        <div
          v-if="openIndex === index"
          :id="`faq-panel-${index}`"
          class="px-4 pb-4 sm:pl-[4.125rem]"
          role="region"
        >
          <p class="m-0 text-[0.9rem] leading-relaxed text-slate-600 dark:text-slate-300 break-words">
            {{ item.answer }}
          </p>
        </div>
      </Transition>
    </article>
  </div>
</template>

<style scoped>
  .faq-panel-enter-active,
  .faq-panel-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .faq-panel-enter-from,
  .faq-panel-leave-to {
    opacity: 0;
    transform: translateY(-0.35rem);
  }
</style>
