'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { MediaPickerInput } from '@/components/media'
import {
  type ProductDescriptionPageContent,
  type JewelleryCareItem,
  type WhatsInBoxItem,
  type CmsSectionResponse,
  type ApiResponse,
} from '../services/cmsService'

interface JewelleryCareComponentProps {
  getContent: () => Promise<ApiResponse<CmsSectionResponse | null>>
  updateContent: (content: ProductDescriptionPageContent) => Promise<ApiResponse<CmsSectionResponse>>
}

export function JewelleryCareComponent({ getContent, updateContent }: JewelleryCareComponentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [items, setItems] = useState<JewelleryCareItem[]>([])
  const [preservedWhatsInBox, setPreservedWhatsInBox] = useState<WhatsInBoxItem[]>([])
  const [buttonText, setButtonText] = useState('')
  const [buttonRedirectUrl, setButtonRedirectUrl] = useState('')
  const [itemsError, setItemsError] = useState<string>()
  const [buttonTextError, setButtonTextError] = useState<string>()
  const [buttonRedirectUrlError, setButtonRedirectUrlError] = useState<string>()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await getContent()
      const content = response.data?.content as ProductDescriptionPageContent | undefined
      if (content) {
        setItems(content.jewellery_care || [])
        setButtonText(content.button_text || '')
        setButtonRedirectUrl(content.button_redirect_url || '')
        setPreservedWhatsInBox(content.whats_in_box || [])
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch product description page')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = () => {
    setItems([...items, { image_url: '', mobile_view_image_url: '', image_alt_text: '', redirect_url: '' }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof JewelleryCareItem, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const validate = (): boolean => {
    let valid = true

    if (items.length === 0) {
      setItemsError('At least one image is required')
      valid = false
    } else if (items.some((item) => !item.image_url)) {
      setItemsError('All items must have an image URL')
      valid = false
    } else {
      setItemsError(undefined)
    }

    if (!buttonText.trim()) {
      setButtonTextError('Button text is required')
      valid = false
    } else {
      setButtonTextError(undefined)
    }

    if (!buttonRedirectUrl.trim()) {
      setButtonRedirectUrlError('Button redirect URL is required')
      valid = false
    } else {
      setButtonRedirectUrlError(undefined)
    }

    return valid
  }

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSaving(true)
      const content: ProductDescriptionPageContent = {
        jewellery_care: items.map((item) => ({
          image_url: item.image_url,
          mobile_view_image_url: item.mobile_view_image_url?.trim() || '',
          image_alt_text: item.image_alt_text?.trim() || '',
          redirect_url: item.redirect_url?.trim() || '',
        })),
        button_text: buttonText.trim(),
        button_redirect_url: buttonRedirectUrl.trim(),
        whats_in_box: preservedWhatsInBox,
      }
      const response = await updateContent(content)
      toast.success(response.message)
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save product description page')
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
          <h1 className="text-2xl font-semibold">Jewellery Care</h1>
          <p className="text-sm text-muted-foreground">Manage jewellery care images for the product description page</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      {/* Button Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Button</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buttonText">Button Text <span className="text-destructive">*</span></Label>
            <Input
              id="buttonText"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="e.g. Learn More"
            />
            {buttonTextError && <p className="text-sm text-destructive">{buttonTextError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="buttonRedirectUrl">Button Redirect URL <span className="text-destructive">*</span></Label>
            <Input
              id="buttonRedirectUrl"
              value={buttonRedirectUrl}
              onChange={(e) => setButtonRedirectUrl(e.target.value)}
              placeholder="https://example.com/page"
            />
            {buttonRedirectUrlError && <p className="text-sm text-destructive">{buttonRedirectUrlError}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Jewellery Care Images */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Jewellery Care Images</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {itemsError && <p className="text-sm text-destructive">{itemsError}</p>}

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No images added yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click &quot;Add Image&quot; to add your first image
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start border rounded-lg p-4">
                  <div className="flex-1 space-y-4">
                    <MediaPickerInput
                      label={`Image ${index + 1}`}
                      value={item.image_url || null}
                      onChange={(path) => handleItemChange(index, 'image_url', path || '')}
                      rootPath="cms/product-description-page/jewellery-care"
                      required
                    />
                    <MediaPickerInput
                      label="Mobile View Image"
                      value={item.mobile_view_image_url || null}
                      onChange={(path) => handleItemChange(index, 'mobile_view_image_url', path || '')}
                      rootPath="cms/product-description-page/jewellery-care/mobile"
                    />
                    <div className="space-y-2">
                      <Label htmlFor={`altText-${index}`}>Alt Text <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        id={`altText-${index}`}
                        value={item.image_alt_text || ''}
                        onChange={(e) => handleItemChange(index, 'image_alt_text', e.target.value)}
                        placeholder="Describe the image"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`redirectUrl-${index}`}>Redirect URL <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        id={`redirectUrl-${index}`}
                        value={item.redirect_url || ''}
                        onChange={(e) => handleItemChange(index, 'redirect_url', e.target.value)}
                        placeholder="https://example.com/page"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
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
