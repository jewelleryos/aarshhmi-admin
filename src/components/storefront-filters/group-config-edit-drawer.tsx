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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Layers, Loader2 } from "lucide-react"
import { toast } from "sonner"
import storefrontFiltersService from "@/redux/services/storefrontFiltersService"
import type { StorefrontFilterGroupConfig } from "@/redux/services/storefrontFiltersService"

interface GroupConfigEditDrawerProps {
  groupConfig: StorefrontFilterGroupConfig | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Format type to display label
function formatType(type: string): string {
  switch (type) {
    case "category":
      return "Category"
    case "price_filter":
      return "Price Filter"
    default:
      return type
  }
}

export function GroupConfigEditDrawer({
  groupConfig,
  open,
  onOpenChange,
}: GroupConfigEditDrawerProps) {
  // Form state
  const [displayName, setDisplayName] = useState("")
  const [rank, setRank] = useState("0")
  const [isFilterable, setIsFilterable] = useState(true)

  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Populate form when drawer opens
  useEffect(() => {
    if (groupConfig && open) {
      setDisplayName(groupConfig.display_name || "")
      setRank(String(groupConfig.rank))
      setIsFilterable(groupConfig.is_filterable)
    }
  }, [groupConfig, open])

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!groupConfig) return

    setIsLoading(true)

    try {
      const response = await storefrontFiltersService.updateGroupConfig(groupConfig.id, {
        display_name: displayName.trim() || null,
        rank: parseInt(rank) || 0,
        is_filterable: isFilterable,
      })

      toast.success(response.message)
      onOpenChange(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to update group config"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

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
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Group Config</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {groupConfig ? formatType(groupConfig.type) : "Update group settings"}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-displayName">Display Name</Label>
            <Input
              id="edit-displayName"
              placeholder='e.g., "Shop By Category" or "Price Range"'
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Section header shown on the storefront filter sidebar
            </p>
          </div>

          {/* Rank */}
          <div className="space-y-2">
            <Label htmlFor="edit-rank">Display Order</Label>
            <Input
              id="edit-rank"
              type="number"
              min={0}
              placeholder="0"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Position among all filter groups (shared with tag groups). Lower numbers appear first.
            </p>
          </div>

          {/* Filterable Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-is-filterable"
              checked={isFilterable}
              onCheckedChange={(checked) => setIsFilterable(checked === true)}
            />
            <Label htmlFor="edit-is-filterable" className="cursor-pointer">
              Show in storefront filters
            </Label>
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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
