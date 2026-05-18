// composables/useClientChatbot.ts
// State management chatbot client-side:
//   - Riwayat sesi (localStorage menggunakan VueUse)
//   - Kirim pesan ke server API chatbot

import type { AIProvider } from '~/utils/ai'


// --- Types -------------------------------------------------------------------

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  provider?: string
  model?: string
  error?: boolean
}

export interface ChatSession {
  id: string
  title: string
  date: string // ISO string
  messages: ChatMessage[]
}

interface ServerChatResponse {
  reply: string
  model?: string
  provider?: string
  skills?: string[]
}

// --- Constants ---------------------------------------------------------------

const STORAGE_KEY = 'jurutani_chat_sessions'
const MAX_SESSIONS = 30
const MAX_MESSAGES_PER_SESSION = 100

// --- Helpers -----------------------------------------------------------------

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function buildSessionTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === 'user')
  if (!first) return 'Percakapan baru'
  return first.content.slice(0, 50) + (first.content.length > 50 ? '...' : '')
}

function useCustomLocalStorage<T>(key: string, initialValue: T, options: { serializer: { read: (v: string) => T, write: (v: T) => string } }) {
  const data = ref<T>(initialValue) as Ref<T>
  
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(key)
    if (stored !== null) {
      data.value = options.serializer.read(stored)
    }
    
    watch(data, (newValue) => {
      window.localStorage.setItem(key, options.serializer.write(newValue))
    }, { deep: true })
    
    window.addEventListener('storage', (e) => {
      if (e.key === key && e.newValue) {
        data.value = options.serializer.read(e.newValue)
      }
    })
  }
  
  return data
}

// --- Composable --------------------------------------------------------------

export const useClientChatbot = () => {
  const authStore = useAuthStore()

  const isOpen = ref(false)
  const isLoading = ref(false)
  const isExpanded = ref(false)
  const hasSeenSplash = ref(false)
  const showSplash = computed(() => isOpen.value && !hasSeenSplash.value)

  const provider = ref<AIProvider>('gemini')

  const sessions = useCustomLocalStorage<ChatSession[]>(STORAGE_KEY, [], {
    serializer: {
      read: (v: string) => {
        try {
          const parsed = JSON.parse(v) as ChatSession[]
          return parsed.map((s) => ({
            ...s,
            messages: s.messages.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
          }))
        } catch {
          return []
        }
      },
      write: (v: ChatSession[]) => JSON.stringify(v.slice(0, MAX_SESSIONS)),
    },
  })
  
  const activeSessionId = ref<string | null>(null)

  const activeSession = computed<ChatSession | null>(
    () => sessions.value.find((s) => s.id === activeSessionId.value) ?? null,
  )

  const messages = computed<ChatMessage[]>(
    () => activeSession.value?.messages ?? [],
  )

  const userProfile = computed(() => ({
    name: authStore.computedProfile?.displayName ?? 'Petani',
    role: authStore.computedProfile?.role ?? 'Pengguna',
    location: authStore.computedProfile?.location ?? '',
    avatar: authStore.avatarUrl ?? '/placeholder/user.webp',
    isAuthenticated: authStore.isAuthenticated,
  }))

  function newChat(): void {
    const session: ChatSession = {
      id: generateId(),
      title: 'Percakapan baru',
      date: new Date().toISOString(),
      messages: [],
    }
    sessions.value.unshift(session)
    activeSessionId.value = session.id
  }

  function loadSession(id: string): void {
    const found = sessions.value.find((s) => s.id === id)
    if (found) activeSessionId.value = found.id
  }

  function deleteSession(id: string): void {
    sessions.value = sessions.value.filter((s) => s.id !== id)
    if (activeSessionId.value === id) {
      activeSessionId.value = sessions.value[0]?.id ?? null
    }
  }

  function clearAllSessions(): void {
    sessions.value = []
    activeSessionId.value = null
  }

  function pushMessage(msg: ChatMessage): void {
    const idx = sessions.value.findIndex((s) => s.id === activeSessionId.value)
    if (idx === -1) return

    const session = sessions.value[idx]!
    const updated: ChatSession = {
      ...session,
      messages: [...session.messages, msg].slice(-MAX_MESSAGES_PER_SESSION),
      title:
        session.messages.length === 0 && msg.role === 'user'
          ? buildSessionTitle([msg])
          : session.title,
    }

    // Update state dan biarkan useLocalStorage yang menyimpannya
    sessions.value = [
      updated,
      ...sessions.value.filter((s) => s.id !== activeSessionId.value),
    ]
  }

  function buildAIHistory() {
    return messages.value.slice(-12).map((m) => ({
      role: m.role,
      content: m.content,
    }))
  }

  async function sendMessage(text: string): Promise<void> {
    if (!text.trim() || isLoading.value) return

    if (!activeSessionId.value) newChat()

    const cleanText = text.trim()
    const history = buildAIHistory()

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: cleanText,
      timestamp: new Date(),
    }
    pushMessage(userMsg)
    isLoading.value = true

    try {
      const response = await $fetch<ServerChatResponse>('/api/chat', {
        method: 'POST',
        body: {
          message: cleanText,
          history,
          provider: provider.value,
        },
      })

      const botMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.reply || 'Maaf, belum ada respons saat ini.',
        timestamp: new Date(),
        provider: response.provider ?? 'server',
        model: response.model ?? 'unknown',
      }
      pushMessage(botMsg)
    } catch (e: unknown) {
      const errMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Gagal mendapatkan respons.\n\n${e instanceof Error ? e.message : 'Terjadi kesalahan tidak diketahui.'}\n\nSilakan coba lagi nanti.`,
        timestamp: new Date(),
        error: true,
      }
      pushMessage(errMsg)
    } finally {
      isLoading.value = false
    }
  }

  function open(): void {
    isOpen.value = true
  }

  function close(): void {
    isOpen.value = false
  }

  function startChat(): void {
    hasSeenSplash.value = true
    if (!activeSessionId.value) newChat()
  }

  function toggleExpand(): void {
    isExpanded.value = !isExpanded.value
  }

  if (import.meta.client && sessions.value.length === 0) {
    newChat()
  } else if (sessions.value.length > 0 && !activeSessionId.value) {
    activeSessionId.value = sessions.value[0]!.id
  }

  return {
    isOpen,
    isLoading,
    isExpanded,
    showSplash,
    hasSeenSplash,

    provider,

    sessions,
    messages,
    activeSession,
    activeSessionId,
    userProfile,

    newChat,
    loadSession,
    deleteSession,
    clearAllSessions,

    sendMessage,

    open,
    close,
    startChat,
    toggleExpand,
  }
}
