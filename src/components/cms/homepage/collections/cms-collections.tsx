'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type CollectionsContent, type CollectionsItem } from '@/components/cms/services/cmsService'
import { CollectionsTable } from './collections-table'
import { CollectionsAddDrawer } from './collections-add-drawer'
import { CollectionsEditDrawer } from './collections-edit-drawer'

export function CMSCollections() {
  const [description, setDescription] = useState('')
  const [collections, setCollections] = useState<CollectionsItem[]>([])
  const [buttonText, setButtonText] = useState('')
  const [buttonRedirectUrl, setButtonRedirectUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{ description?: string; button_text?: string; button_redirect_url?: string }>({})
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<CollectionsItem | null>(null)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getCollections()
      const content = response.data?.content as CollectionsContent | undefined
      if (content) {
        setDescription(content.description || '')
        setCollections(content.collections || [])
        setButtonText(content.button_text || '')
        setButtonRedirectUrl(content.button_redirect_url || '')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch content')
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async (
    updatedDescription: string,
    updatedCollections: CollectionsItem[],
    updatedButtonText: string,
    updatedButtonRedirectUrl: string
  ) => {
    const response = await cmsService.updateCollections({
      description: updatedDescription,
      collections: updatedCollections,
      button_text: updatedButtonText,
      button_redirect_url: updatedButtonRedirectUrl,
    })
    return response
  }

  const handleSaveDetails = async () => {
    const newErrors: typeof errors = {}
    if (!description) {
      newErrors.description = 'Description is required'
    }
    if (!buttonRedirectUrl) {
      newErrors.button_redirect_url = 'Button redirect URL is required'
    } else if (!/^https?:\/\/.+/.test(buttonRedirectUrl)) {
      newErrors.button_redirect_url = 'Must be a valid URL starting with http:// or https://'
    }
    if (!buttonText) {
      newErrors.button_text = 'Button text is required'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in all required fields')
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const response = await saveContent(description, collections, buttonText, buttonRedirectUrl)
      toast.success(response.message)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddCollection = async (collection: Omit<CollectionsItem, 'id'>) => {
    try {
      const newCollection: CollectionsItem = {
        ...collection,
        id: `collection_${Date.now()}`,
      }
      const updatedCollections = [...collections, newCollection]
      const response = await saveContent(description, updatedCollections, buttonText, buttonRedirectUrl)
      toast.success(response.message)
      setCollections(updatedCollections)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add collection')
    }
  }

  const handleEditCollection = async (collection: CollectionsItem) => {
    try {
      const updatedCollections = collections.map((c) => (c.id === collection.id ? collection : c))
      const response = await saveContent(description, updatedCollections, buttonText, buttonRedirectUrl)
      toast.success(response.message)
      setCollections(updatedCollections)
      setIsEditDrawerOpen(false)
      setSelectedCollection(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update collection')
    }
  }

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      const updatedCollections = collections.filter((c) => c.id !== collectionId)
      const response = await saveContent(description, updatedCollections, buttonText, buttonRedirectUrl)
      toast.success(response.message)
      setCollections(updatedCollections)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete collection')
    }
  }

  const handleToggleStatus = async (collectionId: string) => {
    try {
      const updatedCollections = collections.map((c) =>
        c.id === collectionId ? { ...c, status: !c.status } : c
      )
      const response = await saveContent(description, updatedCollections, buttonText, buttonRedirectUrl)
      toast.success(response.message)
      setCollections(updatedCollections)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (collection: CollectionsItem) => {
    setSelectedCollection(collection)
    setIsEditDrawerOpen(true)
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
          <h1 className="text-2xl font-semibold">Collections</h1>
          <p className="text-sm text-muted-foreground">
            Manage the collections section on homepage
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

      {/* View More Button */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Call to Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="button_text">Button Text
              <span className="text-destructive">*</span>
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
              Button Redirect URL
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="button_redirect_url"
              placeholder="https://example.com/collections"
              value={buttonRedirectUrl}
              onChange={(e) => {
                setButtonRedirectUrl(e.target.value)
                if (errors.button_redirect_url) setErrors((prev) => ({ ...prev, button_redirect_url: undefined }))
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

      {/* Collections Table */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Collections</h2>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Collection
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <CollectionsTable
            collections={collections}
            onEdit={openEditDrawer}
            onDelete={handleDeleteCollection}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>



      {/* Add Drawer */}
      <CollectionsAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddCollection}
      />

      {/* Edit Drawer */}
      <CollectionsEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        collection={selectedCollection}
        onSave={handleEditCollection}
      />
    </div>
  )
}
