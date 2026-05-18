function getTodayWIB(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default defineNuxtRouteMiddleware(() => {
  // Skip on server-side rendering
  if (import.meta.server) return

  const today = getTodayWIB()
  const visited = useCookie('jt_visited_today')
  const visitedTime = useCookie('jt_visited_time')

  // Check if already visited today and within 1 hour
  if (visited.value === today && visitedTime.value) {
    const timeDiff = Date.now() - parseInt(visitedTime.value as string)
    const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds

    if (timeDiff < oneHour) return
  }

  // ✅ SEO OPTIMIZATION: Defer Supabase call to idle time
  // This prevents blocking first paint and improves Core Web Vitals
  // Googlebot gets instant HTML, analytics run after page is interactive
  const deferredTrack = async () => {
    const supabase = useSupabaseClient()

    try {
      const { error } = await supabase.rpc('increment_visit', {
        visit_date: today,
      })
      visitedTime.value = Date.now().toString()

      if (error) {
        console.error('Failed to increment visit:', error)
        return
      }

      visited.value = today
    } catch (error) {
      console.error('Failed to increment visit:', error)
    }
  }

  // Use requestIdleCallback for better performance
  // Falls back to setTimeout if not supported
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(deferredTrack, { timeout: 2000 })
  } else {
    setTimeout(deferredTrack, 1000)
  }
})
