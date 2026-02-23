"use client"

import { Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MediaItemCard, type MediaItem } from "./media-item-card"

const VIDEO_EXTENSIONS = ["mp4"]

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// Helper to determine media type from filename
function getMediaType(filename: string): "image" | "video" {
  const ext = filename.split(".").pop()?.toLowerCase() || ""
  if (VIDEO_EXTENSIONS.includes(ext)) return "video"
  return "image"
}

interface MediaColorCardProps {
  colorId: string
  colorName: string
  items: MediaItem[]
  gemstoneColors?: { colorId: string; colorName: string }[]
  getGemstoneSubItems?: (gemstoneColorId: string) => MediaItem[]
  onAddMedia: (items: MediaItem[]) => void
  onAddGemstoneMedia?: (gemstoneColorId: string, gemstoneColorName: string, items: MediaItem[]) => void
  onRemoveMedia: (mediaItemId: string) => void
  onRemoveGemstoneMedia?: (gemstoneColorId: string, mediaItemId: string) => void
  onUpdatePosition: (mediaItemId: string, position: number) => void
  onUpdateGemstonePosition?: (gemstoneColorId: string, mediaItemId: string, position: number) => void
  onUpdateAltText: (mediaItemId: string, altText: string) => void
  onUpdateGemstoneAltText?: (gemstoneColorId: string, mediaItemId: string, altText: string) => void
}

export function MediaColorCard({
  colorId,
  colorName,
  items,
  gemstoneColors = [],
  getGemstoneSubItems,
  onAddMedia,
  onAddGemstoneMedia,
  onRemoveMedia,
  onRemoveGemstoneMedia,
  onUpdatePosition,
  onUpdateGemstonePosition,
  onUpdateAltText,
  onUpdateGemstoneAltText,
}: MediaColorCardProps) {
  const hasGemstones = gemstoneColors.length > 0

  // Calculate next position for new media
  const getNextPosition = (): number => {
    if (items.length === 0) return 1
    return Math.max(...items.map((item) => item.position)) + 1
  }

  // Calculate next position for gemstone sub-media
  const getNextGemstonePosition = (gemstoneColorId: string): number => {
    const subItems = getGemstoneSubItems?.(gemstoneColorId) || []
    if (subItems.length === 0) return 1
    return Math.max(...subItems.map((item) => item.position)) + 1
  }

  // Handle files selected for main color
  const handleFilesSelected = (files: FileList) => {
    const startPos = getNextPosition()
    const newItems: MediaItem[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileKey = `file_${generateId()}`
      newItems.push({
        id: generateId(),
        path: "",
        type: getMediaType(file.name),
        altText: "",
        position: startPos + i,
        fileKey,
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }
    onAddMedia(newItems)
  }

  // Handle files selected for gemstone sub-box
  const handleGemstoneFilesSelected = (
    gemstoneColorId: string,
    gemstoneColorName: string,
    files: FileList
  ) => {
    const startPos = getNextGemstonePosition(gemstoneColorId)
    const newItems: MediaItem[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileKey = `file_${generateId()}`
      newItems.push({
        id: generateId(),
        path: "",
        type: getMediaType(file.name),
        altText: "",
        position: startPos + i,
        fileKey,
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }
    onAddGemstoneMedia?.(gemstoneColorId, gemstoneColorName, newItems)
  }

  // Sort items by position for display
  const sortedItems = [...items].sort((a, b) => a.position - b.position)

  // Render media items grid
  const renderMediaGrid = (
    mediaItems: MediaItem[],
    onRemove: (id: string) => void,
    onPosition: (id: string, pos: number) => void,
    onAlt: (id: string, alt: string) => void,
    onFilesChange: (files: FileList) => void,
    inputId: string
  ) => {
    const sorted = [...mediaItems].sort((a, b) => a.position - b.position)
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sorted.map((item) => (
          <MediaItemCard
            key={item.id}
            item={item}
            onRemove={() => onRemove(item.id)}
            onUpdatePosition={(position) => onPosition(item.id, position)}
            onUpdateAltText={(altText) => onAlt(item.id, altText)}
          />
        ))}
        <label
          htmlFor={inputId}
          className="aspect-square w-[60%] rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs font-medium">Upload Images</span>
        </label>
        <input
          id={inputId}
          type="file"
          multiple
          accept="image/*,video/mp4"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFilesChange(e.target.files)
            }
            e.target.value = ""
          }}
        />
      </div>
    )
  }

  return (
    <Card className="border-muted">
      <CardHeader>
        <CardTitle className="text-base">{colorName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasGemstones ? (
          // Render gemstone sub-boxes
          gemstoneColors.map((gemstoneColor) => {
            const subItems = getGemstoneSubItems?.(gemstoneColor.colorId) || []
            return (
              <Card key={gemstoneColor.colorId} className="border-muted/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">{gemstoneColor.colorName}</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMediaGrid(
                    subItems,
                    (mediaItemId) => onRemoveGemstoneMedia?.(gemstoneColor.colorId, mediaItemId),
                    (mediaItemId, position) =>
                      onUpdateGemstonePosition?.(gemstoneColor.colorId, mediaItemId, position),
                    (mediaItemId, altText) =>
                      onUpdateGemstoneAltText?.(gemstoneColor.colorId, mediaItemId, altText),
                    (files) => handleGemstoneFilesSelected(gemstoneColor.colorId, gemstoneColor.colorName, files),
                    `file-input-${colorId}-${gemstoneColor.colorId}`
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          // Render main media grid (no gemstones)
          renderMediaGrid(
            sortedItems,
            onRemoveMedia,
            onUpdatePosition,
            onUpdateAltText,
            handleFilesSelected,
            `file-input-${colorId}`
          )
        )}
      </CardContent>
    </Card>
  )
}
