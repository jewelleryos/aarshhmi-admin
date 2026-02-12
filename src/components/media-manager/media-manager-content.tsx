"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, ArrowLeft, LayoutGrid, List, Loader2 } from "lucide-react"
import { MediaBreadcrumb } from "./media-breadcrumb"
import { MediaGridView } from "./media-grid-view"
import { MediaListView } from "./media-list-view"
import { MediaPreviewDialog } from "./media-preview-dialog"
import mediaService, { type MediaItem } from "@/redux/services/mediaService"
import { toast } from "sonner"

export function MediaManagerContent() {
  // State
  const [currentPath, setCurrentPath] = useState("")
  const [items, setItems] = useState<MediaItem[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Preview dialog state
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)

  // Check if we can go back
  const canGoBack = currentPath !== "" && currentPath !== "/"

  // Fetch items for current path
  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await mediaService.list(currentPath)
      setItems(response.data.items)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load files"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPath])

  // Fetch on mount and when path changes
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Navigate to folder
  const handleNavigate = (path: string) => {
    setCurrentPath(path)
  }

  // Go back to parent folder
  const handleGoBack = () => {
    const segments = currentPath.split("/").filter((s) => s.length > 0)
    if (segments.length <= 1) {
      setCurrentPath("")
    } else {
      segments.pop()
      setCurrentPath("/" + segments.join("/") + "/")
    }
  }

  // Handle item click
  const handleItemClick = (item: MediaItem) => {
    if (item.type === "folder") {
      handleNavigate(item.path)
    } else {
      setPreviewItem(item)
    }
  }

  // Handle download
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

  // Refresh
  const handleRefresh = () => {
    fetchItems()
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
              />
            ) : (
              <MediaListView
                items={items}
                onItemClick={handleItemClick}
                onDownload={handleDownload}
              />
            )
          )}
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
