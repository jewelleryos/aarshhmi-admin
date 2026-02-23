"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, Image as ImageIcon, Upload, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { getCdnUrl } from "@/utils/cdn"
import productService from "@/redux/services/productService"
import type {
  ProductDetail,
  ColorMedia,
} from "@/redux/services/productService"

// Extended media item that supports both existing (path) and new (file) items
interface EditMediaItem {
  id: string
  path: string
  type: string
  altText: string | null
  position: number
  // New upload fields
  fileKey?: string
  file?: File
  previewUrl?: string
}

// Extended ColorMedia with EditMediaItem
interface EditColorMedia {
  metalColorId: string
  colorSlug?: string
  items: EditMediaItem[]
  gemstoneSubMedia: EditGemstoneSubMedia[]
}

interface EditGemstoneSubMedia {
  gemstoneColorId: string
  gemstoneColorSlug?: string
  items: EditMediaItem[]
}

interface MediaEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductDetail
  onSuccess: () => void
}

// OptionConfig types from product.metadata
interface OptionConfigItem {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  imageAltText: string | null
}

interface OptionConfig {
  metalTypes: OptionConfigItem[]
  metalColors: (OptionConfigItem & { metalTypeId: string })[]
  metalPurities: (OptionConfigItem & { metalTypeId: string })[]
  diamondClarityColors: OptionConfigItem[] | null
  gemstoneColors: OptionConfigItem[] | null
}

const VIDEO_EXTENSIONS = ["mp4"]

// Generate a unique ID for new media items
function generateMediaId(): string {
  return `med_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`
}

function generateFileKey(): string {
  return `file_${Math.random().toString(36).substring(2, 9)}`
}

function getMediaType(filename: string): "image" | "video" {
  const ext = filename.split(".").pop()?.toLowerCase() || ""
  if (VIDEO_EXTENSIONS.includes(ext)) return "video"
  return "image"
}

export function MediaEditDrawer({
  open,
  onOpenChange,
  product,
  onSuccess,
}: MediaEditDrawerProps) {
  // Get option config from product metadata
  const optionConfig = useMemo(() => {
    return product.metadata?.optionConfig as OptionConfig | undefined
  }, [product.metadata])

  // Check if product has gemstone colors
  const hasGemstoneColors = useMemo(() => {
    return optionConfig?.gemstoneColors && optionConfig.gemstoneColors.length > 0
  }, [optionConfig])

  // Form state - local copy of media data
  const [colorMedia, setColorMedia] = useState<EditColorMedia[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Active tab state
  const [activeMetalColorTab, setActiveMetalColorTab] = useState<string>("")
  const [activeGemstoneTab, setActiveGemstoneTab] = useState<Record<string, string>>({})

  // Initialize form data when drawer opens
  useEffect(() => {
    if (open && optionConfig) {
      // Get existing media from product
      const existingMedia = product.metadata?.media as { colorMedia: ColorMedia[] } | undefined
      const existingColorMedia = existingMedia?.colorMedia || []

      // Create colorMedia entries for ALL metal colors from options
      const initialColorMedia: EditColorMedia[] = optionConfig.metalColors.map((metalColor) => {
        // Find existing data for this color
        const existing = existingColorMedia.find((cm) => cm.metalColorId === metalColor.id)

        // Create gemstoneSubMedia for ALL gemstone colors (if product has gemstones)
        let gemstoneSubMedia: EditGemstoneSubMedia[] = []
        if (hasGemstoneColors && optionConfig.gemstoneColors) {
          gemstoneSubMedia = optionConfig.gemstoneColors.map((gemstoneColor) => {
            const existingGem = existing?.gemstoneSubMedia?.find(
              (gsm) => gsm.gemstoneColorId === gemstoneColor.id
            )
            return {
              gemstoneColorId: gemstoneColor.id,
              gemstoneColorSlug: gemstoneColor.slug,
              items: existingGem?.items || [],
            }
          })
        }

        return {
          metalColorId: metalColor.id,
          colorSlug: metalColor.slug,
          items: existing?.items || [],
          gemstoneSubMedia,
        }
      })

      setColorMedia(initialColorMedia)

      // Set initial active tab
      if (optionConfig.metalColors.length > 0) {
        setActiveMetalColorTab(optionConfig.metalColors[0].id)

        // Set initial gemstone tabs for each metal color
        if (hasGemstoneColors && optionConfig.gemstoneColors) {
          const initialGemTabs: Record<string, string> = {}
          optionConfig.metalColors.forEach((mc) => {
            initialGemTabs[mc.id] = "main"
          })
          setActiveGemstoneTab(initialGemTabs)
        }
      }
    }
  }, [open, product, optionConfig, hasGemstoneColors])

  // Get current items based on active tabs
  const getCurrentItems = (metalColorId: string, gemstoneColorId: string | null): EditMediaItem[] => {
    const colorEntry = colorMedia.find((cm) => cm.metalColorId === metalColorId)
    if (!colorEntry) return []

    if (gemstoneColorId === null || gemstoneColorId === "main") {
      return colorEntry.items
    }

    const gemstoneEntry = colorEntry.gemstoneSubMedia.find(
      (gsm) => gsm.gemstoneColorId === gemstoneColorId
    )
    return gemstoneEntry?.items || []
  }

  // Update items for a specific metal/gemstone combination
  const updateItems = (
    metalColorId: string,
    gemstoneColorId: string | null,
    newItems: EditMediaItem[]
  ) => {
    setColorMedia((prev) =>
      prev.map((cm) => {
        if (cm.metalColorId !== metalColorId) return cm

        if (gemstoneColorId === null || gemstoneColorId === "main") {
          return { ...cm, items: newItems }
        }

        return {
          ...cm,
          gemstoneSubMedia: cm.gemstoneSubMedia.map((gsm) =>
            gsm.gemstoneColorId === gemstoneColorId ? { ...gsm, items: newItems } : gsm
          ),
        }
      })
    )
  }

  // Handle files selected from file input
  const handleFilesSelected = (
    metalColorId: string,
    gemstoneColorId: string | null,
    files: FileList
  ) => {
    const currentItems = getCurrentItems(metalColorId, gemstoneColorId)
    const startPos = currentItems.length > 0
      ? Math.max(...currentItems.map((item) => item.position)) + 1
      : 0

    const newItems: EditMediaItem[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileKey = generateFileKey()
      newItems.push({
        id: generateMediaId(),
        path: "",
        type: getMediaType(file.name),
        altText: null,
        position: startPos + i,
        fileKey,
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }

    updateItems(metalColorId, gemstoneColorId, [...currentItems, ...newItems])
  }

  // Handle remove media
  const handleRemove = (
    metalColorId: string,
    gemstoneColorId: string | null,
    itemId: string
  ) => {
    const currentItems = getCurrentItems(metalColorId, gemstoneColorId)

    // Revoke blob URL if it's a local preview
    const item = currentItems.find((i) => i.id === itemId)
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl)
    }

    const filteredItems = currentItems
      .filter((item) => item.id !== itemId)
      .map((item, index) => ({ ...item, position: index })) // Reindex positions

    updateItems(metalColorId, gemstoneColorId, filteredItems)
  }

  // Handle position change
  const handlePositionChange = (
    metalColorId: string,
    gemstoneColorId: string | null,
    itemId: string,
    newPosition: number
  ) => {
    const currentItems = getCurrentItems(metalColorId, gemstoneColorId)
    const updatedItems = currentItems.map((item) =>
      item.id === itemId ? { ...item, position: newPosition } : item
    )
    updateItems(metalColorId, gemstoneColorId, updatedItems)
  }

  // Handle alt text change
  const handleAltTextChange = (
    metalColorId: string,
    gemstoneColorId: string | null,
    itemId: string,
    altText: string
  ) => {
    const currentItems = getCurrentItems(metalColorId, gemstoneColorId)
    const updatedItems = currentItems.map((item) =>
      item.id === itemId ? { ...item, altText: altText || null } : item
    )
    updateItems(metalColorId, gemstoneColorId, updatedItems)
  }

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Build the data payload — existing items have path, new items have fileKey
      const sortedColorMedia = colorMedia.map((cm) => ({
        metalColorId: cm.metalColorId,
        colorSlug: cm.colorSlug || "",
        items: [...cm.items]
          .sort((a, b) => a.position - b.position)
          .map((item) => ({
            ...(item.fileKey
              ? { fileKey: item.fileKey }
              : { id: item.id, path: item.path }),
            type: item.type,
            altText: item.altText,
            position: item.position,
          })),
        gemstoneSubMedia: cm.gemstoneSubMedia.map((gsm) => ({
          gemstoneColorId: gsm.gemstoneColorId,
          gemstoneColorSlug: gsm.gemstoneColorSlug || "",
          items: [...gsm.items]
            .sort((a, b) => a.position - b.position)
            .map((item) => ({
              ...(item.fileKey
                ? { fileKey: item.fileKey }
                : { id: item.id, path: item.path }),
              type: item.type,
              altText: item.altText,
              position: item.position,
            })),
        })),
      }))

      // Build FormData
      const formData = new FormData()
      formData.append("data", JSON.stringify({ colorMedia: sortedColorMedia }))

      // Collect all new files
      for (const cm of colorMedia) {
        for (const item of cm.items) {
          if (item.fileKey && item.file) {
            formData.append(item.fileKey, item.file)
          }
        }
        for (const gsm of cm.gemstoneSubMedia) {
          for (const item of gsm.items) {
            if (item.fileKey && item.file) {
              formData.append(item.fileKey, item.file)
            }
          }
        }
      }

      const response = await productService.updateMedia(product.id, formData)
      toast.success(response.message)
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Something went wrong"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get display URL for a media item (blob preview for new, CDN for existing)
  const getItemUrl = (item: EditMediaItem): string => {
    if (item.previewUrl) return item.previewUrl
    if (item.path) return getCdnUrl(item.path)
    return ""
  }

  // Render media grid for a specific metal/gemstone combination
  const renderMediaGrid = (metalColorId: string, gemstoneColorId: string | null) => {
    const items = getCurrentItems(metalColorId, gemstoneColorId)
    const sortedItems = [...items].sort((a, b) => a.position - b.position)
    const inputId = `edit-file-input-${metalColorId}-${gemstoneColorId || "main"}`

    return (
      <div className="space-y-4">
        {/* Upload Button */}
        <label
          htmlFor={inputId}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload Images
        </label>
        <input
          id={inputId}
          type="file"
          multiple
          accept="image/*,video/mp4"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFilesSelected(metalColorId, gemstoneColorId, e.target.files)
            }
            e.target.value = ""
          }}
        />

        {/* Media Items */}
        {sortedItems.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/50">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No media added</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedItems.map((item) => {
              const itemUrl = getItemUrl(item)
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 border rounded-lg bg-background"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 shrink-0 rounded-md border bg-muted overflow-hidden">
                    {itemUrl ? (
                      item.type === "video" ? (
                        <video
                          src={itemUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={itemUrl}
                          alt={item.altText || "Product image"}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Fields */}
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-4">
                      {/* Position */}
                      <div className="w-20">
                        <Label className="text-xs text-muted-foreground">Position</Label>
                        <Input
                          type="number"
                          min={0}
                          value={item.position}
                          onChange={(e) =>
                            handlePositionChange(
                              metalColorId,
                              gemstoneColorId,
                              item.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="h-8"
                        />
                      </div>

                      {/* Alt Text */}
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Alt Text</Label>
                        <Input
                          type="text"
                          value={item.altText || ""}
                          onChange={(e) =>
                            handleAltTextChange(
                              metalColorId,
                              gemstoneColorId,
                              item.id,
                              e.target.value
                            )
                          }
                          placeholder="Image description"
                          className="h-8"
                        />
                      </div>
                    </div>

                    {/* Path or "New upload" indicator */}
                    <p className="text-xs text-muted-foreground truncate" title={item.path || "New upload"}>
                      {item.fileKey ? "New upload" : item.path}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => handleRemove(metalColorId, gemstoneColorId, item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Render content for a metal color tab
  const renderMetalColorContent = (metalColorId: string) => {
    if (!hasGemstoneColors || !optionConfig?.gemstoneColors) {
      // No gemstones - render media grid directly
      return renderMediaGrid(metalColorId, null)
    }

    // Has gemstones - render nested tabs
    const currentGemTab = activeGemstoneTab[metalColorId] || "main"

    return (
      <Tabs
        value={currentGemTab}
        onValueChange={(value) =>
          setActiveGemstoneTab((prev) => ({ ...prev, [metalColorId]: value }))
        }
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="main">Main</TabsTrigger>
          {optionConfig.gemstoneColors.map((gc) => (
            <TabsTrigger key={gc.id} value={gc.id}>
              {gc.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="main">
          {renderMediaGrid(metalColorId, "main")}
        </TabsContent>

        {optionConfig.gemstoneColors.map((gc) => (
          <TabsContent key={gc.id} value={gc.id}>
            {renderMediaGrid(metalColorId, gc.id)}
          </TabsContent>
        ))}
      </Tabs>
    )
  }

  if (!optionConfig || optionConfig.metalColors.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-xl flex flex-col p-0">
          <SheetHeader className="text-left px-6 py-4 border-b">
            <SheetTitle>Edit Media</SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">No metal colors configured for this product.</p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="sm:max-w-2xl flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Media</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Manage product images for each color variation
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Tabs
            value={activeMetalColorTab}
            onValueChange={setActiveMetalColorTab}
            className="w-full"
          >
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              {optionConfig.metalColors.map((mc) => (
                <TabsTrigger key={mc.id} value={mc.id}>
                  {mc.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {optionConfig.metalColors.map((mc) => (
              <TabsContent key={mc.id} value={mc.id}>
                {renderMetalColorContent(mc.id)}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
