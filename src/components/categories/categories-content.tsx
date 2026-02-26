"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchCategories, fetchCategoriesFlat } from "@/redux/slices/categorySlice"
import { CategoriesTable } from "./categories-table"
import { toast } from "sonner"
import { CategoryAddDrawer } from "./category-add-drawer"
import { CategoryEditDrawer } from "./category-edit-drawer"
import { CategorySeoDrawer } from "./category-seo-drawer"
import { DeleteDependencyDialog } from "@/components/ui/delete-dependency-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import categoryService from "@/redux/services/categoryService"
import type { Category } from "@/redux/services/categoryService"

export function CategoriesContent() {
  const dispatch = useAppDispatch()
  const { flattenedItems, flatItems, isLoading } = useAppSelector((state) => state.category)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isSeoDrawerOpen, setIsSeoDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.CATEGORY.CREATE)
  const canUpdate = has(PERMISSIONS.CATEGORY.UPDATE)
  const canDelete = has(PERMISSIONS.CATEGORY.DELETE)

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

  // Handle delete click
  const handleDeleteClick = (item: Category) => {
    setDeleteTarget(item)
    setIsDeleteDialogOpen(true)
  }

  // Check dependency
  const handleCheckDependency = () => {
    return categoryService.checkDependency(deleteTarget!.id)
  }

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const result = await categoryService.delete(deleteTarget.id)
      toast.success(result.message)
      dispatch(fetchCategories())
      dispatch(fetchCategoriesFlat())
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || "Something went wrong")
      throw err
    }
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
              onDelete={handleDeleteClick}
              canUpdate={canUpdate}
              canDelete={canDelete}
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

      {/* Delete Dependency Dialog */}
      {canDelete && deleteTarget && (
        <DeleteDependencyDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          entityType="Category"
          entityName={deleteTarget.name}
          checkDependency={handleCheckDependency}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
