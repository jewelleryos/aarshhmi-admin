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
import { Textarea } from "@/components/ui/textarea"
import { Palette, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { updateMetalColor } from "@/redux/slices/metalColorSlice"
import { MediaPickerInput } from "@/components/media"
import { toast } from "sonner"
import type { MetalColor } from "@/redux/services/metalColorService"

// Get filename without extension from path
function getFilenameWithoutExtension(path: string): string {
  const segments = path.split("/")
  const filename = segments[segments.length - 1] || ""
  const dotIndex = filename.lastIndexOf(".")
  return dotIndex > 0 ? filename.slice(0, dotIndex) : filename
}

interface MetalColorEditDrawerProps {
  metalColor: MetalColor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MetalColorEditDrawer({ metalColor, open, onOpenChange }: MetalColorEditDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAltText, setImageAltText] = useState("")

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    slug?: string
  }>({})

  // Populate form when drawer opens with metal color data
  useEffect(() => {
    if (metalColor && open) {
      setName(metalColor.name)
      setSlug(metalColor.slug)
      setDescription(metalColor.description || "")
      setImageUrl(metalColor.image_url || "")
      setImageAltText(metalColor.image_alt_text || "")
      setErrors({})
    }
  }, [metalColor, open])

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
    if (!metalColor) return

    // Validate
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!slug.trim()) {
      newErrors.slug = "Slug is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await dispatch(
        updateMetalColor({
          id: metalColor.id,
          data: {
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            image_url: imageUrl.trim() || null,
            image_alt_text: imageAltText.trim() || null,
          },
        })
      ).unwrap()

      toast.success("Metal color updated successfully")
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
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Metal Color</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update metal color details
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Metal Type Field - Disabled */}
          <div className="space-y-2">
            <Label>Metal Type</Label>
            <Input
              value={metalColor?.metal_type_name || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Metal type cannot be changed after creation
            </p>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="Enter metal color name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
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
            />
            {errors.slug && (
              <p className="text-sm text-destructive pl-[5px]">{errors.slug}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Image Field */}
          <MediaPickerInput
            label="Image"
            value={imageUrl || null}
            onChange={(path) => {
              setImageUrl(path || "")
              // Auto-fill alt text from filename if empty
              if (!imageAltText && path) {
                setImageAltText(getFilenameWithoutExtension(path))
              }
            }}
            rootPath="/masters/metal-colors"
            accept={["png", "jpg", "jpeg", "avif", "webp", "gif"]}
          />

          {/* Image Alt Text Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-imageAltText">Image Alt Text</Label>
            <Input
              id="edit-imageAltText"
              placeholder="Enter image alt text (optional)"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
            />
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
              "Update Metal Color"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
