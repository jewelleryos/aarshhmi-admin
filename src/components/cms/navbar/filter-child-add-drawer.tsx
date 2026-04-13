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
import { Tag, Loader2 } from 'lucide-react'
import { MediaPickerInput } from '@/components/media'
import type { FilterChild } from '../services/cmsService'

interface FilterChildAddDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
  onSave: (child: Omit<FilterChild, 'id'>) => Promise<void>
}

export function FilterChildAddDrawer({
  open,
  onOpenChange,
  groupName,
  onSave,
}: FilterChildAddDrawerProps) {
  const [name, setName] = useState('')
  const [redirectLink, setRedirectLink] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [mobileViewImageUrl, setMobileViewImageUrl] = useState('')
  const [imageAltText, setImageAltText] = useState('')
  const [rank, setRank] = useState(0)

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; redirectLink?: string }>({})

  const resetForm = () => {
    setName('')
    setRedirectLink('')
    setImageUrl('')
    setMobileViewImageUrl('')
    setImageAltText('')
    setRank(0)
    setErrors({})
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    if (!isOpen) resetForm()
    onOpenChange(isOpen)
  }

  const handleSubmit = async () => {
    const newErrors: { name?: string; redirectLink?: string } = {}
    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (redirectLink && !redirectLink.startsWith('https://')) {
      newErrors.redirectLink = 'Link must start with https://'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await onSave({ name, redirectLink, imageUrl, mobileViewImageUrl, imageAltText, rank })
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
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Add Item</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Add a new item to &quot;{groupName}&quot;
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="fc_name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fc_name"
              placeholder="e.g. Halo Ring"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, name: undefined }))
              }}
            />
            {errors.name && (
              <p className="text-sm text-destructive pl-1.25">{errors.name}</p>
            )}
          </div>

          {/* Redirect Link */}
          <div className="space-y-2">
            <Label htmlFor="fc_redirectLink">Redirect Link</Label>
            <Input
              id="fc_redirectLink"
              placeholder="https://aarshmi.com/rings/halo-ring"
              value={redirectLink}
              onChange={(e) => {
                setRedirectLink(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, redirectLink: undefined }))
              }}
            />
            {errors.redirectLink ? (
              <p className="text-sm text-destructive pl-1.25">{errors.redirectLink}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Full URL with https (e.g., https://aarshmi.com/rings/halo-ring)
              </p>
            )}
          </div>

          {/* Image */}
          <MediaPickerInput
            label="Image"
            value={imageUrl || null}
            onChange={(path) => setImageUrl(path || '')}
            rootPath="cms/navbar"
          />

          {/* Mobile View Image */}
          <MediaPickerInput
            label="Mobile View Image"
            value={mobileViewImageUrl || null}
            onChange={(path) => setMobileViewImageUrl(path || '')}
            rootPath="cms/navbar/mobile"
          />

          {/* Image Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="fc_imageAltText">Image Alt Text</Label>
            <Input
              id="fc_imageAltText"
              placeholder="Describe the image"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
            />
          </div>

          {/* Rank */}
          <div className="space-y-2">
            <Label htmlFor="fc_rank">Display Order</Label>
            <Input
              id="fc_rank"
              type="number"
              min={0}
              placeholder="0"
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">Lower numbers display first</p>
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
          <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Item'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
