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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Palette, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { createMetalColor } from "@/redux/slices/metalColorSlice"
import metalTypeService from "@/redux/services/metalTypeService"
import { MediaPickerInput } from "@/components/media"
import { toast } from "sonner"

// Get filename without extension from path
function getFilenameWithoutExtension(path: string): string {
  const segments = path.split("/")
  const filename = segments[segments.length - 1] || ""
  const dotIndex = filename.lastIndexOf(".")
  return dotIndex > 0 ? filename.slice(0, dotIndex) : filename
}

interface MetalColorAddDrawerProps {
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

export function MetalColorAddDrawer({ open, onOpenChange }: MetalColorAddDrawerProps) {
  const dispatch = useAppDispatch()

  // Metal types for dropdown
  const [metalTypes, setMetalTypes] = useState<{ id: string; name: string }[]>([])
  const [isLoadingMetalTypes, setIsLoadingMetalTypes] = useState(false)

  // Form state
  const [selectedMetalType, setSelectedMetalType] = useState("")
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
    metalType?: string
    name?: string
    slug?: string
  }>({})

  // Fetch metal types when drawer opens
  useEffect(() => {
    if (open) {
      setIsLoadingMetalTypes(true)
      metalTypeService
        .getForMetalColor()
        .then((response) => {
          if (response.success) {
            setMetalTypes(response.data)
          }
        })
        .catch((err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          const message = error.response?.data?.message || "Something went wrong"
          toast.error(message)
        })
        .finally(() => setIsLoadingMetalTypes(false))
    }
  }, [open])

  // Reset form
  const resetForm = () => {
    setSelectedMetalType("")
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

  // Handle metal type change
  const handleMetalTypeChange = (value: string) => {
    setSelectedMetalType(value)
    if (errors.metalType && value) {
      setErrors((prev) => ({ ...prev, metalType: undefined }))
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate
    const newErrors: typeof errors = {}

    if (!selectedMetalType) {
      newErrors.metalType = "Metal type is required"
    }
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
        createMetalColor({
          metal_type_id: selectedMetalType,
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
          image_alt_text: imageAltText.trim() || null,
          status: true,
        })
      ).unwrap()

      toast.success("Metal color created successfully")
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
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Add Metal Color</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Create a new metal color for jewellery products
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Metal Type Field */}
          <div className="space-y-2">
            <Label>
              Metal Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedMetalType}
              onValueChange={handleMetalTypeChange}
              disabled={isLoadingMetalTypes}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingMetalTypes ? "Loading..." : "Select metal type"} />
              </SelectTrigger>
              <SelectContent>
                {metalTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.metalType && (
              <p className="text-sm text-destructive pl-[5px]">{errors.metalType}</p>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
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
            rootPath="/masters/metal-colors"
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
              "Create Metal Color"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
