'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type ExperienceContent } from '@/components/cms/services/cmsService'
import { MediaPickerInput } from '@/components/media'

export function ExperienceContentComponent() {
  // Form state
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlterText, setImageAlterText] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [description, setDescription] = useState('')
  const [secondSectionTitle, setSecondSectionTitle] = useState('')

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Error state
  const [errors, setErrors] = useState<{
    image_url?: string
    redirect_url?: string
    description?: string
    second_section_title?: string
  }>({})

  // Fetch content on mount
  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getExperience()
      const content = response.data?.content as ExperienceContent | undefined
      if (content) {
        setImageUrl(content.image_url || '')
        setImageAlterText(content.image_alter_text || '')
        setRedirectUrl(content.redirect_url || '')
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

  const handleSave = async () => {
    // Validate
    const newErrors: typeof errors = {}
    if (!imageUrl) {
      newErrors.image_url = 'Image is required'
    }
    if (!redirectUrl) {
      newErrors.redirect_url = 'Redirect URL is required'
    } else if (!/^https?:\/\/.+/.test(redirectUrl)) {
      newErrors.redirect_url = 'Must be a valid URL starting with http:// or https://'
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
        image_url: imageUrl,
        image_alter_text: imageAlterText,
        redirect_url: redirectUrl,
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

      {/* Form */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Image Field */}
          <MediaPickerInput
            label="Image"
            value={imageUrl || null}
            onChange={(path) => {
              setImageUrl(path || '')
              if (path) setErrors((prev) => ({ ...prev, image_url: undefined }))
            }}
            rootPath="cms/homepage/experience"
            required
            error={errors.image_url}
            accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
          />

          {/* Alter Text Field */}
          <div className="space-y-2">
            <Label htmlFor="image_alt_text">Image Alt Text</Label>
            <Input
              id="image_alt_text"
              placeholder="Describe the image"
              value={imageAlterText}
              onChange={(e) => setImageAlterText(e.target.value)}
            />
          </div>

          {/* Redirect URL Field */}
          <div className="space-y-2">
            <Label htmlFor="redirect_url">
              Redirect URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="redirect_url"
              placeholder="https://example.com/experience"
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
                Full URL with https (e.g., https://example.com/experience)
              </p>
            )}
          </div>

          {/* Description Field */}
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

          {/* Second Section Title Field */}
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
                if (e.target.value) setErrors((prev) => ({ ...prev, second_section_title: undefined }))
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
