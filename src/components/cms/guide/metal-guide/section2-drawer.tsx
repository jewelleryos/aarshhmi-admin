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
import { Loader2, AlignLeft } from 'lucide-react'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import type { MetalGuideSection2Item } from '@/components/cms/services/cmsService'

interface Section2DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: MetalGuideSection2Item | null
  onSave: (
    item: Omit<MetalGuideSection2Item, 'id'> | MetalGuideSection2Item
  ) => Promise<void>
}

export function Section2Drawer({ open, onOpenChange, item, onSave }: Section2DrawerProps) {
  const isEditMode = item !== null

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ title?: string }>({})

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setErrors({})
  }

  useEffect(() => {
    if (open) {
      if (item) {
        setTitle(item.title)
        setDescription(item.description)
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
    const newErrors: { title?: string } = {}
    if (!title.trim()) {
      newErrors.title = 'Title is required'
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
        })
      } else {
        await onSave({
          title: title.trim(),
          description,
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
              <AlignLeft className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>{isEditMode ? 'Edit Item' : 'Add Item'}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? 'Update the metal guide section 2 text item'
                  : 'Add a new text item to metal guide section 2'}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="s2_title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="s2_title"
              placeholder="Enter item title"
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
              placeholder="Write the item description here..."
              mediaRootPath="cms/guide/metal-guide/section2"
            />
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
