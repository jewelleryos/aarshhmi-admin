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
import { ImageIcon, Loader2 } from 'lucide-react'
import { MediaPickerInput } from '@/components/media'
import type { MetalGuideSection1Item } from '@/components/cms/services/cmsService'

interface Section1DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: MetalGuideSection1Item | null
  onSave: (
    item: Omit<MetalGuideSection1Item, 'id'> | MetalGuideSection1Item
  ) => Promise<void>
}

export function Section1Drawer({ open, onOpenChange, item, onSave }: Section1DrawerProps) {
  const isEditMode = item !== null

  const [imageUrl, setImageUrl] = useState('')
  const [mobileImageUrl, setMobileImageUrl] = useState('')
  const [imageAltText, setImageAltText] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [rank, setRank] = useState(0)

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    image_url?: string
    redirect_url?: string
  }>({})

  const resetForm = () => {
    setImageUrl('')
    setMobileImageUrl('')
    setImageAltText('')
    setRedirectUrl('')
    setRank(0)
    setErrors({})
  }

  useEffect(() => {
    if (open) {
      if (item) {
        setImageUrl(item.image_url)
        setMobileImageUrl(item.mobile_image_url)
        setImageAltText(item.image_alt_text)
        setRedirectUrl(item.redirect_url)
        setRank(item.rank)
        setErrors({})
      } else {
        resetForm()
      }
    }
  }, [open, item])

  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async () => {
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
      if (isEditMode) {
        await onSave({
          id: item.id,
          image_url: imageUrl,
          mobile_image_url: mobileImageUrl,
          image_alt_text: imageAltText,
          redirect_url: redirectUrl,
          rank,
        })
      } else {
        await onSave({
          image_url: imageUrl,
          mobile_image_url: mobileImageUrl,
          image_alt_text: imageAltText,
          redirect_url: redirectUrl,
          rank,
        })
      }
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
              <SheetTitle>{isEditMode ? 'Edit Item' : 'Add Item'}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? 'Update the metal guide section 1 image item'
                  : 'Add a new image item to metal guide section 1'}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Image URL */}
          <MediaPickerInput
            label="Image"
            value={imageUrl || null}
            onChange={(path) => {
              setImageUrl(path || '')
              if (path) setErrors((prev) => ({ ...prev, image_url: undefined }))
            }}
            rootPath="cms/guide/metal-guide/section1"
            required
            error={errors.image_url}
          />

          {/* Mobile Image URL */}
          <MediaPickerInput
            label="Mobile Image"
            value={mobileImageUrl || null}
            onChange={(path) => setMobileImageUrl(path || '')}
            rootPath="cms/guide/metal-guide/section1/mobile"
          />

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="s1_image_alt_text">Image Alt Text</Label>
            <Input
              id="s1_image_alt_text"
              placeholder="Describe the image"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
            />
          </div>

          {/* Redirect URL */}
          <div className="space-y-2">
            <Label htmlFor="s1_redirect_url">Redirect URL</Label>
            <Input
              id="s1_redirect_url"
              placeholder="https://example.com/page"
              value={redirectUrl}
              onChange={(e) => {
                setRedirectUrl(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, redirect_url: undefined }))
              }}
            />
            {errors.redirect_url ? (
              <p className="text-sm text-destructive">{errors.redirect_url}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Full URL with https (e.g., https://example.com/page)
              </p>
            )}
          </div>

          {/* Rank */}
          <div className="space-y-2">
            <Label htmlFor="s1_rank">Rank</Label>
            <Input
              id="s1_rank"
              type="number"
              min={0}
              placeholder="0"
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">Lower numbers display first</p>
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
          <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditMode ? (
              'Save Changes'
            ) : (
              'Add Item'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
