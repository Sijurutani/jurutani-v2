<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import {
    galleryData,
    innovationPoints,
    platformAdvantages,
    visionMission,
    institutionHighlights,
    teamCategories,
  } from '~/data/about'
  import { useReveal } from '~/composables/useReveal'

  useSeoMeta({
    title: 'Tentang JuruTani — Platform Penyuluhan Digital Polbangtan',
    description: 'JuruTani adalah platform penyuluhan digital resmi bentukan Polbangtan. Kami hadir mendukung petani Indonesia lewat edukasi dan inovasi agribisnis terpadu.'
  })
  useReveal()
</script>

<template>
  <main class="min-h-screen">
    <!-- ── Hero ── -->
    <CommonPageHeroSection
      title="Si JuruTani"
      title-accent="Platform Penyuluhan Digital"
      subtitle="Inovasi dari Politeknik Pembangunan Pertanian Yogyakarta Magelang untuk memajukan pertanian Indonesia di era digital."
      :badge="{ text: 'Platform Inovasi Pertanian', icon: 'i-lucide-sprout' }"
      decorative="gradient"
      align="center"
      :cta="{
        text: 'Mulai Belajar',
        link: '/courses',
        icon: 'i-lucide-graduation-cap',
      }"
      :cta-secondary="{ text: 'Hubungi Kami', link: '/contact-us' }"
      :stats="[
        { value: '2024', label: 'Tahun Berdiri' },
        { value: '6+', label: 'Fitur Utama' },
        { value: '100%', label: 'Untuk Petani' },
      ]"
    />

    <div class="ab-wrap">
      <!-- ── Tentang ── -->
      <section class="ab-section">
        <div class="ab-split">
          <div class="ab-split__text app-reveal">
            <div class="ab-badge">
              <span class="ab-badge__dot" />
              <UIcon name="i-lucide-sprout" class="w-3.5 h-3.5 text-[--text-badge]" />
              <span class="ab-badge__text">Platform Inovasi</span>
              <span class="ab-badge__sweep" aria-hidden="true" />
            </div>
            <h2 class="ab-heading">
              Apa itu <span class="ab-accent">Si JuruTani?</span>
            </h2>
            <blockquote class="ab-quote">
              Menghubungkan teknologi modern dengan kearifan pertanian
              tradisional Indonesia.
            </blockquote>
            <p class="ab-body">
              <strong>Si JuruTani</strong> lahir dari mahasiswa dan dosen
              <strong>Polbangtan Yogyakarta Magelang</strong> — ekosistem
              digital yang menjembatani petani dengan penyuluh, pakar, dan pasar
              secara terpadu.
            </p>
            <p class="ab-body">
              Dengan antarmuka intuitif, petani dapat meningkatkan produktivitas
              dan keberlanjutan usaha tani secara mandiri kapan pun dan di mana
              pun.
            </p>
          </div>

          <div class="ab-split__grid app-reveal">
            <p class="ab-grid-label">Inovasi Penyuluhan Digital</p>
            <div class="ab-feat-grid">
              <div
                v-for="p in innovationPoints"
                :key="p.title"
                class="ab-feat-card"
              >
                <div class="ab-feat-card__icon">
                  <UIcon :name="p.icon" class="w-4 h-4" />
                </div>
                <div>
                  <p class="ab-feat-card__title">{{ p.title }}</p>
                  <p class="ab-feat-card__desc">{{ p.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Visi & Misi ── -->
      <section class="ab-section">
        <CommonSectionHeader
          title="Visi & Misi"
          subtitle="Arah dan komitmen JuruTani dalam memajukan pertanian Indonesia"
          align="center"
          class="mb-10 app-reveal"
        />
        <div class="ab-vm-grid">
          <div
            class="ab-vm-card ab-vm-card--visi app-reveal bg-white dark:bg-gray-900/60"
          >
            <div class="ab-vm-card__head">
              <div class="ab-vm-icon">
                <UIcon
                  :name="visionMission.vision.icon"
                  class="w-5 h-5 text-white"
                />
              </div>
              <h3 class="ab-vm-card__title">
                {{ visionMission.vision.title }}
              </h3>
            </div>
            <p class="ab-body">{{ visionMission.vision.content }}</p>
          </div>
          <div
            class="ab-vm-card app-reveal bg-white dark:bg-gray-900/60"
          >
            <div class="ab-vm-card__head">
              <div class="ab-vm-icon ab-vm-icon--em">
                <UIcon
                  :name="visionMission.mission.icon"
                  class="w-5 h-5 text-white"
                />
              </div>
              <h3 class="ab-vm-card__title">
                {{ visionMission.mission.title }}
              </h3>
            </div>
            <ul class="ab-mission-list">
              <li
                v-for="item in visionMission.mission.items"
                :key="item"
                class="ab-mission-item"
              >
                <span class="ab-mission-dot"
                  ><UIcon name="i-lucide-check" class="w-3 h-3"
                /></span>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ── Keunggulan ── -->
      <section class="ab-section">
        <CommonSectionHeader
          title="Keunggulan Kompetitif"
          subtitle="Fitur unggulan yang dirancang khusus untuk kebutuhan petani Indonesia"
          align="center"
          class="mb-10 app-reveal"
        />
        <div class="ab-adv-grid">
          <div
            v-for="(f, i) in platformAdvantages"
            :key="f.title"
            class="ab-adv-card app-reveal bg-white dark:bg-gray-900/60"
            :style="{ '--delay': `${i * 100}ms` }"
          >
            <div class="ab-adv-icon">
              <UIcon :name="f.icon" class="w-5 h-5 text-white" />
            </div>
            <h3 class="ab-adv-card__title">{{ f.title }}</h3>
            <p class="ab-adv-card__desc">{{ f.description }}</p>
          </div>
        </div>
      </section>

      <!-- ── Gallery ── -->
      <section class="ab-section">
        <CommonSectionHeader
          title="Galeri Inovasi"
          subtitle="Perjalanan pengembangan JuruTani sebagai platform penyuluhan digital"
          align="center"
          class="mb-10 app-reveal"
        />
        <div class="ab-gallery app-reveal">
          <div
            v-for="(item, i) in galleryData"
            :key="i"
            class="ab-gallery__item"
            :class="{ 'ab-gallery__item--wide': i === 0 }"
          >
            <NuxtImg
              :src="item.src"
              :alt="item.alt || item.title"
              class="ab-gallery__img"
              loading="lazy"
            />
            <div class="ab-gallery__overlay">
              <p class="ab-gallery__title">{{ item.title }}</p>
              <p class="ab-gallery__desc">{{ item.description }}</p>
            </div>
            <span class="ab-gallery__badge">{{ item.title }}</span>
          </div>
        </div>
      </section>

      <!-- ── Institusi ── -->
      <section class="ab-section">
        <div class="ab-inst-card app-reveal bg-white dark:bg-gray-900/60">
          <div class="ab-inst-card__head">
            <NuxtImg
              src="/logo/sponsor.png"
              alt="Polbangtan Yogyakarta Magelang"
              class="ab-inst-logo"
            />
            <div>
              <h2 class="ab-inst-card__name">Polbangtan Yogyakarta Magelang</h2>
              <p class="ab-inst-card__sub">
                Politeknik Pembangunan Pertanian — Kementerian Pertanian RI
              </p>
            </div>
          </div>
          <div class="ab-inst-highlights">
            <div
              v-for="h in institutionHighlights"
              :key="h.title"
              class="ab-inst-hl"
            >
              <div class="ab-inst-hl__icon">
                <UIcon
                  :name="h.icon"
                  class="w-4 h-4 text-green-600 dark:text-green-400"
                />
              </div>
              <p class="ab-inst-hl__title">{{ h.title }}</p>
              <p class="ab-inst-hl__desc">{{ h.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Tim ── -->
      <section class="ab-section">
        <CommonSectionHeader
          title="Tim Pengembang"
          subtitle="Mahasiswa dan Dosen Polbangtan Yogyakarta Magelang"
          align="center"
          class="mb-10 app-reveal"
        />
        <div class="ab-team-wrap app-reveal">
          <div class="ab-team-grid">
            <div
              v-for="team in teamCategories"
              :key="team.title"
              class="ab-team-card"
            >
              <div class="ab-team-card__head">
                <div class="ab-team-icon">
                  <UIcon :name="team.icon" class="w-5 h-5 text-white" />
                </div>
                <h4 class="ab-team-card__title">{{ team.title }}</h4>
              </div>
              <ul class="ab-team-list">
                <li v-for="item in team.items" :key="item" class="ab-team-item">
                  <UIcon
                    name="i-lucide-check"
                    class="w-3.5 h-3.5 text-green-300 shrink-0 mt-0.5"
                  />
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ── CTA ── -->
      <section class="ab-section">
        <div class="ab-cta app-reveal">
          <div class="ab-cta__ring ab-cta__ring--1" />
          <div class="ab-cta__ring ab-cta__ring--2" />
          <div class="ab-cta__dot-grid" />
          
          <div class="ab-cta__inner">
            <div class="ab-badge ab-badge--cta mx-auto">
              <span class="ab-badge__dot" />
              <span class="ab-badge__text">Bergabunglah Bersama Kami</span>
              <span class="ab-badge__sweep" aria-hidden="true" />
            </div>
            <h2 class="ab-cta__heading">Siap Memajukan Pertanian Indonesia?</h2>
            <p class="ab-cta__sub">
              Bergabunglah dengan ribuan petani yang telah merasakan manfaat JuruTani.
            </p>
            <div class="ab-cta__btns">
              <NuxtLink to="/auth/register" class="ab-btn ab-btn--solid">
                <UIcon name="i-lucide-user-plus" class="w-4 h-4" />
                Daftar Gratis
              </NuxtLink>
              <NuxtLink to="/contact-us" class="ab-btn ab-btn--ghost">
                <UIcon name="i-lucide-mail" class="w-4 h-4" />
                Hubungi Kami
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
  @keyframes sweep-light {
    0% { transform: translateX(-200%) skewX(-25deg); opacity: 0.1; }
    10% { opacity: 0.6; }
    90% { opacity: 0.6; }
    100% { transform: translateX(280%) skewX(-25deg); opacity: 0.1; }
  }

  .ab-badge__sweep {
    animation: sweep-light 3s ease-in-out infinite 1.5s;
  }

  @keyframes pulse-subtle {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .ab-badge__dot {
    animation: pulse-subtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .ab-wrap {
    max-width: 72rem;
    margin: 0 auto;
    padding: 4rem 1.25rem 5rem;
    display: flex;
    flex-direction: column;
    gap: 5rem;
  }
  @media (min-width: 640px) {
    .ab-wrap {
      padding: 4rem 2rem 6rem;
    }
  }

  .ab-section {
  }

  /* chip / badge */
  .ab-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.875rem;
    background: var(--bg-badge);
    border: 1px solid var(--border-badge);
    border-radius: 9999px;
    margin-bottom: 1.375rem;
    width: fit-content;
    position: relative;
    overflow: hidden;
  }

  .ab-badge__sweep {
    position: absolute;
    top: 0;
    left: 0;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.55) 50%,
      transparent 100%
    );
    border-radius: inherit;
    transform: translateX(-200%);
    pointer-events: none;
    will-change: transform;
  }

  .ab-badge__dot {
    display: block;
    width: 0.375rem;
    height: 0.375rem;
    background: var(--text-accent);
    border-radius: 50%;
  }

  .ab-badge__text {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-badge);
  }

  /* typography */
  .ab-heading {
    font-size: 1.875rem;
    font-weight: 800;
    color: var(--text-base);
    line-height: 1.2;
    margin-bottom: 0.875rem;
  }
  @media (min-width: 768px) {
    .ab-heading {
      font-size: 2.25rem;
    }
  }

  .ab-accent {
    background: linear-gradient(
      135deg,
      var(--text-accent),
      var(--text-accent-light)
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  .ab-quote {
    padding: 0.75rem 1rem;
    border-left: 3px solid #16a34a;
    font-style: italic;
    font-weight: 500;
    color: var(--text-accent);
    background: rgba(22, 163, 74, 0.06);
    border-radius: 0 0.5rem 0.5rem 0;
    margin-bottom: 1rem;
    font-size: 0.9375rem;
  }

  .ab-body {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
  }

  /* split */
  .ab-split {
    display: grid;
    gap: 2.5rem;
  }
  @media (min-width: 1024px) {
    .ab-split {
      grid-template-columns: 1fr 1fr;
      align-items: start;
    }
  }

  /* feat grid */
  .ab-grid-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-subtle);
    margin-bottom: 0.875rem;
  }

  .ab-feat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
  }

  .ab-feat-card {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    background: var(--bg-badge);
    border: 1px solid var(--border-badge);
    transition:
      box-shadow 0.2s ease,
      transform 0.2s ease;
  }
  .ab-feat-card:hover {
    box-shadow: 0 4px 16px rgba(22, 163, 74, 0.15);
    transform: translateY(-2px);
  }

  .ab-feat-card__icon {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: rgba(22, 163, 74, 0.15);
    color: #16a34a;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ab-feat-card__title {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-base);
    line-height: 1.3;
    margin-bottom: 0.2rem;
  }
  .ab-feat-card__desc {
    font-size: 0.68rem;
    color: var(--text-muted);
    line-height: 1.45;
  }

  /* visi misi */
  .ab-vm-grid {
    display: grid;
    gap: 1.25rem;
  }
  @media (min-width: 768px) {
    .ab-vm-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .ab-vm-card {
    padding: 1.75rem;
    border-radius: 1.25rem;
    border: 1px solid rgba(22, 163, 74, 0.15);
  }

  .ab-vm-card__head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .ab-vm-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    background: linear-gradient(135deg, #16a34a, #059669);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ab-vm-icon--em {
    background: linear-gradient(135deg, #059669, #0d9488);
  }
  .ab-vm-card__title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-base);
  }

  .ab-mission-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }
  .ab-mission-item {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    font-size: 0.875rem;
    color: var(--text-muted);
    line-height: 1.6;
  }
  .ab-mission-dot {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: rgba(22, 163, 74, 0.12);
    color: #16a34a;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.15rem;
  }

  /* advantages */
  .ab-adv-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  @media (min-width: 768px) {
    .ab-adv-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .ab-adv-card {
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid rgba(22, 163, 74, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .ab-adv-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(22, 163, 74, 0.15);
    border-color: rgba(22, 163, 74, 0.3);
  }

  .ab-adv-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    background: linear-gradient(135deg, #16a34a, #34d399);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.875rem;
  }

  .ab-adv-card__title {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--text-base);
    margin-bottom: 0.375rem;
    line-height: 1.35;
  }
  .ab-adv-card__desc {
    font-size: 0.75rem;
    color: var(--text-muted);
    line-height: 1.6;
  }

  /* gallery */
  .ab-gallery {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.875rem;
  }
  @media (min-width: 768px) {
    .ab-gallery {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .ab-gallery__item {
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    aspect-ratio: 4/3;
    background: #1a2e1a;
  }
  .ab-gallery__item--wide {
    grid-column: span 2;
  }
  @media (min-width: 768px) {
    .ab-gallery__item--wide {
      grid-column: span 2;
    }
  }

  .ab-gallery__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .ab-gallery__item:hover .ab-gallery__img {
    transform: scale(1.06);
  }

  .ab-gallery__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.72) 0%,
      rgba(0, 0, 0, 0.08) 55%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 1.25rem;
  }
  .ab-gallery__item:hover .ab-gallery__overlay {
    opacity: 1;
  }

  .ab-gallery__title {
    font-size: 0.875rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.25rem;
  }
  .ab-gallery__desc {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.4;
  }

  .ab-gallery__badge {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    font-size: 0.65rem;
    font-weight: 700;
    color: #fff;
  }

  /* institusi */
  .ab-inst-card {
    border-radius: 1.25rem;
    border: 1px solid rgba(22, 163, 74, 0.15);
    overflow: hidden;
  }

  .ab-inst-card__head {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.25rem;
    padding: 1.75rem;
    background: var(--bg-badge);
    border-bottom: 1px solid var(--border-badge);
  }

  .ab-inst-logo {
    max-height: 4rem;
    object-fit: contain;
  }

  .ab-inst-card__name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-base);
    margin-bottom: 0.25rem;
  }
  .ab-inst-card__sub {
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .ab-inst-highlights {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1.5rem 1.75rem;
  }
  @media (max-width: 640px) {
    .ab-inst-highlights {
      grid-template-columns: 1fr;
    }
  }

  .ab-inst-hl {
    text-align: center;
    padding: 1rem;
    border-radius: 0.75rem;
    background: rgba(22, 163, 74, 0.04);
    border: 1px solid rgba(22, 163, 74, 0.1);
  }
  .ab-inst-hl__icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.625rem;
    background: rgba(22, 163, 74, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.625rem;
  }
  .ab-inst-hl__title {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--text-base);
    margin-bottom: 0.25rem;
  }
  .ab-inst-hl__desc {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  /* tim */
  .ab-team-wrap {
    border-radius: 1.25rem;
    background: linear-gradient(135deg, #16a34a, #047857);
    padding: 2.5rem;
    position: relative;
    overflow: hidden;
  }
  .ab-team-wrap::before {
    content: '';
    position: absolute;
    top: -4rem;
    right: -4rem;
    width: 16rem;
    height: 16rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }

  .ab-team-grid {
    display: grid;
    gap: 1rem;
    position: relative;
    z-index: 1;
  }
  @media (min-width: 768px) {
    .ab-team-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .ab-team-card {
    padding: 1.5rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(8px);
  }

  .ab-team-card__head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .ab-team-icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.625rem;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ab-team-card__title {
    font-size: 0.9375rem;
    font-weight: 700;
    color: #fff;
  }

  .ab-team-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .ab-team-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: rgba(209, 250, 229, 0.9);
    line-height: 1.5;
  }

  /* ═══════════════════════════════════════════════════════
     CTA BOX — dual light/dark
  ═══════════════════════════════════════════════════════ */
  .ab-cta {
    position: relative;
    overflow: hidden;
    border-radius: 1.5rem;
    background: var(--bg-badge);
    border: 1.5px solid var(--border-badge);
    text-align: center;
  }

  :global(.dark) .ab-cta {
    background: linear-gradient(135deg, #14532d 0%, #052e16 60%, #022c22 100%);
    border-color: rgba(134, 239, 172, 0.08);
    box-shadow:
      0 20px 60px -12px rgba(5, 46, 22, 0.5),
      0 0 0 1px rgba(134, 239, 172, 0.06);
  }

  .ab-cta__ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(134, 239, 172, 0.07);
    pointer-events: none;
  }
  .ab-cta__ring--1 { width: 300px; height: 300px; top: -90px; right: -30px; }
  .ab-cta__ring--2 { width: 180px; height: 180px; bottom: -55px; left: -35px; }

  .ab-cta__dot-grid {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: radial-gradient(circle at 1px 1px, rgba(134, 239, 172, 0.8) 1px, transparent 0);
    background-size: 24px 24px;
    pointer-events: none;
  }

  .ab-cta__inner {
    position: relative;
    z-index: 1;
    padding: 2.5rem 2rem;
  }

  .ab-badge--cta {
    display: flex;
    margin-bottom: 0.625rem;
    background: rgba(22, 163, 74, 0.08);
    border-color: rgba(22, 163, 74, 0.15);
  }
  :global(.dark) .ab-badge--cta {
    background: rgba(134, 239, 172, 0.08);
    border-color: rgba(134, 239, 172, 0.15);
  }

  .ab-cta__heading {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-base);
    letter-spacing: -0.02em;
    line-height: 1.25;
    margin-bottom: 0.625rem;
  }
  :global(.dark) .ab-cta__heading { color: #ffffff; }

  .ab-cta__sub {
    font-size: 0.875rem;
    color: var(--text-muted);
    line-height: 1.65;
    max-width: 30rem;
    margin: 0 auto 1.75rem;
  }
  :global(.dark) .ab-cta__sub { color: rgba(187, 247, 208, 0.6); }

  .ab-cta__btns {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .ab-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.4rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }

  .ab-btn--solid {
    background: #16a34a;
    color: #fff;
    border: 1.5px solid #16a34a;
  }
  .ab-btn--solid:hover {
    background: #15803d;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.35);
  }
  :global(.dark) .ab-btn--solid {
    background: #22c55e;
    color: #052e16;
    border-color: #22c55e;
  }
  :global(.dark) .ab-btn--solid:hover { background: #4ade80; }

  .ab-btn--ghost {
    background: transparent;
    color: #16a34a;
    border: 1.5px solid rgba(22, 163, 74, 0.4);
  }
  .ab-btn--ghost:hover {
    background: rgba(22, 163, 74, 0.07);
    border-color: #16a34a;
    transform: translateY(-1px);
  }
  :global(.dark) .ab-btn--ghost {
    color: #bbf7d0;
    border-color: rgba(134, 239, 172, 0.25);
  }
  :global(.dark) .ab-btn--ghost:hover {
    border-color: rgba(134, 239, 172, 0.5);
    background: rgba(134, 239, 172, 0.06);
  }
</style>
