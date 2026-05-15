<template>
  <div class="footer-wrapper">
    <!-- Floating CTA Card (overlaps footer) -->
    <div class="cta-container">
      <div class="cta-float">
        <LayoutFooterCta />
      </div>
    </div>

    <!-- Main Footer -->
    <footer
      class="footer-body bg-gradient-to-br from-[#f0fdf4] via-[#dcfce7] to-[#f0fdf4] dark:from-[#021207] dark:via-[#010803] dark:to-[#010803]"
    >
      <!-- Decorative circles -->
      <div class="deco-circle deco-circle--1" />
      <div class="deco-circle deco-circle--2" />
      <div class="deco-circle deco-circle--3" />
      <div class="deco-ring deco-ring--1" />
      <div class="deco-ring deco-ring--2" />

      <div
        class="footer-container relative mx-auto z-10"
        style="padding-top: 6rem"
      >
        <!-- Statistics -->
        <LayoutFooterStats class="mb-6 md:mb-10" />

        <!-- Main Grid -->
        <div class="mb-6 md:mb-10">
          <LayoutFooterMain />
        </div>

        <!-- Social + Sponsors -->
        <div class="mb-6 md:mb-8">
          <LayoutFooterSocial />
        </div>

        <!-- Bottom Bar -->
        <LayoutFooterBottom />
      </div>
    </footer>
  </div>
</template>

<style scoped>
  .footer-wrapper {
    position: relative;
  }

  .cta-container {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    position: relative;
    z-index: 20;
  }

  @media (max-width: 768px) {
    .cta-container {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }

  @media (max-width: 640px) {
    .cta-container {
      max-width: 100%;
    }
  }

  .footer-container {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: 768px) {
    .footer-container {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }

  /* Floating CTA positioned to overlap the footer */
  .cta-float {
    position: relative;
    z-index: 20;
    margin-bottom: -4.5rem;
  }

  /* Footer body */
  .footer-body {
    position: relative;
    overflow: hidden;
    padding: 2rem 0;
    border-radius: 2rem 2rem 0 0;
  }

  /* ═══ Decorative circles (outline only) ═══ */
  .deco-circle {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(34, 197, 94, 0.08);
    pointer-events: none;
  }

  :global(.dark) .deco-circle {
    border-color: rgba(134, 239, 172, 0.08);
  }

  .deco-circle--1 {
    width: 400px;
    height: 400px;
    top: -80px;
    right: -120px;
  }

  .deco-circle--2 {
    width: 300px;
    height: 300px;
    bottom: 100px;
    left: -100px;
  }

  .deco-circle--3 {
    width: 200px;
    height: 200px;
    top: 50%;
    right: 10%;
  }

  /* Decorative rings (double border) */
  .deco-ring {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .deco-ring--1 {
    width: 500px;
    height: 500px;
    top: 20%;
    left: -200px;
    border: 1px solid rgba(34, 197, 94, 0.05);
    box-shadow:
      inset 0 0 0 20px transparent,
      inset 0 0 0 21px rgba(34, 197, 94, 0.03);
  }

  .deco-ring--2 {
    width: 350px;
    height: 350px;
    bottom: -60px;
    right: -80px;
    border: 1px solid rgba(34, 197, 94, 0.06);
    box-shadow:
      inset 0 0 0 15px transparent,
      inset 0 0 0 16px rgba(34, 197, 94, 0.03);
  }

  :global(.dark) .deco-ring--1,
  :global(.dark) .deco-ring--2 {
    border-color: rgba(134, 239, 172, 0.04);
    box-shadow:
      inset 0 0 0 15px transparent,
      inset 0 0 0 16px rgba(134, 239, 172, 0.02);
  }

  @media (max-width: 768px) {
    .footer-body {
      padding: 1rem 0;
    }
  }
</style>
