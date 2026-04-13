'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  cmsService,
  type ExperienceContent,
  type ExperienceImageItem,
} from '@/components/cms/services/cmsService'
import { MediaPickerInput } from '@/components/media'

export function ExperienceContentComponent() {
  const [images, setImages] = useState<ExperienceImageItem[]>([])
  const [description, setDescription] = useState('')
  const [secondSectionTitle, setSecondSectionTitle] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [errors, setErrors] = useState<{
    description?: string
    second_section_title?: string
    images?: string
  }>({})

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getExperience()
      const content = response.data?.content as ExperienceContent | undefined
      if (content) {
        setImages(content.images || [])
        setDescription(content.description || '')
        setSecondSectionTitle(content.second_section_title || '')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddImage = () => {
    setImages((prev) => [...prev, { image_url: '', mobile_view_image_url: '', image_alter_text: '', redirect_url: undefined }])
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImageChange = (index: number, field: keyof ExperienceImageItem, value: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    )
  }

  const handleSave = async () => {
    const newErrors: typeof errors = {}

    if (images.some((img) => !img.image_url)) {
      newErrors.images = 'All images must have a file selected'
    }
    if (!description) {
      newErrors.description = 'Description is required'
    }
    if (!secondSectionTitle) {
      newErrors.second_section_title = 'Second section title is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const response = await cmsService.updateExperience({
        images,
        description,
        second_section_title: secondSectionTitle,
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
          <h1 className="text-2xl font-semibold">Experience</h1>
          <p className="text-sm text-muted-foreground">
            Manage the experience section on homepage
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

      {/* Images */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Images</h2>
          <Button variant="outline" size="sm" onClick={handleAddImage}>
            <Plus className="mr-2 h-4 w-4" />
            Add Image
          </Button>
        </div>

        {errors.images && (
          <p className="text-sm text-destructive">{errors.images}</p>
        )}

        {images.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-sm">No images added yet.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={handleAddImage}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Image
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {images.map((img, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Image {index + 1}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MediaPickerInput
                    label="Image"
                    value={img.image_url || null}
                    onChange={(path) => handleImageChange(index, 'image_url', path || '')}
                    rootPath="cms/homepage/experience"
                    required
                    accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                  />
                  <MediaPickerInput
                    label="Mobile View Image"
                    value={img.mobile_view_image_url || null}
                    onChange={(path) => handleImageChange(index, 'mobile_view_image_url', path || '')}
                    rootPath="cms/homepage/experience/mobile"
                    accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                  />
                  <div className="space-y-2">
                    <Label>Image Alt Text</Label>
                    <Input
                      placeholder="Describe the image"
                      value={img.image_alter_text}
                      onChange={(e) => handleImageChange(index, 'image_alter_text', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Redirect URL</Label>
                    <Input
                      placeholder="https://example.com/experience"
                      value={img.redirect_url || ''}
                      onChange={(e) => handleImageChange(index, 'redirect_url', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional. Full URL with https (e.g., https://example.com/page)
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Enter the description text..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, description: undefined }))
              }}
              rows={5}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Second Section Title */}
          <div className="space-y-2">
            <Label htmlFor="second_section_title">
              Second Section Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="second_section_title"
              placeholder="Enter the second section title..."
              value={secondSectionTitle}
              onChange={(e) => {
                setSecondSectionTitle(e.target.value)
                if (e.target.value)
                  setErrors((prev) => ({ ...prev, second_section_title: undefined }))
              }}
            />
            {errors.second_section_title && (
              <p className="text-sm text-destructive">{errors.second_section_title}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
