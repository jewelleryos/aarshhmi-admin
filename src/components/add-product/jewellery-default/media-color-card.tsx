"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MediaPickerModal } from "@/components/media/media-picker-modal"
import { MediaItemCard, type MediaItem } from "./media-item-card"

// Configuration constants
const PRODUCT_MEDIA_ROOT_PATH = "/products"
const ALLOWED_MEDIA_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "mp4"]
const VIDEO_EXTENSIONS = ["mp4"]

// Helper to determine media type from path
function getMediaType(path: string): "image" | "video" {
  const ext = path.split(".").pop()?.toLowerCase() || ""
  if (VIDEO_EXTENSIONS.includes(ext)) return "video"
  return "image"
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

interface MediaColorCardProps {
  colorId: string
  colorName: string
  items: MediaItem[]
  gemstoneColors?: { colorId: string; colorName: string }[]
  getGemstoneSubItems?: (gemstoneColorId: string) => MediaItem[]
  onAddMedia: (item: MediaItem) => void
  onAddGemstoneMedia?: (gemstoneColorId: string, gemstoneColorName: string, item: MediaItem) => void
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeGemstoneColorId, setActiveGemstoneColorId] = useState<string | null>(null)

  const hasGemstones = gemstoneColors.length > 0

  // Calculate next position for new media (no gemstones)
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

  // Handle media selection from modal
  const handleMediaSelect = (path: string) => {
    const newItem: MediaItem = {
      id: generateId(),
      path,
      type: getMediaType(path),
      altText: "",
      position: activeGemstoneColorId
        ? getNextGemstonePosition(activeGemstoneColorId)
        : getNextPosition(),
    }

    if (activeGemstoneColorId && onAddGemstoneMedia) {
      const gemstoneColor = gemstoneColors.find((gc) => gc.colorId === activeGemstoneColorId)
      if (gemstoneColor) {
        onAddGemstoneMedia(activeGemstoneColorId, gemstoneColor.colorName, newItem)
      }
    } else {
      onAddMedia(newItem)
    }

    setActiveGemstoneColorId(null)
  }

  // Open modal for specific gemstone color
  const openModalForGemstone = (gemstoneColorId: string) => {
    setActiveGemstoneColorId(gemstoneColorId)
    setIsModalOpen(true)
  }

  // Open modal for main color (no gemstones)
  const openModalForMain = () => {
    setActiveGemstoneColorId(null)
    setIsModalOpen(true)
  }

  // Sort items by position for display
  const sortedItems = [...items].sort((a, b) => a.position - b.position)

  // Render media items grid
  const renderMediaGrid = (
    mediaItems: MediaItem[],
    onRemove: (id: string) => void,
    onPosition: (id: string, pos: number) => void,
    onAlt: (id: string, alt: string) => void,
    onAddClick: () => void
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
        <button
          type="button"
          onClick={onAddClick}
          className="aspect-square w-[60%] rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs font-medium">Add Media</span>
        </button>
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
                    () => openModalForGemstone(gemstoneColor.colorId)
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
            openModalForMain
          )
        )}

        {/* Media Picker Modal */}
        <MediaPickerModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          rootPath={PRODUCT_MEDIA_ROOT_PATH}
          onSelect={handleMediaSelect}
          accept={ALLOWED_MEDIA_EXTENSIONS}
        />
      </CardContent>
    </Card>
  )
}
