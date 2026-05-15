export default defineAppConfig({
  ui: {
    // ─── Color Palette ──────────────────────────────────────────────────────
    colors: {
      primary: 'green',
      neutral: 'zinc',
    },

    // ─── Button ─────────────────────────────────────────────────────────────
    button: {
      defaultVariants: {
        color: 'primary',
      },
    },

    // ─── Input ──────────────────────────────────────────────────────────────
    input: {
      slots: {
        root: 'w-full',
        base: 'rounded-xl',
      },
    },

    // ─── Modal ──────────────────────────────────────────────────────────────
    modal: {
      slots: {
        overlay: 'backdrop-blur-sm',
        content: 'rounded-2xl',
      },
    },

    // ─── Toast ──────────────────────────────────────────────────────────────
    toast: {
      slots: {
        root: 'rounded-xl',
      },
    },
  },
})
