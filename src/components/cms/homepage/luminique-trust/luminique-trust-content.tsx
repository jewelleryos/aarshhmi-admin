'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type LuminiqueTrustContent, type LuminiqueTrustItem } from '@/redux/services/cmsService'
import { MediaPickerInput } from '@/components/media'

// Default empty trust items (6 fixed)
const createDefaultTrusts = (): LuminiqueTrustItem[] => {
  return Array.from({ length: 6 }, (_, index) => ({
    id: `trust_${index + 1}`,
    image_url: '',
    image_alt_text: '',
    text_one: '',
    text_two: '',
  }))
}

export function LuminiqueTrustContentComponent() {
  // Form state
  const [title, setTitle] = useState('')
  const [subtext, setSubtext] = useState('')
  const [trusts, setTrusts] = useState<LuminiqueTrustItem[]>(createDefaultTrusts())

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Error state
  const [errors, setErrors] = useState<{
    title?: string
    subtext?: string
    trusts?: { [key: number]: { image_url?: string; text_one?: string; text_two?: string } }
  }>({})

  // Fetch content on mount
  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getLuminiqueTrust()
      const content = response.data?.content as LuminiqueTrustContent | undefined
      if (content) {
        setTitle(content.title || '')
        setSubtext(content.subtext || '')
        // Ensure we always have 6 items
        if (content.trusts && content.trusts.length === 6) {
          setTrusts(content.trusts)
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch content')
    } finally {
      setIsLoading(false)
    }
  }

  const updateTrustItem = (index: number, field: keyof LuminiqueTrustItem, value: string) => {
    setTrusts((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    // Clear error for this field
    if (errors.trusts?.[index]?.[field as keyof typeof errors.trusts[number]]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        if (newErrors.trusts?.[index]) {
          delete newErrors.trusts[index][field as keyof typeof newErrors.trusts[number]]
        }
        return newErrors
      })
    }
  }

  const handleSave = async () => {
    // Validate
    const newErrors: typeof errors = {}

    if (!title) {
      newErrors.title = 'Title is required'
    }
    if (!subtext) {
      newErrors.subtext = 'Subtext is required'
    }

    // Validate each trust item
    const trustErrors: typeof errors.trusts = {}
    trusts.forEach((trust, index) => {
      const itemErrors: { image_url?: string; text_one?: string; text_two?: string } = {}
      if (!trust.image_url) {
        itemErrors.image_url = 'Image is required'
      }
      if (!trust.text_one) {
        itemErrors.text_one = 'Text one is required'
      }
      if (!trust.text_two) {
        itemErrors.text_two = 'Text two is required'
      }
      if (Object.keys(itemErrors).length > 0) {
        trustErrors[index] = itemErrors
      }
    })

    if (Object.keys(trustErrors).length > 0) {
      newErrors.trusts = trustErrors
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in all required fields')
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const response = await cmsService.updateLuminiqueTrust({
        title,
        subtext,
        trusts,
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
          <h1 className="text-2xl font-semibold">Luminique Trust</h1>
          <p className="text-sm text-muted-foreground">
            Manage the trust section on homepage (6 fixed items)
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

      {/* Title & Subtext */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter section title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, title: undefined }))
              }}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Subtext Field */}
          <div className="space-y-2">
            <Label htmlFor="subtext">
              Subtext <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subtext"
              placeholder="Enter section subtext"
              value={subtext}
              onChange={(e) => {
                setSubtext(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, subtext: undefined }))
              }}
            />
            {errors.subtext && (
              <p className="text-sm text-destructive">{errors.subtext}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trust Items Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Trust Items (6 Fixed)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trusts.map((trust, index) => (
            <Card key={trust.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Trust {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image */}
                <MediaPickerInput
                  label="Image"
                  value={trust.image_url || null}
                  onChange={(path) => updateTrustItem(index, 'image_url', path || '')}
                  rootPath="cms/homepage/luminique-trust"
                  required
                  error={errors.trusts?.[index]?.image_url}
                  accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                />

                {/* Alt Text */}
                <div className="space-y-2">
                  <Label htmlFor={`alt_${index}`}>Alt Text</Label>
                  <Input
                    id={`alt_${index}`}
                    placeholder="Image description"
                    value={trust.image_alt_text}
                    onChange={(e) => updateTrustItem(index, 'image_alt_text', e.target.value)}
                  />
                </div>

                {/* Text One */}
                <div className="space-y-2">
                  <Label htmlFor={`text_one_${index}`}>
                    Text One <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`text_one_${index}`}
                    placeholder="e.g., 100%"
                    value={trust.text_one}
                    onChange={(e) => updateTrustItem(index, 'text_one', e.target.value)}
                  />
                  {errors.trusts?.[index]?.text_one && (
                    <p className="text-sm text-destructive">{errors.trusts[index].text_one}</p>
                  )}
                </div>

                {/* Text Two */}
                <div className="space-y-2">
                  <Label htmlFor={`text_two_${index}`}>
                    Text Two <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`text_two_${index}`}
                    placeholder="e.g., Certified Diamonds"
                    value={trust.text_two}
                    onChange={(e) => updateTrustItem(index, 'text_two', e.target.value)}
                  />
                  {errors.trusts?.[index]?.text_two && (
                    <p className="text-sm text-destructive">{errors.trusts[index].text_two}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
