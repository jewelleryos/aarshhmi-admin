'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageIcon, Loader2 } from 'lucide-react'
import { MediaPickerInput } from '@/components/media'
import type { HeroDesktopBannerItem } from '@/redux/services/cmsService'

interface HeroDesktopBannerEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  banner: HeroDesktopBannerItem | null
  onSave: (banner: HeroDesktopBannerItem) => Promise<void>
}

export function HeroDesktopBannerEditDrawer({
  open,
  onOpenChange,
  banner,
  onSave,
}: HeroDesktopBannerEditDrawerProps) {
  // Form state
  const [imageUrl, setImageUrl] = useState('')
  const [imageAltText, setImageAltText] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [rank, setRank] = useState(0)
  const [status, setStatus] = useState(true)

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ image_url?: string; redirect_url?: string }>({})

  // Populate form when banner changes
  useEffect(() => {
    if (banner) {
      setImageUrl(banner.image_url || '')
      setImageAltText(banner.image_alt_text || '')
      setRedirectUrl(banner.redirect_url || '')
      setRank(banner.rank || 0)
      setStatus(banner.status ?? true)
      setErrors({})
    }
  }, [banner])

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!banner) return

    // Validate
    const newErrors: { image_url?: string; redirect_url?: string } = {}
    if (!imageUrl) {
      newErrors.image_url = 'Image is required'
    }
    if (!redirectUrl) {
      newErrors.redirect_url = 'Redirect URL is required'
    } else if (!/^https?:\/\/.+/.test(redirectUrl)) {
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
        id: banner.id,
        image_url: imageUrl,
        image_alt_text: imageAltText,
        redirect_url: redirectUrl,
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
        {/* Header */}
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Banner</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update hero banner details
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Image Field */}
          <MediaPickerInput
            label="Banner Image"
            value={imageUrl || null}
            onChange={(path) => {
              setImageUrl(path || '')
              if (path) setErrors((prev) => ({ ...prev, image_url: undefined }))
            }}
            rootPath="cms/homepage/hero-desktop-banner"
            required
            error={errors.image_url}
          />

          {/* Alt Text Field */}
          <div className="space-y-2">
            <Label htmlFor="edit_image_alt_text">Image Alt Text</Label>
            <Input
              id="edit_image_alt_text"
              placeholder="Describe the banner image"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
            />
          </div>

          {/* Redirect URL Field */}
          <div className="space-y-2">
            <Label htmlFor="edit_redirect_url">
              Redirect URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit_redirect_url"
              placeholder="https://example.com/collections/summer-sale"
              value={redirectUrl}
              onChange={(e) => {
                setRedirectUrl(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, redirect_url: undefined }))
              }}
            />
            {errors.redirect_url ? (
              <p className="text-sm text-destructive pl-1.25">{errors.redirect_url}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Full URL with https (e.g., https://example.com/page)
              </p>
            )}
          </div>

          {/* Rank Field */}
          <div className="space-y-2">
            <Label htmlFor="edit_rank">Display Order</Label>
            <Input
              id="edit_rank"
              type="number"
              min={0}
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers display first
            </p>
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit_status"
              checked={status}
              onCheckedChange={(checked) => setStatus(checked === true)}
            />
            <Label htmlFor="edit_status" className="cursor-pointer">
              Active
            </Label>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
