"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Folder,
  Image,
  Video,
  File,
  FolderOpen,
  Download,
} from "lucide-react"
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

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface MediaListViewProps {
  items: MediaItem[]
  onItemClick: (item: MediaItem) => void
  onDownload: (item: MediaItem) => void
}

export function MediaListView({
  items,
  onItemClick,
  onDownload,
}: MediaListViewProps) {
  // Get icon based on item type
  const getIcon = (item: MediaItem) => {
    if (item.type === "folder") {
      return <Folder className="h-4 w-4 text-amber-500" />
    }
    if (item.contentType?.startsWith("image/")) {
      return <Image className="h-4 w-4 text-green-500" />
    }
    if (item.contentType?.startsWith("video/")) {
      return <Video className="h-4 w-4 text-blue-500" />
    }
    return <File className="h-4 w-4 text-muted-foreground" />
  }

  // Handle download click
  const handleDownloadClick = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation()
    onDownload(item)
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          This folder is empty
        </h3>
      </div>
    )
  }

  // Sort: folders first, then files
  const sortedItems = [...items].sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1
    if (a.type !== "folder" && b.type === "folder") return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Name</TableHead>
            <TableHead className="w-[15%]">Size</TableHead>
            <TableHead className="w-[25%]">Modified</TableHead>
            <TableHead className="w-[10%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item) => (
            <TableRow
              key={item.path}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onItemClick(item)}
            >
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  {getIcon(item)}
                  <span className="text-sm truncate max-w-xs" title={item.name}>
                    {item.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground py-2">
                {item.type === "folder" ? "-" : formatFileSize(item.size)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground py-2">
                {formatDate(item.lastModified)}
              </TableCell>
              <TableCell className="py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => handleDownloadClick(e, item)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
