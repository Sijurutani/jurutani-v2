<script setup lang="ts">
  import {
    footerMenuLinks as menuLinks,
    footerContactInfo as contactInfo,
  } from '@/data/menu'
</script>

<template>
  <div
    class="main-panel relative overflow-hidden bg-white/65 dark:bg-linear-to-br dark:from-[#021207]/90 dark:to-[#14532d]/70 border border-green-500/10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
  >
    <!-- Decorative elements -->
    <div class="card-deco-circle card-deco-circle--1" />
    <div class="card-deco-circle card-deco-circle--2" />
    <div class="card-deco-ring card-deco-ring--1" />
    <div class="card-deco-ring card-deco-ring--2" />

    <div
      class="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12"
    >
      <!-- Brand -->
      <div class="flex flex-col space-y-4">
        <NuxtLink to="/" class="inline-flex items-center w-fit">
          <NuxtImg
            src="/jurutani/long-transparent.webp"
            alt="JuruTani Logo"
            class="h-10"
          />
        </NuxtLink>
        <p
          class="text-sm text-gray-600 dark:text-green-200/80 max-w-xs leading-relaxed"
        >
          Memberdayakan petani Indonesia dengan teknologi modern dan solusi
          berkelanjutan untuk pertanian yang lebih baik.
        </p>
        <div
          class="mt-2 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200/30 dark:border-green-700/30"
        >
          <p
            class="text-xs text-green-700/70 dark:text-green-300/90 font-medium"
          >
            Inovasi dari Politeknik Pembangunan Pertanian Yogyakarta Magelang
          </p>
        </div>
      </div>

      <!-- Links -->
      <div class="flex flex-col space-y-4">
        <h4 class="font-semibold text-lg text-green-900 dark:text-green-100">
          Tautan Cepat
        </h4>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="(column, colIndex) in menuLinks"
            :key="colIndex"
            class="flex flex-col space-y-3"
          >
            <NuxtLink
              v-for="item in column"
              :key="item.path"
              :to="item.path"
              class="menu-link text-gray-600 dark:text-[#bbefc8] hover:text-green-600 dark:hover:text-green-400"
            >
              <span class="menu-dot" />
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Contact -->
      <div class="flex flex-col space-y-4">
        <h4 class="font-semibold text-lg text-green-900 dark:text-green-100">
          Kontak Kami
        </h4>
        <div class="space-y-3">
          <div
            v-for="(contact, index) in contactInfo"
            :key="index"
            class="flex items-start gap-3"
          >
            <div
              class="shrink-0 w-5 h-5 flex items-center justify-center mt-0.5"
            >
              <UIcon
                :name="contact.icon"
                class="text-green-600 dark:text-green-400 w-4 h-4"
              />
            </div>
            <div class="flex-1 min-w-0">
              <template v-if="Array.isArray(contact.text)">
                <p
                  v-for="(line, i) in contact.text"
                  :key="i"
                  class="text-sm text-gray-600 dark:text-green-200/80 leading-relaxed"
                >
                  {{ line }}
                </p>
              </template>
              <p v-else class="text-sm text-gray-600 dark:text-green-200/80">
                {{ contact.text }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Decorative circles inside cards */
  .card-deco-circle {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(34, 197, 94, 0.1);
    pointer-events: none;
    background: radial-gradient(
      circle,
      rgba(34, 197, 94, 0.03) 0%,
      transparent 70%
    );
  }
  :global(.dark) .card-deco-circle {
    border-color: rgba(134, 239, 172, 0.1);
    background: radial-gradient(
      circle,
      rgba(134, 239, 172, 0.05) 0%,
      transparent 70%
    );
  }

  .card-deco-circle--1 {
    width: 300px;
    height: 300px;
    top: -100px;
    left: -50px;
  }
  .card-deco-circle--2 {
    width: 250px;
    height: 250px;
    bottom: -80px;
    right: -50px;
  }

  .card-deco-ring {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    border: 1px solid rgba(34, 197, 94, 0.05);
    box-shadow:
      inset 0 0 0 10px transparent,
      inset 0 0 0 11px rgba(34, 197, 94, 0.02);
  }
  :global(.dark) .card-deco-ring {
    border-color: rgba(134, 239, 172, 0.05);
    box-shadow:
      inset 0 0 0 10px transparent,
      inset 0 0 0 11px rgba(134, 239, 172, 0.02);
  }

  .card-deco-ring--1 {
    width: 400px;
    height: 400px;
    top: 10%;
    right: 20%;
    opacity: 0.5;
  }
  .card-deco-ring--2 {
    width: 200px;
    height: 200px;
    bottom: 20%;
    left: 30%;
    opacity: 0.4;
  }

  .main-panel {
    padding: 2rem;
    border-radius: 1.25rem;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  @media (max-width: 768px) {
    .main-panel {
      padding: 1rem;
    }
  }

  .menu-link {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    transition:
      color 0.2s ease,
      transform 0.2s ease;
  }
  .menu-link:hover {
    transform: translateX(3px);
  }

  .menu-dot {
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 9999px;
    background: #22c55e;
    margin-right: 0.625rem;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }
  .menu-link:hover .menu-dot {
    transform: scale(1.6);
  }
</style>
