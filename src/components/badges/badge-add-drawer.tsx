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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Award, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { createBadge } from "@/redux/slices/badgeSlice"
import { toast } from "sonner"

// Position options
const POSITION_OPTIONS = [
  { value: "1", label: "Top Left" },
  { value: "2", label: "Top Center" },
  { value: "3", label: "Top Right" },
  { value: "4", label: "Bottom Left" },
  { value: "5", label: "Bottom Center" },
  { value: "6", label: "Bottom Right" },
]

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

interface BadgeAddDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BadgeAddDrawer({
  open,
  onOpenChange,
}: BadgeAddDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [bgColor, setBgColor] = useState("")
  const [fontColor, setFontColor] = useState("")
  const [position, setPosition] = useState<string>("")

  // Track if slug was manually edited
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    slug?: string
    bg_color?: string
    font_color?: string
    position?: string
  }>({})

  // Reset form
  const resetForm = () => {
    setName("")
    setSlug("")
    setBgColor("")
    setFontColor("")
    setPosition("")
    setSlugManuallyEdited(false)
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

  // Handle name change - auto generate slug if not manually edited
  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value))
    }
    if (errors.name && value.trim()) {
      setErrors((prev) => ({ ...prev, name: undefined }))
    }
  }

  // Handle slug change
  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setSlug(value.toLowerCase().replace(/\s+/g, "-"))
    if (errors.slug && value.trim()) {
      setErrors((prev) => ({ ...prev, slug: undefined }))
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
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
        createBadge({
          name: name.trim(),
          slug: slug.trim(),
          bg_color: bgColor.trim(),
          font_color: fontColor.trim(),
          position: parseInt(position),
        })
      ).unwrap()

      toast.success("Badge created successfully")
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
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Add Badge</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Create a new product badge
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
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
            <Label htmlFor="slug">
              Slug{" "}
              <span className="text-muted-foreground font-normal">
                (auto-generated)
              </span>{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
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
            <Label htmlFor="bgColor">
              Background Color <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bgColor"
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
            <Label htmlFor="fontColor">
              Font Color <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fontColor"
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
            <Label htmlFor="position">
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
                Creating...
              </>
            ) : (
              "Create Badge"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
