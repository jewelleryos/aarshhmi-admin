import type { LucideIcon } from "lucide-react"

// Permission string reference (e.g., "DASHBOARD.READ", "USER.CREATE")
export type PermissionRef = string

// Navigation item types
export type NavItemType = "item" | "dropdown" | "master"

// ============================================
// JSON types (raw config from JSON files)
// ============================================

// Base navigation item (from JSON)
interface BaseNavItemJson {
  id: string
  label: string
  icon?: string // Icon name as string
  permissions?: PermissionRef[]
}

// Simple navigation item
export interface NavItemJson extends BaseNavItemJson {
  type: "item"
  href: string
}

// Dropdown navigation item
export interface NavDropdownJson extends BaseNavItemJson {
  type: "dropdown"
  children: NavItemJson[]
}

// Master page navigation item
export interface NavMasterJson extends BaseNavItemJson {
  type: "master"
  href: string
  children: NavItemJson[]
}

// Group navigation item (for organizing items under a label)
export interface NavGroupJson {
  type: "group"
  label: string
  children: (NavItemJson | NavDropdownJson | NavMasterJson)[]
}

export type NavigationItemJson = NavItemJson | NavDropdownJson | NavMasterJson | NavGroupJson

// Sidebar config structure
export interface SidebarConfigJson {
  navigation: NavigationItemJson[]
}

// ============================================
// Resolved types (after processing JSON)
// ============================================

export interface NavItem {
  id: string
  label: string
  icon?: LucideIcon
  type: "item"
  href: string
  permissions?: number[]
}

export interface NavDropdown {
  id: string
  label: string
  icon?: LucideIcon
  type: "dropdown"
  children: NavItem[]
  permissions?: number[]
}

export interface NavMaster {
  id: string
  label: string
  icon?: LucideIcon
  type: "master"
  href: string
  children: NavItem[]
  permissions?: number[]
}

export interface NavGroup {
  type: "group"
  label: string
  children: (NavItem | NavDropdown | NavMaster)[]
}

export type NavigationItem = NavItem | NavDropdown | NavMaster | NavGroup
