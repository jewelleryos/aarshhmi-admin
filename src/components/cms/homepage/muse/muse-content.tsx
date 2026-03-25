'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type MuseItem, type MuseContent } from '@/components/cms/services/cmsService'
import { MuseTable } from './muse-table'
import { MuseAddDrawer } from './muse-add-drawer'
import { MuseEditDrawer } from './muse-edit-drawer'

export function MuseContentComponent() {
  const [items, setItems] = useState<MuseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MuseItem | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getMuse()
      const content = response.data?.content as MuseContent | undefined
      setItems(content?.items || [])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch muse items')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async (item: Omit<MuseItem, 'id'>) => {
    try {
      const newItem: MuseItem = { ...item, id: `muse_${Date.now()}` }
      const updatedItems = [...items, newItem]
      const response = await cmsService.updateMuse({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add muse item')
    }
  }

  const handleEditItem = async (item: MuseItem) => {
    try {
      const updatedItems = items.map((i) => (i.id === item.id ? item : i))
      const response = await cmsService.updateMuse({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsEditDrawerOpen(false)
      setSelectedItem(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update muse item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedItems = items.filter((i) => i.id !== itemId)
      const response = await cmsService.updateMuse({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete muse item')
    }
  }

  const handleToggleStatus = async (itemId: string) => {
    try {
      const updatedItems = items.map((i) =>
        i.id === itemId ? { ...i, status: !i.status } : i
      )
      const response = await cmsService.updateMuse({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (item: MuseItem) => {
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
          <h1 className="text-2xl font-semibold">Muse</h1>
          <p className="text-sm text-muted-foreground">Manage homepage muse section</p>
        </div>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Muse
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <MuseTable
            items={items}
            onEdit={openEditDrawer}
            onDelete={handleDeleteItem}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <MuseAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddItem}
      />

      {/* Edit Drawer */}
      <MuseEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        item={selectedItem}
        onSave={handleEditItem}
      />
    </div>
  )
}
