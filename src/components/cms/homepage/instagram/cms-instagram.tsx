'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save, X, Plus, Trash2, Video } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type InstagramItem, type InstagramContent, type ProductForSelection } from '@/components/cms/services/cmsService'
import { MediaPickerInput } from '@/components/media'

export function CMSInstagram() {
  const [items, setItems] = useState<InstagramItem[]>([])
  const [buttonText, setButtonText] = useState('')
  const [buttonRedirectUrl, setButtonRedirectUrl] = useState('')
  const [allProducts, setAllProducts] = useState<ProductForSelection[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{ button_text?: string; button_redirect_url?: string }>({})

  useEffect(() => {
    fetchContent()
    fetchAllProducts()
  }, [])

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

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getInstagram()
      const content = response.data?.content as InstagramContent | undefined
      if (content) {
        setItems(content.items || [])
        setButtonText(content.button_text || '')
        setButtonRedirectUrl(content.button_redirect_url || '')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = () => {
    if (items.length >= 10) {
      toast.error('Maximum 10 items allowed')
      return
    }
    setItems((prev) => [
      ...prev,
      {
        id: `ig_${Date.now()}`,
        video_url: '',
        video_alt_text: '',
        main_title: '',
        product_skus: [],
      },
    ])
  }

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof Omit<InstagramItem, 'id' | 'product_skus'>, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const handleAddProduct = (itemId: string, baseSku: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        if (item.product_skus.length >= 5) {
          toast.error('Maximum 5 products per item')
          return item
        }
        if (item.product_skus.includes(baseSku)) return item
        return { ...item, product_skus: [...item.product_skus, baseSku] }
      })
    )
  }

  const handleRemoveProduct = (itemId: string, sku: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        return { ...item, product_skus: item.product_skus.filter((s) => s !== sku) }
      })
    )
  }

  const getProductLabel = (sku: string): string => {
    const product = allProducts.find((p) => p.base_sku === sku)
    return product ? `${product.base_sku} — ${product.name}` : sku
  }

  const getAvailableProducts = (currentItemSkus: string[]) => {
    return allProducts.filter((p) => !currentItemSkus.includes(p.base_sku))
  }

  const handleSave = async () => {
    const newErrors: typeof errors = {}
    if (!buttonText) {
      newErrors.button_text = 'Button text is required'
    }
    if (!buttonRedirectUrl) {
      newErrors.button_redirect_url = 'Button redirect URL is required'
    } else if (!/^https?:\/\/.+/.test(buttonRedirectUrl)) {
      newErrors.button_redirect_url = 'Must be a valid URL starting with http:// or https://'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in all required fields')
      return
    }

    setErrors({})
    setIsSaving(true)
    try {
      const response = await cmsService.updateInstagram({
        items,
        button_text: buttonText,
        button_redirect_url: buttonRedirectUrl,
      })
      toast.success(response.message)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Instagram Section</h1>
          <p className="text-sm text-muted-foreground">
            Manage instagram video reels with linked products (max 10 items, 5 products each)
          </p>
        </div>
        <div className="flex items-center gap-2">

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Call to Action */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <h3 className="text-base font-semibold">Call to Action</h3>

          <div className="space-y-2">
            <Label>
              Button Text <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. View All Reels"
              value={buttonText}
              onChange={(e) => {
                setButtonText(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, button_text: undefined }))
              }}
            />
            {errors.button_text && (
              <p className="text-sm text-destructive">{errors.button_text}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Button Redirect URL <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="https://instagram.com/aarshhmi"
              value={buttonRedirectUrl}
              onChange={(e) => {
                setButtonRedirectUrl(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, button_redirect_url: undefined }))
              }}
            />
            {errors.button_redirect_url ? (
              <p className="text-sm text-destructive">{errors.button_redirect_url}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Full URL with https</p>
            )}
          </div>
        </CardContent>
      </Card>


      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline">{items.length} / 10 Items</Badge>
        <Button onClick={handleAddItem} disabled={items.length >= 10}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Video className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No items added yet. Click &quot;Add Item&quot; to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        items.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="pt-6 space-y-6">
              {/* Item Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Item {index + 1}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Video */}
              <MediaPickerInput
                label="Video (MP4 only)"
                value={item.video_url || null}
                onChange={(path) => updateItem(item.id, 'video_url', path || '')}
                rootPath="cms/instagram"
                accept={["mp4"]}
              />

              <div className="space-y-2">
                <Label>Video Alt Text</Label>
                <Input
                  placeholder="Describe the video"
                  value={item.video_alt_text}
                  onChange={(e) => updateItem(item.id, 'video_alt_text', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Main Title</Label>
                <Input
                  placeholder="e.g. Summer Collection Spotlight"
                  value={item.main_title}
                  onChange={(e) => updateItem(item.id, 'main_title', e.target.value)}
                />
              </div>

              {/* Products */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Products</Label>
                  <Badge variant="outline">{item.product_skus.length} / 5</Badge>
                </div>

                {item.product_skus.length < 5 && (
                  <Select
                    value=""
                    onValueChange={(value) => handleAddProduct(item.id, value)}
                    disabled={isLoadingProducts || getAvailableProducts(item.product_skus).length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingProducts
                            ? 'Loading products...'
                            : getAvailableProducts(item.product_skus).length === 0
                              ? 'No more products available'
                              : 'Select a product to add'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableProducts(item.product_skus).map((product) => (
                        <SelectItem key={product.id} value={product.base_sku}>
                          {product.base_sku} — {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {item.product_skus.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No products selected.</p>
                ) : (
                  <div className="space-y-1">
                    {item.product_skus.map((sku, skuIndex) => (
                      <div
                        key={sku}
                        className="flex items-center gap-3 rounded-lg border p-2"
                      >
                        <span className="text-xs text-muted-foreground w-4 text-center">{skuIndex + 1}</span>
                        <p className="flex-1 text-sm font-medium truncate">
                          {getProductLabel(sku)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveProduct(item.id, sku)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}


    </div>
  )
}
