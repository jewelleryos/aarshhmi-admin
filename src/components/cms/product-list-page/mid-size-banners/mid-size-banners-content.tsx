'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  type MidSizeBannersItem,
  type MidSizeBannersContent,
  type CategoryWithChildrenForSelect,
  type CmsSectionResponse,
  type ApiResponse,
  cmsService,
} from '../../services/cmsService'
import { MidSizeBannersTable } from './mid-size-banners-table'
import { MidSizeBannersAddDrawer } from './mid-size-banners-add-drawer'
import { MidSizeBannersEditDrawer } from './mid-size-banners-edit-drawer'

interface MidSizeBannersContentProps {
  getContent: () => Promise<ApiResponse<CmsSectionResponse | null>>
  updateContent: (content: MidSizeBannersContent) => Promise<ApiResponse<CmsSectionResponse>>
}

export function MidSizeBannersContentComponent({
  getContent,
  updateContent,
}: MidSizeBannersContentProps) {
  const [items, setItems] = useState<MidSizeBannersItem[]>([])
  const [categories, setCategories] = useState<CategoryWithChildrenForSelect[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MidSizeBannersItem | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [contentResponse, categoriesResponse] = await Promise.all([
        getContent(),
        cmsService.getCategoriesTree(),
      ])
      const content = contentResponse.data?.content as MidSizeBannersContent | undefined
      setItems(content?.items || [])
      const allCategories = categoriesResponse.data?.items || []
      setCategories(allCategories.filter((c) => c.status))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async (item: Omit<MidSizeBannersItem, 'id'>) => {
    try {
      const newItem: MidSizeBannersItem = {
        ...item,
        id: `msb_${Date.now()}`,
      }
      const updatedItems = [...items, newItem]
      const response = await updateContent({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add banner')
      throw err
    }
  }

  const handleEditItem = async (item: MidSizeBannersItem) => {
    try {
      const updatedItems = items.map((i) => (i.id === item.id ? item : i))
      const response = await updateContent({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsEditDrawerOpen(false)
      setSelectedItem(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update banner')
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
      toast.error(error.response?.data?.message || 'Failed to delete banner')
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

  const openEditDrawer = (item: MidSizeBannersItem) => {
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
          <h1 className="text-2xl font-semibold">Mid Size Banners</h1>
          <p className="text-sm text-muted-foreground">
            Manage mid size banner items for the product list page
          </p>
        </div>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <MidSizeBannersTable
            items={items}
            categories={categories}
            onEdit={openEditDrawer}
            onDelete={handleDeleteItem}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      <MidSizeBannersAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddItem}
      />

      <MidSizeBannersEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        item={selectedItem}
        onSave={handleEditItem}
      />
    </div>
  )
}
