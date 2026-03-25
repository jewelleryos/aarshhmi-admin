'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { MediaPickerInput } from '@/components/media'
import { cmsService, type GiftGuideContent, type GiftSectionItem } from '@/components/cms/services/cmsService'

const createDefaultSectionOne = (): GiftSectionItem[] =>
  Array.from({ length: 4 }, (_, i) => ({
    id: `gift_1_${i + 1}`,
    image_url: '',
    image_alt_text: '',
  }))

const createDefaultSectionTwo = (): GiftSectionItem[] =>
  Array.from({ length: 3 }, (_, i) => ({
    id: `gift_2_${i + 1}`,
    image_url: '',
    image_alt_text: '',
  }))

interface GiftSectionErrors {
  [key: number]: { image_url?: string; image_alt_text?: string }
}

export function CMSGiftGuide() {
  const [description, setDescription] = useState('')
  const [giftSectionOne, setGiftSectionOne] = useState<GiftSectionItem[]>(createDefaultSectionOne())
  const [giftSectionTwo, setGiftSectionTwo] = useState<GiftSectionItem[]>(createDefaultSectionTwo())
  const [buttonText, setButtonText] = useState('')
  const [buttonRedirectUrl, setButtonRedirectUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{
    description?: string
    button_text?: string
    button_redirect_url?: string
    gift_section_one?: GiftSectionErrors
    gift_section_two?: GiftSectionErrors
  }>({})

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getGiftGuide()
      const content = response.data?.content as GiftGuideContent | undefined
      if (content) {
        setDescription(content.description || '')
        setButtonText(content.button_text || '')
        setButtonRedirectUrl(content.button_redirect_url || '')
        if (content.gift_section_one && content.gift_section_one.length === 4) {
          setGiftSectionOne(content.gift_section_one)
        }
        if (content.gift_section_two && content.gift_section_two.length === 3) {
          setGiftSectionTwo(content.gift_section_two)
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch content')
    } finally {
      setIsLoading(false)
    }
  }

  const updateSectionItem = (
    section: 'one' | 'two',
    index: number,
    field: keyof GiftSectionItem,
    value: string
  ) => {
    const setter = section === 'one' ? setGiftSectionOne : setGiftSectionTwo
    setter((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    // Clear error for this field
    const errorKey = section === 'one' ? 'gift_section_one' : 'gift_section_two'
    if (errors[errorKey]?.[index]?.[field as keyof GiftSectionErrors[number]]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        if (newErrors[errorKey]?.[index]) {
          delete newErrors[errorKey]![index][field as keyof GiftSectionErrors[number]]
        }
        return newErrors
      })
    }
  }

  const validateSectionItems = (items: GiftSectionItem[]): GiftSectionErrors => {
    const sectionErrors: GiftSectionErrors = {}
    items.forEach((item, index) => {
      const itemErrors: { image_url?: string; image_alt_text?: string } = {}
      if (!item.image_url) {
        itemErrors.image_url = 'Image is required'
      }
      if (!item.image_alt_text) {
        itemErrors.image_alt_text = 'Alt text is required'
      }
      if (Object.keys(itemErrors).length > 0) {
        sectionErrors[index] = itemErrors
      }
    })
    return sectionErrors
  }

  const handleSave = async () => {
    const newErrors: typeof errors = {}
    if (!description) {
      newErrors.description = 'Description is required'
    }
    if (!buttonText) {
      newErrors.button_text = 'Button text is required'
    }
    if (!buttonRedirectUrl) {
      newErrors.button_redirect_url = 'Button redirect URL is required'
    } else if (!/^https?:\/\/.+/.test(buttonRedirectUrl)) {
      newErrors.button_redirect_url = 'Must be a valid URL starting with http:// or https://'
    }

    const sectionOneErrors = validateSectionItems(giftSectionOne)
    if (Object.keys(sectionOneErrors).length > 0) {
      newErrors.gift_section_one = sectionOneErrors
    }

    const sectionTwoErrors = validateSectionItems(giftSectionTwo)
    if (Object.keys(sectionTwoErrors).length > 0) {
      newErrors.gift_section_two = sectionTwoErrors
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in all required fields')
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const response = await cmsService.updateGiftGuide({
        description,
        gift_section_one: giftSectionOne,
        gift_section_two: giftSectionTwo,
        button_text: buttonText,
        button_redirect_url: buttonRedirectUrl,
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
          <h1 className="text-2xl font-semibold">Gift Guide</h1>
          <p className="text-sm text-muted-foreground">
            Manage the gift guide section on homepage
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



      {/* Section Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Input
              id="description"
              placeholder="Enter section description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, description: undefined }))
              }}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Call to Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="button_text">
              Button Text <span className="text-destructive">*</span>
            </Label>
            <Input
              id="button_text"
              placeholder="e.g., View More"
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
          <div className="space-y-2">
            <Label htmlFor="button_redirect_url">
              Button Redirect URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="button_redirect_url"
              placeholder="https://example.com/gift-guide"
              value={buttonRedirectUrl}
              onChange={(e) => {
                setButtonRedirectUrl(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, button_redirect_url: undefined }))
              }}
            />
            {errors.button_redirect_url ? (
              <p className="text-sm text-destructive">{errors.button_redirect_url}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Full URL with https (e.g., https://example.com/page)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gift Section 1 (4 Fixed Items) */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Gift Section 1 (4 Fixed)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {giftSectionOne.map((item, index) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Gift {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MediaPickerInput
                  label="Image"
                  value={item.image_url || null}
                  onChange={(path) => updateSectionItem('one', index, 'image_url', path || '')}
                  rootPath="cms/homepage/gift-guide/section-one"
                  required
                  error={errors.gift_section_one?.[index]?.image_url}
                  accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                />

                <div className="space-y-2">
                  <Label htmlFor={`s1_alt_${index}`}>
                    Alt Text <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`s1_alt_${index}`}
                    placeholder="Image description"
                    value={item.image_alt_text}
                    onChange={(e) => updateSectionItem('one', index, 'image_alt_text', e.target.value)}
                  />
                  {errors.gift_section_one?.[index]?.image_alt_text && (
                    <p className="text-sm text-destructive">{errors.gift_section_one[index].image_alt_text}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Gift Section 2 (3 Fixed Items) */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Gift Section 2 (3 Fixed)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {giftSectionTwo.map((item, index) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Gift {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MediaPickerInput
                  label="Image"
                  value={item.image_url || null}
                  onChange={(path) => updateSectionItem('two', index, 'image_url', path || '')}
                  rootPath="cms/homepage/gift-guide/section-two"
                  required
                  error={errors.gift_section_two?.[index]?.image_url}
                  accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                />

                <div className="space-y-2">
                  <Label htmlFor={`s2_alt_${index}`}>
                    Alt Text <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`s2_alt_${index}`}
                    placeholder="Image description"
                    value={item.image_alt_text}
                    onChange={(e) => updateSectionItem('two', index, 'image_alt_text', e.target.value)}
                  />
                  {errors.gift_section_two?.[index]?.image_alt_text && (
                    <p className="text-sm text-destructive">{errors.gift_section_two[index].image_alt_text}</p>
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
