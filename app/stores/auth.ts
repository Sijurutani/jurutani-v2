import { defineStore } from 'pinia'
import type { Database } from '~/types/database.types'
import { Enum } from '~/utils/enum'
import { uploadAvatarFile, deleteAvatarFile } from '~/utils/storage'

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileRow = Database['public']['Tables']['profiles']['Row']

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

  const profile = ref<ProfileRow | null>(null)
  const loading = ref(false)
  const profileLoading = ref(false)
  const storeError = ref<string | null>(null)

  // ─── Getters ─────────────────────────────────────────────────────────────

  const user = computed(() => supabaseUser.value ?? null)
  const currentUserId = computed(() => user.value?.id || (user.value as any)?.sub)
  const isAuthenticated = computed(() => !!user.value)

  /**
   * Urutan avatar: profiles.avatar_url → user_metadata.avatar_url → placeholder
   * user_metadata hanya sebagai fallback OAuth (Google/GitHub) bukan sumber utama
   */
  const avatarUrl = computed(() => {
    if (profile.value?.avatar_url) return profile.value.avatar_url
    if (user.value?.user_metadata?.avatar_url) {
      return user.value.user_metadata.avatar_url as string
    }
    return '/placeholder/user.webp'
  })

  /**
   * Representasi lengkap profile — sumber utama: public.profiles
   * user_metadata TIDAK dipakai sebagai fallback untuk field data profil
   * karena DB trigger sudah auto-create row saat user pertama kali login.
   * Satu-satunya fallback ke auth adalah id, email, created_at, updated_at
   * karena field ini memang milik auth.users bukan profiles.
   */
  const profileView = computed<ProfileRow | null>(() => {
    if (!user.value) return null

    const base = profile.value // data dari public.profiles

    return {
      id: currentUserId.value as string,
      email: base?.email ?? user.value.email ?? null,
      full_name: base?.full_name ?? null,
      username: base?.username ?? null,
      avatar_url: base?.avatar_url ?? null,
      role: base?.role ?? 'petani',
      phone: base?.phone ?? null,
      bio: base?.bio ?? null,
      address: base?.address ?? null,
      birth_date: base?.birth_date ?? null,
      website: base?.website ?? null,
      is_admin: base?.is_admin ?? null,
      archived_at: base?.archived_at ?? null,
      deleted_at: base?.deleted_at ?? null,
      created_at: base?.created_at ?? user.value.created_at ?? new Date().toISOString(),
      updated_at: base?.updated_at ?? user.value.updated_at ?? new Date().toISOString(),
    }
  })

  const roleLabel = computed(() => {
    const role = profileView.value?.role ?? 'petani'
    return Enum.UserRole.find((r) => r.value === role)?.label ?? 'Pengguna'
  })

  /**
   * computedProfile — murni dari profileView (yang murni dari public.profiles)
   * Tidak ada satupun akses langsung ke user_metadata di sini.
   * displayName: profiles.full_name → email prefix → 'Petani'
   */
  const computedProfile = computed(() => {
    if (!user.value) return null

    return {
      id: currentUserId.value as string,
      email: profileView.value?.email ?? user.value.email ?? '',
      displayName:
        profileView.value?.full_name ||
        user.value.email?.split('@')[0] ||
        'Petani',
      avatarUrl: avatarUrl.value,
      role: profileView.value?.role ?? 'petani',
      phone: profileView.value?.phone ?? null,
      bio: profileView.value?.bio ?? null,
      location: profileView.value?.address ?? null,
      createdAt: profileView.value?.created_at ?? user.value.created_at,
    }
  })

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Fetch profile dari public.profiles.
   * Karena ada DB trigger auto-create saat user baru dibuat,
   * kondisi "row belum ada" seharusnya tidak terjadi — tapi tetap di-handle
   * sebagai safety net dengan upsert dari auth metadata.
   */
  async function fetchProfile(userId?: string): Promise<void> {
    const targetId = userId ?? currentUserId.value
    if (!targetId) return

    profileLoading.value = true
    storeError.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle()

      if (fetchError) {
        storeError.value = fetchError.message
        console.error('[AuthStore] fetchProfile error:', fetchError.message)
        return
      }

      if (data) {
        profile.value = data as ProfileRow
      } else {
        // Safety net: row belum ada (seharusnya tidak terjadi jika trigger aktif)
        // Buat row minimal agar tidak crash
        const meta = user.value?.user_metadata ?? {}
        const seed: Partial<ProfileRow> = {
          id: targetId,
          email: user.value?.email ?? null,
          full_name: (meta.full_name as string | null) ?? (meta.name as string | null) ?? null,
          avatar_url: (meta.avatar_url as string | null) ?? (meta.picture as string | null) ?? null,
          role: 'petani',
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }

        const { data: upserted, error: upsertError } = await supabase
          .from('profiles')
          .upsert(seed, { onConflict: 'id' })
          .select('*')
          .single()

        if (upsertError) {
          storeError.value = `Gagal membuat profil: ${upsertError.message}`
          console.error('[AuthStore] Auto-upsert profile gagal:', upsertError.message)
        } else {
          profile.value = upserted as ProfileRow
        }
      }
    } catch (err) {
      storeError.value = err instanceof Error ? err.message : 'Gagal memuat data profil'
      console.error('[AuthStore] fetchProfile exception:', err)
    } finally {
      profileLoading.value = false
    }
  }

  async function updateProfile(updates: Partial<ProfileRow>): Promise<AuthResult> {
    if (!user.value) {
      return { success: false, error: 'User tidak terautentikasi' }
    }

    try {
      const payload: Partial<ProfileRow> = {
        ...updates,
        id: currentUserId.value as string,
        email: updates.email ?? user.value.email ?? null,
        updated_at: new Date().toISOString(),
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .single()

      if (updateError) return { success: false, error: updateError.message }

      profile.value = data as ProfileRow
      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Gagal memperbarui profil' }
    }
  }

  async function uploadAvatar(file: File): Promise<AuthResult> {
    if (!user.value) {
      return { success: false, error: 'User tidak terautentikasi' }
    }

    try {
      const oldAvatarUrl = profile.value?.avatar_url ?? null

      const publicUrl = await uploadAvatarFile(currentUserId.value as string, file)

      const { success: updateOk, error: updateErr } = await updateProfile({
        avatar_url: publicUrl,
      })

      if (!updateOk) {
        return { success: false, error: updateErr ?? 'Gagal menyimpan URL avatar ke profil' }
      }

      // Hapus avatar lama secara non-blocking, hanya jika dari bucket kita sendiri
      if (oldAvatarUrl && oldAvatarUrl.includes('/storage/v1/object/public/avatars/')) {
        deleteAvatarFile(oldAvatarUrl).catch((err) =>
          console.warn('[AuthStore] Gagal hapus avatar lama:', err),
        )
      }

      return { success: true, data: { avatar_url: publicUrl } }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Gagal mengupload avatar' }
    }
  }

  async function signIn(email: string, password: string): Promise<AuthResult> {
    loading.value = true
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) return { success: false, error: signInError.message }

      // fetchProfile tidak dipanggil di sini — watch(supabaseUser) handle ini
      // untuk menghindari race condition session belum committed ke browser
      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Login gagal' }
    } finally {
      loading.value = false
    }
  }

  async function signInWithSocialProvider(
    provider: 'google' | 'github',
  ): Promise<AuthResult> {
    loading.value = true
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (oauthError) return { success: false, error: oauthError.message }
      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Social login gagal' }
    } finally {
      loading.value = false
    }
  }

  async function signOut(): Promise<AuthResult> {
    loading.value = true
    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) return { success: false, error: signOutError.message }

      profile.value = null
      storeError.value = null
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Logout gagal' }
    } finally {
      loading.value = false
    }
  }

  async function signUp(
    email: string,
    password: string,
    fullName: string,
  ): Promise<AuthResult> {
    loading.value = true
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (signUpError) return { success: false, error: signUpError.message }
      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Registrasi gagal' }
    } finally {
      loading.value = false
    }
  }

  async function sendPasswordReset(email: string): Promise<AuthResult> {
    loading.value = true
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) return { success: false, error: resetError.message }
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Gagal kirim email reset' }
    } finally {
      loading.value = false
    }
  }

  async function updatePassword(newPassword: string): Promise<AuthResult> {
    loading.value = true
    try {
      const { error: pwError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (pwError) return { success: false, error: pwError.message }
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Gagal update password' }
    } finally {
      loading.value = false
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  // Fetch profile setiap kali supabaseUser berubah (login, restore session, sign-out).
  watch(
    supabaseUser,
    async (newUser) => {
      if (newUser) {
        const uid = newUser.id || (newUser as any).sub
        await fetchProfile(uid)
      } else {
        profile.value = null
        storeError.value = null
      }
    },
    { immediate: true },
  )

  // ─── Expose ───────────────────────────────────────────────────────────────

  return {
    // state
    profile,
    profileView,
    loading,
    profileLoading,
    error: storeError, // expose sebagai 'error' agar API publik store tidak berubah
    user,
    // getters
    isAuthenticated,
    avatarUrl,
    roleLabel,
    computedProfile,
    // actions
    fetchProfile,
    updateProfile,
    uploadAvatar,
    signIn,
    signInWithSocialProvider,
    signOut,
    signUp,
    sendPasswordReset,
    updatePassword,
  }
})