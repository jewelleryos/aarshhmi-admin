"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchCategories, fetchCategoriesFlat } from "@/redux/slices/categorySlice"
import { CategoriesTable } from "./categories-table"
import { CategoryAddDrawer } from "./category-add-drawer"
import { CategoryEditDrawer } from "./category-edit-drawer"
import { CategorySeoDrawer } from "./category-seo-drawer"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import type { Category } from "@/redux/services/categoryService"

export function CategoriesContent() {
  const dispatch = useAppDispatch()
  const { flattenedItems, flatItems, isLoading } = useAppSelector((state) => state.category)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isSeoDrawerOpen, setIsSeoDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.CATEGORY.CREATE)
  const canUpdate = has(PERMISSIONS.CATEGORY.UPDATE)

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchCategoriesFlat())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: Category) => {
    if (!canUpdate) return
    setSelectedCategory(item)
    setIsEditDrawerOpen(true)
  }

  // Handle edit SEO
  const handleEditSeo = (item: Category) => {
    if (!canUpdate) return
    setSelectedCategory(item)
    setIsSeoDrawerOpen(true)
  }

  // Handle add drawer close - refetch data
  const handleAddDrawerClose = (open: boolean) => {
    setIsAddDrawerOpen(open)
    if (!open) {
      dispatch(fetchCategories())
      dispatch(fetchCategoriesFlat())
    }
  }

  // Handle edit drawer close - refetch data
  const handleEditDrawerClose = (open: boolean) => {
    setIsEditDrawerOpen(open)
    if (!open) {
      dispatch(fetchCategories())
      dispatch(fetchCategoriesFlat())
    }
  }

  // Handle seo drawer close - refetch data
  const handleSeoDrawerClose = (open: boolean) => {
    setIsSeoDrawerOpen(open)
    if (!open) {
      dispatch(fetchCategories())
    }
  }

  // Get root categories for parent dropdown (only items with no parent)
  const rootCategories = flatItems.filter((c) => c.parent_category_id === null)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories and subcategories
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && flattenedItems.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <CategoriesTable
              items={flattenedItems}
              onEdit={handleEdit}
              onEditSeo={handleEditSeo}
              canUpdate={canUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      {canCreate && (
        <CategoryAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={handleAddDrawerClose}
          rootCategories={rootCategories}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <CategoryEditDrawer
          category={selectedCategory}
          open={isEditDrawerOpen}
          onOpenChange={handleEditDrawerClose}
          rootCategories={rootCategories}
        />
      )}

      {/* SEO Drawer */}
      {canUpdate && (
        <CategorySeoDrawer
          category={selectedCategory}
          open={isSeoDrawerOpen}
          onOpenChange={handleSeoDrawerClose}
        />
      )}
    </div>
  )
}
