import { defineStore } from 'pinia'
import type { AuthError } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  role: 'petani' | 'penyuluh' | 'admin' | 'guest'
  phone: string | null
  bio: string | null
  location: string | null
  createdAt: string
}

interface AuthResult {
  success: boolean
  error?: string
  data?: any
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient<Database>()
  const supabaseUser = useSupabaseUser()

  // ─── State ───────────────────────────────────────────────────────────────
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)

  // ─── Getters ─────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!supabaseUser.value)

  const avatarUrl = computed(() => {
    if (profile.value?.avatarUrl) return profile.value.avatarUrl
    if (supabaseUser.value?.user_metadata?.avatar_url) {
      return supabaseUser.value.user_metadata.avatar_url as string
    }
    return '/placeholder/user.webp'
  })

  const computedProfile = computed(() => {
    if (!supabaseUser.value) return null
    return {
      id: supabaseUser.value.id,
      email: supabaseUser.value.email ?? '',
      displayName:
        profile.value?.displayName ||
        (supabaseUser.value.user_metadata?.full_name as string) ||
        supabaseUser.value.email?.split('@')[0] ||
        'Petani',
      avatarUrl: avatarUrl.value,
      role: profile.value?.role ?? 'petani',
      phone: profile.value?.phone ?? null,
      bio: profile.value?.bio ?? null,
      location: profile.value?.location ?? null,
      createdAt: profile.value?.createdAt ?? supabaseUser.value.created_at,
    }
  })

  // ─── Actions ──────────────────────────────────────────────────────────────

  /** Fetch profile dari tabel `profiles` Supabase */
  async function fetchProfile(): Promise<void> {
    if (!supabaseUser.value) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.value.id)
        .single()

      if (!error && data) {
        profile.value = {
          id: data.id,
          email: data.email ?? supabaseUser.value.email ?? '',
          displayName: data.full_name || data.username || supabaseUser.value.email?.split('@')[0] || 'Petani',
          avatarUrl: data.avatar_url ?? null,
          role: data.role ?? 'petani',
          phone: data.phone ?? null,
          bio: data.bio ?? null,
          location: data.location ?? null,
          createdAt: data.created_at,
        }
      }
    } catch (err) {
      console.warn('[AuthStore] fetchProfile error:', err)
    }
  }

  /** Email + Password Sign In */
  async function signIn(email: string, password: string): Promise<AuthResult> {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { success: false, error: error.message }
      await fetchProfile()
      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Login gagal' }
    } finally {
      loading.value = false
    }
  }

  /** OAuth Sign In (Google, dll.) */
  async function signInWithSocialProvider(provider: 'google' | 'github'): Promise<AuthResult> {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) return { success: false, error: error.message }
      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Social login gagal' }
    } finally {
      loading.value = false
    }
  }

  /** Sign Out */
  async function signOut(): Promise<AuthResult> {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) return { success: false, error: error.message }
      profile.value = null
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Logout gagal' }
    } finally {
      loading.value = false
    }
  }

  /** Register dengan email + password */
  async function signUp(email: string, password: string, fullName: string): Promise<AuthResult> {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })
      if (error) return { success: false, error: error.message }
      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Registrasi gagal' }
    } finally {
      loading.value = false
    }
  }

  /** Kirim email reset password */
  async function sendPasswordReset(email: string): Promise<AuthResult> {
    loading.value = true
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Gagal kirim email reset' }
    } finally {
      loading.value = false
    }
  }

  /** Update password baru */
  async function updatePassword(newPassword: string): Promise<AuthResult> {
    loading.value = true
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Gagal update password' }
    } finally {
      loading.value = false
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  // Auto-fetch profile saat user tersedia
  watch(supabaseUser, async (user) => {
    if (user) {
      await fetchProfile()
    } else {
      profile.value = null
    }
  }, { immediate: true })

  return {
    // state
    profile,
    loading,
    // getters
    isAuthenticated,
    avatarUrl,
    computedProfile,
    // actions
    fetchProfile,
    signIn,
    signInWithSocialProvider,
    signOut,
    signUp,
    sendPasswordReset,
    updatePassword,
  }
})
