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
import { Loader2, Save, X, Package } from 'lucide-react'
import { toast } from 'sonner'
import {
  cmsService,
  type ShopFromBestsellersContent,
  type ProductForSelection,
} from '@/components/cms/services/cmsService'

export function CMSShopFromBestsellers() {
  // Form state
  const [productSkus, setProductSkus] = useState<string[]>([])
  const [buttonText, setButtonText] = useState('')
  const [buttonRedirectUrl, setButtonRedirectUrl] = useState('')

  // Product state
  const [allProducts, setAllProducts] = useState<ProductForSelection[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Error state
  const [errors, setErrors] = useState<{
   button_text?: string;
    button_redirect_url?: string
  }>({})

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
      const response = await cmsService.getShopFromBestsellers()
      const content = response.data?.content as ShopFromBestsellersContent | undefined
      if (content) {
        setProductSkus(content.product_skus || [])
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

  const availableProducts = allProducts.filter((p) => !productSkus.includes(p.base_sku))

  const handleAddProduct = (baseSku: string) => {
    if (productSkus.length >= 20) {
      toast.error('Maximum 20 products allowed')
      return
    }
    if (productSkus.includes(baseSku)) return
    setProductSkus((prev) => [...prev, baseSku])
  }

  const handleRemoveProduct = (sku: string) => {
    setProductSkus((prev) => prev.filter((s) => s !== sku))
  }

  const getProductLabel = (sku: string): string => {
    const product = allProducts.find((p) => p.base_sku === sku)
    return product ? `${product.base_sku} — ${product.name}` : sku
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
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const response = await cmsService.updateShopFromBestsellers({
        product_skus: productSkus,
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
          <h1 className="text-2xl font-semibold">Shop From Our Bestsellers</h1>
          <p className="text-sm text-muted-foreground">
            Manage homepage bestsellers section
          </p>
        </div>
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

       {/* Call to Action Section */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <h3 className="text-base font-semibold">Call to Action</h3>

          <div className="space-y-2">
            <Label>Button Text
              <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. View All Bestsellers"
              value={buttonText}
              onChange={(e) => {setButtonText(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, button_text: undefined }))
              }}
            />
             {errors.button_text && (
              <p className="text-sm text-destructive">{errors.button_text}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Button Redirect URL
            <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="https://aarshhmi.com/collections/bestsellers"
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

      {/* Products Section */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Products</h3>
            <Badge variant="outline">{productSkus.length} / 20</Badge>
          </div>

          {/* Product Dropdown */}
          {productSkus.length < 20 && (
            <Select
              value=""
              onValueChange={(value) => handleAddProduct(value)}
              disabled={isLoadingProducts || availableProducts.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingProducts
                      ? 'Loading products...'
                      : availableProducts.length === 0
                        ? 'No more products available'
                        : 'Select a product to add'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.map((product) => (
                  <SelectItem key={product.id} value={product.base_sku}>
                    {product.base_sku} — {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Selected Products */}
          {productSkus.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No products selected. Use the dropdown above to add products.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {productSkus.map((sku, index) => (
                <div
                  key={sku}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <span className="text-xs text-muted-foreground w-5 text-center">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getProductLabel(sku)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveProduct(sku)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

     
    </div>
  )
}
