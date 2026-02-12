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
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, Loader2 } from "lucide-react"
import { MediaPickerInput } from "@/components/media"
import type { FilterGroup } from "@/redux/services/storefrontFiltersService"
import type { UpdateFilterGroupData } from "@/redux/services/storefrontFiltersService"

// Get filename without extension from path
function getFilenameWithoutExtension(path: string): string {
  const segments = path.split("/")
  const filename = segments[segments.length - 1] || ""
  const dotIndex = filename.lastIndexOf(".")
  return dotIndex > 0 ? filename.slice(0, dotIndex) : filename
}

interface FilterGroupEditDrawerProps {
  group: FilterGroup | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (data: UpdateFilterGroupData) => Promise<void>
}

export function FilterGroupEditDrawer({
  group,
  open,
  onOpenChange,
  onUpdate,
}: FilterGroupEditDrawerProps) {
  // Form state
  const [displayName, setDisplayName] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [mediaAltText, setMediaAltText] = useState("")
  const [isFilterable, setIsFilterable] = useState(true)
  const [rank, setRank] = useState(0)

  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Populate form when drawer opens
  useEffect(() => {
    if (group && open) {
      setDisplayName(group.display_name || "")
      setMediaUrl(group.media_url || "")
      setMediaAltText(group.media_alt_text || "")
      setIsFilterable(group.is_filterable)
      setRank(group.rank)
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

    setIsLoading(true)

    try {
      await onUpdate({
        filter_display_name: displayName.trim() || null,
        media_url: mediaUrl.trim() || null,
        media_alt_text: mediaAltText.trim() || null,
        is_filterable: isFilterable,
        rank: rank,
      })
    } catch {
      // Error is handled by parent
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
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Filter Group</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {group?.name || "Update filter group settings"}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Original Name (read-only info) */}
          <div className="space-y-2">
            <Label>Original Name</Label>
            <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
              {group?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              This name comes from the tag group and cannot be changed here
            </p>
          </div>

          {/* Display Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-displayName">Filter Display Name</Label>
            <Input
              id="edit-displayName"
              placeholder="Custom name for storefront filter"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the original name: "{group?.name}"
            </p>
          </div>

          {/* Media Field */}
          <MediaPickerInput
            label="Media"
            value={mediaUrl || null}
            onChange={(path) => {
              setMediaUrl(path || "")
              if (!mediaAltText && path) {
                setMediaAltText(getFilenameWithoutExtension(path))
              }
            }}
            rootPath="/tags"
            accept={["png", "jpg", "jpeg", "avif", "webp", "gif"]}
          />

          {/* Media Alt Text Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-mediaAltText">Media Alt Text</Label>
            <Input
              id="edit-mediaAltText"
              placeholder="Enter alt text for the media"
              value={mediaAltText}
              onChange={(e) => setMediaAltText(e.target.value)}
            />
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
              Lower numbers appear first in the filter list
            </p>
          </div>

          {/* Filterable Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-isFilterable"
              checked={isFilterable}
              onCheckedChange={(checked) => setIsFilterable(checked === true)}
            />
            <Label htmlFor="edit-isFilterable" className="cursor-pointer">
              Show in storefront filters
            </Label>
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
          <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
