<script setup lang="ts">
  import { faqCategories, faqData } from '~/data/faq'
  import { useReveal } from '~/composables/useReveal'

  useSeoMeta({
    title: 'Pusat Bantuan & Panduan Penggunaan',
    description: 'Pusat bantuan platform JuruTani. Temukan kumpulan FAQ, panduan tutorial fitur, serta kontak bantuan teknis bagi seluruh pengguna layanan penyuluhan kami.'
  })
  useReveal()

  // Menggunakan faqCategories langsung dari data/faq.ts
  // Menambahkan 'number' untuk tampilan, karena data asli tidak memilikinya.
  const categories = faqCategories.map((cat, index) => ({
    ...cat,
    id: cat.id,
    label: cat.name,
    number: `0${index + 1}`,
  }))

  const scrollToFaqs = () => {
    if (!import.meta.client) return
    document.getElementById('faq-content')?.scrollIntoView({ behavior: 'smooth' })
  }
</script>

<template>
  <div class="hf-page">
    <!-- ════════════════════════════════════════════════
         HERO — matches HeroSection & page header patterns
         Uses bg-linear-to-r emerald gradient like other pages
    ════════════════════════════════════════════════ -->
    <section class="hf-hero mt-14 md:mt-20">
      <div class="hf-hero__inner">
        <!-- Eyebrow badge — matches hero-badge token style -->
        <div class="hf-badge">
          <span class="hf-badge__dot animate-pulse-subtle" />
          <UIcon name="i-lucide-help-circle" class="w-3.5 h-3.5 text-[--text-badge]" />
          <span class="hf-badge__text">Pusat Bantuan</span>
          <!-- Light sweep — kini menggunakan animasi CSS -->
          <span class="hf-badge__sweep animate-sweep-light" aria-hidden="true" />
        </div>

        <!-- H1 — matches hero-heading token style -->
        <h1 class="hf-title">
          Semua Jawaban yang
          <span class="hf-title__accent">Anda Butuhkan</span>
        </h1>

        <!-- Description — matches hero-description -->
        <p class="hf-desc">
          Temukan jawaban lengkap, panduan langkah demi langkah, dan solusi
          untuk setiap pertanyaan seputar platform JuruTani.
        </p>

        <!-- Stats — matches stat-item / stat-value pattern from HeroSection -->
        <div class="hf-stats">
          <div class="hf-stat">
            <span class="hf-stat__val">10K+</span>
            <span class="hf-stat__lbl">Pertanyaan</span>
          </div>
          <div class="hf-stat__sep" />
          <div class="hf-stat">
            <span class="hf-stat__val">98%</span>
            <span class="hf-stat__lbl">Kepuasan</span>
          </div>
          <div class="hf-stat__sep" />
          <div class="hf-stat">
            <span class="hf-stat__val">24/7</span>
            <span class="hf-stat__lbl">Dukungan</span>
          </div>
        </div>

        <!-- Scroll CTA -->
        <button class="hf-scroll-cta" @click="scrollToFaqs">
          <UIcon name="i-lucide-chevrons-down" class="w-4 h-4" />
          Lihat Semua Pertanyaan
        </button>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════
         FAQ CONTENT
    ════════════════════════════════════════════════ -->
    <div id="faq-content" class="hf-content">
      <!-- Category sections -->
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="hf-category app-reveal"
      >
        <!-- Category header -->
        <div class="hf-cat-head">
          <span class="hf-cat-badge">{{ cat.number }}</span>
          <div class="hf-cat-title-row">
            <UIcon :name="cat.icon" class="w-4 h-4 text-[--text-accent]" />
            <h2 class="hf-cat-title">{{ cat.label }}</h2>
          </div>
        </div>
        <div class="hf-cat-rule" />

        <!-- Accordion items -->
        <AppFaqAccordion :items="faqData[cat.id]" />
      </div>

      <!-- ── CTA box — dual light/dark, styled like Footer/Cta.vue ── -->
      <div class="hf-cta app-reveal">
        <!-- decorative rings (mirrors cta-deco-ring pattern) -->
        <div class="hf-cta__ring hf-cta__ring--1" />
        <div class="hf-cta__ring hf-cta__ring--2" />
        <div class="hf-cta__dot-grid" />

        <div class="hf-cta__inner">
          <div class="hf-badge hf-badge--cta mx-auto">
            <span class="hf-badge__dot" />
            <span class="hf-badge__text">Masih Bingung?</span>
            <span class="hf-badge__sweep" aria-hidden="true" />
          </div>
          <h3 class="hf-cta__title">Kami siap membantu Anda</h3>
          <p class="hf-cta__desc">
            Jika pertanyaan Anda belum terjawab, hubungi tim support kami atau
            bertanya langsung ke komunitas petani JuruTani.
          </p>
          <div class="hf-cta__btns">
            <NuxtLink to="/contact-us" class="hf-btn hf-btn--solid">
              <UIcon name="i-lucide-send" class="w-4 h-4" />
              Hubungi Support
            </NuxtLink>
            <NuxtLink to="/discussions" class="hf-btn hf-btn--ghost">
              <UIcon name="i-lucide-users" class="w-4 h-4" />
              Tanya Komunitas
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* ═══════════════════════════════════════════════════════
     PAGE — transparent, inherits layout bg-linear gradient
  ═══════════════════════════════════════════════════════ */
  .hf-page {
    font-family: -apple-system, 'Segoe UI', sans-serif;
  }

  /* ═══════════════════════════════════════════════════════
     HERO
     ─ Transparent bg (layout gradient shows through).
     ─ All colors use global CSS vars that auto-switch dark/light.
     ─ Gradient text uses --text-accent / --text-accent-light
       exactly like HeroSection.vue .hero-heading__accent.
  ═══════════════════════════════════════════════════════ */
  .hf-hero {
    padding: 3.5rem 1.25rem 3rem;
    text-align: center;
    position: relative;
  }

  @media (min-width: 640px) {
    .hf-hero {
      padding: 4rem 2rem 3.5rem;
    }
  }

  .hf-hero__inner {
    max-width: 48rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ── Badge — identical to PageHeroSection badge ── */
  .hf-badge {
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

  /* Light sweep shimmer — GPU compositor via transform */
  .hf-badge__sweep {
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
    pointer-events: none;
    will-change: transform, opacity;
  }

  .hf-badge__dot {
    display: block;
    width: 0.375rem;
    height: 0.375rem;
    background: var(--text-accent);
    border-radius: 50%;
  }

  .hf-badge__text {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-badge);
  }

  /* ── H1 — identical token to .hero-heading ── */
  .hf-title {
    font-size: clamp(1.875rem, 5vw, 3rem);
    font-weight: 800;
    line-height: 1.2;
    color: var(--text-base);
    margin-bottom: 1rem;
    letter-spacing: -0.025em;
  }

  /* Gradient accent — identical to .hero-heading__accent */
  .hf-title__accent {
    display: block;
    background: linear-gradient(
      135deg,
      var(--text-accent),
      var(--text-accent-light)
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    isolation: isolate;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* ── Description — identical token to .hero-description ── */
  .hf-desc {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--text-muted);
    max-width: 36rem;
    margin-bottom: 2rem;
  }

  /* ── Stats — identical token to .stat-item / .stat-value ── */
  .hf-stats {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .hf-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
  }

  .hf-stat__val {
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--text-accent);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .hf-stat__lbl {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--text-subtle);
    white-space: nowrap;
  }

  /* Separator — identical to .stat-sep */
  .hf-stat__sep {
    width: 1px;
    height: 2rem;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(134, 239, 172, 0.5),
      transparent
    );
    flex-shrink: 0;
  }

  /* Scroll CTA — ghost button style matching nav-pill */
  .hf-scroll-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.55rem 1.25rem;
    border-radius: 9999px;
    border: 1px solid var(--border-badge);
    background: var(--bg-badge);
    color: var(--text-badge);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      background 0.2s,
      border-color 0.2s;
  }

  .hf-scroll-cta:hover {
    border-color: var(--text-accent);
    background: rgba(22, 163, 74, 0.08);
  }

  /* ═══════════════════════════════════════════════════════
     CONTENT AREA
  ═══════════════════════════════════════════════════════ */
  .hf-content {
    max-width: 52rem;
    margin: 0 auto;
    padding: 2rem 1.25rem 5rem;
    display: flex;
    flex-direction: column;
    gap: 3.5rem;
  }

  @media (min-width: 640px) {
    .hf-content {
      padding: 2rem 2rem 5.5rem;
    }
  }

  /* ═══════════════════════════════════════════════════════
     CATEGORY HEADER
  ═══════════════════════════════════════════════════════ */
  .hf-cat-head {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    margin-bottom: 0.875rem;
  }

  /* Number badge — Solar Flare (small accent only, per spec) */
  .hf-cat-badge {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.375rem;
    height: 2.375rem;
    border-radius: 0.5rem;
    background: linear-gradient(90deg, #ffaa00, #ff6600, #eb001a);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.04em;
  }

  .hf-cat-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Category title — uses --text-accent (green) auto-switches dark/light */
  .hf-cat-title {
    font-size: 1.0625rem;
    font-weight: 700;
    color: var(--text-accent);
    letter-spacing: -0.01em;
    line-height: 1.3;
  }

  /* Divider rule */
  .hf-cat-rule {
    height: 1.5px;
    background: var(--border-badge);
    margin-bottom: 1rem;
    border-radius: 1px;
  }



  /* ═══════════════════════════════════════════════════════
     CTA BOX — dual light/dark, mirrors Footer/Cta.vue style
     Light: soft green badge surface
     Dark: deep green gradient (14532d → 052e16) like Footer CTA
  ═══════════════════════════════════════════════════════ */
  .hf-cta {
    position: relative;
    overflow: hidden;
    border-radius: 1.5rem;
    /* Light mode: soft green badge surface */
    background: var(--bg-badge);
    border: 1.5px solid var(--border-badge);
    text-align: center;
  }

  /* Dark: deep green gradient identical to Footer/Cta.vue .cta-card */
  :global(.dark) .hf-cta {
    background: linear-gradient(135deg, #14532d 0%, #052e16 60%, #022c22 100%);
    border-color: rgba(134, 239, 172, 0.08);
    box-shadow:
      0 20px 60px -12px rgba(5, 46, 22, 0.5),
      0 0 0 1px rgba(134, 239, 172, 0.06);
  }

  /* Decorative rings — mirrors cta-deco-ring */
  .hf-cta__ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(134, 239, 172, 0.07);
    pointer-events: none;
  }
  .hf-cta__ring--1 { width: 300px; height: 300px; top: -90px; right: -30px; }
  .hf-cta__ring--2 { width: 180px; height: 180px; bottom: -55px; left: -35px; }

  /* Dot grid — mirrors cta-dot-grid */
  .hf-cta__dot-grid {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: radial-gradient(circle at 1px 1px, rgba(134, 239, 172, 0.8) 1px, transparent 0);
    background-size: 24px 24px;
    pointer-events: none;
  }

  .hf-cta__inner {
    position: relative;
    z-index: 1;
    padding: 2.5rem 2rem;
  }

  /* CTA Badge Override */
  .hf-badge--cta {
    display: flex; /* Ensures it acts as a flex container */
    margin-bottom: 0.625rem;
    background: rgba(22, 163, 74, 0.08);
    border-color: rgba(22, 163, 74, 0.15);
  }

  :global(.dark) .hf-badge--cta {
    background: rgba(134, 239, 172, 0.08);
    border-color: rgba(134, 239, 172, 0.15);
  }

  /* .hf-cta__eyebrow is removed since we use hf-badge */

  .hf-cta__title {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-base);
    letter-spacing: -0.02em;
    line-height: 1.25;
    margin-bottom: 0.625rem;
  }

  :global(.dark) .hf-cta__title { color: #ffffff; }

  .hf-cta__desc {
    font-size: 0.875rem;
    color: var(--text-muted);
    line-height: 1.65;
    max-width: 30rem;
    margin: 0 auto 1.75rem;
  }

  :global(.dark) .hf-cta__desc { color: rgba(187, 247, 208, 0.6); }

  .hf-cta__btns {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  /* Buttons */
  .hf-btn {
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

  /* Solid — light: brand green / dark: #22c55e like Footer CTA primary */
  .hf-btn--solid {
    background: #16a34a;
    color: #fff;
    border: 1.5px solid #16a34a;
  }
  .hf-btn--solid:hover {
    background: #15803d;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.35);
  }
  :global(.dark) .hf-btn--solid {
    background: #22c55e;
    color: #052e16;
    border-color: #22c55e;
  }
  :global(.dark) .hf-btn--solid:hover { background: #4ade80; }

  /* Ghost — light: outline accent / dark: ghost like Footer CTA ghost */
  .hf-btn--ghost {
    background: transparent;
    color: #16a34a;
    border: 1.5px solid rgba(22, 163, 74, 0.4);
  }
  .hf-btn--ghost:hover {
    background: rgba(22, 163, 74, 0.07);
    border-color: #16a34a;
    transform: translateY(-1px);
  }
  :global(.dark) .hf-btn--ghost {
    color: #bbf7d0;
    border-color: rgba(134, 239, 172, 0.25);
  }
  :global(.dark) .hf-btn--ghost:hover {
    border-color: rgba(134, 239, 172, 0.5);
    background: rgba(134, 239, 172, 0.06);
  }





  /* ═══════════════════════════════════════════════════════
     RESPONSIVE
  ═══════════════════════════════════════════════════════ */
  @media (max-width: 480px) {
    .hf-stats {
      gap: 1rem;
    }

    .hf-stat__val {
      font-size: 1.125rem;
    }

    .hf-cta {
      padding: 2rem 1.25rem;
    }

    .hf-item__q {
      font-size: 0.875rem;
    }
  }
</style>
