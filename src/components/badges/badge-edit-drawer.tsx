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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Award, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { updateBadge } from "@/redux/slices/badgeSlice"
import { toast } from "sonner"
import type { Badge } from "@/redux/services/badgeService"

// Position options
const POSITION_OPTIONS = [
  { value: "1", label: "Top Left" },
  { value: "2", label: "Top Center" },
  { value: "3", label: "Top Right" },
  { value: "4", label: "Bottom Left" },
  { value: "5", label: "Bottom Center" },
  { value: "6", label: "Bottom Right" },
]

interface BadgeEditDrawerProps {
  badge: Badge | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BadgeEditDrawer({
  badge,
  open,
  onOpenChange,
}: BadgeEditDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [bgColor, setBgColor] = useState("")
  const [fontColor, setFontColor] = useState("")
  const [position, setPosition] = useState<string>("")

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    slug?: string
    bg_color?: string
    font_color?: string
    position?: string
  }>({})

  // Populate form when drawer opens with badge data
  useEffect(() => {
    if (badge && open) {
      setName(badge.name)
      setSlug(badge.slug)
      setBgColor(badge.bg_color)
      setFontColor(badge.font_color)
      setPosition(badge.position.toString())
      setErrors({})
    }
  }, [badge, open])

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  // Handle name change
  const handleNameChange = (value: string) => {
    setName(value)
    if (errors.name && value.trim()) {
      setErrors((prev) => ({ ...prev, name: undefined }))
    }
  }

  // Handle slug change
  const handleSlugChange = (value: string) => {
    setSlug(value.toLowerCase().replace(/\s+/g, "-"))
    if (errors.slug && value.trim()) {
      setErrors((prev) => ({ ...prev, slug: undefined }))
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!badge) return

    // Validate
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!slug.trim()) {
      newErrors.slug = "Slug is required"
    }
    if (!bgColor.trim()) {
      newErrors.bg_color = "Background color is required"
    }
    if (!fontColor.trim()) {
      newErrors.font_color = "Font color is required"
    }
    if (!position) {
      newErrors.position = "Position is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await dispatch(
        updateBadge({
          id: badge.id,
          data: {
            name: name.trim(),
            slug: slug.trim(),
            bg_color: bgColor.trim(),
            font_color: fontColor.trim(),
            position: parseInt(position),
          },
        })
      ).unwrap()

      toast.success("Badge updated successfully")
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
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Badge</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update badge details
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
              placeholder="Enter badge name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-destructive pl-[5px]">{errors.name}</p>
            )}
          </div>

          {/* Slug Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-slug"
              placeholder="Enter slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              maxLength={100}
            />
            {errors.slug && (
              <p className="text-sm text-destructive pl-[5px]">{errors.slug}</p>
            )}
          </div>

          {/* Background Color Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-bgColor">
              Background Color <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-bgColor"
              placeholder="e.g., #FF0000, red, rgb(255,0,0)"
              value={bgColor}
              onChange={(e) => {
                setBgColor(e.target.value)
                if (errors.bg_color && e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, bg_color: undefined }))
                }
              }}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Enter color as hex (#FF0000), name (red), or rgb/rgba
            </p>
            {errors.bg_color && (
              <p className="text-sm text-destructive pl-[5px]">{errors.bg_color}</p>
            )}
          </div>

          {/* Font Color Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-fontColor">
              Font Color <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-fontColor"
              placeholder="e.g., #FFFFFF, white, rgb(255,255,255)"
              value={fontColor}
              onChange={(e) => {
                setFontColor(e.target.value)
                if (errors.font_color && e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, font_color: undefined }))
                }
              }}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Enter color as hex (#FFFFFF), name (white), or rgb/rgba
            </p>
            {errors.font_color && (
              <p className="text-sm text-destructive pl-[5px]">{errors.font_color}</p>
            )}
          </div>

          {/* Position Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-position">
              Position <span className="text-destructive">*</span>
            </Label>
            <Select
              value={position}
              onValueChange={(value) => {
                setPosition(value)
                if (errors.position) {
                  setErrors((prev) => ({ ...prev, position: undefined }))
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {POSITION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Position where the badge will appear on product images
            </p>
            {errors.position && (
              <p className="text-sm text-destructive pl-[5px]">{errors.position}</p>
            )}
          </div>

          {/* Live Preview */}
          {name && bgColor && fontColor && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-4 border rounded-lg bg-muted/30">
                <div
                  className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium"
                  style={{ backgroundColor: bgColor, color: fontColor }}
                >
                  {name}
                </div>
              </div>
            </div>
          )}
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
              "Update Badge"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
