'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type GeneralContent } from '../services/cmsService'

const SOCIAL_PLATFORMS = ['instagram', 'facebook', 'twitter', 'youtube', 'pinterest', 'linkedin', 'reddit'] as const
type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]

const defaultContent: GeneralContent = {
  phone_no: '',
  email: '',
  address: '',
  social_links: {
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    pinterest: '',
    linkedin: '',
    reddit: '',
  },
}

export function GeneralContentComponent() {
  const [content, setContent] = useState<GeneralContent>(defaultContent)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getGeneral()
      if (response.data?.content) {
        const fetched = response.data.content as unknown as GeneralContent
        setContent({
          phone_no: fetched.phone_no || '',
          email: fetched.email || '',
          address: fetched.address || '',
          social_links: {
            instagram: fetched.social_links?.instagram || '',
            facebook: fetched.social_links?.facebook || '',
            twitter: fetched.social_links?.twitter || '',
            youtube: fetched.social_links?.youtube || '',
            pinterest: fetched.social_links?.pinterest || '',
            linkedin: fetched.social_links?.linkedin || '',
            reddit: fetched.social_links?.reddit || '',
          },
        })
      }
    } catch {
      toast.error('Failed to load general settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (field: keyof Omit<GeneralContent, 'social_links'>, value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }))
  }

  const handleSocialLinkChange = (platform: SocialPlatform, value: string) => {
    setContent((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value },
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await cmsService.updateGeneral(content)
      toast.success('General settings saved successfully')
    } catch {
      toast.error('Failed to save general settings')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">General Settings</h1>
          <p className="text-sm text-muted-foreground">Manage contact information and social media links</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone_no">Phone Number</Label>
            <Input
              id="phone_no"
              placeholder="+91 98765 43210"
              value={content.phone_no}
              onChange={(e) => handleFieldChange('phone_no', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@example.com"
              value={content.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter full address"
              value={content.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SOCIAL_PLATFORMS.map((platform, idx) => (
            <div key={platform}>
              {idx > 0 && <Separator className="mb-4" />}
              <div className="space-y-2">
                <Label htmlFor={`social-${platform}`} className="capitalize font-medium">
                  {platform}
                </Label>
                <Input
                  id={`social-${platform}`}
                  placeholder={`https://${platform}.com/...`}
                  value={content.social_links[platform]}
                  onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
