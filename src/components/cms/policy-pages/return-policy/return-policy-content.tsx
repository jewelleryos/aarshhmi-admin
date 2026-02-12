'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type ReturnPolicyContent } from '@/redux/services/cmsService'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

export function ReturnPolicyContentComponent() {
  // Form state
  const [htmlText, setHtmlText] = useState('')

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Error state
  const [error, setError] = useState<string | undefined>()

  // Fetch content on mount
  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getReturnPolicy()
      const content = response.data?.content as ReturnPolicyContent | undefined
      if (content) {
        setHtmlText(content.htmlText || '')
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
    if (!htmlText.trim() || htmlText === '<p></p>') {
      setError('Content is required')
      toast.error('Please add some content')
      return
    }

    setError(undefined)
    setIsSaving(true)

    try {
      const response = await cmsService.updateReturnPolicy({
        htmlText,
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
          <h1 className="text-2xl font-semibold">Return Policy</h1>
          <p className="text-sm text-muted-foreground">
            Manage return policy content
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

      {/* Editor */}
      <Card>
        <CardContent className="pt-6">
          <RichTextEditor
            value={htmlText}
            onChange={(html) => {
              setHtmlText(html)
              if (html.trim() && html !== '<p></p>') {
                setError(undefined)
              }
            }}
            placeholder="Enter return policy content..."
            mediaRootPath="cms/policy-pages/return-policy"
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  )
}
