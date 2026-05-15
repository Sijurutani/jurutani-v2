/**
 * Middleware: auth
 * Redirect ke halaman login jika user belum terautentikasi.
 * Gunakan di halaman yang memerlukan login:
 *   definePageMeta({ middleware: ['auth'] })
 */
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }
})
