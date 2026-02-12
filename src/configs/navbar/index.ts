import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import permissionsJson from "../permissions.json"
import sidebarJson from "./sidebar.json"
import type {
  SidebarConfigJson,
  NavigationItemJson,
  NavigationItem,
  NavItem,
  NavDropdown,
  NavMaster,
  NavGroup,
} from "./types"

// Permission config type
interface PermissionsConfig {
  [module: string]: {
    [action: string]: number
  }
}

// Export raw permissions config
export const PERMISSIONS = permissionsJson as PermissionsConfig

/**
 * Resolve permission reference string to code
 * e.g., "DASHBOARD.READ" -> 201
 */
export function resolvePermission(ref: string): number | null {
  const [module, action] = ref.split(".")
  return PERMISSIONS[module]?.[action] ?? null
}

/**
 * Resolve array of permission refs to codes
 */
export function resolvePermissions(refs?: string[]): number[] | undefined {
  if (!refs || refs.length === 0) return undefined

  const codes = refs
    .map(resolvePermission)
    .filter((code): code is number => code !== null)

  return codes.length > 0 ? codes : undefined
}

/**
 * Get Lucide icon by name
 */
function getIcon(name?: string): LucideIcon | undefined {
  if (!name) return undefined
  return (LucideIcons as unknown as Record<string, LucideIcon>)[name]
}

/**
 * Resolve navigation item from JSON to typed object
 */
function resolveNavItem(item: NavigationItemJson): NavigationItem {
  // Handle group type first (it has different properties)
  if (item.type === "group") {
    const children = item.children.map((child) => resolveNavItem(child)) as (NavItem | NavDropdown | NavMaster)[]
    return {
      type: "group",
      label: item.label,
      children,
    } as NavGroup
  }

  // Build base for non-group items
  const base = {
    id: item.id,
    label: item.label,
    icon: getIcon(item.icon),
    permissions: resolvePermissions(item.permissions),
  }

  if (item.type === "item") {
    return {
      ...base,
      type: "item",
      href: item.href,
    } as NavItem
  }

  if (item.type === "dropdown") {
    const children = item.children.map((child) => resolveNavItem(child) as NavItem)
    // Auto-compute permissions from children if not specified
    const permissions = base.permissions ?? [
      ...new Set(children.flatMap((c) => c.permissions ?? [])),
    ]
    return {
      ...base,
      type: "dropdown",
      children,
      permissions: permissions.length > 0 ? permissions : undefined,
    } as NavDropdown
  }

  if (item.type === "master") {
    const children = item.children.map((child) => resolveNavItem(child) as NavItem)
    // Auto-compute permissions from children if not specified
    const permissions = base.permissions ?? [
      ...new Set(children.flatMap((c) => c.permissions ?? [])),
    ]
    return {
      ...base,
      type: "master",
      href: item.href,
      children,
      permissions: permissions.length > 0 ? permissions : undefined,
    } as NavMaster
  }

  throw new Error(`Unknown navigation type: ${(item as NavigationItemJson).type}`)
}

// Parse and resolve sidebar config
const sidebarConfigJson = sidebarJson as SidebarConfigJson
export const sidebarConfig: NavigationItem[] = sidebarConfigJson.navigation.map(resolveNavItem)

// Re-export types
export type { NavigationItem, NavItem, NavDropdown, NavMaster, NavGroup } from "./types"
