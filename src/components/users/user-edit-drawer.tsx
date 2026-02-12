"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { UserCog, ChevronDown, Loader2 } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import permissionConfig from "@/configs/permissions-full.json"
import usersService, { type UserData } from "@/redux/services/usersService"
import { toast } from "sonner"

interface UserEditDrawerProps {
  user: UserData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UserEditDrawer({ user, open, onOpenChange, onSuccess }: UserEditDrawerProps) {
  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    permissions?: string
  }>({})

  // Populate form when user data changes
  useEffect(() => {
    if (user && open) {
      setFirstName(user.first_name)
      setLastName(user.last_name)
      setPhone(user.phone || "")
      setSelectedPermissions(user.permissions)
      setErrors({})
    }
  }, [user, open])

  // Reset form
  const resetForm = () => {
    setFirstName("")
    setLastName("")
    setPhone("")
    setSelectedPermissions([])
    setErrors({})
  }

  // Reset form when drawer closes
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all fields at once
    const newErrors: typeof errors = {}

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (selectedPermissions.length === 0) {
      newErrors.permissions = "At least one permission is required"
    }

    // If there are errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (!user) return

    setErrors({})
    setIsLoading(true)

    try {
      const response = await usersService.update(user.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || null,
        permissions: selectedPermissions,
      })

      toast.success(response.message)
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Something went wrong"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Get all permission codes for a module
  const getModulePermissionCodes = (moduleKey: string): number[] => {
    const module = permissionConfig.modules[moduleKey as keyof typeof permissionConfig.modules]
    if (!module) return []
    return Object.values(module.permissions).map((p) => p.code)
  }

  // Check if all permissions in a module are selected
  const isModuleFullySelected = (moduleKey: string): boolean => {
    const codes = getModulePermissionCodes(moduleKey)
    return codes.length > 0 && codes.every((code) => selectedPermissions.includes(code))
  }

  // Check if some (but not all) permissions in a module are selected
  const isModulePartiallySelected = (moduleKey: string): boolean => {
    const codes = getModulePermissionCodes(moduleKey)
    const selectedCount = codes.filter((code) => selectedPermissions.includes(code)).length
    return selectedCount > 0 && selectedCount < codes.length
  }

  // Handle module checkbox toggle
  const handleModuleToggle = (moduleKey: string, checked: boolean) => {
    const codes = getModulePermissionCodes(moduleKey)
    if (checked) {
      // Add all module permissions
      const newPermissions = new Set([...selectedPermissions, ...codes])
      setSelectedPermissions([...newPermissions])
      // Clear permissions error when selecting
      if (errors.permissions) {
        setErrors((prev) => ({ ...prev, permissions: undefined }))
      }
    } else {
      // Remove all module permissions
      setSelectedPermissions(selectedPermissions.filter((p) => !codes.includes(p)))
    }
  }

  // Handle individual permission toggle with dependency logic
  const handlePermissionToggle = (code: number, checked: boolean) => {
    const permissionInfo = permissionConfig.byCode[code.toString() as keyof typeof permissionConfig.byCode]
    let newSelected = [...selectedPermissions]

    if (checked) {
      // Add permission and its requirements
      newSelected.push(code)
      if (permissionInfo?.requires) {
        for (const req of permissionInfo.requires) {
          if (!newSelected.includes(req)) {
            newSelected.push(req)
          }
        }
      }
      // Clear permissions error when selecting
      if (errors.permissions) {
        setErrors((prev) => ({ ...prev, permissions: undefined }))
      }
    } else {
      // Remove permission and all that depend on it
      newSelected = newSelected.filter((p) => p !== code)

      // Find and remove dependents
      for (const [codeStr, info] of Object.entries(permissionConfig.byCode)) {
        const requires = info.requires as number[]
        if (requires.includes(code) && newSelected.includes(parseInt(codeStr))) {
          newSelected = newSelected.filter((p) => p !== parseInt(codeStr))
        }
      }
    }

    setSelectedPermissions(newSelected)
  }

  if (!user) return null

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="sm:max-w-xl flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit User</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update user information and permissions
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editFirstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editFirstName"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  if (errors.firstName && e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, firstName: undefined }))
                  }
                }}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editLastName"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  if (errors.lastName && e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, lastName: undefined }))
                  }
                }}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email Field - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="editEmail">Email</Label>
            <Input
              id="editEmail"
              type="email"
              value={user.email}
              disabled
              className="bg-muted/50"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="editPhone">Phone</Label>
            <Input
              id="editPhone"
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Permissions Section */}
          <div className="space-y-4 pt-2 border-t">
            <div>
              <p className="text-sm text-muted-foreground">
                Select permissions ({selectedPermissions.length} selected)
              </p>
              {errors.permissions && (
                <p className="text-sm text-destructive mt-1">{errors.permissions}</p>
              )}
            </div>

            {/* Permission Modules */}
            <div className="space-y-2">
              {Object.entries(permissionConfig.modules).map(([moduleKey, module]) => {
                const isFullySelected = isModuleFullySelected(moduleKey)
                const isPartiallySelected = isModulePartiallySelected(moduleKey)
                const modulePermissionCount = getModulePermissionCodes(moduleKey).length
                const selectedInModule = getModulePermissionCodes(moduleKey).filter(
                  (code) => selectedPermissions.includes(code)
                ).length

                return (
                  <Collapsible key={moduleKey} className="rounded-md border">
                    <div className="flex items-center gap-3 p-3">
                      <Checkbox
                        id={`edit-module-${moduleKey}`}
                        checked={isFullySelected}
                        data-state={isPartiallySelected ? "indeterminate" : undefined}
                        onCheckedChange={(checked) =>
                          handleModuleToggle(moduleKey, !!checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <CollapsibleTrigger className="flex flex-1 items-center justify-between">
                        <span className="font-medium text-sm">{module.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {selectedInModule}/{modulePermissionCount}
                          </span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                        </div>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                        {Object.entries(module.permissions).map(([, permission]) => (
                          <div
                            key={permission.code}
                            className="flex items-center space-x-2 rounded-md border p-3"
                          >
                            <Checkbox
                              id={`edit-perm-${permission.code}`}
                              checked={selectedPermissions.includes(permission.code)}
                              onCheckedChange={(checked) =>
                                handlePermissionToggle(permission.code, !!checked)
                              }
                            />
                            <Label
                              htmlFor={`edit-perm-${permission.code}`}
                              className="text-sm cursor-pointer"
                            >
                              {permission.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update User"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
