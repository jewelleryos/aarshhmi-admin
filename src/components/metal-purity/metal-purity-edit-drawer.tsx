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
import { Gem, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { updateMetalPurity } from "@/redux/slices/metalPuritySlice"
import { MediaPickerInput } from "@/components/media"
import { toast } from "sonner"
import { fromSmallestUnit } from "@/utils/currency"
import type { MetalPurity } from "@/redux/services/metalPurityService"

// Get filename without extension from path
function getFilenameWithoutExtension(path: string): string {
  const segments = path.split("/")
  const filename = segments[segments.length - 1] || ""
  const dotIndex = filename.lastIndexOf(".")
  return dotIndex > 0 ? filename.slice(0, dotIndex) : filename
}

interface MetalPurityEditDrawerProps {
  metalPurity: MetalPurity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MetalPurityEditDrawer({ metalPurity, open, onOpenChange }: MetalPurityEditDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAltText, setImageAltText] = useState("")
  const [price, setPrice] = useState("")

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    slug?: string
    price?: string
  }>({})

  // Populate form when drawer opens with metal purity data
  useEffect(() => {
    if (metalPurity && open) {
      setName(metalPurity.name)
      setSlug(metalPurity.slug)
      setDescription(metalPurity.description || "")
      setImageUrl(metalPurity.image_url || "")
      setImageAltText(metalPurity.image_alt_text || "")
      // Convert price from smallest unit to display value
      setPrice(fromSmallestUnit(metalPurity.price).toString())
      setErrors({})
    }
  }, [metalPurity, open])

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

  // Handle price change - allow only valid decimal numbers
  const handlePriceChange = (value: string) => {
    // Allow empty, digits, and one decimal point
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setPrice(value)
      if (errors.price && value) {
        setErrors((prev) => ({ ...prev, price: undefined }))
      }
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!metalPurity) return

    // Validate
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!slug.trim()) {
      newErrors.slug = "Slug is required"
    }
    if (!price || parseFloat(price) <= 0) {
      newErrors.price = "Price must be a positive number"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await dispatch(
        updateMetalPurity({
          id: metalPurity.id,
          data: {
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            image_url: imageUrl.trim() || null,
            image_alt_text: imageAltText.trim() || null,
            price: parseFloat(price),
          },
        })
      ).unwrap()

      toast.success("Metal purity updated successfully")
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
              <Gem className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Metal Purity</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update metal purity details
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
              value={metalPurity?.metal_type_name || ""}
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
              placeholder="Enter metal purity name"
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

          {/* Price Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-price">
              Price per gram <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-price"
              placeholder="Enter price per gram (e.g., 6500.50)"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              inputMode="decimal"
            />
            {errors.price && (
              <p className="text-sm text-destructive pl-[5px]">{errors.price}</p>
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
            rootPath="/masters/metal-purities"
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
              "Update Metal Purity"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
