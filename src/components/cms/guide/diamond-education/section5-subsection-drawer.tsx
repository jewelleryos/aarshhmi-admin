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
import { Loader2, Layers } from 'lucide-react'
import { MediaPickerInput } from '@/components/media'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import type { DiamondEducationSection5SubSection } from '@/components/cms/services/cmsService'

interface Section5SubSectionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: DiamondEducationSection5SubSection | null
  onSave: (
    item:
      | Omit<DiamondEducationSection5SubSection, 'id'>
      | DiamondEducationSection5SubSection
  ) => Promise<void>
}

export function Section5SubSectionDrawer({
  open,
  onOpenChange,
  item,
  onSave,
}: Section5SubSectionDrawerProps) {
  const isEditMode = item !== null

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [mobileImageUrl, setMobileImageUrl] = useState('')
  const [imageAltText, setImageAltText] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    title?: string
    redirect_url?: string
  }>({})

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setImageUrl('')
    setMobileImageUrl('')
    setImageAltText('')
    setRedirectUrl('')
    setErrors({})
  }

  useEffect(() => {
    if (open) {
      if (item) {
        setTitle(item.title)
        setDescription(item.description)
        setImageUrl(item.image_url)
        setMobileImageUrl(item.mobile_image_url)
        setImageAltText(item.image_alt_text)
        setRedirectUrl(item.redirect_url || '')
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
    const newErrors: { title?: string; redirect_url?: string } = {}
    if (!title.trim()) {
      newErrors.title = 'Title is required'
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
          title: title.trim(),
          description,
          image_url: imageUrl,
          mobile_image_url: mobileImageUrl,
          image_alt_text: imageAltText,
          redirect_url: redirectUrl || undefined,
        })
      } else {
        await onSave({
          title: title.trim(),
          description,
          image_url: imageUrl,
          mobile_image_url: mobileImageUrl,
          image_alt_text: imageAltText,
          redirect_url: redirectUrl || undefined,
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
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>{isEditMode ? 'Edit Sub-section' : 'Add Sub-section'}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? 'Update the section 5 sub-section'
                  : 'Add a new sub-section to section 6'}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="s5sub_title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="s5sub_title"
              placeholder="Enter sub-section title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, title: undefined }))
              }}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Write the sub-section description here..."
              mediaRootPath="cms/guide/diamond-education/section6"
            />
          </div>

          {/* Image URL */}
          <MediaPickerInput
            label="Image"
            value={imageUrl || null}
            onChange={(path) => setImageUrl(path || '')}
            rootPath="cms/guide/diamond-education/section6"
          />

          {/* Mobile Image URL */}
          <MediaPickerInput
            label="Mobile Image"
            value={mobileImageUrl || null}
            onChange={(path) => setMobileImageUrl(path || '')}
            rootPath="cms/guide/diamond-education/section5/mobile"
          />

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="s5sub_image_alt_text">Image Alt Text</Label>
            <Input
              id="s5sub_image_alt_text"
              placeholder="Describe the image"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
            />
          </div>

          {/* Redirect URL */}
          <div className="space-y-2">
            <Label htmlFor="s5sub_redirect_url">Redirect URL</Label>
            <Input
              id="s5sub_redirect_url"
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
              'Add Sub-section'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
