'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type PartnerWithUsContent } from '@/components/cms/services/cmsService'
import { MediaPickerInput } from '@/components/media'

export default function CMSPartnerWithUs() {
  // Section 1 - Banner (Image only)
  const [section1ImageUrl, setSection1ImageUrl] = useState('')
  const [section1ImageAltText, setSection1ImageAltText] = useState('')

  // Section 2
  const [section2Title, setSection2Title] = useState('')
  const [section2Description1, setSection2Description1] = useState('')
  const [section2Description2, setSection2Description2] = useState('')
  const [section2ImageUrl, setSection2ImageUrl] = useState('')
  const [section2ImageAltText, setSection2ImageAltText] = useState('')
  const [section2ButtonText, setSection2ButtonText] = useState('')
  const [section2RedirectUrl, setSection2RedirectUrl] = useState('')

  // Section 3
  const [section3Title, setSection3Title] = useState('')
  const [section3Description1, setSection3Description1] = useState('')
  const [section3Description2, setSection3Description2] = useState('')
  const [section3Description3, setSection3Description3] = useState('')
  const [section3ImageUrl, setSection3ImageUrl] = useState('')
  const [section3ImageAltText, setSection3ImageAltText] = useState('')
  const [section3ButtonText, setSection3ButtonText] = useState('')
  const [section3RedirectUrl, setSection3RedirectUrl] = useState('')

  // Section 4
  const [section4Title, setSection4Title] = useState('')
  const [section4Description1, setSection4Description1] = useState('')
  const [section4Description2, setSection4Description2] = useState('')
  const [section4Description3, setSection4Description3] = useState('')
  const [section4ImageUrl, setSection4ImageUrl] = useState('')
  const [section4ImageAltText, setSection4ImageAltText] = useState('')
  const [section4ButtonText, setSection4ButtonText] = useState('')
  const [section4RedirectUrl, setSection4RedirectUrl] = useState('')

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getPartnerWithUs()
      const content = response.data?.content as PartnerWithUsContent | undefined
      if (content) {
        // Section 1
        setSection1ImageUrl(content.section1_image_url || '')
        setSection1ImageAltText(content.section1_image_alt_text || '')
        // Section 2
        setSection2Title(content.section2_title || '')
        setSection2Description1(content.section2_description1 || '')
        setSection2Description2(content.section2_description2 || '')
        setSection2ImageUrl(content.section2_image_url || '')
        setSection2ImageAltText(content.section2_image_alt_text || '')
        setSection2ButtonText(content.section2_button_text || '')
        setSection2RedirectUrl(content.section2_redirect_url || '')
        // Section 3
        setSection3Title(content.section3_title || '')
        setSection3Description1(content.section3_description1 || '')
        setSection3Description2(content.section3_description2 || '')
        setSection3Description3(content.section3_description3 || '')
        setSection3ImageUrl(content.section3_image_url || '')
        setSection3ImageAltText(content.section3_image_alt_text || '')
        setSection3ButtonText(content.section3_button_text || '')
        setSection3RedirectUrl(content.section3_redirect_url || '')
        // Section 4
        setSection4Title(content.section4_title || '')
        setSection4Description1(content.section4_description1 || '')
        setSection4Description2(content.section4_description2 || '')
        setSection4Description3(content.section4_description3 || '')
        setSection4ImageUrl(content.section4_image_url || '')
        setSection4ImageAltText(content.section4_image_alt_text || '')
        setSection4ButtonText(content.section4_button_text || '')
        setSection4RedirectUrl(content.section4_redirect_url || '')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}

    // Section 1 validation
    if (!section1ImageUrl) newErrors.section1_image_url = 'Banner image is required'
    if (!section1ImageAltText) newErrors.section1_image_alt_text = 'Image alt text is required'

    // Section 2 validation
    if (!section2ImageUrl) newErrors.section2_image_url = 'Image is required'
    if (!section2ImageAltText) newErrors.section2_image_alt_text = 'Image alt text is required'
    if (!section2Title) newErrors.section2_title = 'Title is required'
    if (!section2ButtonText) newErrors.section2_button_text = 'Button text is required'
    if (!section2RedirectUrl) {
      newErrors.section2_redirect_url = 'Redirect URL is required'
    } else if (!/^https?:\/\/.+/.test(section2RedirectUrl)) {
      newErrors.section2_redirect_url = 'Must be a valid URL starting with http:// or https://'
    }

    // Section 3 validation
    if (!section3ImageUrl) newErrors.section3_image_url = 'Image is required'
    if (!section3ImageAltText) newErrors.section3_image_alt_text = 'Image alt text is required'
    if (!section3Title) newErrors.section3_title = 'Title is required'
    if (!section3ButtonText) newErrors.section3_button_text = 'Button text is required'
    if (!section3RedirectUrl) {
      newErrors.section3_redirect_url = 'Redirect URL is required'
    } else if (!/^https?:\/\/.+/.test(section3RedirectUrl)) {
      newErrors.section3_redirect_url = 'Must be a valid URL starting with http:// or https://'
    }

    // Section 4 validation
    if (!section4ImageUrl) newErrors.section4_image_url = 'Image is required'
    if (!section4ImageAltText) newErrors.section4_image_alt_text = 'Image alt text is required'
    if (!section4Title) newErrors.section4_title = 'Title is required'
    if (!section4ButtonText) newErrors.section4_button_text = 'Button text is required'
    if (!section4RedirectUrl) {
      newErrors.section4_redirect_url = 'Redirect URL is required'
    } else if (!/^https?:\/\/.+/.test(section4RedirectUrl)) {
      newErrors.section4_redirect_url = 'Must be a valid URL starting with http:// or https://'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const response = await cmsService.updatePartnerWithUs({
        section1_image_url: section1ImageUrl,
        section1_image_alt_text: section1ImageAltText,

        section2_title: section2Title,
        section2_description1: section2Description1,
        section2_description2: section2Description2,
        section2_image_url: section2ImageUrl,
        section2_image_alt_text: section2ImageAltText,
        section2_button_text: section2ButtonText,
        section2_redirect_url: section2RedirectUrl,

        section3_title: section3Title,
        section3_description1: section3Description1,
        section3_description2: section3Description2,
        section3_description3: section3Description3,
        section3_image_url: section3ImageUrl,
        section3_image_alt_text: section3ImageAltText,
        section3_button_text: section3ButtonText,
        section3_redirect_url: section3RedirectUrl,

        section4_title: section4Title,
        section4_description1: section4Description1,
        section4_description2: section4Description2,
        section4_description3: section4Description3,
        section4_image_url: section4ImageUrl,
        section4_image_alt_text: section4ImageAltText,
        section4_button_text: section4ButtonText,
        section4_redirect_url: section4RedirectUrl,
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
          <h1 className="text-2xl font-semibold">Partner With Us</h1>
          <p className="text-sm text-muted-foreground">
            Manage the partner with us page content
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

      {/* Section 1 - Banner */}
      <Card>
        <CardHeader>
          <CardTitle>Section 1 - Banner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <MediaPickerInput
            label="Banner Image"
            value={section1ImageUrl || null}
            onChange={(path) => {
              setSection1ImageUrl(path || '')
              if (path) setErrors((prev) => ({ ...prev, section1_image_url: undefined as unknown as string }))
            }}
            rootPath="cms/partner-with-us/section1"
            required
            error={errors.section1_image_url}
            accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
          />

          <div className="space-y-2">
            <Label htmlFor="section1_image_alt_text">
              Image Alt Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section1_image_alt_text"
              placeholder="Describe the banner image"
              value={section1ImageAltText}
              onChange={(e) => {
                setSection1ImageAltText(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section1_image_alt_text: undefined as unknown as string }))
              }}
            />
            {errors.section1_image_alt_text && (
              <p className="text-sm text-destructive">{errors.section1_image_alt_text}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2 */}
      <Card>
        <CardHeader>
          <CardTitle>Section 2</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="section2_title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section2_title"
              placeholder="Enter section title"
              value={section2Title}
              onChange={(e) => {
                setSection2Title(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section2_title: undefined as unknown as string }))
              }}
            />
            {errors.section2_title && (
              <p className="text-sm text-destructive">{errors.section2_title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section2_description1">Description 1</Label>
            <Textarea
              id="section2_description1"
              placeholder="Enter description..."
              value={section2Description1}
              onChange={(e) => setSection2Description1(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section2_description2">Description 2</Label>
            <Textarea
              id="section2_description2"
              placeholder="Enter description..."
              value={section2Description2}
              onChange={(e) => setSection2Description2(e.target.value)}
              rows={3}
            />
          </div>

          <MediaPickerInput
            label="Image"
            value={section2ImageUrl || null}
            onChange={(path) => {
              setSection2ImageUrl(path || '')
              if (path) setErrors((prev) => ({ ...prev, section2_image_url: undefined as unknown as string }))
            }}
            rootPath="cms/partner-with-us/section2"
            required
            error={errors.section2_image_url}
            accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
          />

          <div className="space-y-2">
            <Label htmlFor="section2_image_alt_text">
              Image Alt Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section2_image_alt_text"
              placeholder="Describe the image"
              value={section2ImageAltText}
              onChange={(e) => {
                setSection2ImageAltText(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section2_image_alt_text: undefined as unknown as string }))
              }}
            />
            {errors.section2_image_alt_text && (
              <p className="text-sm text-destructive">{errors.section2_image_alt_text}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section2_button_text">
              Button Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section2_button_text"
              placeholder="e.g., Learn More"
              value={section2ButtonText}
              onChange={(e) => {
                setSection2ButtonText(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section2_button_text: undefined as unknown as string }))
              }}
            />
            {errors.section2_button_text && (
              <p className="text-sm text-destructive">{errors.section2_button_text}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section2_redirect_url">
              Redirect URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section2_redirect_url"
              placeholder="https://example.com"
              value={section2RedirectUrl}
              onChange={(e) => {
                setSection2RedirectUrl(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section2_redirect_url: undefined as unknown as string }))
              }}
            />
            {errors.section2_redirect_url ? (
              <p className="text-sm text-destructive">{errors.section2_redirect_url}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Full URL with https (e.g., https://example.com)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 3 */}
      <Card>
        <CardHeader>
          <CardTitle>Section 3</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="section3_title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section3_title"
              placeholder="Enter section title"
              value={section3Title}
              onChange={(e) => {
                setSection3Title(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section3_title: undefined as unknown as string }))
              }}
            />
            {errors.section3_title && (
              <p className="text-sm text-destructive">{errors.section3_title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section3_description1">Description 1</Label>
            <Textarea
              id="section3_description1"
              placeholder="Enter description..."
              value={section3Description1}
              onChange={(e) => setSection3Description1(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section3_description2">Description 2</Label>
            <Textarea
              id="section3_description2"
              placeholder="Enter description..."
              value={section3Description2}
              onChange={(e) => setSection3Description2(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section3_description3">Description 3</Label>
            <Textarea
              id="section3_description3"
              placeholder="Enter description..."
              value={section3Description3}
              onChange={(e) => setSection3Description3(e.target.value)}
              rows={3}
            />
          </div>

          <MediaPickerInput
            label="Image"
            value={section3ImageUrl || null}
            onChange={(path) => {
              setSection3ImageUrl(path || '')
              if (path) setErrors((prev) => ({ ...prev, section3_image_url: undefined as unknown as string }))
            }}
            rootPath="cms/partner-with-us/section3"
            required
            error={errors.section3_image_url}
            accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
          />

          <div className="space-y-2">
            <Label htmlFor="section3_image_alt_text">
              Image Alt Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section3_image_alt_text"
              placeholder="Describe the image"
              value={section3ImageAltText}
              onChange={(e) => {
                setSection3ImageAltText(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section3_image_alt_text: undefined as unknown as string }))
              }}
            />
            {errors.section3_image_alt_text && (
              <p className="text-sm text-destructive">{errors.section3_image_alt_text}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section3_button_text">
              Button Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section3_button_text"
              placeholder="e.g., Learn More"
              value={section3ButtonText}
              onChange={(e) => {
                setSection3ButtonText(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section3_button_text: undefined as unknown as string }))
              }}
            />
            {errors.section3_button_text && (
              <p className="text-sm text-destructive">{errors.section3_button_text}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section3_redirect_url">
              Redirect URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section3_redirect_url"
              placeholder="https://example.com"
              value={section3RedirectUrl}
              onChange={(e) => {
                setSection3RedirectUrl(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section3_redirect_url: undefined as unknown as string }))
              }}
            />
            {errors.section3_redirect_url ? (
              <p className="text-sm text-destructive">{errors.section3_redirect_url}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Full URL with https (e.g., https://example.com)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 4 */}
      <Card>
        <CardHeader>
          <CardTitle>Section 4</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="section4_title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section4_title"
              placeholder="Enter section title"
              value={section4Title}
              onChange={(e) => {
                setSection4Title(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section4_title: undefined as unknown as string }))
              }}
            />
            {errors.section4_title && (
              <p className="text-sm text-destructive">{errors.section4_title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section4_description1">Description 1</Label>
            <Textarea
              id="section4_description1"
              placeholder="Enter description..."
              value={section4Description1}
              onChange={(e) => setSection4Description1(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section4_description2">Description 2</Label>
            <Textarea
              id="section4_description2"
              placeholder="Enter description..."
              value={section4Description2}
              onChange={(e) => setSection4Description2(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section4_description3">Description 3</Label>
            <Textarea
              id="section4_description3"
              placeholder="Enter description..."
              value={section4Description3}
              onChange={(e) => setSection4Description3(e.target.value)}
              rows={3}
            />
          </div>

          <MediaPickerInput
            label="Image"
            value={section4ImageUrl || null}
            onChange={(path) => {
              setSection4ImageUrl(path || '')
              if (path) setErrors((prev) => ({ ...prev, section4_image_url: undefined as unknown as string }))
            }}
            rootPath="cms/partner-with-us/section4"
            required
            error={errors.section4_image_url}
            accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
          />

          <div className="space-y-2">
            <Label htmlFor="section4_image_alt_text">
              Image Alt Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section4_image_alt_text"
              placeholder="Describe the image"
              value={section4ImageAltText}
              onChange={(e) => {
                setSection4ImageAltText(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section4_image_alt_text: undefined as unknown as string }))
              }}
            />
            {errors.section4_image_alt_text && (
              <p className="text-sm text-destructive">{errors.section4_image_alt_text}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section4_button_text">
              Button Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section4_button_text"
              placeholder="e.g., Learn More"
              value={section4ButtonText}
              onChange={(e) => {
                setSection4ButtonText(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section4_button_text: undefined as unknown as string }))
              }}
            />
            {errors.section4_button_text && (
              <p className="text-sm text-destructive">{errors.section4_button_text}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="section4_redirect_url">
              Redirect URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="section4_redirect_url"
              placeholder="https://example.com"
              value={section4RedirectUrl}
              onChange={(e) => {
                setSection4RedirectUrl(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, section4_redirect_url: undefined as unknown as string }))
              }}
            />
            {errors.section4_redirect_url ? (
              <p className="text-sm text-destructive">{errors.section4_redirect_url}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Full URL with https (e.g., https://example.com)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
