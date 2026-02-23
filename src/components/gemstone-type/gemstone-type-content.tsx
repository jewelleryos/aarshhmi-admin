"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchGemstoneTypes } from "@/redux/slices/gemstoneTypeSlice"
import { GemstoneTypeTable } from "./gemstone-type-table"
import { GemstoneTypeAddDrawer } from "./gemstone-type-add-drawer"
import { GemstoneTypeEditDrawer } from "./gemstone-type-edit-drawer"
import { DeleteDependencyDialog } from "@/components/ui/delete-dependency-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import gemstoneTypeService from "@/redux/services/gemstoneTypeService"
import type { GemstoneType } from "@/redux/services/gemstoneTypeService"

export function GemstoneTypeContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.gemstoneType)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedGemstoneType, setSelectedGemstoneType] = useState<GemstoneType | null>(null)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GemstoneType | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.GEMSTONE_TYPE.CREATE)
  const canUpdate = has(PERMISSIONS.GEMSTONE_TYPE.UPDATE)
  const canDelete = has(PERMISSIONS.GEMSTONE_TYPE.DELETE)

  // Fetch gemstone types on mount
  useEffect(() => {
    dispatch(fetchGemstoneTypes())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: GemstoneType) => {
    if (!canUpdate) return
    setSelectedGemstoneType(item)
    setIsEditDrawerOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (item: GemstoneType) => {
    setDeleteTarget(item)
    setIsDeleteDialogOpen(true)
  }

  // Check dependency
  const handleCheckDependency = () => {
    return gemstoneTypeService.checkDependency(deleteTarget!.id)
  }

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const result = await gemstoneTypeService.delete(deleteTarget.id)
      toast.success(result.message)
      dispatch(fetchGemstoneTypes())
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || "Something went wrong")
      throw err
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gemstone Types</h1>
          <p className="text-muted-foreground">
            Manage gemstone types for jewellery products
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Gemstone Type
          </Button>
        )}
      </div>

      {/* Gemstone Types Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <GemstoneTypeTable
              items={items}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      {canCreate && (
        <GemstoneTypeAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <GemstoneTypeEditDrawer
          gemstoneType={selectedGemstoneType}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}

      {/* Delete Dependency Dialog */}
      {canDelete && deleteTarget && (
        <DeleteDependencyDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          entityType="Gemstone Type"
          entityName={deleteTarget.name}
          checkDependency={handleCheckDependency}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
