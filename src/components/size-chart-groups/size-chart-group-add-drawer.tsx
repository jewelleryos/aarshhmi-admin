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
import { Label } from "@/components/ui/label"
import { Ruler, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { createSizeChartGroup } from "@/redux/slices/sizeChartGroupSlice"
import { toast } from "sonner"

interface SizeChartGroupAddDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SizeChartGroupAddDrawer({
  open,
  onOpenChange,
}: SizeChartGroupAddDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [name, setName] = useState("")
  const [valueName, setValueName] = useState("")
  const [valueDescription, setValueDescription] = useState("")
  const [valueDifference, setValueDifference] = useState("")

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    value_name?: string
    value_difference?: string
  }>({})

  // Reset form
  const resetForm = () => {
    setName("")
    setValueName("")
    setValueDescription("")
    setValueDifference("")
    setErrors({})
  }

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = "Group name is required"
    }
    if (!valueName.trim()) {
      newErrors.value_name = "Value name is required"
    }
    if (valueDifference === "" || isNaN(parseFloat(valueDifference))) {
      newErrors.value_difference = "Difference is required and must be a number"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await dispatch(
        createSizeChartGroup({
          name: name.trim(),
          value_name: valueName.trim(),
          value_description: valueDescription.trim() || null,
          value_difference: parseFloat(valueDifference),
        })
      ).unwrap()

      toast.success("Size chart group created successfully")
      resetForm()
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
              <Ruler className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Add Size Chart Group</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Create a new size chart group with first value
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Group Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Group Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter group name (e.g., Ring Size)"
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

          {/* Divider - First Size Value Section */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-4">First Size Value (Default)</h4>

            {/* Value Name Field */}
            <div className="space-y-2">
              <Label htmlFor="value_name">
                Value Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="value_name"
                placeholder="Enter size value (e.g., 14, 2.4)"
                value={valueName}
                onChange={(e) => {
                  setValueName(e.target.value)
                  if (errors.value_name && e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, value_name: undefined }))
                  }
                }}
                maxLength={100}
              />
              {errors.value_name && (
                <p className="text-sm text-destructive pl-[5px]">{errors.value_name}</p>
              )}
            </div>

            {/* Description Field (Optional) */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="value_description">Description</Label>
              <Input
                id="value_description"
                placeholder="Enter description (optional)"
                value={valueDescription}
                onChange={(e) => setValueDescription(e.target.value)}
                maxLength={255}
              />
            </div>

            {/* Difference Field */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="value_difference">
                Difference <span className="text-destructive">*</span>
              </Label>
              <Input
                id="value_difference"
                type="number"
                step="0.0001"
                placeholder="e.g., 0, 0.07, -0.07"
                value={valueDifference}
                onChange={(e) => {
                  setValueDifference(e.target.value)
                  if (errors.value_difference && e.target.value !== "") {
                    setErrors((prev) => ({ ...prev, value_difference: undefined }))
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Enter adjustment value (can be negative)
              </p>
              {errors.value_difference && (
                <p className="text-sm text-destructive pl-[5px]">{errors.value_difference}</p>
              )}
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
              "Create Size Chart Group"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
