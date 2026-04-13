'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { MediaPickerInput } from '@/components/media'
import { cmsService, type GiftGuideContent, type GiftSectionItem, type GiftSectionSubItem } from '@/components/cms/services/cmsService'

const createDefaultSectionOne = (): GiftSectionItem[] =>
  Array.from({ length: 4 }, (_, i) => ({
    id: `gift_1_${i + 1}`,
    image_url: '',
    mobile_view_image_url: '',
    image_alt_text: '',
    redirect_url: '',
  }))

const createDefaultSectionTwo = (): GiftSectionItem[] =>
  Array.from({ length: 3 }, (_, i) => ({
    id: `gift_2_${i + 1}`,
    image_url: '',
    mobile_view_image_url: '',
    image_alt_text: '',
    redirect_url: '',
  }))

interface GiftSectionErrors {
  [key: number]: { image_url?: string; image_alt_text?: string; redirect_url?: string; sub_items?: { [key: number]: { redirect_url?: string; title_1?: string; title_2?: string } } }
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

  const addSubItem = (sectionOneIndex: number) => {
    setGiftSectionOne((prev) => {
      const updated = [...prev]
      const current = updated[sectionOneIndex]
      updated[sectionOneIndex] = {
        ...current,
        sub_items: [...(current.sub_items || []), { image_url: '', image_alt_text: '', redirect_url: '', title_1: '', title_2: '' }],
      }
      return updated
    })
  }

  const removeSubItem = (sectionOneIndex: number, subIndex: number) => {
    setGiftSectionOne((prev) => {
      const updated = [...prev]
      const current = updated[sectionOneIndex]
      updated[sectionOneIndex] = {
        ...current,
        sub_items: (current.sub_items || []).filter((_, i) => i !== subIndex),
      }
      return updated
    })
  }

  const updateSubItem = (sectionOneIndex: number, subIndex: number, field: keyof GiftSectionSubItem, value: string) => {
    setGiftSectionOne((prev) => {
      const updated = [...prev]
      const current = updated[sectionOneIndex]
      const subItems = [...(current.sub_items || [])]
      subItems[subIndex] = { ...subItems[subIndex], [field]: value }
      updated[sectionOneIndex] = { ...current, sub_items: subItems }
      return updated
    })
  }

  const validateSectionItems = (items: GiftSectionItem[]): GiftSectionErrors => {
    const sectionErrors: GiftSectionErrors = {}
    items.forEach((item, index) => {
      const itemErrors: GiftSectionErrors[number] = {}
      if (!item.image_url) {
        itemErrors.image_url = 'Image is required'
      }
      if (!item.redirect_url) {
        itemErrors.redirect_url = 'Redirect URL is required'
      } else if (!/^https?:\/\/.+/.test(item.redirect_url)) {
        itemErrors.redirect_url = 'Must be a valid URL starting with http:// or https://'
      }
      if (item.sub_items && item.sub_items.length > 0) {
        const subErrors: GiftSectionErrors[number]['sub_items'] = {}
        item.sub_items.forEach((sub, si) => {
          const se: { redirect_url?: string; title_1?: string; title_2?: string } = {}
          if (!sub.title_1) {
            se.title_1 = 'Title 1 is required'
          }
          if (!sub.title_2) {
            se.title_2 = 'Title 2 is required'
          }
          if (Object.keys(se).length > 0) {
            subErrors![si] = se
          }
        })
        if (Object.keys(subErrors!).length > 0) {
          itemErrors.sub_items = subErrors
        }
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

                <MediaPickerInput
                  label="Mobile View Image"
                  value={item.mobile_view_image_url || null}
                  onChange={(path) => updateSectionItem('one', index, 'mobile_view_image_url', path || '')}
                  rootPath="cms/homepage/gift-guide/section-one/mobile"
                  accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                />

                <div className="space-y-2">
                  <Label htmlFor={`s1_redirect_${index}`}>
                    Redirect URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`s1_redirect_${index}`}
                    placeholder="https://example.com/gift"
                    value={item.redirect_url}
                    onChange={(e) => updateSectionItem('one', index, 'redirect_url', e.target.value)}
                  />
                  {errors.gift_section_one?.[index]?.redirect_url ? (
                    <p className="text-sm text-destructive">{errors.gift_section_one[index].redirect_url}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Full URL with https</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`s1_alt_${index}`}>Alt Text</Label>
                  <Input
                    id={`s1_alt_${index}`}
                    placeholder="Image description"
                    value={item.image_alt_text}
                    onChange={(e) => updateSectionItem('one', index, 'image_alt_text', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gift 4 Sub Items — full width section below the grid */}
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Gift 4 — Sub Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSubItem(3)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Sub Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(giftSectionOne[3]?.sub_items || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No sub items added yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(giftSectionOne[3]?.sub_items || []).map((sub, si) => (
                  <div key={si} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sub Item {si + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeSubItem(3, si)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <MediaPickerInput
                      label="Image"
                      value={sub.image_url || null}
                      onChange={(path) => updateSubItem(3, si, 'image_url', path || '')}
                      rootPath="cms/homepage/gift-guide/section-one/sub-items"
                      accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                    />
                    <div className="space-y-2">
                      <Label htmlFor={`s1_sub_alt_${si}`}>Alt Text</Label>
                      <Input
                        id={`s1_sub_alt_${si}`}
                        placeholder="Image description"
                        value={sub.image_alt_text || ''}
                        onChange={(e) => updateSubItem(3, si, 'image_alt_text', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`s1_sub_redirect_${si}`}>Redirect URL</Label>
                      <Input
                        id={`s1_sub_redirect_${si}`}
                        placeholder="https://example.com"
                        value={sub.redirect_url}
                        onChange={(e) => updateSubItem(3, si, 'redirect_url', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`s1_sub_title1_${si}`}>
                        Title 1 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`s1_sub_title1_${si}`}
                        placeholder="Title 1"
                        value={sub.title_1}
                        onChange={(e) => updateSubItem(3, si, 'title_1', e.target.value)}
                      />
                      {errors.gift_section_one?.[3]?.sub_items?.[si]?.title_1 && (
                        <p className="text-sm text-destructive">{errors.gift_section_one[3].sub_items![si].title_1}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`s1_sub_title2_${si}`}>
                        Title 2 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`s1_sub_title2_${si}`}
                        placeholder="Title 2"
                        value={sub.title_2}
                        onChange={(e) => updateSubItem(3, si, 'title_2', e.target.value)}
                      />
                      {errors.gift_section_one?.[3]?.sub_items?.[si]?.title_2 && (
                        <p className="text-sm text-destructive">{errors.gift_section_one[3].sub_items![si].title_2}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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

                <MediaPickerInput
                  label="Mobile View Image"
                  value={item.mobile_view_image_url || null}
                  onChange={(path) => updateSectionItem('two', index, 'mobile_view_image_url', path || '')}
                  rootPath="cms/homepage/gift-guide/section-two/mobile"
                  accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                />

                <div className="space-y-2">
                  <Label htmlFor={`s2_redirect_${index}`}>
                    Redirect URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`s2_redirect_${index}`}
                    placeholder="https://example.com/gift"
                    value={item.redirect_url}
                    onChange={(e) => updateSectionItem('two', index, 'redirect_url', e.target.value)}
                  />
                  {errors.gift_section_two?.[index]?.redirect_url ? (
                    <p className="text-sm text-destructive">{errors.gift_section_two[index].redirect_url}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Full URL with https</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`s2_alt_${index}`}>Alt Text</Label>
                  <Input
                    id={`s2_alt_${index}`}
                    placeholder="Image description"
                    value={item.image_alt_text}
                    onChange={(e) => updateSectionItem('two', index, 'image_alt_text', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>


    </div>
  )
}
