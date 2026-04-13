'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { MediaPickerInput } from '@/components/media'
import {
  type ProductListDetailsContent,
  type ProductListImage,
  type CmsSectionResponse,
  type ApiResponse,
} from '../services/cmsService'

interface ProductListDetailsComponentProps {
  title: string
  description: string
  getContent: () => Promise<ApiResponse<CmsSectionResponse | null>>
  updateContent: (content: ProductListDetailsContent) => Promise<ApiResponse<CmsSectionResponse>>
}

export function ProductListDetailsComponent({
  title,
  description,
  getContent,
  updateContent,
}: ProductListDetailsComponentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [images, setImages] = useState<ProductListImage[]>([])
  const [imagesError, setImagesError] = useState<string>()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await getContent()
      const content = response.data?.content as ProductListDetailsContent | undefined
      if (content) {
        setImages(content.images || [])
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch product list details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddImage = () => {
    setImages([...images, { image_url: '', mobile_view_image_url: '', image_alt_text: '', redirect_url: '' }])
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleImageChange = (index: number, field: keyof ProductListImage, value: string) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], [field]: value }
    setImages(newImages)
  }

  const validate = (): boolean => {
    if (images.length === 0) {
      setImagesError('At least one image is required')
      return false
    }
    if (images.some((img) => !img.image_url)) {
      setImagesError('All images must have an image URL')
      return false
    }
    setImagesError(undefined)
    return true
  }

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSaving(true)
      const content: ProductListDetailsContent = {
        images: images.map((img) => ({
          image_url: img.image_url,
          image_alt_text: img.image_alt_text?.trim() || '',
          redirect_url: img.redirect_url?.trim() || '',
        })),
      }
      const response = await updateContent(content)
      toast.success(response.message)
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save product list details')
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
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
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

      {/* Images Section */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <Label>Images</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddImage}>
              <Plus className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </div>
          {imagesError && <p className="text-sm text-destructive">{imagesError}</p>}

          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No images added yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click &quot;Add Image&quot; to add your first image
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {images.map((image, index) => (
                <div key={index} className="flex gap-4 items-start border rounded-lg p-4">
                  <div className="flex-1 space-y-4">
                    <MediaPickerInput
                      label={`Image ${index + 1}`}
                      value={image.image_url || null}
                      onChange={(path) => handleImageChange(index, 'image_url', path || '')}
                      rootPath="cms/product-list-details"
                      required
                    />
                    <MediaPickerInput
                      label="Mobile View Image"
                      value={image.mobile_view_image_url || null}
                      onChange={(path) => handleImageChange(index, 'mobile_view_image_url', path || '')}
                      rootPath="cms/product-list-details/mobile"
                    />
                    <div className="space-y-2">
                      <Label htmlFor={`altText-${index}`}>Alt Text</Label>
                      <Input
                        id={`altText-${index}`}
                        value={image.image_alt_text}
                        onChange={(e) => handleImageChange(index, 'image_alt_text', e.target.value)}
                        placeholder="Describe the image"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`redirectUrl-${index}`}>Redirect URL</Label>
                      <Input
                        id={`redirectUrl-${index}`}
                        value={image.redirect_url}
                        onChange={(e) => handleImageChange(index, 'redirect_url', e.target.value)}
                        placeholder="https://example.com/page"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveImage(index)}
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
