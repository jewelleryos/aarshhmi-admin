'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { BookOpen, Loader2 } from 'lucide-react'
import { MediaPickerInput } from '@/components/media'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import type { BlogItem } from '@/components/cms/services/cmsService'

interface BlogEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blog: BlogItem | null
  onSave: (blog: BlogItem) => Promise<void>
}

export function BlogEditDrawer({
  open,
  onOpenChange,
  blog,
  onSave,
}: BlogEditDrawerProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [mobileImageUrl, setMobileImageUrl] = useState('')
  const [imageAltText, setImageAltText] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [blogDescription, setBlogDescription] = useState('')
  const [rank, setRank] = useState(0)
  const [status, setStatus] = useState(true)

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    title?: string
    image_url?: string
    redirect_url?: string
  }>({})

  useEffect(() => {
    if (blog) {
      setTitle(blog.title || '')
      setDescription(blog.description || '')
      setImageUrl(blog.image_url || '')
      setMobileImageUrl(blog.mobile_image_url || '')
      setImageAltText(blog.image_alt_text || '')
      setRedirectUrl(blog.redirect_url || '')
      setBlogDescription(blog.blog_description || '')
      setRank(blog.rank || 0)
      setStatus(blog.status ?? true)
      setErrors({})
    }
  }, [blog])

  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  const handleSubmit = async () => {
    if (!blog) return

    const newErrors: { title?: string; image_url?: string; redirect_url?: string } = {}
    if (!title) {
      newErrors.title = 'Title is required'
    }
    if (!imageUrl) {
      newErrors.image_url = 'Image is required'
    }
    if (redirectUrl && !/^https?:\/\/.+/.test(redirectUrl)) {
      newErrors.redirect_url = 'Must be a valid URL starting with http:// or https://'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await onSave({
        id: blog.id,
        title,
        description,
        image_url: imageUrl,
        mobile_image_url: mobileImageUrl,
        image_alt_text: imageAltText,
        redirect_url: redirectUrl,
        blog_description: blogDescription,
        rank,
        status,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="sm:max-w-xl flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit Blog Post</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update blog post details
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="edit_title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit_title"
              placeholder="Enter blog post title"
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

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Input
              id="edit_description"
              placeholder="Enter a short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Image Field */}
          <MediaPickerInput
            label="Blog Image"
            value={imageUrl || null}
            onChange={(path) => {
              setImageUrl(path || '')
              if (path) setErrors((prev) => ({ ...prev, image_url: undefined }))
            }}
            rootPath="cms/blog"
            required
            error={errors.image_url}
          />

          {/* Mobile Image Field */}
          <MediaPickerInput
            label="Mobile Image"
            value={mobileImageUrl || null}
            onChange={(path) => setMobileImageUrl(path || '')}
            rootPath="cms/blog/mobile"
          />

          {/* Alt Text Field */}
          <div className="space-y-2">
            <Label htmlFor="edit_image_alt_text">Image Alt Text</Label>
            <Input
              id="edit_image_alt_text"
              placeholder="Describe the blog image"
              value={imageAltText}
              onChange={(e) => setImageAltText(e.target.value)}
            />
          </div>

          {/* Redirect URL Field */}
          <div className="space-y-2">
            <Label htmlFor="edit_redirect_url">
              Redirect URL
            </Label>
            <Input
              id="edit_redirect_url"
              placeholder="https://example.com/blog/post-slug"
              value={redirectUrl}
              onChange={(e) => {
                setRedirectUrl(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, redirect_url: undefined }))
              }}
            />
            {errors.redirect_url ? (
              <p className="text-sm text-destructive pl-1.25">{errors.redirect_url}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Full URL with https (e.g., https://example.com/page)
              </p>
            )}
          </div>

          {/* Blog Description (Rich Text) */}
          <div className="space-y-2">
            <Label>Blog Description</Label>
            <RichTextEditor
              value={blogDescription}
              onChange={setBlogDescription}
              placeholder="Write the full blog content here..."
              mediaRootPath="cms/blog/content"
            />
          </div>

          {/* Rank Field */}
          <div className="space-y-2">
            <Label htmlFor="edit_rank">Display Order</Label>
            <Input
              id="edit_rank"
              type="number"
              min={0}
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers display first
            </p>
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit_status"
              checked={status}
              onCheckedChange={(checked) => setStatus(checked === true)}
            />
            <Label htmlFor="edit_status" className="cursor-pointer">
              Active
            </Label>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
