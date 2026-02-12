'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type AboutLuminiqueContent } from '@/redux/services/cmsService'
import { MediaPickerInput } from '@/components/media'

export function AboutLuminiqueContentComponent() {
  // Form state
  const [imageUrl, setImageUrl] = useState('')
  const [imageAltText, setImageAltText] = useState('')
  const [description, setDescription] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Error state
  const [errors, setErrors] = useState<{
    image_url?: string
    description?: string
    button_text?: string
    redirect_url?: string
  }>({})

  // Fetch content on mount
  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getAboutLuminique()
      const content = response.data?.content as AboutLuminiqueContent | undefined
      if (content) {
        setImageUrl(content.image_url || '')
        setImageAltText(content.image_alt_text || '')
        setDescription(content.description || '')
        setButtonText(content.button_text || '')
        setRedirectUrl(content.redirect_url || '')
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
    if (!description) {
      newErrors.description = 'Description is required'
    }
    if (!buttonText) {
      newErrors.button_text = 'Button text is required'
    }
    if (!redirectUrl) {
      newErrors.redirect_url = 'Redirect URL is required'
    } else if (!/^https?:\/\/.+/.test(redirectUrl)) {
      newErrors.redirect_url = 'Must be a valid URL starting with http:// or https://'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const response = await cmsService.updateAboutLuminique({
        image_url: imageUrl,
        image_alt_text: imageAltText,
        description,
        button_text: buttonText,
        redirect_url: redirectUrl,
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
          <h1 className="text-2xl font-semibold">About Luminique</h1>
          <p className="text-sm text-muted-foreground">
            Manage the about luminique section on homepage
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
            rootPath="cms/homepage/about-luminique"
            required
            error={errors.image_url}
            accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
          />

          {/* Alt Text Field */}
          <div className="space-y-2">
            <Label htmlFor="image_alt_text">Image Alt Text</Label>
            <Input
              id="image_alt_text"
              placeholder="Describe the image"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
            />
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

          {/* Button Text Field */}
          <div className="space-y-2">
            <Label htmlFor="button_text">
              Button Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="button_text"
              placeholder="e.g., Know More"
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

          {/* Redirect URL Field */}
          <div className="space-y-2">
            <Label htmlFor="redirect_url">
              Redirect URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="redirect_url"
              placeholder="https://example.com/about"
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
                Full URL with https (e.g., https://example.com/about)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
