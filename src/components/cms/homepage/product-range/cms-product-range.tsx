'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type ProductRangeItem, type ProductRangeContent } from '@/components/cms/services/cmsService'
import { ProductRangeTable } from './product-range-table'
import { ProductRangeAddDrawer } from './product-range-add-drawer'
import { ProductRangeEditDrawer } from './product-range-edit-drawer'

export function CMSProductRange() {
  const [categories, setCategories] = useState<ProductRangeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ProductRangeItem | null>(null)

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getProductRange()
      const content = response.data?.content as ProductRangeContent | undefined
      setCategories(content?.categories || [])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch product range')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async (category: Omit<ProductRangeItem, 'id'>) => {
    try {
      const newCategory: ProductRangeItem = {
        ...category,
        id: `category_${Date.now()}`,
      }
      const updatedCategories = [...categories, newCategory]
      const response = await cmsService.updateProductRange({ categories: updatedCategories })
      toast.success(response.message)
      setCategories(updatedCategories)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add product range')
    }
  }

  const handleEditCategory = async (category: ProductRangeItem) => {
    try {
      const updatedCategories = categories.map((c) => (c.id === category.id ? category : c))
      const response = await cmsService.updateProductRange({ categories: updatedCategories })
      toast.success(response.message)
      setCategories(updatedCategories)
      setIsEditDrawerOpen(false)
      setSelectedCategory(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update product range')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const updatedCategories = categories.filter((c) => c.id !== categoryId)
      const response = await cmsService.updateProductRange({ categories: updatedCategories })
      toast.success(response.message)
      setCategories(updatedCategories)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete product range')
    }
  }

  const handleToggleStatus = async (categoryId: string) => {
    try {
      const updatedCategories = categories.map((c) =>
        c.id === categoryId ? { ...c, status: !c.status } : c
      )
      const response = await cmsService.updateProductRange({ categories: updatedCategories })
      toast.success(response.message)
      setCategories(updatedCategories)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (category: ProductRangeItem) => {
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
          <h1 className="text-2xl font-semibold">Product Range</h1>
          <p className="text-sm text-muted-foreground">
            Manage homepage product range section
          </p>
        </div>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product Range
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <ProductRangeTable
            categories={categories}
            onEdit={openEditDrawer}
            onDelete={handleDeleteCategory}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <ProductRangeAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddCategory}
      />

      {/* Edit Drawer */}
      <ProductRangeEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        category={selectedCategory}
        onSave={handleEditCategory}
      />
    </div>
  )
}
