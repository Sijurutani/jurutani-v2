import { ref, watch } from 'vue'

/**
 * Composable untuk manage mobile menu state
 * Includes body scroll lock dan keyboard navigation
 */
export const useMobileMenu = () => {
  const isOpen = ref(false)
  const menuRef = ref<HTMLElement | null>(null)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  // Auto lock/unlock body scroll
  watch(isOpen, (newValue) => {
    if (typeof document !== 'undefined') {
      if (newValue) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  })

  // Keyboard handler
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen.value) {
      close()
    }
  }

  return {
    isOpen,
    menuRef,
    open,
    close,
    toggle,
    handleKeydown,
  }
}
