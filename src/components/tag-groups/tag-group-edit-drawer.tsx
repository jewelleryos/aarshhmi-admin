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
import { Checkbox } from "@/components/ui/checkbox"
import { Tags, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { updateTagGroup } from "@/redux/slices/tagGroupSlice"
import { MediaPickerInput } from "@/components/media"
import { toast } from "sonner"
import type { TagGroup } from "@/redux/services/tagGroupService"

// Get filename without extension from path
function getFilenameWithoutExtension(path: string): string {
  const segments = path.split("/")
  const filename = segments[segments.length - 1] || ""
  const dotIndex = filename.lastIndexOf(".")
  return dotIndex > 0 ? filename.slice(0, dotIndex) : filename
}

interface TagGroupEditDrawerProps {
  tagGroup: TagGroup | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TagGroupEditDrawer({ tagGroup, open, onOpenChange }: TagGroupEditDrawerProps) {
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

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    slug?: string
  }>({})

  // Populate form when drawer opens with tag group data
  useEffect(() => {
    if (tagGroup && open) {
      setName(tagGroup.name)
      setSlug(tagGroup.slug)
      setDescription(tagGroup.description || "")
      setMediaUrl(tagGroup.media_url || "")
      setMediaAltText(tagGroup.media_alt_text || "")
      setIsFilterable(tagGroup.is_filterable)
      setFilterDisplayName(tagGroup.filter_display_name || "")
      setRank(tagGroup.rank)
      setErrors({})
    }
  }, [tagGroup, open])

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
    if (!tagGroup) return

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
        updateTagGroup({
          id: tagGroup.id,
          data: {
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            media_url: mediaUrl.trim() || null,
            media_alt_text: mediaAltText.trim() || null,
            is_filterable: isFilterable,
            filter_display_name: filterDisplayName.trim() || null,
            rank: rank,
          },
        })
      ).unwrap()

      toast.success("Tag group updated successfully")
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
              <SheetTitle>Edit Tag Group</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update tag group details
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
            <Label htmlFor="edit-mediaAltText">Media Alt Text</Label>
            <Input
              id="edit-mediaAltText"
              placeholder="Enter media alt text (optional)"
              value={mediaAltText}
              onChange={(e) => setMediaAltText(e.target.value)}
            />
          </div>

          {/* Filterable Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-isFilterable"
              checked={isFilterable}
              onCheckedChange={(checked) => setIsFilterable(checked === true)}
            />
            <Label htmlFor="edit-isFilterable" className="cursor-pointer">
              Show in frontend filters
            </Label>
          </div>

          {/* Filter Display Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-filterDisplayName">Filter Display Name</Label>
            <Input
              id="edit-filterDisplayName"
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
            <Label htmlFor="edit-rank">Display Order</Label>
            <Input
              id="edit-rank"
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
                Updating...
              </>
            ) : (
              "Update Tag Group"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
