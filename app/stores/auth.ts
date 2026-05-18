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

  // FIX #1: Rename 'error' → 'storeError' agar tidak di-shadow oleh
  // destructured `{ error }` dari Supabase calls di dalam setiap fungsi.
  const storeError = ref<string | null>(null)

  // ─── Getters ─────────────────────────────────────────────────────────────
  const user = computed(() => supabaseUser.value ?? null)
  const isAuthenticated = computed(() => !!user.value)

  const avatarUrl = computed(() => {
    if (profile.value?.avatar_url) return profile.value.avatar_url
    if (user.value?.user_metadata?.avatar_url) {
      return user.value.user_metadata.avatar_url as string
    }
    return '/placeholder/user.webp'
  })

  const profileView = computed<ProfileRow | null>(() => {
    if (!user.value) return null
    const base = profile.value
    return {
      id: user.value.id,
      email: base?.email ?? user.value.email ?? null,
      full_name:
        base?.full_name ??
        (user.value.user_metadata?.full_name as string | null) ??
        null,
      username:
        base?.username ??
        (user.value.user_metadata?.username as string | null) ??
        null,
      avatar_url:
        base?.avatar_url ??
        (user.value.user_metadata?.avatar_url as string | null) ??
        null,
      role:
        base?.role ??
        (user.value.user_metadata?.role as string | null) ??
        'petani',
      phone: base?.phone ?? null,
      bio: base?.bio ?? null,
      address: base?.address ?? null,
      birth_date: base?.birth_date ?? null,
      website: base?.website ?? null,
      is_admin: base?.is_admin ?? null,
      archived_at: base?.archived_at ?? null,
      deleted_at: base?.deleted_at ?? null,
      created_at:
        base?.created_at ?? user.value.created_at ?? new Date().toISOString(),
      updated_at:
        base?.updated_at ?? user.value.updated_at ?? new Date().toISOString(),
    }
  })

  const roleLabel = computed(() => {
    const role = profileView.value?.role ?? 'petani'
    return Enum.UserRole.find((r) => r.value === role)?.label ?? 'Pengguna'
  })

  const computedProfile = computed(() => {
    if (!user.value) return null
    return {
      id: user.value.id,
      email: profileView.value?.email ?? user.value.email ?? '',
      displayName:
        profileView.value?.full_name ||
        (user.value.user_metadata?.full_name as string) ||
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

  /** Fetch profile dari tabel `profiles` Supabase.
   *  Jika row belum ada (user baru via OAuth), otomatis buat row dari auth metadata.
   */
  async function fetchProfile(userId?: string): Promise<void> {
    const targetId = userId ?? user.value?.id
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
        // Row ditemukan — simpan langsung
        profile.value = data as ProfileRow
      } else {
        // Row belum ada (user baru via OAuth, atau belum ada trigger DB).
        // Buat row minimal dari auth metadata agar profile page langsung berfungsi.
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
          // FIX: Tampilkan error upsert ke UI agar user tahu row gagal dibuat.
          // Sebelumnya error ini hanya console.warn sehingga UI tidak menunjukkan masalah,
          // tapi data yang tampil adalah fallback user_metadata (terlihat "berhasil" padahal tidak).
          storeError.value = `Gagal membuat profil: ${upsertError.message}`
          console.error('[AuthStore] Auto-upsert profile gagal:', upsertError.message)
          // profile.value tetap null — profileView fallback ke user_metadata
        } else {
          profile.value = upserted as ProfileRow
        }
      }
    } catch (err) {
      storeError.value =
        err instanceof Error ? err.message : 'Gagal memuat data profil'
      console.error('[AuthStore] fetchProfile exception:', err)
    } finally {
      profileLoading.value = false
    }
  }

  async function updateProfile(
    updates: Partial<ProfileRow>,
  ): Promise<AuthResult> {
    if (!user.value) {
      return { success: false, error: 'User tidak terautentikasi' }
    }
    try {
      const payload: Partial<ProfileRow> = {
        ...updates,
        id: user.value.id,
        email: updates.email ?? user.value.email ?? null,
        updated_at: new Date().toISOString(),
      }

      // FIX #1 applied: rename destructured 'error' → 'updateError'
      const { data, error: updateError } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .single()

      if (updateError) return { success: false, error: updateError.message }
      profile.value = data as ProfileRow
      return { success: true, data }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message ?? 'Gagal memperbarui profil',
      }
    }
  }

  async function uploadAvatar(file: File): Promise<AuthResult> {
    if (!user.value) {
      return { success: false, error: 'User tidak terautentikasi' }
    }

    try {
      // Simpan URL avatar lama sebelum upload (untuk dihapus setelah sukses)
      const oldAvatarUrl = profile.value?.avatar_url ?? null

      // Delegasikan upload ke storage.ts — naming & path dikelola secara terpusat
      const publicUrl = await uploadAvatarFile(user.value.id, file)

      // FIX: Simpan URL avatar baru ke tabel profiles di database.
      // Sebelumnya uploadAvatar hanya upload ke storage tapi tidak update DB,
      // sehingga avatar_url tidak pernah tersimpan ke profiles.avatar_url.
      const { success: updateOk, error: updateErr } = await updateProfile({
        avatar_url: publicUrl,
      })
      if (!updateOk) {
        return { success: false, error: updateErr ?? 'Gagal menyimpan URL avatar ke profil' }
      }

      // Hapus avatar lama secara non-blocking (gagal tidak mempengaruhi UX).
      // Guard: hanya hapus jika URL lama memang dari bucket avatars kita,
      // bukan URL eksternal OAuth (Google, GitHub, dll.)
      if (oldAvatarUrl && oldAvatarUrl.includes('/storage/v1/object/public/avatars/')) {
        deleteAvatarFile(oldAvatarUrl).catch((err) =>
          console.warn('[AuthStore] Gagal hapus avatar lama:', err),
        )
      }

      return { success: true, data: { avatar_url: publicUrl } }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message ?? 'Gagal mengupload avatar',
      }
    }
  }

  /** Email + Password Sign In */
  async function signIn(email: string, password: string): Promise<AuthResult> {
    loading.value = true
    try {
      // FIX #1 applied: rename destructured 'error' → 'signInError'
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) return { success: false, error: signInError.message }

      // FIX #2: Hapus 'await fetchProfile()' di sini.
      // Memanggil fetchProfile() langsung setelah signInWithPassword() berisiko
      // race condition karena session Supabase belum tentu committed ke browser.
      // watch(supabaseUser) di bawah sudah handle ini secara otomatis dan aman.

      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Login gagal' }
    } finally {
      loading.value = false
    }
  }

  /** OAuth Sign In (Google, dll.) */
  async function signInWithSocialProvider(
    provider: 'google' | 'github',
  ): Promise<AuthResult> {
    loading.value = true
    try {
      // FIX #1 applied: rename destructured 'error' → 'oauthError'
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

  /** Sign Out */
  async function signOut(): Promise<AuthResult> {
    loading.value = true
    try {
      // FIX #1 applied: rename destructured 'error' → 'signOutError'
      // Sebelumnya 'const { error }' men-shadow 'storeError' ref,
      // sehingga 'storeError.value = null' di bawah tidak pernah tercapai
      // dengan benar karena nama 'error' sudah dipakai oleh local const.
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

  /** Register dengan email + password */
  async function signUp(
    email: string,
    password: string,
    fullName: string,
  ): Promise<AuthResult> {
    loading.value = true
    try {
      // FIX #1 applied: rename destructured 'error' → 'signUpError'
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

  /** Kirim email reset password */
  async function sendPasswordReset(email: string): Promise<AuthResult> {
    loading.value = true
    try {
      // FIX #1 applied: rename destructured 'error' → 'resetError'
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
      )

      if (resetError) return { success: false, error: resetError.message }
      return { success: true }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message ?? 'Gagal kirim email reset',
      }
    } finally {
      loading.value = false
    }
  }

  /** Update password baru */
  async function updatePassword(newPassword: string): Promise<AuthResult> {
    loading.value = true
    try {
      // FIX #1 applied: rename destructured 'error' → 'pwError'
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
  // Guard 'if (!profile.value)' dihapus — terlalu agresif dan menyebabkan data
  // stale saat SSR hydration sudah set profile ke nilai non-null sebelumnya.
  watch(
    supabaseUser,
    async (newUser) => {
      if (newUser) {
        await fetchProfile(newUser.id)
      } else {
        profile.value = null
        storeError.value = null
      }
    },
    { immediate: true },
  )

  return {
    // state
    profile,
    profileView,
    loading,
    profileLoading,
    // FIX #1: expose sebagai 'error' agar API publik store tidak berubah,
    // tapi internal ref-nya sudah aman dengan nama 'storeError'
    error: storeError,
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