'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MediaPickerInput } from '@/components/media'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Loader2, ArrowLeft, Save, Clock, FileText, Globe } from 'lucide-react'
import { toast } from 'sonner'
import blogService, { type Blog, type BlogCategory, type BlogAuthor, type BlogStatus } from './blog-service'

interface BlogPostFormProps {
  blogId?: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function BlogPostForm({ blogId }: BlogPostFormProps) {
  const router = useRouter()
  const isEdit = !!blogId

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(isEdit)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [authors, setAuthors] = useState<BlogAuthor[]>([])

  // Form fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featureImageUrl, setFeatureImageUrl] = useState('')
  const [featureImageAlt, setFeatureImageAlt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [status, setStatus] = useState<BlogStatus>('draft')
  const [publishedAt, setPublishedAt] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [catRes, authRes] = await Promise.all([
          blogService.listCategories(),
          blogService.listAuthors(),
        ])
        setCategories(catRes.data.data.items.filter((c) => c.status))
        setAuthors(authRes.data.data.items.filter((a) => a.status))
      } catch {
        toast.error('Failed to load categories/authors')
      }
    }
    loadMeta()
  }, [])

  useEffect(() => {
    if (!isEdit) return
    const fetchBlog = async () => {
      setIsFetching(true)
      try {
        const res = await blogService.getBlog(blogId)
        const b = res.data.data
        setTitle(b.title)
        setSlug(b.slug)
        setSlugManuallyEdited(true)
        setExcerpt(b.excerpt || '')
        setContent(b.content || '')
        setFeatureImageUrl(b.feature_image_url || '')
        setFeatureImageAlt(b.feature_image_alt || '')
        setCategoryId(b.category_id || '')
        setAuthorId(b.author_id || '')
        // Normalise: if stored as 'published' but published_at is in future, treat as scheduled
        const loadedStatus: BlogStatus =
          b.status === 'published' && b.published_at && new Date(b.published_at) > new Date()
            ? 'scheduled'
            : b.status
        setStatus(loadedStatus)
        setPublishedAt(b.published_at ? (() => {
          const d = new Date(b.published_at!)
          const yyyy = d.getFullYear()
          const mm = String(d.getMonth() + 1).padStart(2, '0')
          const dd = String(d.getDate()).padStart(2, '0')
          const hh = String(d.getHours()).padStart(2, '0')
          const min = String(d.getMinutes()).padStart(2, '0')
          return `${yyyy}-${mm}-${dd}T${hh}:${min}`
        })() : '')
        setMetaTitle(b.meta_title || '')
        setMetaDescription(b.meta_description || '')
      } catch {
        toast.error('Failed to load blog post')
        router.push('/blog-management/posts')
      } finally {
        setIsFetching(false)
      }
    }
    fetchBlog()
  }, [blogId, isEdit])

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slugManuallyEdited) {
      setSlug(slugify(val))
    }
  }

  const handleSlugChange = (val: string) => {
    setSlug(val)
    setSlugManuallyEdited(true)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Title is required'
    if (!slug.trim()) errs.slug = 'Slug is required'
    if (!featureImageUrl) errs.featureImageUrl = 'Feature image is required'
    if (derivedStatus() === 'scheduled') {
      if (!publishedAt) {
        errs.publishedAt = 'A future date & time is required for scheduled posts'
      } else if (new Date(publishedAt) <= new Date()) {
        errs.publishedAt = 'Scheduled date must be in the future'
      }
    }
    return errs
  }

  // Derive the effective status from the current state
  const derivedStatus = (): BlogStatus => {
    if (status === 'draft') return 'draft'
    if (publishedAt && new Date(publishedAt) > new Date()) return 'scheduled'
    // Keep showing scheduled if user selected it but hasn't picked a date yet
    if (status === 'scheduled') return 'scheduled'
    return 'published'
  }

  // Handle date change — auto-switch status based on selected date
  const handlePublishedAtChange = (val: string) => {
    setPublishedAt(val)
    if (val && new Date(val) > new Date()) {
      setStatus('scheduled')
    } else if (status === 'scheduled') {
      setStatus('draft')
      setPublishedAt('')
    }
    // Clear publishedAt error when user picks a date
    if (val) setErrors((prev) => ({ ...prev, publishedAt: undefined as any }))
  }

  // Now-formatted string for datetime-local input
  const nowLocalString = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const handleSubmit = async (action: 'draft' | 'publish' | 'save') => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please fill in all required fields')
      return
    }
    setErrors({})

    let finalStatus: BlogStatus = status
    let finalPublishedAt: string | null = publishedAt ? new Date(publishedAt).toISOString() : null

    if (action === 'draft') {
      finalStatus = 'draft'
      finalPublishedAt = null
    } else if (action === 'publish') {
      finalStatus = 'published'
      finalPublishedAt = new Date().toISOString()
      setPublishedAt(nowLocalString())
      setStatus('published')
    } else {
      // save (edit mode) — use derived status
      finalStatus = derivedStatus()
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt || undefined,
      content: content || undefined,
      feature_image_url: featureImageUrl || undefined,
      feature_image_alt: featureImageAlt || undefined,
      category_id: categoryId || null,
      author_id: authorId || null,
      status: finalStatus,
      published_at: finalPublishedAt,
      meta_title: metaTitle || undefined,
      meta_description: metaDescription || undefined,
    }

    setIsLoading(true)
    try {
      if (isEdit) {
        await blogService.updateBlog(blogId, payload)
        toast.success('Blog post updated successfully')
      } else {
        await blogService.createBlog(payload)
        toast.success('Blog post created successfully')
      }
      router.push('/blog-management/posts')
    } catch (err: any) {
      const msg = err?.response?.data?.message || (isEdit ? 'Failed to update blog post' : 'Failed to create blog post')
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/blog-management/posts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Blog Post' : 'New Blog Post'}</h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Update your blog post' : 'Create a new blog post for the storefront'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={isLoading}>
            <FileText className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          {isEdit ? (
            <Button onClick={() => handleSubmit('save')} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          ) : derivedStatus() === 'scheduled' ? (
            <Button onClick={() => handleSubmit('save')} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
              Schedule
            </Button>
          ) : (
            <Button onClick={() => handleSubmit('publish')} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
              Publish Now
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content (left 2/3) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter blog post title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="post-url-slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                <p className="text-xs text-muted-foreground">URL-friendly identifier. Auto-generated from title.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Short summary of the blog post..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">Brief description shown in blog listing pages.</p>
              </div>
            </CardContent>
          </Card>

          {/* Content (Rich Text Editor) — grows to fill remaining height */}
          <Card className="flex flex-col flex-1">
            <CardHeader>
              <CardTitle className="text-base">Content</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your blog content here..."
                mediaRootPath="blogs/content"
                height={400}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (right 1/3) */}
        <div className="space-y-6">
          {/* Feature Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature Image</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaPickerInput
                label=""
                value={featureImageUrl || null}
                onChange={(path) => {
                  setFeatureImageUrl(path || '')
                  if (path) setErrors((prev) => ({ ...prev, featureImageUrl: undefined as any }))
                }}
                rootPath="blogs/feature"
                required
                error={errors.featureImageUrl}
              />
              {featureImageUrl && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="feature_image_alt">Image Alt Text</Label>
                  <Input
                    id="feature_image_alt"
                    placeholder="Describe the image"
                    value={featureImageAlt}
                    onChange={(e) => setFeatureImageAlt(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status & Publish */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status dropdown */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={derivedStatus()}
                  onValueChange={(v) => {
                    const s = v as BlogStatus
                    setStatus(s)
                    if (s === 'draft') {
                      setPublishedAt('')
                      setErrors((prev) => ({ ...prev, publishedAt: undefined as any }))
                    }
                    if (s === 'published') {
                      // Auto-fill current date/time when switching to published
                      setPublishedAt(nowLocalString())
                      setErrors((prev) => ({ ...prev, publishedAt: undefined as any }))
                    }
                    if (s === 'scheduled') {
                      // Clear date so user must pick a future one
                      setPublishedAt('')
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <span className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Draft
                      </span>
                    </SelectItem>
                    <SelectItem value="scheduled">
                      <span className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-blue-500" /> Scheduled
                      </span>
                    </SelectItem>
                    <SelectItem value="published">
                      <span className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-green-500" /> Published
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="published_at">
                  Publish Date & Time
                  {derivedStatus() === 'scheduled' && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                <Input
                  id="published_at"
                  type="datetime-local"
                  value={publishedAt}
                  min={derivedStatus() === 'scheduled' ? nowLocalString() : undefined}
                  onChange={(e) => handlePublishedAtChange(e.target.value)}
                  className={errors.publishedAt ? 'border-destructive' : ''}
                />
                {errors.publishedAt ? (
                  <p className="text-xs text-destructive">{errors.publishedAt}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {derivedStatus() === 'scheduled'
                      ? 'Required. Post will go live on this date.'
                      : derivedStatus() === 'published'
                      ? 'Set to current time. You can adjust if needed.'
                      : 'Pick a future date to schedule, or leave empty to publish immediately.'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category & Author */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category & Author</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId || 'none'} onValueChange={(v) => setCategoryId(v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Select value={authorId || 'none'} onValueChange={(v) => setAuthorId(v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No author</SelectItem>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  placeholder="SEO page title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  placeholder="SEO meta description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
