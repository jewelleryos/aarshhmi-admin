"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { List, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { createSizeChartValue } from "@/redux/slices/sizeChartValueSlice"
import { toast } from "sonner"
import type { SizeChartGroupDropdownItem } from "@/redux/services/sizeChartValueService"

interface SizeChartValueAddDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: SizeChartGroupDropdownItem[]
}

export function SizeChartValueAddDrawer({
  open,
  onOpenChange,
  groups,
}: SizeChartValueAddDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [groupId, setGroupId] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [difference, setDifference] = useState("")

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    size_chart_group_id?: string
    name?: string
    difference?: string
  }>({})

  // Reset form
  const resetForm = () => {
    setGroupId("")
    setName("")
    setDescription("")
    setDifference("")
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

    if (!groupId) {
      newErrors.size_chart_group_id = "Size chart group is required"
    }
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
        createSizeChartValue({
          size_chart_group_id: groupId,
          name: name.trim(),
          description: description.trim() || null,
          difference: parseFloat(difference),
        })
      ).unwrap()

      toast.success("Size chart value created successfully")
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
              <List className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Add Size Chart Value</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Create a new size value for a size chart group
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Size Chart Group Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="group">
              Size Chart Group <span className="text-destructive">*</span>
            </Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Select size chart group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.size_chart_group_id && (
              <p className="text-sm text-destructive pl-[5px]">
                {errors.size_chart_group_id}
              </p>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
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
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Difference Field */}
          <div className="space-y-2">
            <Label htmlFor="difference">
              Difference <span className="text-destructive">*</span>
            </Label>
            <Input
              id="difference"
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
                Creating...
              </>
            ) : (
              "Create Size Chart Value"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
