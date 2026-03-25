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
import { Navigation, Loader2 } from 'lucide-react'
import { MediaPickerInput } from '@/components/media'
import type { NavItem, RightSideBanner } from '../services/cmsService'

interface NavbarEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: NavItem | null
  onSave: (item: NavItem) => Promise<void>
}

const emptyRightSideBanner: RightSideBanner = {
  imageUrl: '',
  imageAltText: '',
  mainText: '',
}

export function NavbarEditDrawer({
  open,
  onOpenChange,
  item,
  onSave,
}: NavbarEditDrawerProps) {
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [rank, setRank] = useState(0)
  const [status, setStatus] = useState(true)
  const [isMegaMenu, setIsMegaMenu] = useState(false)

  // Mega menu settings
  const [rightSideBanner, setRightSideBanner] = useState<RightSideBanner>({ ...emptyRightSideBanner })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; link?: string }>({})

  useEffect(() => {
    if (item) {
      setName(item.name || '')
      setLink(item.link || '')
      setRank(item.rank || 0)
      setStatus(item.status ?? true)
      setIsMegaMenu(item.isMegaMenu ?? false)
      setRightSideBanner(item.megaMenuData?.rightSideBanner || { ...emptyRightSideBanner })
      setErrors({})
    }
  }, [item])

  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  const handleSubmit = async () => {
    if (!item) return

    const newErrors: { name?: string; link?: string } = {}
    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!link.trim()) {
      newErrors.link = 'Link is required'
    } else if (!link.startsWith('https://')) {
      newErrors.link = 'Link must start with https://'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await onSave({
        id: item.id,
        name,
        link,
        rank,
        status,
        isMegaMenu,
        megaMenuData: isMegaMenu
          ? {
              filterData: item.megaMenuData?.filterData || [],
              rightSideBanner,
            }
          : null,
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
              <Navigation className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Nav Link</SheetTitle>
              <p className="text-sm text-muted-foreground">Update navigation item details</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit_name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit_name"
              placeholder="e.g. Rings"
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

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="edit_link">
              Link <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit_link"
              placeholder="https://aarshmi.com/rings"
              value={link}
              onChange={(e) => {
                setLink(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, link: undefined }))
              }}
            />
            {errors.link ? (
              <p className="text-sm text-destructive pl-1.25">{errors.link}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Full URL with https (e.g., https://aarshmi.com/rings)
              </p>
            )}
          </div>

          {/* Rank */}
          <div className="space-y-2">
            <Label htmlFor="edit_rank">Display Order</Label>
            <Input
              id="edit_rank"
              type="number"
              min={0}
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">Lower numbers display first</p>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit_status"
              checked={status}
              onCheckedChange={(checked) => setStatus(checked === true)}
            />
            <Label htmlFor="edit_status" className="cursor-pointer">Active</Label>
          </div>

          {/* Is Mega Menu */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit_isMegaMenu"
              checked={isMegaMenu}
              onCheckedChange={(checked) => setIsMegaMenu(checked === true)}
            />
            <Label htmlFor="edit_isMegaMenu" className="cursor-pointer">Enable Mega Menu</Label>
          </div>

          {/* Mega Menu Settings */}
          {isMegaMenu && (
            <div className="space-y-6 rounded-lg border p-4">
              <h3 className="text-base font-semibold">Mega Menu Settings</h3>

              {/* Right Side Banner */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Right Side Banner</h4>
                <MediaPickerInput
                  label="Banner Image"
                  value={rightSideBanner.imageUrl || null}
                  onChange={(path) =>
                    setRightSideBanner((prev) => ({ ...prev, imageUrl: path || '' }))
                  }
                  rootPath="cms/navbar"
                />
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Image Alt Text</Label>
                  <Input
                    placeholder="Describe the banner image"
                    value={rightSideBanner.imageAltText}
                    onChange={(e) =>
                      setRightSideBanner((prev) => ({ ...prev, imageAltText: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Main Text</Label>
                  <Input
                    placeholder="e.g. Find Your Ring. Find Your Style."
                    value={rightSideBanner.mainText}
                    onChange={(e) =>
                      setRightSideBanner((prev) => ({ ...prev, mainText: e.target.value }))
                    }
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground rounded-md bg-muted/50 p-3">
                Filter groups and their items can be managed from the table actions &rarr; &quot;Manage Mega Menu&quot;.
              </p>
            </div>
          )}
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
