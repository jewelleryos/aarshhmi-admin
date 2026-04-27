"use client"

import { MediaItemCard } from "./media-item-card"
import { Skeleton } from "@/components/ui/skeleton"
import { FolderOpen } from "lucide-react"
import type { MediaItem } from "@/redux/services/mediaService"

interface MediaGridViewProps {
  items: MediaItem[]
  onItemClick: (item: MediaItem) => void
  onDownload: (item: MediaItem) => void
  isLoadingMore?: boolean
}

export function MediaGridView({
  items,
  onItemClick,
  onDownload,
  isLoadingMore = false,
}: MediaGridViewProps) {
  if (items.length === 0 && !isLoadingMore) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          This folder is empty
        </h3>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {items.map((item) => (
          <MediaItemCard
            key={item.path}
            item={item}
            onClick={() => onItemClick(item)}
            onDownload={() => onDownload(item)}
          />
        ))}
        {/* Loading-more skeletons appended to the same grid */}
        {isLoadingMore &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="space-y-1.5">
              <Skeleton className="aspect-square rounded-md" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
      </div>
    </div>
  )
}

// Initial loading skeleton (full grid)
export function MediaGridSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="aspect-square rounded-md" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  )
}
