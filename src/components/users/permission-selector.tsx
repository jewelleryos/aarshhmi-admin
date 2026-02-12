"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import permissionConfig from "@/configs/permissions-full.json"

interface ByCodeInfo {
  module: string
  action: string
  label: string
  requires: number[]
}

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
    const permissionInfo = permissionConfig.byCode[code.toString() as keyof typeof permissionConfig.byCode]

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
      for (const [codeStr, info] of Object.entries(permissionConfig.byCode) as [string, ByCodeInfo][]) {
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
