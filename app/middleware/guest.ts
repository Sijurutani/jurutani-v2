/**
 * Middleware: guest
 * Redirect ke beranda jika user sudah terautentikasi.
 * Gunakan di halaman auth (login, register, dll.):
 *   definePageMeta({ middleware: ['guest'] })
 */
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()

  if (user.value) {
    return navigateTo('/')
  }
})
