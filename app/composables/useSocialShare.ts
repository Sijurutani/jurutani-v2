import { ref } from 'vue'
import { toastStore } from './useJuruTaniToast'
export interface ShareOptions {
  title: string
  description?: string
  url: string
  hashtags?: string[]
}

export interface SharePlatform {
  name: string
  icon: string
  color: string
  action: (options: ShareOptions) => void | Promise<void>
}

export function useSocialShare() {
  const isSharing = ref(false)

  // Copy to clipboard — client only
  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!import.meta.client) return false
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Failed to copy:', err)
      return false
    }
  }

  // Share to WhatsApp — client only
  const shareToWhatsApp = (options: ShareOptions) => {
    if (!import.meta.client) return
    const text = encodeURIComponent(
      `${options.title}\n\n${options.description || ''}\n\n${options.url}`,
    )
    const url = `https://api.whatsapp.com/send?text=${text}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Share to Facebook — client only
  const shareToFacebook = (options: ShareOptions) => {
    if (!import.meta.client) return
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(options.url)}`
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400')
  }

  // Share to Instagram (Note: Instagram doesn't have direct share URL, so we Link URL)
  const shareToInstagram = async (options: ShareOptions) => {
    const success = await copyToClipboard(options.url)
    if (success) {
      toastStore.success(
        'Link disalin! Buka Instagram dan paste link di bio atau story Anda',
      )
    } else {
      toastStore.error('Gagal menyalin link. Silakan salin link secara manual')
    }
  }

  // Share to TikTok (Note: TikTok doesn't have direct share URL, so we Link URL)
  const shareToTikTok = async (options: ShareOptions) => {
    const success = await copyToClipboard(options.url)
    if (success) {
      toastStore.success(
        'Link disalin! Buka TikTok dan paste link di bio atau video Anda',
      )
    } else {
      toastStore.error('Gagal menyalin link. Silakan salin link secara manual')
    }
  }

  // Link URL
  const copyLink = async (options: ShareOptions) => {
    const success = await copyToClipboard(options.url)
    if (success) {
      toastStore.success('Link berhasil disalin ke clipboard')
    } else {
      toastStore.error('Gagal menyalin link. Silakan salin link secara manual')
    }
  }

  // Available platforms
  const platforms: SharePlatform[] = [
    {
      name: 'WhatsApp',
      icon: 'i-mdi-whatsapp',
      color: 'bg-green-500 hover:bg-green-600',
      action: shareToWhatsApp,
    },
    {
      name: 'Facebook',
      icon: 'i-mdi-facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: shareToFacebook,
    },
    {
      name: 'Instagram',
      icon: 'i-mdi-instagram',
      color:
        'bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      action: shareToInstagram,
    },
    {
      name: 'TikTok',
      icon: 'i-simple-icons-tiktok',
      color: 'bg-gray-900 hover:bg-gray-800',
      action: shareToTikTok,
    },
    {
      name: 'Link URL',
      icon: 'i-lucide-link',
      color: 'bg-gray-500 hover:bg-gray-600',
      action: copyLink,
    },
  ]

  // Share function
  const share = async (platform: SharePlatform, options: ShareOptions) => {
    isSharing.value = true
    try {
      await platform.action(options)
    } catch (err) {
      console.error('Share error:', err)
      toastStore.error('Gagal membagikan konten. Silakan coba lagi')
    } finally {
      isSharing.value = false
    }
  }

  // Native share (if available) — client only
  const nativeShare = async (options: ShareOptions) => {
    if (!import.meta.client) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title,
          text: options.description,
          url: options.url,
        })
      } catch (err) {
        console.error('Native share error:', err)
      }
    }
  }

  return {
    platforms,
    isSharing,
    share,
    nativeShare,
    copyToClipboard,
    shareToWhatsApp,
    shareToFacebook,
    shareToInstagram,
    shareToTikTok,
    copyLink,
  }
}
