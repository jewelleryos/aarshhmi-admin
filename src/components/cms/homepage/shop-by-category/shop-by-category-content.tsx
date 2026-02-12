'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type ShopByCategoryItem, type ShopByCategoryContent } from '@/redux/services/cmsService'
import { ShopByCategoryTable } from './shop-by-category-table'
import { ShopByCategoryAddDrawer } from './shop-by-category-add-drawer'
import { ShopByCategoryEditDrawer } from './shop-by-category-edit-drawer'

export function ShopByCategoryContentComponent() {
  const [categories, setCategories] = useState<ShopByCategoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ShopByCategoryItem | null>(null)

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getShopByCategory()
      const content = response.data?.content as ShopByCategoryContent | undefined
      setCategories(content?.categories || [])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async (category: Omit<ShopByCategoryItem, 'id'>) => {
    try {
      const newCategory: ShopByCategoryItem = {
        ...category,
        id: `category_${Date.now()}`,
      }
      const updatedCategories = [...categories, newCategory]
      const response = await cmsService.updateShopByCategory({ categories: updatedCategories })
      toast.success(response.message)
      setCategories(updatedCategories)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add category')
    }
  }

  const handleEditCategory = async (category: ShopByCategoryItem) => {
    try {
      const updatedCategories = categories.map((c) => (c.id === category.id ? category : c))
      const response = await cmsService.updateShopByCategory({ categories: updatedCategories })
      toast.success(response.message)
      setCategories(updatedCategories)
      setIsEditDrawerOpen(false)
      setSelectedCategory(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update category')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const updatedCategories = categories.filter((c) => c.id !== categoryId)
      const response = await cmsService.updateShopByCategory({ categories: updatedCategories })
      toast.success(response.message)
      setCategories(updatedCategories)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete category')
    }
  }

  const handleToggleStatus = async (categoryId: string) => {
    try {
      const updatedCategories = categories.map((c) =>
        c.id === categoryId ? { ...c, status: !c.status } : c
      )
      const response = await cmsService.updateShopByCategory({ categories: updatedCategories })
      toast.success(response.message)
      setCategories(updatedCategories)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (category: ShopByCategoryItem) => {
    setSelectedCategory(category)
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
          <h1 className="text-2xl font-semibold">Shop by Category</h1>
          <p className="text-sm text-muted-foreground">
            Manage homepage shop by category section
          </p>
        </div>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <ShopByCategoryTable
            categories={categories}
            onEdit={openEditDrawer}
            onDelete={handleDeleteCategory}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <ShopByCategoryAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddCategory}
      />

      {/* Edit Drawer */}
      <ShopByCategoryEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        category={selectedCategory}
        onSave={handleEditCategory}
      />
    </div>
  )
}
