"use client"

import { X, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCdnUrl } from "@/utils/cdn"

// Media item type
export interface MediaItem {
  id: string
  path: string
  type: "image" | "video"
  altText: string
  position: number
}

interface MediaItemCardProps {
  item: MediaItem
  onRemove: () => void
  onUpdatePosition: (position: number) => void
  onUpdateAltText: (altText: string) => void
}

export function MediaItemCard({
  item,
  onRemove,
  onUpdatePosition,
  onUpdateAltText,
}: MediaItemCardProps) {
  const cdnUrl = getCdnUrl(item.path)

  return (
    <div className="relative border rounded-lg p-3 bg-muted/30">
      {/* Remove button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>

      {/* Media preview */}
      <div className="aspect-square rounded-md overflow-hidden bg-muted mb-3 relative">
        {item.type === "image" ? (
          <img
            src={cdnUrl || ""}
            alt={item.altText || "Product image"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted relative">
            <video
              src={cdnUrl || ""}
              className="w-full h-full object-cover"
              muted
            />
            {/* Play icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="h-5 w-5 text-black ml-0.5" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Position input */}
      <div className="space-y-1 mb-2">
        <Label className="text-xs">Position</Label>
        <Input
          type="number"
          min="1"
          value={item.position}
          onChange={(e) => onUpdatePosition(parseInt(e.target.value) || 1)}
          className="h-8 text-sm"
        />
      </div>

      {/* Alt text input */}
      <div className="space-y-1">
        <Label className="text-xs">Alt Text</Label>
        <Input
          type="text"
          placeholder="Describe the image..."
          value={item.altText}
          onChange={(e) => onUpdateAltText(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
    </div>
  )
}
