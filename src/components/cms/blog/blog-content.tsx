'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type BlogContent, type BlogItem, type BlogButton } from '@/components/cms/services/cmsService'
import { BlogTable } from './blog-table'
import { BlogAddDrawer } from './blog-add-drawer'
import { BlogEditDrawer } from './blog-edit-drawer'

export function BlogContentComponent() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [buttonData, setButtonData] = useState<BlogButton[]>([])
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null)
  const [errors, setErrors] = useState<{ title?: string }>({})

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getBlog()
      const content = response.data?.content as BlogContent | undefined
      if (content) {
        setTitle(content.title || '')
        setDescription(content.description || '')
        setButtonData(content.button_data || [])
        setBlogs(content.blogs || [])
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch blog content')
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async (
    updatedTitle: string,
    updatedDescription: string,
    updatedButtonData: BlogButton[],
    updatedBlogs: BlogItem[]
  ) => {
    const response = await cmsService.updateBlog({
      title: updatedTitle,
      description: updatedDescription,
      button_data: updatedButtonData,
      blogs: updatedBlogs,
    })
    return response
  }

  const handleSaveDetails = async () => {
    const newErrors: typeof errors = {}
    if (!title) {
      newErrors.title = 'Title is required'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in all required fields')
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const response = await saveContent(title, description, buttonData, blogs)
      toast.success(response.message)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddBlog = async (blog: Omit<BlogItem, 'id'>) => {
    try {
      const newBlog: BlogItem = {
        ...blog,
        id: `blog_${Date.now()}`,
      }
      const updatedBlogs = [...blogs, newBlog]
      const response = await saveContent(title, description, buttonData, updatedBlogs)
      toast.success(response.message)
      setBlogs(updatedBlogs)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add blog post')
    }
  }

  const handleEditBlog = async (blog: BlogItem) => {
    try {
      const updatedBlogs = blogs.map((b) => (b.id === blog.id ? blog : b))
      const response = await saveContent(title, description, buttonData, updatedBlogs)
      toast.success(response.message)
      setBlogs(updatedBlogs)
      setIsEditDrawerOpen(false)
      setSelectedBlog(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update blog post')
    }
  }

  const handleDeleteBlog = async (blogId: string) => {
    try {
      const updatedBlogs = blogs.filter((b) => b.id !== blogId)
      const response = await saveContent(title, description, buttonData, updatedBlogs)
      toast.success(response.message)
      setBlogs(updatedBlogs)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete blog post')
    }
  }

  const handleToggleBlogStatus = async (blogId: string) => {
    try {
      const updatedBlogs = blogs.map((b) =>
        b.id === blogId ? { ...b, status: !b.status } : b
      )
      const response = await saveContent(title, description, buttonData, updatedBlogs)
      toast.success(response.message)
      setBlogs(updatedBlogs)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update blog status')
    }
  }

  const openEditDrawer = (blog: BlogItem) => {
    setSelectedBlog(blog)
    setIsEditDrawerOpen(true)
  }

  const handleAddButton = () => {
    const newButton: BlogButton = {
      id: `btn_${Date.now()}`,
      button_text: '',
      redirection_url: '',
    }
    setButtonData((prev) => [...prev, newButton])
  }

  const handleUpdateButton = (id: string, field: keyof Omit<BlogButton, 'id'>, value: string) => {
    setButtonData((prev) =>
      prev.map((btn) => (btn.id === id ? { ...btn, [field]: value } : btn))
    )
  }

  const handleDeleteButton = (id: string) => {
    setButtonData((prev) => prev.filter((btn) => btn.id !== id))
  }

  const handleSaveButtons = async () => {
    setIsSaving(true)
    try {
      const response = await saveContent(title, description, buttonData, blogs)
      toast.success(response.message)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save buttons')
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
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="text-sm text-muted-foreground">
            Manage the blog section content
          </p>
        </div>
        <Button onClick={handleSaveDetails} disabled={isSaving}>
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
            <Label htmlFor="blog_title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="blog_title"
              placeholder="Enter blog section title"
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
          <div className="space-y-2">
            <Label htmlFor="blog_description">Description</Label>
            <Input
              id="blog_description"
              placeholder="Enter blog section description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Button Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Call to Action Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {buttonData.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No buttons added yet. Click &quot;Add Button&quot; to create one.
            </p>
          )}
          {buttonData.map((btn) => (
            <div key={btn.id} className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Button text (e.g., Read More)"
                  value={btn.button_text}
                  onChange={(e) => handleUpdateButton(btn.id, 'button_text', e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Redirection URL (e.g., https://example.com/blog)"
                  value={btn.redirection_url}
                  onChange={(e) => handleUpdateButton(btn.id, 'redirection_url', e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mt-0.5 h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                onClick={() => handleDeleteButton(btn.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={handleAddButton}>
              <Plus className="mr-2 h-4 w-4" />
              Add Button
            </Button>
            {/* {buttonData.length > 0 && (
              <Button size="sm" onClick={handleSaveButtons} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Buttons
                  </>
                )}
              </Button>
            )} */}
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts Table */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Blog Posts</h2>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Blog
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <BlogTable
            blogs={blogs}
            onEdit={openEditDrawer}
            onDelete={handleDeleteBlog}
            onToggleStatus={handleToggleBlogStatus}
          />
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <BlogAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddBlog}
      />

      {/* Edit Drawer */}
      <BlogEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        blog={selectedBlog}
        onSave={handleEditBlog}
      />
    </div>
  )
}
