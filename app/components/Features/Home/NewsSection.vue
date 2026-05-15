<script setup lang="ts">
  const { getLatestNews } = useHomeData()
  const { data: news, pending } = await getLatestNews()

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getImageUrl = (item: any): string => {
    if (item?.cover_image) return item.cover_image
    if (item?.images?.length) return item.images[0]
    return '/placeholder/content.webp'
  }
</script>

<template>
  <div class="max-w-6xl mx-auto px-4">
    <!-- Header -->
    <div class="flex items-end justify-between mb-8">
      <div>
        <p class="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Terkini</p>
        <h2 class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
          Berita & Informasi
        </h2>
      </div>
      <UButton
        to="/update"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-arrow-right"
        trailing
      >
        Lihat semua
      </UButton>
    </div>

    <!-- Loading skeleton -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div
        v-for="i in 4"
        :key="i"
        class="rounded-2xl bg-white dark:bg-green-950/50 border border-green-100 dark:border-green-800/40 overflow-hidden animate-pulse"
      >
        <div class="h-44 bg-gray-200 dark:bg-green-900/40" />
        <div class="p-4 space-y-2">
          <div class="h-3 bg-gray-200 dark:bg-green-900/40 rounded w-1/3" />
          <div class="h-4 bg-gray-200 dark:bg-green-900/40 rounded w-full" />
          <div class="h-4 bg-gray-200 dark:bg-green-900/40 rounded w-4/5" />
        </div>
      </div>
    </div>

    <!-- News Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <NuxtLink
        v-for="item in (news ?? []).slice(0, 4)"
        :key="item.id"
        :to="`/update/${item.slug}`"
        class="group flex flex-col rounded-2xl bg-white dark:bg-green-950/50 border border-green-100 dark:border-green-800/40 hover:border-green-300 dark:hover:border-green-600 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
      >
        <!-- Thumbnail -->
        <div class="relative overflow-hidden h-44 bg-green-100 dark:bg-green-900/30 shrink-0">
          <NuxtImg
            :src="getImageUrl(item)"
            :alt="item.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div
            v-if="item.category"
            class="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-600/90 text-white backdrop-blur-sm"
          >
            {{ item.category }}
          </div>
        </div>

        <!-- Content -->
        <div class="flex flex-col flex-1 p-4 gap-2">
          <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
            {{ item.title }}
          </h3>
          <p v-if="item.sub_title" class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {{ item.sub_title }}
          </p>
          <div class="mt-auto pt-2 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <UIcon name="i-lucide-calendar" class="w-3 h-3 shrink-0" />
            {{ formatDate(item.created_at) }}
          </div>
        </div>
      </NuxtLink>

      <!-- Empty state -->
      <div
        v-if="!pending && (!news || news.length === 0)"
        class="col-span-full text-center py-12 text-gray-400 dark:text-gray-500"
      >
        <UIcon name="i-lucide-newspaper" class="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p class="text-sm">Belum ada berita</p>
      </div>
    </div>
  </div>
</template>
