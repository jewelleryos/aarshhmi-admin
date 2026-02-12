import { useAppSelector } from "@/redux/store"
import { hasAnyPermission, hasAllPermissions } from "@/lib/permissions"

export function usePermissions() {
  const { permissions } = useAppSelector((state) => state.auth)

  return {
    permissions,
    hasAny: (required: number[]) => hasAnyPermission(permissions, required),
    hasAll: (required: number[]) => hasAllPermissions(permissions, required),
    has: (permission: number) => permissions.includes(permission),
  }
}
