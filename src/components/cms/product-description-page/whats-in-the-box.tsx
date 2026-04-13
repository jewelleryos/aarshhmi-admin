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
  type WhatsInBoxItem,
  type JewelleryCareItem,
  type CmsSectionResponse,
  type ApiResponse,
} from '../services/cmsService'

interface WhatsInTheBoxComponentProps {
  getContent: () => Promise<ApiResponse<CmsSectionResponse | null>>
  updateContent: (content: ProductDescriptionPageContent) => Promise<ApiResponse<CmsSectionResponse>>
}

export function WhatsInTheBoxComponent({ getContent, updateContent }: WhatsInTheBoxComponentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [items, setItems] = useState<WhatsInBoxItem[]>([])
  const [itemsError, setItemsError] = useState<string>()

  // Preserved fields from the other section so we don't overwrite them on save
  const [preservedJewelleryCare, setPreservedJewelleryCare] = useState<JewelleryCareItem[]>([])
  const [preservedButtonText, setPreservedButtonText] = useState('')
  const [preservedButtonRedirectUrl, setPreservedButtonRedirectUrl] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await getContent()
      const content = response.data?.content as ProductDescriptionPageContent | undefined
      if (content) {
        setItems(content.whats_in_box || [])
        setPreservedJewelleryCare(content.jewellery_care || [])
        setPreservedButtonText(content.button_text || '')
        setPreservedButtonRedirectUrl(content.button_redirect_url || '')
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

  const handleItemChange = (index: number, field: keyof WhatsInBoxItem, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const validate = (): boolean => {
    if (items.some((item) => !item.image_url)) {
      setItemsError('All items must have an image')
      return false
    }
    setItemsError(undefined)
    return true
  }

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSaving(true)
      const content: ProductDescriptionPageContent = {
        jewellery_care: preservedJewelleryCare,
        button_text: preservedButtonText,
        button_redirect_url: preservedButtonRedirectUrl,
        whats_in_box: items.map((item) => ({
          image_url: item.image_url,
          mobile_view_image_url: item.mobile_view_image_url?.trim() || '',
          image_alt_text: item.image_alt_text?.trim() || '',
          redirect_url: item.redirect_url?.trim() || '',
        })),
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
          <h1 className="text-2xl font-semibold">What&apos;s in the Box</h1>
          <p className="text-sm text-muted-foreground">Manage &quot;What&apos;s in the Box&quot; images for the product description page</p>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Images</CardTitle>
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
                      rootPath="cms/product-description-page/whats-in-the-box"
                      required
                    />
                    <MediaPickerInput
                      label="Mobile View Image"
                      value={item.mobile_view_image_url || null}
                      onChange={(path) => handleItemChange(index, 'mobile_view_image_url', path || '')}
                      rootPath="cms/product-description-page/whats-in-the-box/mobile"
                    />
                    <div className="space-y-2">
                      <Label htmlFor={`wib-altText-${index}`}>Alt Text <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        id={`wib-altText-${index}`}
                        value={item.image_alt_text || ''}
                        onChange={(e) => handleItemChange(index, 'image_alt_text', e.target.value)}
                        placeholder="Describe the image"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`wib-redirectUrl-${index}`}>Redirect URL <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        id={`wib-redirectUrl-${index}`}
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
