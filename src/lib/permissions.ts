import type { NavigationItem, NavDropdown, NavMaster, NavGroup } from "@/configs"

/**
 * Check if user has ANY of the required permissions
 */
export function hasAnyPermission(
  userPermissions: number[],
  requiredPermissions?: number[]
): boolean {
  // If no permissions required, always show
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true
  }

  // Check if user has ANY of the required permissions
  return requiredPermissions.some((perm) => userPermissions.includes(perm))
}

/**
 * Check if user has ALL of the required permissions
 */
export function hasAllPermissions(
  userPermissions: number[],
  requiredPermissions?: number[]
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true
  }

  return requiredPermissions.every((perm) => userPermissions.includes(perm))
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigation(
  items: NavigationItem[],
  userPermissions: number[]
): NavigationItem[] {
  return items
    .map((item) => {
      // For groups, recursively filter children
      if (item.type === "group") {
        const filteredChildren = filterNavigation(item.children, userPermissions) as NavGroup["children"]
        if (filteredChildren.length === 0) return null
        return {
          ...item,
          children: filteredChildren,
        }
      }

      // Check permission for non-group items
      if (!hasAnyPermission(userPermissions, item.permissions)) {
        return null
      }

      // For dropdown/master, also filter children
      if (item.type === "dropdown" || item.type === "master") {
        const filteredChildren = item.children.filter((child) =>
          hasAnyPermission(userPermissions, child.permissions)
        )
        if (filteredChildren.length === 0) return null
        return {
          ...item,
          children: filteredChildren,
        }
      }

      return item
    })
    .filter((item): item is NavigationItem => item !== null)
}

/**
 * Get the first accessible child href for a master/dropdown item
 * Used for redirecting master pages to first available module
 */
export function getFirstAccessibleHref(
  item: NavDropdown | NavMaster,
  userPermissions: number[]
): string | null {
  const accessibleChild = item.children.find((child) =>
    hasAnyPermission(userPermissions, child.permissions)
  )
  return accessibleChild?.href ?? null
}

/**
 * Get resolved href for navigation item
 * - For "item" type: returns href directly
 * - For "master" type: returns first accessible child href
 * - For "dropdown" type: returns null (dropdowns don't navigate)
 */
export function getResolvedHref(
  item: NavigationItem,
  userPermissions: number[]
): string | null {
  if (item.type === "item") {
    return item.href
  }

  if (item.type === "master") {
    return getFirstAccessibleHref(item, userPermissions)
  }

  // Dropdowns don't have a direct href
  return null
}
