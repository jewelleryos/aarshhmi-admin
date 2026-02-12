"use client"

import { useState } from "react"
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
import { UserPlus, Eye, EyeOff, ChevronDown, Loader2 } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import permissionConfig from "@/configs/permissions-full.json"
import usersService from "@/redux/services/usersService"
import { toast } from "sonner"

interface UserAddDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UserAddDrawer({ open, onOpenChange, onSuccess }: UserAddDrawerProps) {
  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    permissions?: string
  }>({})

  // Reset form
  const resetForm = () => {
    setFirstName("")
    setLastName("")
    setEmail("")
    setPhone("")
    setPassword("")
    setShowPassword(false)
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
    if (!email.trim()) {
      newErrors.email = "Email is required"
    }
    if (!password.trim()) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    if (selectedPermissions.length === 0) {
      newErrors.permissions = "At least one permission is required"
    }

    // If there are errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const response = await usersService.create({
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
        password,
        permissions: selectedPermissions,
      })

      toast.success(response.message)
      resetForm()
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

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-xl flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Add New User</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Create a new user account with permissions
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
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
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
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

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email && e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, email: undefined }))
                }
              }}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password && e.target.value.length >= 8) {
                    setErrors((prev) => ({ ...prev, password: undefined }))
                  }
                }}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
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
                        id={`module-${moduleKey}`}
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
                              id={`perm-${permission.code}`}
                              checked={selectedPermissions.includes(permission.code)}
                              onCheckedChange={(checked) =>
                                handlePermissionToggle(permission.code, !!checked)
                              }
                            />
                            <Label
                              htmlFor={`perm-${permission.code}`}
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
                Creating...
              </>
            ) : (
              "Create User"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
