'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { MediaPickerInput } from '@/components/media'
import { ImageIcon, Loader2 } from 'lucide-react'
import { type PromotionalBannerItem } from '../../services/cmsService'

interface MoreFromTheCollectionEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: PromotionalBannerItem | null
  onSave: (item: PromotionalBannerItem) => Promise<void>
}

export function MoreFromTheCollectionEditDrawer({
  open,
  onOpenChange,
  item,
  onSave,
}: MoreFromTheCollectionEditDrawerProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [mobileViewImageUrl, setMobileViewImageUrl] = useState('')
  const [imageAltText, setImageAltText] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [rank, setRank] = useState(0)
  const [status, setStatus] = useState(true)

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ image_url?: string; redirect_url?: string }>({})

  useEffect(() => {
    if (item) {
      setImageUrl(item.image_url)
      setMobileViewImageUrl(item.mobile_view_image_url || '')
      setImageAltText(item.image_alt_text)
      setRedirectUrl(item.redirect_url || '')
      setRank(item.rank)
      setStatus(item.status)
      setErrors({})
    }
  }, [item])

  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  const handleSave = async () => {
    if (!item) return

    const newErrors: { image_url?: string; redirect_url?: string } = {}
    if (!imageUrl) {
      newErrors.image_url = 'Image is required'
    }
    if (redirectUrl && !/^https?:\/\/.+/.test(redirectUrl)) {
      newErrors.redirect_url = 'Must be a valid URL starting with http:// or https://'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await onSave({
        ...item,
        image_url: imageUrl,
        mobile_view_image_url: mobileViewImageUrl,
        image_alt_text: imageAltText,
        redirect_url: redirectUrl || undefined,
        rank,
        status,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="sm:max-w-xl flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Item</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update More From The Collection item
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <MediaPickerInput
            label="Item Image"
            value={imageUrl || null}
            onChange={(path) => {
              setImageUrl(path || '')
              if (path) setErrors((prev) => ({ ...prev, image_url: undefined }))
            }}
            rootPath="cms/product-description-page/more-from-the-collection"
            required
            error={errors.image_url}
          />

          <MediaPickerInput
            label="Mobile View Image"
            value={mobileViewImageUrl || null}
            onChange={(path) => setMobileViewImageUrl(path || '')}
            rootPath="cms/product-description-page/more-from-the-collection/mobile"
          />

          <div className="space-y-2">
            <Label htmlFor="mftc-edit-altText">Image Alt Text</Label>
            <Input
              id="mftc-edit-altText"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
              placeholder="Describe the image"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mftc-edit-redirectUrl">Redirect URL</Label>
            <Input
              id="mftc-edit-redirectUrl"
              value={redirectUrl}
              onChange={(e) => {
                setRedirectUrl(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, redirect_url: undefined }))
              }}
              placeholder="https://example.com/collections/..."
            />
            {errors.redirect_url ? (
              <p className="text-sm text-destructive">{errors.redirect_url}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Full URL with https (e.g., https://example.com/page)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mftc-edit-rank">Display Order</Label>
            <Input
              id="mftc-edit-rank"
              type="number"
              min={0}
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">Lower numbers display first</p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="mftc-edit-status"
              checked={status}
              onCheckedChange={(checked) => setStatus(checked === true)}
            />
            <Label htmlFor="mftc-edit-status" className="cursor-pointer">Active</Label>
          </div>
        </div>

        <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
