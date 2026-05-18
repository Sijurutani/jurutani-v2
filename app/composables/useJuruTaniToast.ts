import { getCurrentInstance } from 'vue'

type ToastColor = 'success' | 'error' | 'warning' | 'info' | 'neutral'

interface ToastInput {
  title: string
  description?: string
  duration?: number
}

const ICONS: Record<ToastColor, string> = {
  success: 'i-lucide-check-circle',
  error: 'i-lucide-x-circle',
  warning: 'i-lucide-triangle-alert',
  info: 'i-lucide-info',
  neutral: 'i-lucide-bell',
}


function normalizeToastInput(input: string | ToastInput, duration?: number): ToastInput {
  if (typeof input === 'string') {
    return { title: input, duration }
  }

  return {
    ...input,
    duration: input.duration ?? duration,
  }
}

const createToastApi = (toast: ReturnType<typeof useToast>) => {
  const addToast = (
    color: ToastColor,
    input: string | ToastInput,
    duration?: number,
  ) => {
    if (!import.meta.client) return

    const normalized = normalizeToastInput(input, duration)

    if (!toast || typeof toast.add !== 'function') return

    try {
      toast.add({
        title: normalized.title,
        description: normalized.description,
        color,
        icon: ICONS[color],
        duration: normalized.duration,
      })
    } catch (error) {
      console.warn('[Toast] Failed to add toast:', error)
    }
  }

  return {
    success(input: string | ToastInput, duration?: number) {
      addToast('success', input, duration)
    },
    error(input: string | ToastInput, duration?: number) {
      addToast('error', input, duration)
    },
    warning(input: string | ToastInput, duration?: number) {
      addToast('warning', input, duration)
    },
    info(input: string | ToastInput, duration?: number) {
      addToast('info', input, duration)
    },
    neutral(input: string | ToastInput, duration?: number) {
      addToast('neutral', input, duration)
    },
  }
}

type ToastApi = ReturnType<typeof createToastApi>

let cachedToast: ToastApi | null = null

export const useJuruTaniToast = () => {
  const toast = useToast()
  const api = createToastApi(toast)
  cachedToast = api
  return api
}

const getToastApi = () => {
  if (cachedToast) return cachedToast

  const instance = getCurrentInstance()
  if (!instance) return null

  return useJuruTaniToast()
}

export const toastStore = {
  success(input: string | ToastInput, duration?: number) {
    const api = getToastApi()
    if (!api) return
    api.success(input, duration)
  },
  error(input: string | ToastInput, duration?: number) {
    const api = getToastApi()
    if (!api) return
    api.error(input, duration)
  },
  warning(input: string | ToastInput, duration?: number) {
    const api = getToastApi()
    if (!api) return
    api.warning(input, duration)
  },
  info(input: string | ToastInput, duration?: number) {
    const api = getToastApi()
    if (!api) return
    api.info(input, duration)
  },
  neutral(input: string | ToastInput, duration?: number) {
    const api = getToastApi()
    if (!api) return
    api.neutral(input, duration)
  },
}
