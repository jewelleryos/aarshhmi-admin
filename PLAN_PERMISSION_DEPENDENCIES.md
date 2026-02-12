# Permission Dependencies Implementation Plan

## Overview

Simple permission dependency handling for user create/update forms only.

- **When selecting a permission**: Auto-select required permissions
- **When deselecting a permission**: Auto-deselect permissions that depend on it

## Implementation Steps

### Step 1: Create Permission Config with Dependencies

**File**: `admin/src/configs/permissions-full.json`

```json
{
  "modules": {
    "user": {
      "id": 1,
      "label": "User Management",
      "permissions": {
        "create": { "code": 101, "label": "Create User", "requires": [102] },
        "read": { "code": 102, "label": "View Users", "requires": [] },
        "update": { "code": 103, "label": "Update User", "requires": [102] },
        "delete": { "code": 104, "label": "Delete User", "requires": [102] },
        "manage_own_permissions": { "code": 105, "label": "Manage Own Permissions", "requires": [] }
      }
    },
    "dashboard": {
      "id": 2,
      "label": "Dashboard",
      "permissions": {
        "read": { "code": 201, "label": "View Dashboard", "requires": [] }
      }
    }
  },
  "byCode": {
    "101": { "module": "user", "action": "create", "label": "Create User", "requires": [102] },
    "102": { "module": "user", "action": "read", "label": "View Users", "requires": [] },
    "103": { "module": "user", "action": "update", "label": "Update User", "requires": [102] },
    "104": { "module": "user", "action": "delete", "label": "Delete User", "requires": [102] },
    "105": { "module": "user", "action": "manage_own_permissions", "label": "Manage Own Permissions", "requires": [] },
    "201": { "module": "dashboard", "action": "read", "label": "View Dashboard", "requires": [] }
  }
}
```

### Step 2: Create Permission Selector Component

**File**: `admin/src/components/users/permission-selector.tsx`

Simple component with useState - dependency logic inline:

```tsx
"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import permissionConfig from "@/configs/permissions-full.json"

interface PermissionSelectorProps {
  value: number[]
  onChange: (permissions: number[]) => void
}

export function PermissionSelector({ value, onChange }: PermissionSelectorProps) {
  const [selected, setSelected] = useState<number[]>(value)

  // Sync with parent value
  useEffect(() => {
    setSelected(value)
  }, [value])

  const handleToggle = (code: number, checked: boolean) => {
    let newSelected = [...selected]
    const permissionInfo = permissionConfig.byCode[code.toString()]

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
    } else {
      // Remove permission and all that depend on it
      newSelected = newSelected.filter(p => p !== code)

      // Find and remove dependents
      for (const [codeStr, info] of Object.entries(permissionConfig.byCode)) {
        if (info.requires.includes(code) && newSelected.includes(parseInt(codeStr))) {
          newSelected = newSelected.filter(p => p !== parseInt(codeStr))
        }
      }
    }

    setSelected(newSelected)
    onChange(newSelected)
  }

  return (
    <div className="space-y-6">
      {Object.entries(permissionConfig.modules).map(([moduleKey, module]) => (
        <div key={moduleKey} className="space-y-3">
          <h4 className="font-medium text-sm">{module.label}</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(module.permissions).map(([, permission]) => (
              <div key={permission.code} className="flex items-center space-x-2">
                <Checkbox
                  id={`perm-${permission.code}`}
                  checked={selected.includes(permission.code)}
                  onCheckedChange={(checked) => handleToggle(permission.code, !!checked)}
                />
                <Label htmlFor={`perm-${permission.code}`} className="text-sm cursor-pointer">
                  {permission.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Files to Create

| File | Action |
|------|--------|
| `admin/src/configs/permissions-full.json` | **Create** |
| `admin/src/components/users/permission-selector.tsx` | **Create** |

## Usage in Create/Update User Form

```tsx
const [permissions, setPermissions] = useState<number[]>([])

<PermissionSelector
  value={permissions}
  onChange={setPermissions}
/>
```
