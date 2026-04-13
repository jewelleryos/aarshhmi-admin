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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react'
import { MediaPickerInput } from '@/components/media'
import { toast } from 'sonner'
import { cmsService, type MuseItem, type SparkleItem, type ProductForSelection } from '@/components/cms/services/cmsService'

interface MuseEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: MuseItem | null
  onSave: (item: MuseItem) => Promise<void>
}

const defaultSparkle = (): SparkleItem => ({
  product_sku: '',
  x_coordinate: 50,
  y_coordinate: 50,
  is_active: true,
})

export function MuseEditDrawer({ open, onOpenChange, item, onSave }: MuseEditDrawerProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [mobileViewImageUrl, setMobileViewImageUrl] = useState('')
  const [imageAltText, setImageAltText] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [rank, setRank] = useState(0)
  const [status, setStatus] = useState(true)
  const [sparkle, setSparkle] = useState<SparkleItem[]>([])

  const [allProducts, setAllProducts] = useState<ProductForSelection[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ image_url?: string; redirect_url?: string }>({})

  useEffect(() => {
    if (item) {
      setImageUrl(item.image_url || '')
      setMobileViewImageUrl(item.mobile_view_image_url || '')
      setImageAltText(item.image_alt_text || '')
      setRedirectUrl(item.redirect_url || '')
      setRank(item.rank || 0)
      setStatus(item.status ?? true)
      setSparkle(item.sparkle || [])
      setErrors({})
    }
  }, [item])

  useEffect(() => {
    if (open) {
      fetchAllProducts()
    }
  }, [open])

  const fetchAllProducts = async () => {
    try {
      setIsLoadingProducts(true)
      const response = await cmsService.getProductsForSelection()
      setAllProducts(response.data?.items || [])
    } catch {
      toast.error('Failed to fetch products')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  const handleAddSparkle = () => {
    setSparkle((prev) => [...prev, defaultSparkle()])
  }

  const handleRemoveSparkle = (index: number) => {
    setSparkle((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSparkleChange = (index: number, field: keyof SparkleItem, value: string | number | boolean) => {
    setSparkle((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  const handleSubmit = async () => {
    if (!item) return

    const newErrors: typeof errors = {}
    if (!imageUrl) newErrors.image_url = 'Image is required'
    if (!redirectUrl) {
      newErrors.redirect_url = 'Redirect URL is required'
    } else if (!/^https?:\/\/.+/.test(redirectUrl)) {
      newErrors.redirect_url = 'Must be a valid URL starting with http:// or https://'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Validate sparkle items
    for (let i = 0; i < sparkle.length; i++) {
      if (!sparkle[i].product_sku) {
        toast.error(`Sparkle item ${i + 1}: product is required`)
        return
      }
    }

    setErrors({})
    setIsLoading(true)

    try {
      await onSave({ id: item.id, image_url: imageUrl, mobile_view_image_url: mobileViewImageUrl, image_alt_text: imageAltText, redirect_url: redirectUrl, rank, status, sparkle })
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
              <SheetTitle>Edit Muse</SheetTitle>
              <p className="text-sm text-muted-foreground">Update muse item details</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <MediaPickerInput
            label="Image"
            value={imageUrl || null}
            onChange={(path) => {
              setImageUrl(path || '')
              if (path) setErrors((prev) => ({ ...prev, image_url: undefined }))
            }}
            rootPath="cms/homepage/muse"
            required
            error={errors.image_url}
            accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
          />

          <MediaPickerInput
            label="Mobile View Image"
            value={mobileViewImageUrl || null}
            onChange={(path) => setMobileViewImageUrl(path || '')}
            rootPath="cms/homepage/muse/mobile"
            accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
          />

          <div className="space-y-2">
            <Label htmlFor="edit_image_alt_text">Image Alt Text</Label>
            <Input
              id="edit_image_alt_text"
              placeholder="Describe the image"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_redirect_url">
              Redirect URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit_redirect_url"
              placeholder="https://example.com/muse"
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit_status"
              checked={status}
              onCheckedChange={(checked) => setStatus(checked === true)}
            />
            <Label htmlFor="edit_status" className="cursor-pointer">Active</Label>
          </div>

          {/* Sparkle Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Sparkle Products</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Pin products on the muse image</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{sparkle.length}</Badge>
                <Button type="button" variant="outline" size="sm" onClick={handleAddSparkle}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {sparkle.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">No sparkle items. Click Add to pin a product on the image.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sparkle.map((sparkleItem, index) => (
                  <div key={index} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sparkle {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveSparkle(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Product <span className="text-destructive">*</span></Label>
                      <Select
                        value={sparkleItem.product_sku}
                        onValueChange={(value) => handleSparkleChange(index, 'product_sku', value)}
                        disabled={isLoadingProducts}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingProducts ? 'Loading...' : 'Select a product'} />
                        </SelectTrigger>
                        <SelectContent>
                          {allProducts.map((product) => (
                            <SelectItem key={product.id} value={product.base_sku}>
                              {product.base_sku} — {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">X Coordinate</Label>
                        <Input
                          type="number"
                          value={sparkleItem.x_coordinate}
                          onChange={(e) => handleSparkleChange(index, 'x_coordinate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Y Coordinate</Label>
                        <Input
                          type="number"
                          value={sparkleItem.y_coordinate}
                          onChange={(e) => handleSparkleChange(index, 'y_coordinate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit_sparkle_active_${index}`}
                        checked={sparkleItem.is_active}
                        onCheckedChange={(checked) => handleSparkleChange(index, 'is_active', checked === true)}
                      />
                      <Label htmlFor={`edit_sparkle_active_${index}`} className="cursor-pointer text-xs">Active</Label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
          <Button variant="outline" className="flex-1" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              'Save Changes'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
