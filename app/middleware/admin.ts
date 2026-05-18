/**
 * Middleware: admin
 * Redirect ke home jika user bukan admin.
 * Gunakan di halaman admin:
 *   definePageMeta({ middleware: ['auth', 'admin'] })
 */
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  // Tunggu profileView tersedia — jika null, user belum ter-auth (auth middleware handle ini)
  if (!authStore.profileView) return

  if (!authStore.profileView.is_admin) {
    return navigateTo('/')
  }
})
