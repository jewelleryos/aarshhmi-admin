'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type MediaGridItem, type MediaGridContent } from '@/redux/services/cmsService'
import { MediaGridTable } from './media-grid-table'
import { MediaGridAddDrawer } from './media-grid-add-drawer'
import { MediaGridEditDrawer } from './media-grid-edit-drawer'

export function MediaGridContentComponent() {
  const [items, setItems] = useState<MediaGridItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MediaGridItem | null>(null)

  // Fetch items on mount
  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getMediaGrid()
      const content = response.data?.content as MediaGridContent | undefined
      setItems(content?.items || [])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch media grid')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async (item: Omit<MediaGridItem, 'id'>) => {
    try {
      const newItem: MediaGridItem = {
        ...item,
        id: `media_${Date.now()}`,
      }
      const updatedItems = [...items, newItem]
      const response = await cmsService.updateMediaGrid({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add media')
    }
  }

  const handleEditItem = async (item: MediaGridItem) => {
    try {
      const updatedItems = items.map((i) => (i.id === item.id ? item : i))
      const response = await cmsService.updateMediaGrid({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsEditDrawerOpen(false)
      setSelectedItem(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update media')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedItems = items.filter((i) => i.id !== itemId)
      const response = await cmsService.updateMediaGrid({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete media')
    }
  }

  const handleToggleStatus = async (itemId: string) => {
    try {
      const updatedItems = items.map((i) =>
        i.id === itemId ? { ...i, status: !i.status } : i
      )
      const response = await cmsService.updateMediaGrid({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (item: MediaGridItem) => {
    setSelectedItem(item)
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
          <h1 className="text-2xl font-semibold">Media Grid</h1>
          <p className="text-sm text-muted-foreground">
            Manage homepage media grid (images & videos)
          </p>
        </div>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Media
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <MediaGridTable
            items={items}
            onEdit={openEditDrawer}
            onDelete={handleDeleteItem}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <MediaGridAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddItem}
      />

      {/* Edit Drawer */}
      <MediaGridEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        item={selectedItem}
        onSave={handleEditItem}
      />
    </div>
  )
}
