'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type LuminiqueCollectionItem, type LuminiqueCollectionContent } from '@/redux/services/cmsService'
import { LuminiqueCollectionTable } from './luminique-collection-table'
import { LuminiqueCollectionAddDrawer } from './luminique-collection-add-drawer'
import { LuminiqueCollectionEditDrawer } from './luminique-collection-edit-drawer'

export function LuminiqueCollectionContentComponent() {
  const [items, setItems] = useState<LuminiqueCollectionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<LuminiqueCollectionItem | null>(null)

  // Fetch items on mount
  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getLuminiqueCollection()
      const content = response.data?.content as LuminiqueCollectionContent | undefined
      setItems(content?.items || [])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch collection')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async (item: Omit<LuminiqueCollectionItem, 'id'>) => {
    try {
      const newItem: LuminiqueCollectionItem = {
        ...item,
        id: `lumi_${Date.now()}`,
      }
      const updatedItems = [...items, newItem]
      const response = await cmsService.updateLuminiqueCollection({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add item')
    }
  }

  const handleEditItem = async (item: LuminiqueCollectionItem) => {
    try {
      const updatedItems = items.map((i) => (i.id === item.id ? item : i))
      const response = await cmsService.updateLuminiqueCollection({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsEditDrawerOpen(false)
      setSelectedItem(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedItems = items.filter((i) => i.id !== itemId)
      const response = await cmsService.updateLuminiqueCollection({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  const handleToggleStatus = async (itemId: string) => {
    try {
      const updatedItems = items.map((i) =>
        i.id === itemId ? { ...i, status: !i.status } : i
      )
      const response = await cmsService.updateLuminiqueCollection({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (item: LuminiqueCollectionItem) => {
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
          <h1 className="text-2xl font-semibold">Luminique Collection</h1>
          <p className="text-sm text-muted-foreground">
            Manage homepage luminique collection images
          </p>
        </div>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <LuminiqueCollectionTable
            items={items}
            onEdit={openEditDrawer}
            onDelete={handleDeleteItem}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <LuminiqueCollectionAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddItem}
      />

      {/* Edit Drawer */}
      <LuminiqueCollectionEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        item={selectedItem}
        onSave={handleEditItem}
      />
    </div>
  )
}
