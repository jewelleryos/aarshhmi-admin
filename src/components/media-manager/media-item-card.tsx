"use client"

import { cn } from "@/lib/utils"
import { Folder, Image, Video, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MediaItem } from "@/redux/services/mediaService"

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "-"
  const units = ["B", "KB", "MB", "GB"]
  let unitIndex = 0
  let size = bytes
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

interface MediaItemCardProps {
  item: MediaItem
  onClick: () => void
  onDownload: () => void
}

export function MediaItemCard({
  item,
  onClick,
  onDownload,
}: MediaItemCardProps) {
  const isFolder = item.type === "folder"
  const isImage = item.contentType?.startsWith("image/")
  const isVideo = item.contentType?.startsWith("video/")

  // Handle download click
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDownload()
  }

  return (
    <div
      className={cn(
        "group relative rounded-md border bg-card transition-all cursor-pointer",
        "hover:border-primary/50 hover:shadow-sm"
      )}
      onClick={onClick}
    >
      {/* Thumbnail / Icon */}
      <div className="aspect-square relative overflow-hidden rounded-t-md bg-muted">
        {isFolder ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Folder className="h-10 w-10 text-amber-500" />
          </div>
        ) : isImage && item.url ? (
          <img
            src={item.url}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : isVideo ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
            <Video className="h-10 w-10 text-blue-500" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image className="h-10 w-10 text-muted-foreground" />
          </div>
        )}

        {/* Download button - visible on hover */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 bg-white/90 hover:bg-white"
            onClick={handleDownloadClick}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* File info */}
      <div className="p-1.5">
        <p className="text-xs font-medium truncate" title={item.name}>
          {item.name}
        </p>
        {!isFolder && (
          <p className="text-[10px] text-muted-foreground">
            {formatFileSize(item.size)}
          </p>
        )}
      </div>
    </div>
  )
}
