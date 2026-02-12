'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type AboutUsContent } from '@/redux/services/cmsService'
import { MediaPickerInput } from '@/components/media'

const MEDIA_ROOT_PATH = 'cms/about-us'

// Default empty content
const defaultContent: AboutUsContent = {
  main_image_url: '',
  main_image_alt_text: '',
  section1_title: '',
  section1_text: '',
  section1_first_image_url: '',
  section1_first_image_alt_text: '',
  section1_second_image_url: '',
  section1_second_image_alt_text: '',
  section1_third_image_url: '',
  section1_third_image_alt_text: '',
  section2_title: '',
  section2_text: '',
  section2_first_image_url: '',
  section2_first_image_alt_text: '',
  section2_second_image_url: '',
  section2_second_image_alt_text: '',
  section2_third_image_url: '',
  section2_third_image_alt_text: '',
  last_section_title: '',
  last_section_text: '',
}

type ErrorKeys = keyof AboutUsContent

export function AboutUsContentComponent() {
  // Form state
  const [content, setContent] = useState<AboutUsContent>(defaultContent)

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Error state
  const [errors, setErrors] = useState<Partial<Record<ErrorKeys, string>>>({})

  // Fetch content on mount
  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getAboutUs()
      const data = response.data?.content as AboutUsContent | undefined
      if (data) {
        setContent({
          ...defaultContent,
          ...data,
        })
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch content')
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof AboutUsContent, value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }))
    if (value) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSave = async () => {
    // Validate all required fields
    const newErrors: Partial<Record<ErrorKeys, string>> = {}

    // Main image validation
    if (!content.main_image_url) newErrors.main_image_url = 'Main image is required'
    if (!content.main_image_alt_text) newErrors.main_image_alt_text = 'Main image alt text is required'

    // Section 1 validation
    if (!content.section1_title) newErrors.section1_title = 'Section 1 title is required'
    if (!content.section1_text) newErrors.section1_text = 'Section 1 text is required'
    if (!content.section1_first_image_url) newErrors.section1_first_image_url = 'Section 1 first image is required'
    if (!content.section1_first_image_alt_text) newErrors.section1_first_image_alt_text = 'Alt text is required'
    if (!content.section1_second_image_url) newErrors.section1_second_image_url = 'Section 1 second image is required'
    if (!content.section1_second_image_alt_text) newErrors.section1_second_image_alt_text = 'Alt text is required'
    if (!content.section1_third_image_url) newErrors.section1_third_image_url = 'Section 1 third image is required'
    if (!content.section1_third_image_alt_text) newErrors.section1_third_image_alt_text = 'Alt text is required'

    // Section 2 validation
    if (!content.section2_title) newErrors.section2_title = 'Section 2 title is required'
    if (!content.section2_text) newErrors.section2_text = 'Section 2 text is required'
    if (!content.section2_first_image_url) newErrors.section2_first_image_url = 'Section 2 first image is required'
    if (!content.section2_first_image_alt_text) newErrors.section2_first_image_alt_text = 'Alt text is required'
    if (!content.section2_second_image_url) newErrors.section2_second_image_url = 'Section 2 second image is required'
    if (!content.section2_second_image_alt_text) newErrors.section2_second_image_alt_text = 'Alt text is required'
    if (!content.section2_third_image_url) newErrors.section2_third_image_url = 'Section 2 third image is required'
    if (!content.section2_third_image_alt_text) newErrors.section2_third_image_alt_text = 'Alt text is required'

    // Last section validation
    if (!content.last_section_title) newErrors.last_section_title = 'Last section title is required'
    if (!content.last_section_text) newErrors.last_section_text = 'Last section text is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in all required fields')
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const response = await cmsService.updateAboutUs(content)
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
          <h1 className="text-2xl font-semibold">About Us</h1>
          <p className="text-sm text-muted-foreground">
            Manage the about us page content
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

      {/* Main Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Main Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MediaPickerInput
            label="Main Image"
            value={content.main_image_url || null}
            onChange={(path) => updateField('main_image_url', path || '')}
            rootPath={MEDIA_ROOT_PATH}
            required
            error={errors.main_image_url}
            accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
          />
          <div className="space-y-2">
            <Label htmlFor="main_image_alt_text">
              Alt Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="main_image_alt_text"
              placeholder="Describe the main image"
              value={content.main_image_alt_text}
              onChange={(e) => updateField('main_image_alt_text', e.target.value)}
            />
            {errors.main_image_alt_text && (
              <p className="text-sm text-destructive">{errors.main_image_alt_text}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 1 */}
      <Card>
        <CardHeader>
          <CardTitle>Section 1</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="section1_title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section1_title"
              placeholder="Enter section title"
              value={content.section1_title}
              onChange={(e) => updateField('section1_title', e.target.value)}
            />
            {errors.section1_title && (
              <p className="text-sm text-destructive">{errors.section1_title}</p>
            )}
          </div>

          {/* Text */}
          <div className="space-y-2">
            <Label htmlFor="section1_text">
              Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="section1_text"
              placeholder="Enter section text..."
              value={content.section1_text}
              onChange={(e) => updateField('section1_text', e.target.value)}
              rows={5}
            />
            {errors.section1_text && (
              <p className="text-sm text-destructive">{errors.section1_text}</p>
            )}
          </div>

          <Separator />

          {/* Section 1 Images */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Images</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* First Image */}
              <div className="space-y-3">
                <MediaPickerInput
                  label="First Image"
                  value={content.section1_first_image_url || null}
                  onChange={(path) => updateField('section1_first_image_url', path || '')}
                  rootPath={MEDIA_ROOT_PATH}
                  required
                  error={errors.section1_first_image_url}
                  accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                />
                <div className="space-y-2">
                  <Label htmlFor="section1_first_image_alt">
                    Alt Text <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="section1_first_image_alt"
                    placeholder="Alt text"
                    value={content.section1_first_image_alt_text}
                    onChange={(e) => updateField('section1_first_image_alt_text', e.target.value)}
                  />
                  {errors.section1_first_image_alt_text && (
                    <p className="text-sm text-destructive">{errors.section1_first_image_alt_text}</p>
                  )}
                </div>
              </div>

              {/* Second Image */}
              <div className="space-y-3">
                <MediaPickerInput
                  label="Second Image"
                  value={content.section1_second_image_url || null}
                  onChange={(path) => updateField('section1_second_image_url', path || '')}
                  rootPath={MEDIA_ROOT_PATH}
                  required
                  error={errors.section1_second_image_url}
                  accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                />
                <div className="space-y-2">
                  <Label htmlFor="section1_second_image_alt">
                    Alt Text <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="section1_second_image_alt"
                    placeholder="Alt text"
                    value={content.section1_second_image_alt_text}
                    onChange={(e) => updateField('section1_second_image_alt_text', e.target.value)}
                  />
                  {errors.section1_second_image_alt_text && (
                    <p className="text-sm text-destructive">{errors.section1_second_image_alt_text}</p>
                  )}
                </div>
              </div>

              {/* Third Image */}
              <div className="space-y-3">
                <MediaPickerInput
                  label="Third Image"
                  value={content.section1_third_image_url || null}
                  onChange={(path) => updateField('section1_third_image_url', path || '')}
                  rootPath={MEDIA_ROOT_PATH}
                  required
                  error={errors.section1_third_image_url}
                  accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                />
                <div className="space-y-2">
                  <Label htmlFor="section1_third_image_alt">
                    Alt Text <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="section1_third_image_alt"
                    placeholder="Alt text"
                    value={content.section1_third_image_alt_text}
                    onChange={(e) => updateField('section1_third_image_alt_text', e.target.value)}
                  />
                  {errors.section1_third_image_alt_text && (
                    <p className="text-sm text-destructive">{errors.section1_third_image_alt_text}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 */}
      <Card>
        <CardHeader>
          <CardTitle>Section 2</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="section2_title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section2_title"
              placeholder="Enter section title"
              value={content.section2_title}
              onChange={(e) => updateField('section2_title', e.target.value)}
            />
            {errors.section2_title && (
              <p className="text-sm text-destructive">{errors.section2_title}</p>
            )}
          </div>

          {/* Text */}
          <div className="space-y-2">
            <Label htmlFor="section2_text">
              Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="section2_text"
              placeholder="Enter section text..."
              value={content.section2_text}
              onChange={(e) => updateField('section2_text', e.target.value)}
              rows={5}
            />
            {errors.section2_text && (
              <p className="text-sm text-destructive">{errors.section2_text}</p>
            )}
          </div>

          <Separator />

          {/* Section 2 Images */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Images</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* First Image */}
              <div className="space-y-3">
                <MediaPickerInput
                  label="First Image"
                  value={content.section2_first_image_url || null}
                  onChange={(path) => updateField('section2_first_image_url', path || '')}
                  rootPath={MEDIA_ROOT_PATH}
                  required
                  error={errors.section2_first_image_url}
                  accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                />
                <div className="space-y-2">
                  <Label htmlFor="section2_first_image_alt">
                    Alt Text <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="section2_first_image_alt"
                    placeholder="Alt text"
                    value={content.section2_first_image_alt_text}
                    onChange={(e) => updateField('section2_first_image_alt_text', e.target.value)}
                  />
                  {errors.section2_first_image_alt_text && (
                    <p className="text-sm text-destructive">{errors.section2_first_image_alt_text}</p>
                  )}
                </div>
              </div>

              {/* Second Image */}
              <div className="space-y-3">
                <MediaPickerInput
                  label="Second Image"
                  value={content.section2_second_image_url || null}
                  onChange={(path) => updateField('section2_second_image_url', path || '')}
                  rootPath={MEDIA_ROOT_PATH}
                  required
                  error={errors.section2_second_image_url}
                  accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                />
                <div className="space-y-2">
                  <Label htmlFor="section2_second_image_alt">
                    Alt Text <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="section2_second_image_alt"
                    placeholder="Alt text"
                    value={content.section2_second_image_alt_text}
                    onChange={(e) => updateField('section2_second_image_alt_text', e.target.value)}
                  />
                  {errors.section2_second_image_alt_text && (
                    <p className="text-sm text-destructive">{errors.section2_second_image_alt_text}</p>
                  )}
                </div>
              </div>

              {/* Third Image */}
              <div className="space-y-3">
                <MediaPickerInput
                  label="Third Image"
                  value={content.section2_third_image_url || null}
                  onChange={(path) => updateField('section2_third_image_url', path || '')}
                  rootPath={MEDIA_ROOT_PATH}
                  required
                  error={errors.section2_third_image_url}
                  accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                />
                <div className="space-y-2">
                  <Label htmlFor="section2_third_image_alt">
                    Alt Text <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="section2_third_image_alt"
                    placeholder="Alt text"
                    value={content.section2_third_image_alt_text}
                    onChange={(e) => updateField('section2_third_image_alt_text', e.target.value)}
                  />
                  {errors.section2_third_image_alt_text && (
                    <p className="text-sm text-destructive">{errors.section2_third_image_alt_text}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Section */}
      <Card>
        <CardHeader>
          <CardTitle>Last Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="last_section_title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="last_section_title"
              placeholder="Enter section title"
              value={content.last_section_title}
              onChange={(e) => updateField('last_section_title', e.target.value)}
            />
            {errors.last_section_title && (
              <p className="text-sm text-destructive">{errors.last_section_title}</p>
            )}
          </div>

          {/* Text */}
          <div className="space-y-2">
            <Label htmlFor="last_section_text">
              Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="last_section_text"
              placeholder="Enter section text..."
              value={content.last_section_text}
              onChange={(e) => updateField('last_section_text', e.target.value)}
              rows={5}
            />
            {errors.last_section_text && (
              <p className="text-sm text-destructive">{errors.last_section_text}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
