"use client"

import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogOverlay,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Download, Link, X } from "lucide-react"
import { getCdnUrl } from "@/utils/cdn"
import type { MediaItem } from "@/redux/services/mediaService"
import { toast } from "sonner"

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"]
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "avi"]

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".")
  return lastDot === -1 ? "" : filename.slice(lastDot + 1).toLowerCase()
}

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

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface MediaPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: MediaItem
  onDownload: () => void
}

export function MediaPreviewDialog({
  open,
  onOpenChange,
  item,
  onDownload,
}: MediaPreviewDialogProps) {
  const ext = getFileExtension(item.name)
  const isImage = item.contentType?.startsWith("image/") || IMAGE_EXTENSIONS.includes(ext)
  const isVideo = item.contentType?.startsWith("video/") || VIDEO_EXTENSIONS.includes(ext)
  const previewUrl = item.url || getCdnUrl(item.path)

  // Copy URL to clipboard
  const handleCopyUrl = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl)
      toast.success("URL copied to clipboard")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <div
          className={cn(
            "bg-background fixed top-[50%] left-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] rounded-lg border shadow-lg overflow-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Preview area */}
          <div className="bg-muted/50 flex items-center justify-center min-h-75 max-h-[60vh]">
            {isImage && previewUrl ? (
              <img
                src={previewUrl}
                alt={item.name}
                className="max-w-full max-h-[60vh] object-contain"
              />
            ) : isVideo && previewUrl ? (
              <video
                src={previewUrl}
                controls
                className="max-w-full max-h-[60vh]"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <p className="text-sm text-muted-foreground">Preview not available</p>
            )}
          </div>

          {/* File info */}
          <div className="p-4 border-t">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg">{item.name}</AlertDialogTitle>
            </AlertDialogHeader>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Size:</span>{" "}
                <span className="font-medium">{formatFileSize(item.size)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>{" "}
                <span className="font-medium">{item.contentType}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Modified:</span>{" "}
                <span className="font-medium">{formatDate(item.lastModified)}</span>
              </div>
              {previewUrl && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">URL:</span>{" "}
                  <span className="font-medium text-xs break-all">{previewUrl}</span>
                </div>
              )}
            </div>

            <AlertDialogFooter className="mt-4">
              <Button variant="outline" onClick={handleCopyUrl}>
                <Link className="mr-2 h-4 w-4" />
                Copy URL
              </Button>
              <Button onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
