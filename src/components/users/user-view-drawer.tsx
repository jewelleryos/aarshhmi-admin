"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Clock, Calendar, Shield } from "lucide-react"
import type { UserData } from "@/redux/services/usersService"

// Permission code to label mapping
const PERMISSION_LABELS: Record<number, { label: string; category: string }> = {
  101: { label: "Create Users", category: "User Management" },
  102: { label: "View Users", category: "User Management" },
  103: { label: "Update Users", category: "User Management" },
  104: { label: "Delete Users", category: "User Management" },
  105: { label: "Manage Own Permissions", category: "User Management" },
  201: { label: "View Dashboard", category: "Dashboard" },
}

interface UserViewDrawerProps {
  user: UserData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Format date for display
function formatDate(dateString: string | null): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }) + " at " + new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// Group permissions by category
function groupPermissions(permissions: number[]) {
  const grouped: Record<string, { code: number; label: string }[]> = {}

  permissions.forEach((code) => {
    const permission = PERMISSION_LABELS[code]
    if (permission) {
      if (!grouped[permission.category]) {
        grouped[permission.category] = []
      }
      grouped[permission.category].push({ code, label: permission.label })
    }
  })

  return grouped
}

export function UserViewDrawer({ user, open, onOpenChange }: UserViewDrawerProps) {
  if (!user) return null

  const groupedPermissions = groupPermissions(user.permissions)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto p-6">
        {/* Header */}
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="text-xl">
            {user.first_name} {user.last_name}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">Administrator</p>
          <Badge
            variant="outline"
            className={
              user.is_active
                ? "mt-2 w-fit bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "mt-2 w-fit bg-gray-500/20 text-gray-400 border-gray-500/30"
            }
          >
            {user.is_active ? "Active" : "Inactive"}
          </Badge>
        </SheetHeader>

        {/* Contact Information */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Contact Information
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-muted/50 rounded-md p-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 bg-muted/50 rounded-md p-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.phone || "Not provided"}</span>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Activity
            </span>
          </div>
          <div className="space-y-2">
            <div className="bg-muted/50 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Last Login</span>
              </div>
              <p className="text-sm font-medium">{formatDate(user.last_login_at)}</p>
            </div>
            <div className="bg-muted/50 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Account Created</span>
              </div>
              <p className="text-sm font-medium">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Permissions ({user.permissions.length})
            </span>
          </div>

          {Object.keys(groupedPermissions).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category}>
                  <p className="text-xs text-muted-foreground mb-2">
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((perm) => (
                      <Badge
                        key={perm.code}
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {perm.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No permissions assigned</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
