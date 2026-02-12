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
import { List, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { updateSizeChartValue } from "@/redux/slices/sizeChartValueSlice"
import { toast } from "sonner"
import type { SizeChartValue } from "@/redux/services/sizeChartValueService"

interface SizeChartValueEditDrawerProps {
  value: SizeChartValue | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SizeChartValueEditDrawer({
  value,
  open,
  onOpenChange,
}: SizeChartValueEditDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [difference, setDifference] = useState("")

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    difference?: string
  }>({})

  // Populate form when drawer opens with value data
  useEffect(() => {
    if (value && open) {
      setName(value.name)
      setDescription(value.description || "")
      setDifference(value.difference.toString())
      setErrors({})
    }
  }, [value, open])

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!value) return

    // Validate
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }
    if (difference === "" || isNaN(parseFloat(difference))) {
      newErrors.difference = "Difference is required and must be a number"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await dispatch(
        updateSizeChartValue({
          id: value.id,
          data: {
            name: name.trim(),
            description: description.trim() || null,
            difference: parseFloat(difference),
          },
        })
      ).unwrap()

      toast.success("Size chart value updated successfully")
      onOpenChange(false)
    } catch (err) {
      toast.error(err as string)
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
              <List className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Size Chart Value</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update size chart value details
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Size Chart Group (Disabled) */}
          <div className="space-y-2">
            <Label>Size Chart Group</Label>
            <Input
              value={value?.size_chart_group_name || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Group cannot be changed after creation
            </p>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="Enter size value (e.g., 14, 2.4)"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name && e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, name: undefined }))
                }
              }}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-destructive pl-[5px]">{errors.name}</p>
            )}
          </div>

          {/* Description Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Difference Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-difference">
              Difference <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-difference"
              type="number"
              step="0.0001"
              placeholder="e.g., 0, 0.07, -0.07"
              value={difference}
              onChange={(e) => {
                setDifference(e.target.value)
                if (errors.difference && e.target.value !== "") {
                  setErrors((prev) => ({ ...prev, difference: undefined }))
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Enter adjustment value (can be negative)
            </p>
            {errors.difference && (
              <p className="text-sm text-destructive pl-[5px]">
                {errors.difference}
              </p>
            )}
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
              "Update Size Chart Value"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
