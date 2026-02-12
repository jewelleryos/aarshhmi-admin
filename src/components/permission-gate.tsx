"use client"

import { usePermissions } from "@/hooks/usePermissions"

interface PermissionGateProps {
  permissions: number[]
  mode?: "any" | "all"
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({
  permissions,
  mode = "any",
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasAny, hasAll } = usePermissions()

  const hasAccess = mode === "any" ? hasAny(permissions) : hasAll(permissions)

  if (!hasAccess) {
    return fallback
  }

  return children
}
