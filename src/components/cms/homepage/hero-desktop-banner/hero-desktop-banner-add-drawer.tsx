'use client'

import { useState } from 'react'
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

interface HeroDesktopBannerAddDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (banner: Omit<HeroDesktopBannerItem, 'id'>) => Promise<void>
}

export function HeroDesktopBannerAddDrawer({
  open,
  onOpenChange,
  onSave,
}: HeroDesktopBannerAddDrawerProps) {
  // Form state
  const [imageUrl, setImageUrl] = useState('')
  const [imageAltText, setImageAltText] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [rank, setRank] = useState(0)
  const [status, setStatus] = useState(true)

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ image_url?: string; redirect_url?: string }>({})

  // Reset form
  const resetForm = () => {
    setImageUrl('')
    setImageAltText('')
    setRedirectUrl('')
    setRank(0)
    setStatus(true)
    setErrors({})
  }

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  // Handle form submission
  const handleSubmit = async () => {
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
        image_url: imageUrl,
        image_alt_text: imageAltText,
        redirect_url: redirectUrl,
        rank,
        status,
      })
      resetForm()
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
              <SheetTitle>Add Banner</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Add a new hero banner for the homepage
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
            <Label htmlFor="image_alt_text">Image Alt Text</Label>
            <Input
              id="image_alt_text"
              placeholder="Describe the banner image"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
            />
          </div>

          {/* Redirect URL Field */}
          <div className="space-y-2">
            <Label htmlFor="redirect_url">
              Redirect URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="redirect_url"
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
            <Label htmlFor="rank">Display Order</Label>
            <Input
              id="rank"
              type="number"
              min={0}
              placeholder="0"
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
              id="status"
              checked={status}
              onCheckedChange={(checked) => setStatus(checked === true)}
            />
            <Label htmlFor="status" className="cursor-pointer">
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
                Creating...
              </>
            ) : (
              "Create Banner"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
