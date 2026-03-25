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
import { Navigation, Loader2 } from 'lucide-react'
import type { NavItem } from '../services/cmsService'

interface NavbarAddDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: Omit<NavItem, 'id'>) => Promise<void>
}

export function NavbarAddDrawer({
  open,
  onOpenChange,
  onSave,
}: NavbarAddDrawerProps) {
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [rank, setRank] = useState(0)
  const [status, setStatus] = useState(true)
  const [isMegaMenu, setIsMegaMenu] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; link?: string }>({})

  const resetForm = () => {
    setName('')
    setLink('')
    setRank(0)
    setStatus(true)
    setIsMegaMenu(false)
    setErrors({})
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    if (!isOpen) resetForm()
    onOpenChange(isOpen)
  }

  const handleSubmit = async () => {
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
        name,
        link,
        rank,
        status,
        isMegaMenu,
        megaMenuData: isMegaMenu
          ? {
              filterData: [],
              rightSideBanner: { imageUrl: '', imageAltText: '', mainText: '' },
            }
          : null,
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
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Navigation className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Add Nav Link</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Add a new navigation item to the navbar
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
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
            <Label htmlFor="link">
              Link <span className="text-destructive">*</span>
            </Label>
            <Input
              id="link"
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
            <Label htmlFor="rank">Display Order</Label>
            <Input
              id="rank"
              type="number"
              min={0}
              placeholder="0"
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">Lower numbers display first</p>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="status"
              checked={status}
              onCheckedChange={(checked) => setStatus(checked === true)}
            />
            <Label htmlFor="status" className="cursor-pointer">Active</Label>
          </div>

          {/* Is Mega Menu */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMegaMenu"
              checked={isMegaMenu}
              onCheckedChange={(checked) => setIsMegaMenu(checked === true)}
            />
            <Label htmlFor="isMegaMenu" className="cursor-pointer">Enable Mega Menu</Label>
          </div>

          {isMegaMenu && (
            <p className="text-xs text-muted-foreground rounded-md bg-muted/50 p-3">
              Mega menu content (filter groups, banners, etc.) can be configured after creating the nav link by clicking &quot;Manage&quot; in the table actions.
            </p>
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
                Creating...
              </>
            ) : (
              'Create Nav Link'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
