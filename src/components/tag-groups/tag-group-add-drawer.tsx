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
import { Checkbox } from "@/components/ui/checkbox"
import { Tags, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { createTagGroup } from "@/redux/slices/tagGroupSlice"
import { MediaPickerInput } from "@/components/media"
import { toast } from "sonner"

// Get filename without extension from path
function getFilenameWithoutExtension(path: string): string {
  const segments = path.split("/")
  const filename = segments[segments.length - 1] || ""
  const dotIndex = filename.lastIndexOf(".")
  return dotIndex > 0 ? filename.slice(0, dotIndex) : filename
}

interface TagGroupAddDrawerProps {
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

export function TagGroupAddDrawer({ open, onOpenChange }: TagGroupAddDrawerProps) {
  const dispatch = useAppDispatch()

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [mediaAltText, setMediaAltText] = useState("")
  const [isFilterable, setIsFilterable] = useState(true)
  const [filterDisplayName, setFilterDisplayName] = useState("")
  const [rank, setRank] = useState(0)

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
    setMediaUrl("")
    setMediaAltText("")
    setIsFilterable(true)
    setFilterDisplayName("")
    setRank(0)
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
        createTagGroup({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          media_url: mediaUrl.trim() || null,
          media_alt_text: mediaAltText.trim() || null,
          is_filterable: isFilterable,
          filter_display_name: filterDisplayName.trim() || null,
          rank: rank,
          status: true,
        })
      ).unwrap()

      toast.success("Tag group created successfully")
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
              <Tags className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Add Tag Group</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Create a new tag group for organizing product tags
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
              placeholder="Enter tag group name"
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
              placeholder="Enter description (optional, supports HTML)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Media Field */}
          <MediaPickerInput
            label="Media"
            value={mediaUrl || null}
            onChange={(path) => {
              setMediaUrl(path || "")
              // Auto-fill alt text from filename if empty
              if (!mediaAltText && path) {
                setMediaAltText(getFilenameWithoutExtension(path))
              }
            }}
            rootPath="/tags"
            accept={["png", "jpg", "jpeg", "avif", "webp", "gif", "mp4"]}
          />

          {/* Media Alt Text Field */}
          <div className="space-y-2">
            <Label htmlFor="mediaAltText">Media Alt Text</Label>
            <Input
              id="mediaAltText"
              placeholder="Enter media alt text (optional)"
              value={mediaAltText}
              onChange={(e) => setMediaAltText(e.target.value)}
            />
          </div>

          {/* Filterable Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFilterable"
              checked={isFilterable}
              onCheckedChange={(checked) => setIsFilterable(checked === true)}
            />
            <Label htmlFor="isFilterable" className="cursor-pointer">
              Show in frontend filters
            </Label>
          </div>

          {/* Filter Display Name Field */}
          <div className="space-y-2">
            <Label htmlFor="filterDisplayName">Filter Display Name</Label>
            <Input
              id="filterDisplayName"
              placeholder="Custom name for frontend filter (optional)"
              value={filterDisplayName}
              onChange={(e) => setFilterDisplayName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the tag group name in filters
            </p>
          </div>

          {/* Rank Field */}
          <div className="space-y-2">
            <Label htmlFor="rank">Display Order</Label>
            <Input
              id="rank"
              type="number"
              min={0}
              placeholder="0"
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first
            </p>
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
              "Create Tag Group"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
