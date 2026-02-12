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
import { Ruler, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { updateSizeChartGroup } from "@/redux/slices/sizeChartGroupSlice"
import { toast } from "sonner"
import type { SizeChartGroup } from "@/redux/services/sizeChartGroupService"

interface SizeChartGroupEditDrawerProps {
  group: SizeChartGroup | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SizeChartGroupEditDrawer({
  group,
  open,
  onOpenChange,
}: SizeChartGroupEditDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [name, setName] = useState("")

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string }>({})

  // Populate form when drawer opens with group data
  useEffect(() => {
    if (group && open) {
      setName(group.name)
      setErrors({})
    }
  }, [group, open])

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!group) return

    // Validate
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await dispatch(
        updateSizeChartGroup({
          id: group.id,
          data: {
            name: name.trim(),
          },
        })
      ).unwrap()

      toast.success("Size chart group updated successfully")
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
              <SheetTitle>Edit Size Chart Group</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update size chart group details
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="Enter group name"
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
              "Update Size Chart Group"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
