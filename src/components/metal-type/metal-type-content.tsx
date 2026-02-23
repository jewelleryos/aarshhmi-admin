"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchMetalTypes } from "@/redux/slices/metalTypeSlice"
import { MetalTypeTable } from "./metal-type-table"
import { MetalTypeAddDrawer } from "./metal-type-add-drawer"
import { MetalTypeEditDrawer } from "./metal-type-edit-drawer"
import { DeleteDependencyDialog } from "@/components/ui/delete-dependency-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import metalTypeService from "@/redux/services/metalTypeService"
import type { MetalType } from "@/redux/services/metalTypeService"

export function MetalTypeContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector(
    (state) => state.metalType
  )

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedMetalType, setSelectedMetalType] = useState<MetalType | null>(null)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MetalType | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.METAL_TYPE.CREATE)
  const canUpdate = has(PERMISSIONS.METAL_TYPE.UPDATE)
  const canDelete = has(PERMISSIONS.METAL_TYPE.DELETE)

  // Fetch metal types on mount
  useEffect(() => {
    dispatch(fetchMetalTypes())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: MetalType) => {
    if (!canUpdate) return
    setSelectedMetalType(item)
    setIsEditDrawerOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (item: MetalType) => {
    setDeleteTarget(item)
    setIsDeleteDialogOpen(true)
  }

  // Check dependency
  const handleCheckDependency = () => {
    return metalTypeService.checkDependency(deleteTarget!.id)
  }

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const result = await metalTypeService.delete(deleteTarget.id)
      toast.success(result.message)
      dispatch(fetchMetalTypes())
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
          <h1 className="text-2xl font-bold tracking-tight">Metal Types</h1>
          <p className="text-muted-foreground">
            Manage metal types for jewellery products
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Metal Type
          </Button>
        )}
      </div>

      {/* Metal Types Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <MetalTypeTable
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
        <MetalTypeAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <MetalTypeEditDrawer
          metalType={selectedMetalType}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}

      {/* Delete Dependency Dialog */}
      {canDelete && deleteTarget && (
        <DeleteDependencyDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          entityType="Metal Type"
          entityName={deleteTarget.name}
          checkDependency={handleCheckDependency}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
