import { navs as siteNavs } from '@/data/menu'
import type { NavItem, NavMenu } from '~/types/navigation'

export type { NavItem, NavMenu }

/**
 * Composable untuk manage navigation menu
 * Provides centralized navigation data dan helper functions
 */
export const useNavMenu = () => {
  const navs = siteNavs as NavMenu
  const route = useRoute()

  /**
   * Flatten nested nav items untuk search/routing
   */
  const flattenNavItems = (items: NavItem[]): NavItem[] => {
    return items.reduce((acc: NavItem[], item) => {
      if (item.children) {
        return [...acc, ...item.children]
      }
      return [...acc, item]
    }, [])
  }

  /**
   * Get all navigation items (flattened)
   */
  const allNavs = computed(() => [
    ...flattenNavItems(navs.primary),
    ...navs.secondary,
  ])

  /**
   * Current route path
   */
  const currentPath = computed(() => route.path)

  /**
   * Find nav item by path
   */
  const findNavByPath = (path: string): NavItem | undefined => {
    return allNavs.value.find((nav) => nav.to === path)
  }

  /**
   * Check if path is active
   */
  const isPathActive = (path: string): boolean => {
    return (
      currentPath.value === path || currentPath.value.startsWith(`${path}/`)
    )
  }

  return {
    // Data
    navsPrimary: navs.primary,
    navsSecondary: navs.secondary,
    allNavs,
    currentPath,

    // Methods
    flattenNavItems,
    findNavByPath,
    isPathActive,
  }
}
