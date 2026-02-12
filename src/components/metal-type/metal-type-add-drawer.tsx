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
import { Textarea } from "@/components/ui/textarea"
import { Layers, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { createMetalType } from "@/redux/slices/metalTypeSlice"
import { MediaPickerInput } from "@/components/media"
import { toast } from "sonner"

// Get filename without extension from path
function getFilenameWithoutExtension(path: string): string {
  const segments = path.split("/")
  const filename = segments[segments.length - 1] || ""
  const dotIndex = filename.lastIndexOf(".")
  return dotIndex > 0 ? filename.slice(0, dotIndex) : filename
}

interface MetalTypeAddDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function MetalTypeAddDrawer({ open, onOpenChange }: MetalTypeAddDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAltText, setImageAltText] = useState("")

  // Track if slug was manually edited
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    slug?: string
  }>({})

  // Reset form
  const resetForm = () => {
    setName("")
    setSlug("")
    setDescription("")
    setImageUrl("")
    setImageAltText("")
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await dispatch(
        createMetalType({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
          image_alt_text: imageAltText.trim() || null,
          status: true,
        })
      ).unwrap()

      toast.success("Metal type created successfully")
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
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Add Metal Type</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Create a new metal type for jewellery products
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
              placeholder="Enter metal type name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-destructive pl-[5px]">{errors.name}</p>
            )}
          </div>

          {/* Slug Field */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-muted-foreground font-normal">(auto-generated)</span> <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
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
            rootPath="/masters/metals"
            accept={["png", "jpg", "jpeg", "avif", "webp", "gif"]}
          />

          {/* Image Alt Text Field */}
          <div className="space-y-2">
            <Label htmlFor="imageAltText">Image Alt Text</Label>
            <Input
              id="imageAltText"
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
                Creating...
              </>
            ) : (
              "Create Metal Type"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
