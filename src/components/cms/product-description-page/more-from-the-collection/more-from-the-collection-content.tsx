'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  type PromotionalBannerItem,
  type PromotionalBannerContent,
  type CmsSectionResponse,
  type ApiResponse,
} from '../../services/cmsService'
import { MoreFromTheCollectionTable } from './more-from-the-collection-table'
import { MoreFromTheCollectionAddDrawer } from './more-from-the-collection-add-drawer'
import { MoreFromTheCollectionEditDrawer } from './more-from-the-collection-edit-drawer'

interface MoreFromTheCollectionContentProps {
  getContent: () => Promise<ApiResponse<CmsSectionResponse | null>>
  updateContent: (content: PromotionalBannerContent) => Promise<ApiResponse<CmsSectionResponse>>
}

export function MoreFromTheCollectionContent({
  getContent,
  updateContent,
}: MoreFromTheCollectionContentProps) {
  const [items, setItems] = useState<PromotionalBannerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PromotionalBannerItem | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await getContent()
      const content = response.data?.content as PromotionalBannerContent | undefined
      setItems(content?.items || [])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async (item: Omit<PromotionalBannerItem, 'id'>) => {
    try {
      const newItem: PromotionalBannerItem = {
        ...item,
        id: `mftc_${Date.now()}`,
      }
      const updatedItems = [...items, newItem]
      const response = await updateContent({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add item')
      throw err
    }
  }

  const handleEditItem = async (item: PromotionalBannerItem) => {
    try {
      const updatedItems = items.map((i) => (i.id === item.id ? item : i))
      const response = await updateContent({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsEditDrawerOpen(false)
      setSelectedItem(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update item')
      throw err
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedItems = items.filter((i) => i.id !== itemId)
      const response = await updateContent({ items: updatedItems })
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
      const response = await updateContent({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (item: PromotionalBannerItem) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">More From The Collection</h1>
          <p className="text-sm text-muted-foreground">
            Manage items for the More From The Collection section on the product description page
          </p>
        </div>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <MoreFromTheCollectionTable
            items={items}
            onEdit={openEditDrawer}
            onDelete={handleDeleteItem}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      <MoreFromTheCollectionAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddItem}
      />

      <MoreFromTheCollectionEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        item={selectedItem}
        onSave={handleEditItem}
      />
    </div>
  )
}
