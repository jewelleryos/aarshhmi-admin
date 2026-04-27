"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, ArrowLeft, LayoutGrid, List, Loader2 } from "lucide-react"
import { MediaBreadcrumb } from "./media-breadcrumb"
import { MediaGridView } from "./media-grid-view"
import { MediaListView } from "./media-list-view"
import { MediaPreviewDialog } from "./media-preview-dialog"
import mediaService, { type MediaItem } from "@/redux/services/mediaService"
import { toast } from "sonner"

const PAGE_SIZE = 48

export function MediaManagerContent() {
  const [currentPath, setCurrentPath] = useState("")
  const [items, setItems] = useState<MediaItem[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)

  const pageRef = useRef(1)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const canGoBack = currentPath !== "" && currentPath !== "/"

  const fetchPage = useCallback(async (path: string, page: number, append: boolean) => {
    try {
      if (append) {
        setIsFetchingMore(true)
      } else {
        setIsLoading(true)
        setError(null)
        setItems([])
        setHasMore(false)
      }

      const response = await mediaService.list(path, page, PAGE_SIZE)
      const { items: newItems, hasMore: more } = response.data

      setItems((prev) => append ? [...prev, ...newItems] : newItems)
      setHasMore(more)
      pageRef.current = page
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load files"
      if (!append) setError(message)
      toast.error(message)
    } finally {
      if (append) setIsFetchingMore(false)
      else setIsLoading(false)
    }
  }, [])

  // Reset and load page 1 whenever path changes
  useEffect(() => {
    pageRef.current = 1
    fetchPage(currentPath, 1, false)
  }, [currentPath, fetchPage])

  // IntersectionObserver — fires when sentinel is visible
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          fetchPage(currentPath, pageRef.current + 1, true)
        }
      },
      { rootMargin: "200px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isFetchingMore, isLoading, currentPath, fetchPage])

  const handleNavigate = (path: string) => setCurrentPath(path)

  const handleGoBack = () => {
    const segments = currentPath.split("/").filter((s) => s.length > 0)
    if (segments.length <= 1) {
      setCurrentPath("")
    } else {
      segments.pop()
      setCurrentPath("/" + segments.join("/") + "/")
    }
  }

  const handleItemClick = (item: MediaItem) => {
    if (item.type === "folder") {
      handleNavigate(item.path)
    } else {
      setPreviewItem(item)
    }
  }

  const handleDownload = async (item: MediaItem) => {
    try {
      if (item.type === "folder") {
        toast.info("Downloading folder...")
        await mediaService.downloadFolder(item.path, item.name)
        toast.success("Folder downloaded")
      } else {
        toast.info("Downloading file...")
        await mediaService.downloadFile(item.path, item.name)
        toast.success("File downloaded")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed"
      toast.error(message)
    }
  }

  const handleRefresh = () => {
    pageRef.current = 1
    fetchPage(currentPath, 1, false)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Manager</h1>
          <p className="text-muted-foreground">
            Browse your images and videos
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Content Card */}
      <Card>
        <CardContent className="pt-6">
          {/* Navigation Bar - Back, Breadcrumb, View Toggle in one row */}
          <div className="flex items-center justify-between mb-4 gap-4">
            {/* Left side - Back button + Breadcrumb */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                disabled={!canGoBack}
                className="h-8 shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <MediaBreadcrumb path={currentPath} onNavigate={handleNavigate} />
            </div>

            {/* Right side - View toggle */}
            <div className="flex items-center border rounded-md shrink-0">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none h-8 px-3"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          )}

          {/* Grid/List View */}
          {!isLoading && !error && (
            viewMode === "grid" ? (
              <MediaGridView
                items={items}
                onItemClick={handleItemClick}
                onDownload={handleDownload}
                isLoadingMore={isFetchingMore}
              />
            ) : (
              <MediaListView
                items={items}
                onItemClick={handleItemClick}
                onDownload={handleDownload}
                isLoadingMore={isFetchingMore}
              />
            )
          )}

          {/* Sentinel — triggers next page load when scrolled into view */}
          <div ref={sentinelRef} className="h-1" />
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      {previewItem && (
        <MediaPreviewDialog
          open={!!previewItem}
          onOpenChange={(open) => !open && setPreviewItem(null)}
          item={previewItem}
          onDownload={() => handleDownload(previewItem)}
        />
      )}
    </div>
  )
}
