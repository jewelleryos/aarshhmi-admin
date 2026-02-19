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
import { ArrowUpDown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import storefrontFiltersService from "@/redux/services/storefrontFiltersService"
import type { SortByOption } from "@/redux/services/storefrontFiltersService"

interface SortByEditDrawerProps {
  sortByOption: SortByOption | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SortByEditDrawer({
  sortByOption,
  open,
  onOpenChange,
}: SortByEditDrawerProps) {
  // Form state
  const [label, setLabel] = useState("")
  const [rank, setRank] = useState("0")
  const [isActive, setIsActive] = useState(true)

  // Loading state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    label?: string
  }>({})

  // Populate form when drawer opens
  useEffect(() => {
    if (sortByOption && open) {
      setLabel(sortByOption.label)
      setRank(String(sortByOption.rank))
      setIsActive(sortByOption.is_active)
      setErrors({})
    }
  }, [sortByOption, open])

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!sortByOption) return

    // Validate
    const newErrors: typeof errors = {}

    if (!label.trim()) {
      newErrors.label = "Label is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const response = await storefrontFiltersService.updateSortByOption(sortByOption.id, {
        label: label.trim(),
        rank: parseInt(rank) || 0,
        is_active: isActive,
      })

      toast.success(response.message)
      onOpenChange(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to update sort-by option"
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
              <ArrowUpDown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Sort Option</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {sortByOption?.label || "Update sort-by option settings"}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="edit-label">
              Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-label"
              placeholder='e.g., "Price: Low to High"'
              value={label}
              onChange={(e) => {
                setLabel(e.target.value)
                if (errors.label && e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, label: undefined }))
                }
              }}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              This text is displayed to customers on the storefront
            </p>
            {errors.label && (
              <p className="text-sm text-destructive pl-1.25">{errors.label}</p>
            )}
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
              Lower numbers appear first in the sort-by dropdown
            </p>
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-is-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
            />
            <Label htmlFor="edit-is-active" className="cursor-pointer">
              Active
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
