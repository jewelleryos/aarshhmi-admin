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

  const [title1, setTitle1] = useState('')
  const [description1, setDescription1] = useState('')
  const [title2, setTitle2] = useState('')
  const [description2, setDescription2] = useState('')
  const [images, setImages] = useState<ProductListImage[]>([])

  const [errors, setErrors] = useState<{
    title1?: string
    description1?: string
    title2?: string
    description2?: string
    images?: string
  }>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await getContent()
      const content = response.data?.content as ProductListDetailsContent | undefined
      if (content) {
        setTitle1(content.title1 || '')
        setDescription1(content.description1 || '')
        setTitle2(content.title2 || '')
        setDescription2(content.description2 || '')
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
    setImages([...images, { image_url: '', image_alt_text: '' }])
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleImageChange = (index: number, field: keyof ProductListImage, value: string) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], [field]: value }
    setImages(newImages)
  }

  const validate = () => {
    const newErrors: {
      title1?: string
      description1?: string
      title2?: string
      description2?: string
      images?: string
    } = {}

    if (!title1.trim()) newErrors.title1 = 'Title 1 is required'
    if (!description1.trim()) newErrors.description1 = 'Description 1 is required'
    if (!title2.trim()) newErrors.title2 = 'Title 2 is required'
    if (!description2.trim()) newErrors.description2 = 'Description 2 is required'
    if (images.length === 0) newErrors.images = 'At least one image is required'
    if (images.some((img) => !img.image_url)) {
      newErrors.images = 'All images must have an image URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSaving(true)
      const content: ProductListDetailsContent = {
        title1: title1.trim(),
        description1: description1.trim(),
        title2: title2.trim(),
        description2: description2.trim(),
        images: images.map((img) => ({
          image_url: img.image_url,
          image_alt_text: img.image_alt_text.trim() || img.image_url,
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

      {/* Form */}
      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Title 1 */}
          <div className="space-y-2">
            <Label htmlFor="title1">
              Title 1 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title1"
              value={title1}
              onChange={(e) => setTitle1(e.target.value)}
              placeholder="Enter title 1"
            />
            {errors.title1 && <p className="text-sm text-destructive">{errors.title1}</p>}
          </div>

          {/* Description 1 */}
          <div className="space-y-2">
            <Label htmlFor="description1">
              Description 1 <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="description1"
              value={description1}
              onChange={(e) => setDescription1(e.target.value)}
              placeholder="Enter description 1"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description1 && <p className="text-sm text-destructive">{errors.description1}</p>}
          </div>

          {/* Title 2 */}
          <div className="space-y-2">
            <Label htmlFor="title2">
              Title 2 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title2"
              value={title2}
              onChange={(e) => setTitle2(e.target.value)}
              placeholder="Enter title 2"
            />
            {errors.title2 && <p className="text-sm text-destructive">{errors.title2}</p>}
          </div>

          {/* Description 2 */}
          <div className="space-y-2">
            <Label htmlFor="description2">
              Description 2 <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="description2"
              value={description2}
              onChange={(e) => setDescription2(e.target.value)}
              placeholder="Enter description 2"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description2 && <p className="text-sm text-destructive">{errors.description2}</p>}
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Images</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddImage}>
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </div>
            {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}

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
                      <div className="space-y-2">
                        <Label htmlFor={`altText-${index}`}>Alt Text</Label>
                        <Input
                          id={`altText-${index}`}
                          value={image.image_alt_text}
                          onChange={(e) =>
                            handleImageChange(index, 'image_alt_text', e.target.value)
                          }
                          placeholder="Describe the image"
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
