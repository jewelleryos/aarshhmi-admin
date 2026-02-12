"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteDialogWithDelay } from "@/components/ui/delete-dialog-with-delay"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Folder,
  FileImage,
  Upload,
  FolderPlus,
  Loader2,
  MoreVertical,
  Trash2,
  ChevronRight,
  ImageOff,
} from "lucide-react"
import { toast } from "sonner"
import mediaService, { type MediaItem } from "@/redux/services/mediaService"
import { getCdnUrl } from "@/utils/cdn"

interface MediaPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rootPath: string
  onSelect: (path: string) => void // Returns path only - CDN URL added when displaying
  accept?: string[] // Allowed file extensions (e.g., ["png", "jpg", "jpeg"])
}

// Normalize path - ensure it starts with / and doesn't end with /
function normalizePath(path: string): string {
  let normalized = path.trim()
  if (!normalized.startsWith("/")) {
    normalized = "/" + normalized
  }
  if (normalized.endsWith("/") && normalized.length > 1) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

// Get breadcrumb segments from path relative to root
function getBreadcrumbs(currentPath: string, rootPath: string): { name: string; path: string }[] {
  const normalizedCurrent = normalizePath(currentPath)
  const normalizedRoot = normalizePath(rootPath)

  // Get the relative part after root
  const relativePath = normalizedCurrent.slice(normalizedRoot.length)

  if (!relativePath) {
    return []
  }

  const segments = relativePath.split("/").filter(Boolean)
  const breadcrumbs: { name: string; path: string }[] = []

  let accumulatedPath = normalizedRoot
  for (const segment of segments) {
    accumulatedPath = `${accumulatedPath}/${segment}`
    breadcrumbs.push({ name: segment, path: accumulatedPath })
  }

  return breadcrumbs
}

// Get root folder name from path
function getRootName(rootPath: string): string {
  const normalized = normalizePath(rootPath)
  const segments = normalized.split("/").filter(Boolean)
  return segments[segments.length - 1] || "Root"
}

// Get file extension from filename
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".")
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return ""
  }
  return filename.slice(lastDotIndex + 1).toLowerCase()
}

// Convert accept array to input accept string
function getAcceptString(accept?: string[]): string {
  if (!accept || accept.length === 0) return "image/*"
  return accept.map(ext => `.${ext}`).join(",")
}

export function MediaPickerModal({
  open,
  onOpenChange,
  rootPath,
  onSelect,
  accept,
}: MediaPickerModalProps) {
  const normalizedRootPath = normalizePath(rootPath)

  // State
  const [currentPath, setCurrentPath] = useState(normalizedRootPath)
  const [items, setItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch items for current path
  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await mediaService.list(currentPath)
      if (response.success) {
        // Sort: folders first, then files
        const sorted = [...response.data.items].sort((a, b) => {
          if (a.type === "folder" && b.type !== "folder") return -1
          if (a.type !== "folder" && b.type === "folder") return 1
          return a.name.localeCompare(b.name)
        })
        setItems(sorted)
      }
    } catch (error) {
      toast.error("Failed to load files")
    } finally {
      setIsLoading(false)
    }
  }, [currentPath])

  // Fetch on path change
  useEffect(() => {
    if (open) {
      fetchItems()
    }
  }, [open, fetchItems])

  // Reset to root when modal opens
  useEffect(() => {
    if (open) {
      setCurrentPath(normalizedRootPath)
    }
  }, [open, normalizedRootPath])

  // Navigate to folder
  const handleFolderClick = (item: MediaItem) => {
    if (item.type === "folder") {
      // Remove trailing slash from path if present
      const cleanPath = item.path.endsWith("/") ? item.path.slice(0, -1) : item.path
      setCurrentPath(cleanPath)
    }
  }

  // Navigate via breadcrumb
  const handleBreadcrumbClick = (path: string) => {
    setCurrentPath(path)
  }

  // Navigate to rootgetFileExtension
  const handleRootClick = () => {
    setCurrentPath(normalizedRootPath)
  }

  // Handle file double-click (select)
  const handleFileDoubleClick = (item: MediaItem) => {
    if (item.type === "file") {
      // Return only the path - CDN URL will be added when displaying
      onSelect(item.path)
      onOpenChange(false)
    }
  }

  // Handle upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Validate file extensions if accept is specified
    if (accept && accept.length > 0) {
      const invalidFiles = Array.from(files).filter(file => {
        const ext = getFileExtension(file.name)
        return !accept.includes(ext)
      })

      if (invalidFiles.length > 0) {
        toast.error(`Only ${accept.join(", ")} files are allowed`)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }
    }

    setIsUploading(true)
    try {
      const response = await mediaService.upload(currentPath, Array.from(files))
      if (response.success) {
        const uploadedCount = response.data.uploaded.length
        const failedCount = response.data.failed.length

        if (uploadedCount > 0) {
          toast.success(`${uploadedCount} file(s) uploaded successfully`)
        }
        if (failedCount > 0) {
          toast.error(`${failedCount} file(s) failed to upload`)
        }

        fetchItems()
      }
    } catch (error) {
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required")
      return
    }

    setIsCreatingFolder(true)
    try {
      const response = await mediaService.createFolder(currentPath, newFolderName.trim())
      if (response.success) {
        toast.success("Folder created successfully")
        setNewFolderName("")
        setShowNewFolderInput(false)
        fetchItems()
      }
    } catch (error) {
      toast.error("Failed to create folder")
    } finally {
      setIsCreatingFolder(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deleteItem) return

    try {
      if (deleteItem.type === "folder") {
        const response = await mediaService.deleteFolder(deleteItem.path)
        toast.success(response.message)
      } else {
        const response = await mediaService.deleteFiles([deleteItem.path])
        toast.success(response.message)
      }
      fetchItems()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Something went wrong"
      toast.error(message)
    }
  }

  // Get breadcrumbs
  const breadcrumbs = getBreadcrumbs(currentPath, normalizedRootPath)
  const rootName = getRootName(normalizedRootPath)

  // Check if item is an image (using extension only - contentType not reliable from backend)
  const isImage = (item: MediaItem) => {
    if (item.type !== "file") return false
    const ext = getFileExtension(item.name)
    return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"].includes(ext)
  }

  // Handle main dialog close - prevent closing when delete dialog is open
  const handleMainDialogChange = (isOpen: boolean) => {
    if (!isOpen && isDeleteDialogOpen) return // Don't close if delete dialog is open
    onOpenChange(isOpen)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleMainDialogChange}>
        <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>

          {/* Toolbar */}
          <div className="px-6 py-3 border-b flex items-center justify-between gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm overflow-x-auto flex-1">
              <button
                onClick={handleRootClick}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium shrink-0"
              >
                {rootName}
              </button>
              {breadcrumbs.map((crumb) => (
                <div key={crumb.path} className="flex items-center gap-1 shrink-0">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <button
                    onClick={() => handleBreadcrumbClick(crumb.path)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {showNewFolderInput ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className="h-8 w-40"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateFolder()
                      if (e.key === "Escape") {
                        setShowNewFolderInput(false)
                        setNewFolderName("")
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateFolder}
                    disabled={isCreatingFolder}
                  >
                    {isCreatingFolder ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Create"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowNewFolderInput(false)
                      setNewFolderName("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNewFolderInput(true)}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="aspect-square rounded-md" />
                      <Skeleton className="h-3 w-3/4 mx-auto" />
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ImageOff className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">
                    This folder is empty
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload images or create a new folder
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.path}
                      className="group relative"
                    >
                      <div
                        className={`
                          aspect-square rounded-md border bg-muted/50 flex items-center justify-center overflow-hidden
                          ${item.type === "folder" ? "cursor-pointer hover:border-primary/50 hover:bg-muted" : ""}
                          ${item.type === "file" ? "cursor-pointer hover:border-primary/50" : ""}
                        `}
                        onClick={() => item.type === "folder" && handleFolderClick(item)}
                        onDoubleClick={() => item.type === "file" && handleFileDoubleClick(item)}
                      >
                        {item.type === "folder" ? (
                          <Folder className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <>
                            {isImage(item) && getCdnUrl(item.path) ? (
                              <img
                                src={getCdnUrl(item.path)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileImage className="h-8 w-8 text-muted-foreground" />
                            )}
                          </>
                        )}
                      </div>

                      {/* Item name */}
                      <p className="mt-1 text-xs truncate text-center" title={item.name}>
                        {item.name}
                      </p>

                      {/* Actions menu */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteItem(item)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={getAcceptString(accept)}
            className="hidden"
            onChange={handleUpload}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog with delay */}
      {deleteItem && (
        <DeleteDialogWithDelay
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title={`Delete ${deleteItem.type === "folder" ? "Folder" : "File"}`}
          description={`Are you sure you want to delete "${deleteItem.name}"?${deleteItem.type === "folder" ? " This will delete all contents inside the folder." : ""} This action cannot be undone.`}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
