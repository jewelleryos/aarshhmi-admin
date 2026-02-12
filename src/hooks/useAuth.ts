import { useAppSelector } from '@/redux/store'

export function useAuth() {
  const { user, permissions, isAuthenticated, isInitialized, isLoading } = useAppSelector(
    (state) => state.auth
  )

  const hasPermission = (permission: number): boolean => {
    return permissions.includes(permission)
  }

  const hasAnyPermission = (perms: number[]): boolean => {
    return perms.some((p) => permissions.includes(p))
  }

  const hasAllPermissions = (perms: number[]): boolean => {
    return perms.every((p) => permissions.includes(p))
  }

  return {
    user,
    permissions,
    isAuthenticated,
    isInitialized,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
