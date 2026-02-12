"use client"

import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MediaColorCard } from "./media-color-card"
import type { MediaItem } from "./media-item-card"

// Gemstone sub-media structure
export interface GemstoneSubMedia {
  gemstoneColorId: string
  gemstoneColorName: string
  items: MediaItem[]
}

// Color media structure (updated to support gemstone sub-boxes)
export interface ColorMedia {
  colorId: string
  colorName: string
  items: MediaItem[]                    // Direct items when no gemstones
  gemstoneSubMedia: GemstoneSubMedia[]  // Sub-boxes for gemstone colors
}

// Media details data structure
export interface MediaDetailsData {
  colorMedia: ColorMedia[]
}

interface MediaSectionProps {
  data: MediaDetailsData
  selectedColors: { colorId: string; colorName: string }[]
  selectedGemstoneColors: { colorId: string; colorName: string }[]  // NEW
  onChange: (data: MediaDetailsData) => void
}

export function MediaSection({
  data,
  selectedColors,
  selectedGemstoneColors,
  onChange,
}: MediaSectionProps) {
  const hasGemstones = selectedGemstoneColors.length > 0

  // Get items for a specific color (when no gemstones)
  const getColorItems = (colorId: string): MediaItem[] => {
    const colorMedia = data.colorMedia.find((cm) => cm.colorId === colorId)
    return colorMedia?.items || []
  }

  // Get items for a specific metal color + gemstone color combination
  const getGemstoneSubItems = (metalColorId: string, gemstoneColorId: string): MediaItem[] => {
    const colorMedia = data.colorMedia.find((cm) => cm.colorId === metalColorId)
    const subMedia = colorMedia?.gemstoneSubMedia?.find((sm) => sm.gemstoneColorId === gemstoneColorId)
    return subMedia?.items || []
  }

  // Handle adding media to a color (no gemstones)
  const handleAddMedia = (colorId: string, colorName: string, item: MediaItem) => {
    const existingColorMedia = data.colorMedia.find((cm) => cm.colorId === colorId)

    if (existingColorMedia) {
      onChange({
        colorMedia: data.colorMedia.map((cm) =>
          cm.colorId === colorId
            ? { ...cm, items: [...cm.items, item] }
            : cm
        ),
      })
    } else {
      onChange({
        colorMedia: [
          ...data.colorMedia,
          { colorId, colorName, items: [item], gemstoneSubMedia: [] },
        ],
      })
    }
  }

  // Handle adding media to gemstone sub-box
  const handleAddGemstoneMedia = (
    metalColorId: string,
    metalColorName: string,
    gemstoneColorId: string,
    gemstoneColorName: string,
    item: MediaItem
  ) => {
    const existingColorMedia = data.colorMedia.find((cm) => cm.colorId === metalColorId)

    if (existingColorMedia) {
      const existingSubMedia = existingColorMedia.gemstoneSubMedia?.find(
        (sm) => sm.gemstoneColorId === gemstoneColorId
      )

      if (existingSubMedia) {
        // Update existing sub-media
        onChange({
          colorMedia: data.colorMedia.map((cm) =>
            cm.colorId === metalColorId
              ? {
                  ...cm,
                  gemstoneSubMedia: cm.gemstoneSubMedia.map((sm) =>
                    sm.gemstoneColorId === gemstoneColorId
                      ? { ...sm, items: [...sm.items, item] }
                      : sm
                  ),
                }
              : cm
          ),
        })
      } else {
        // Add new sub-media entry
        onChange({
          colorMedia: data.colorMedia.map((cm) =>
            cm.colorId === metalColorId
              ? {
                  ...cm,
                  gemstoneSubMedia: [
                    ...(cm.gemstoneSubMedia || []),
                    { gemstoneColorId, gemstoneColorName, items: [item] },
                  ],
                }
              : cm
          ),
        })
      }
    } else {
      // Add new color media with sub-media
      onChange({
        colorMedia: [
          ...data.colorMedia,
          {
            colorId: metalColorId,
            colorName: metalColorName,
            items: [],
            gemstoneSubMedia: [{ gemstoneColorId, gemstoneColorName, items: [item] }],
          },
        ],
      })
    }
  }

  // Handle removing media from a color (no gemstones)
  const handleRemoveMedia = (colorId: string, mediaItemId: string) => {
    onChange({
      colorMedia: data.colorMedia.map((cm) =>
        cm.colorId === colorId
          ? { ...cm, items: cm.items.filter((item) => item.id !== mediaItemId) }
          : cm
      ),
    })
  }

  // Handle removing media from gemstone sub-box
  const handleRemoveGemstoneMedia = (
    metalColorId: string,
    gemstoneColorId: string,
    mediaItemId: string
  ) => {
    onChange({
      colorMedia: data.colorMedia.map((cm) =>
        cm.colorId === metalColorId
          ? {
              ...cm,
              gemstoneSubMedia: cm.gemstoneSubMedia.map((sm) =>
                sm.gemstoneColorId === gemstoneColorId
                  ? { ...sm, items: sm.items.filter((item) => item.id !== mediaItemId) }
                  : sm
              ),
            }
          : cm
      ),
    })
  }

  // Handle updating media position (no gemstones)
  const handleUpdatePosition = (
    colorId: string,
    mediaItemId: string,
    position: number
  ) => {
    onChange({
      colorMedia: data.colorMedia.map((cm) =>
        cm.colorId === colorId
          ? {
              ...cm,
              items: cm.items.map((item) =>
                item.id === mediaItemId ? { ...item, position } : item
              ),
            }
          : cm
      ),
    })
  }

  // Handle updating gemstone media position
  const handleUpdateGemstonePosition = (
    metalColorId: string,
    gemstoneColorId: string,
    mediaItemId: string,
    position: number
  ) => {
    onChange({
      colorMedia: data.colorMedia.map((cm) =>
        cm.colorId === metalColorId
          ? {
              ...cm,
              gemstoneSubMedia: cm.gemstoneSubMedia.map((sm) =>
                sm.gemstoneColorId === gemstoneColorId
                  ? {
                      ...sm,
                      items: sm.items.map((item) =>
                        item.id === mediaItemId ? { ...item, position } : item
                      ),
                    }
                  : sm
              ),
            }
          : cm
      ),
    })
  }

  // Handle updating media alt text (no gemstones)
  const handleUpdateAltText = (
    colorId: string,
    mediaItemId: string,
    altText: string
  ) => {
    onChange({
      colorMedia: data.colorMedia.map((cm) =>
        cm.colorId === colorId
          ? {
              ...cm,
              items: cm.items.map((item) =>
                item.id === mediaItemId ? { ...item, altText } : item
              ),
            }
          : cm
      ),
    })
  }

  // Handle updating gemstone media alt text
  const handleUpdateGemstoneAltText = (
    metalColorId: string,
    gemstoneColorId: string,
    mediaItemId: string,
    altText: string
  ) => {
    onChange({
      colorMedia: data.colorMedia.map((cm) =>
        cm.colorId === metalColorId
          ? {
              ...cm,
              gemstoneSubMedia: cm.gemstoneSubMedia.map((sm) =>
                sm.gemstoneColorId === gemstoneColorId
                  ? {
                      ...sm,
                      items: sm.items.map((item) =>
                        item.id === mediaItemId ? { ...item, altText } : item
                      ),
                    }
                  : sm
              ),
            }
          : cm
      ),
    })
  }

  // Show message when no colors are selected
  if (selectedColors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select metal colors in the Metal Details tab first to add media for each color variant.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          {hasGemstones
            ? "Add images and videos for each metal color and gemstone color combination. Set the position to control the display order (1 = primary image)."
            : "Add images and videos for each color variant. Set the position to control the display order (1 = primary image)."}
        </p>

        {/* Color media cards */}
        {selectedColors.map((color) => (
          <MediaColorCard
            key={color.colorId}
            colorId={color.colorId}
            colorName={color.colorName}
            items={getColorItems(color.colorId)}
            gemstoneColors={selectedGemstoneColors}
            getGemstoneSubItems={(gemstoneColorId) =>
              getGemstoneSubItems(color.colorId, gemstoneColorId)
            }
            onAddMedia={(item) => handleAddMedia(color.colorId, color.colorName, item)}
            onAddGemstoneMedia={(gemstoneColorId, gemstoneColorName, item) =>
              handleAddGemstoneMedia(color.colorId, color.colorName, gemstoneColorId, gemstoneColorName, item)
            }
            onRemoveMedia={(mediaItemId) => handleRemoveMedia(color.colorId, mediaItemId)}
            onRemoveGemstoneMedia={(gemstoneColorId, mediaItemId) =>
              handleRemoveGemstoneMedia(color.colorId, gemstoneColorId, mediaItemId)
            }
            onUpdatePosition={(mediaItemId, position) =>
              handleUpdatePosition(color.colorId, mediaItemId, position)
            }
            onUpdateGemstonePosition={(gemstoneColorId, mediaItemId, position) =>
              handleUpdateGemstonePosition(color.colorId, gemstoneColorId, mediaItemId, position)
            }
            onUpdateAltText={(mediaItemId, altText) =>
              handleUpdateAltText(color.colorId, mediaItemId, altText)
            }
            onUpdateGemstoneAltText={(gemstoneColorId, mediaItemId, altText) =>
              handleUpdateGemstoneAltText(color.colorId, gemstoneColorId, mediaItemId, altText)
            }
          />
        ))}
      </CardContent>
    </Card>
  )
}
