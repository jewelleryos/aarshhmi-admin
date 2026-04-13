'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type AssuranceContent, type AssuranceItem } from '@/components/cms/services/cmsService'
import { MediaPickerInput } from '@/components/media'

const ASSURANCE_COUNT = 5

const createDefaultItems = (): AssuranceItem[] =>
  Array.from({ length: ASSURANCE_COUNT }, (_, index) => ({
    id: `assurance_${index + 1}`,
    image_url: '',
    mobile_view_image_url: '',
    image_alt_text: '',
    text_one: '',
    text_two: '',
  }))

export function AssuranceContentComponent() {
  const [items, setItems] = useState<AssuranceItem[]>(createDefaultItems())

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{ [key: number]: { image_url?: string; text_one?: string;} }>({})

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getAssurance()
      const content = response.data?.content as AssuranceContent | undefined
      if (content?.items && content.items.length === ASSURANCE_COUNT) {
        setItems(content.items)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch content')
    } finally {
      setIsLoading(false)
    }
  }

  const updateItem = (index: number, field: keyof AssuranceItem, value: string) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    if (value) {
      setErrors((prev) => {
        const next = { ...prev }
        if (next[index]) delete next[index][field as keyof typeof next[number]]
        return next
      })
    }
  }

  const handleSave = async () => {
    const newErrors: typeof errors = {}
    items.forEach((item, index) => {
      const itemErrors: { image_url?: string; text_one?: string} = {}
      if (!item.image_url) itemErrors.image_url = 'Image is required'
      if (!item.text_one) itemErrors.text_one = 'Text one is required'
      if (Object.keys(itemErrors).length > 0) newErrors[index] = itemErrors
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in all required fields')
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const response = await cmsService.updateAssurance({ items })
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
          <h1 className="text-2xl font-semibold">Assurance</h1>
          <p className="text-sm text-muted-foreground">
            Manage the assurance section on homepage (5 fixed items)
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

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assurance {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image */}
              <MediaPickerInput
                label="Image"
                value={item.image_url || null}
                onChange={(path) => updateItem(index, 'image_url', path || '')}
                rootPath="cms/homepage/assurance"
                required
                error={errors[index]?.image_url}
                accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
              />

              <MediaPickerInput
                label="Mobile View Image"
                value={item.mobile_view_image_url || null}
                onChange={(path) => updateItem(index, 'mobile_view_image_url', path || '')}
                rootPath="cms/homepage/assurance/mobile"
                accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
              />

              {/* Alt Text */}
              <div className="space-y-2">
                <Label htmlFor={`alt_${index}`}>Alt Text</Label>
                <Input
                  id={`alt_${index}`}
                  placeholder="Image description"
                  value={item.image_alt_text}
                  onChange={(e) => updateItem(index, 'image_alt_text', e.target.value)}
                />
              </div>

              {/* Text One */}
              <div className="space-y-2">
                <Label htmlFor={`text_one_${index}`}>
                  Text One <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`text_one_${index}`}
                  placeholder="Enter text"
                  value={item.text_one}
                  onChange={(e) => updateItem(index, 'text_one', e.target.value)}
                />
                {errors[index]?.text_one && (
                  <p className="text-sm text-destructive">{errors[index].text_one}</p>
                )}
              </div>

              {/* Text Two */}
              <div className="space-y-2">
                <Label htmlFor={`text_two_${index}`}>
                  Text Two
                </Label>
                <Input
                  id={`text_two_${index}`}
                  placeholder="Enter text"
                  value={item.text_two}
                  onChange={(e) => updateItem(index, 'text_two', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
