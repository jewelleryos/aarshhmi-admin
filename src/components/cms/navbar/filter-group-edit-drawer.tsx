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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Layers, Loader2 } from 'lucide-react'
import type { FilterGroup } from '../services/cmsService'

interface FilterGroupEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: FilterGroup | null
  onSave: (group: FilterGroup) => Promise<void>
}

export function FilterGroupEditDrawer({
  open,
  onOpenChange,
  group,
  onSave,
}: FilterGroupEditDrawerProps) {
  const [name, setName] = useState('')
  const [rank, setRank] = useState(0)
  const [imageType, setImageType] = useState('box')

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string }>({})

  useEffect(() => {
    if (group) {
      setName(group.name || '')
      setRank(group.rank || 0)
      setImageType(group.imageType || 'box')
      setErrors({})
    }
  }, [group])

  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  const handleSubmit = async () => {
    if (!group) return

    const newErrors: { name?: string } = {}
    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await onSave({ ...group, name, rank, imageType })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="sm:max-w-md flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Filter Group</SheetTitle>
              <p className="text-sm text-muted-foreground">Update filter group details</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit_fg_name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit_fg_name"
              placeholder="e.g. Category"
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

          <div className="space-y-2">
            <Label htmlFor="edit_fg_rank">Display Order</Label>
            <Input
              id="edit_fg_rank"
              type="number"
              min={0}
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">Lower numbers display first</p>
          </div>

          {/* Image Type */}
          <div className="space-y-2">
            <Label>Image Type</Label>
            <Select value={imageType} onValueChange={setImageType}>
              <SelectTrigger>
                <SelectValue placeholder="Select image type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="box">Box</SelectItem>
                <SelectItem value="capsule">Capsule</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How child item images are displayed in the mega menu
            </p>
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
