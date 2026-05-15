<script setup lang="ts">

  const isModalOpen = ref(false)
  const showTeaser = ref(false)
  const hasDismissedTeaser = ref(false)

  const adminPhone = '+6285669000010'.replace(/\D/g, '')
  const adminWhatsappLink = `https://api.whatsapp.com/send/?phone=${adminPhone}&text=${encodeURIComponent(
    'Halo Admin JuruTani, saya tertarik untuk kontribusi. Mohon info lebih lanjut ya.',
  )}&type=phone_number&app_absent=0`

  let teaserTimer: ReturnType<typeof setTimeout> | undefined

  const hideTeaser = () => {
    showTeaser.value = false
    hasDismissedTeaser.value = true

    if (teaserTimer) {
      clearTimeout(teaserTimer)
      teaserTimer = undefined
    }
  }

  const openModal = () => {
    isModalOpen.value = true
    hideTeaser()
  }

  onMounted(() => {
    teaserTimer = setTimeout(() => {
      if (!isModalOpen.value && !hasDismissedTeaser.value) {
        showTeaser.value = true
      }
    }, 3000)
  })

  onUnmounted(() => {
    if (teaserTimer) {
      clearTimeout(teaserTimer)
    }
  })

  const openRoute = (path: string) => {
    isModalOpen.value = false
    navigateTo(path)
  }

  const openNews = () => {
    openRoute('/update/create')
  }

  const openProduct = () => {
    openRoute('/markets/create')
  }

  const openAdminChat = () => {
    if (!import.meta.client) return
    isModalOpen.value = false
    window.open(adminWhatsappLink, '_blank', 'noopener,noreferrer')
  }

  const menuItems = [
    {
      label: 'Create Update',
      icon: 'i-lucide-newspaper',
      action: openNews,
      description: 'Publikasikan berita atau perkembangan terbaru.',
    },
    {
      label: 'Create Product',
      icon: 'i-lucide-package-2',
      action: openProduct,
      description: 'Tambahkan produk baru ke marketplace JuruTani.',
    },
    {
      label: 'Tanya Admin',
      icon: 'i-mdi-whatsapp',
      action: openAdminChat,
      description: 'Hubungi admin langsung lewat WhatsApp.',
      color: 'success',
    },
  ]
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
    <div>
      <Transition name="teaser-float">
        <div
          v-if="showTeaser && !isModalOpen"
          class="fixed right-24 bottom-7 z-70 w-[240px] max-w-[calc(100vw-7rem)]"
        >
          <UButton
            color="neutral"
            variant="ghost"
            type="button"
            class="teaser-close"
            aria-label="Tutup pesan kontribusi"
            @click.stop="hideTeaser"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </UButton>

          <UButton
            color="neutral"
            variant="ghost"
            type="button"
            class="teaser-card"
            aria-label="Buka menu kontribusi"
            @click="openModal"
          >
            <p class="teaser-card__text">Tertarik untuk kontribusi?</p>
            <span class="teaser-card__tail" aria-hidden="true" />
          </UButton>
        </div>
      </Transition>

      <UButton
        color="neutral"
        variant="ghost"
        type="button"
        class="main-fab fixed right-6 bottom-6 z-71"
        aria-label="Menu Tambah"
        @click="openModal"
      >
        <UIcon
          name="i-lucide-plus"
          class="size-8 transition-transform duration-300 ease-out"
          :class="{ 'rotate-45': isModalOpen }"
        />
      </UButton>

      <UModal
        v-model:open="isModalOpen"
        title="Pilih Aksi Kontribusi"
        description="Lanjutkan dengan membuat konten baru atau hubungi admin untuk koordinasi."
        :ui="{
          content: 'max-w-md rounded-3xl border border-default/60 shadow-2xl',
          overlay: 'backdrop-blur-sm bg-black/30',
          header: 'px-6 pt-6',
          body: 'px-6 pb-6',
        }"
      >
        <template #body>
          <div class="space-y-3">
            <UButton
              v-for="item in menuItems"
              :key="item.label"
              color="neutral"
              variant="ghost"
              type="button"
              class="action-card"
              @click="item.action"
            >
              <span
                class="action-card__icon"
                :class="{ 'action-card__icon--wa': item.color === 'success' }"
              >
                <UIcon :name="item.icon" class="size-5" />
              </span>

              <span class="min-w-0 flex-1 text-left">
                <span class="action-card__title">{{ item.label }}</span>
                <span class="action-card__description">{{
                  item.description
                }}</span>
              </span>

              <UIcon
                name="i-lucide-arrow-up-right"
                class="action-card__arrow size-4"
              />
            </UButton>
          </div>
        </template>
      </UModal>
    </div>
  </Teleport>
  </ClientOnly>
</template>

<style scoped>
  .teaser-float-enter-active,
  .teaser-float-leave-active {
    will-change: transform, opacity;
  }

  .teaser-float-enter-active,
  .teaser-float-leave-active {
    transition:
      opacity 0.34s ease,
      transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .teaser-float-enter-from,
  .teaser-float-leave-to {
    opacity: 0;
    transform: translateX(18px) translateY(2px);
  }

  .main-fab {
    width: 4rem;
    height: 4rem;
    border-radius: 9999px;
    background:
      radial-gradient(
        circle at 30% 30%,
        rgba(255, 255, 255, 0.28),
        transparent 38%
      ),
      linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 24px 48px rgba(22, 163, 74, 0.24),
      0 8px 18px rgba(22, 163, 74, 0.24);
    transition:
      transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.28s ease,
      filter 0.28s ease;
  }

  .main-fab:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow:
      0 28px 54px rgba(22, 163, 74, 0.28),
      0 10px 20px rgba(22, 163, 74, 0.26);
    filter: saturate(1.08);
  }

  .main-fab:focus-visible {
    outline: 2px solid rgba(34, 197, 94, 0.45);
    outline-offset: 4px;
  }

  .teaser-card {
    position: relative;
    width: 100%;
    padding: 1rem 1.15rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.97);
    border: 1px solid rgba(226, 232, 240, 0.95);
    color: #173985;
    text-align: left;
    backdrop-filter: blur(10px);
    box-shadow:
      0 24px 52px rgba(15, 23, 42, 0.1),
      0 8px 20px rgba(15, 23, 42, 0.08);
    transition:
      transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.22s ease,
      border-color 0.22s ease;
  }

  .teaser-card:hover {
    transform: translateY(-1px);
    border-color: rgba(191, 219, 254, 0.95);
    box-shadow:
      0 28px 58px rgba(15, 23, 42, 0.12),
      0 10px 24px rgba(15, 23, 42, 0.1);
  }

  .teaser-card__text {
    font-size: 1.02rem;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: -0.01em;
  }

  .teaser-card__tail {
    position: absolute;
    top: 50%;
    right: -0.42rem;
    width: 0.95rem;
    height: 0.95rem;
    background: rgba(255, 255, 255, 0.97);
    border-top: 1px solid rgba(226, 232, 240, 0.95);
    border-right: 1px solid rgba(226, 232, 240, 0.95);
    transform: translateY(-50%) rotate(45deg);
  }

  .teaser-close {
    position: absolute;
    top: -0.68rem;
    left: -0.65rem;
    z-index: 1;
    width: 1.9rem;
    height: 1.9rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.98);
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
    transition:
      transform 0.2s ease,
      color 0.2s ease,
      background-color 0.2s ease;
  }

  .teaser-close:hover {
    transform: scale(1.05);
    color: #0f172a;
    background: white;
  }

  .action-card {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.95rem;
    padding: 1rem;
    border-radius: 1.25rem;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(248, 250, 252, 0.96) 100%
    );
    border: 1px solid rgba(226, 232, 240, 0.9);
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.06);
    transition:
      transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.22s ease,
      border-color 0.22s ease,
      background 0.22s ease;
  }

  .action-card:hover {
    transform: translateY(-2px);
    border-color: rgba(134, 239, 172, 0.95);
    box-shadow: 0 18px 34px rgba(22, 163, 74, 0.12);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(240, 253, 244, 0.96) 100%
    );
  }

  .action-card__icon {
    width: 3rem;
    height: 3rem;
    flex-shrink: 0;
    border-radius: 9999px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(
        circle at 30% 30%,
        rgba(255, 255, 255, 0.24),
        transparent 36%
      ),
      linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
    box-shadow: 0 12px 24px rgba(22, 163, 74, 0.2);
  }

  .action-card__icon--wa {
    background:
      radial-gradient(
        circle at 30% 30%,
        rgba(255, 255, 255, 0.24),
        transparent 36%
      ),
      linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  }

  .action-card__title {
    display: block;
    font-size: 0.95rem;
    font-weight: 700;
    color: #0f172a;
  }

  .action-card__description {
    display: block;
    margin-top: 0.18rem;
    font-size: 0.78rem;
    line-height: 1.45;
    color: #475569;
  }

  .action-card__arrow {
    flex-shrink: 0;
    color: #64748b;
    transition:
      transform 0.2s ease,
      color 0.2s ease;
  }

  .action-card:hover .action-card__arrow {
    transform: translate(2px, -2px);
    color: #16a34a;
  }

  @media (max-width: 640px) {
    .main-fab {
      right: 1rem;
      bottom: 1rem;
    }
  }
</style>
