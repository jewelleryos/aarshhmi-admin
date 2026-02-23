"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchMetalPurities } from "@/redux/slices/metalPuritySlice"
import { MetalPurityTable } from "./metal-purity-table"
import { MetalPurityAddDrawer } from "./metal-purity-add-drawer"
import { MetalPurityEditDrawer } from "./metal-purity-edit-drawer"
import { DeleteDependencyDialog } from "@/components/ui/delete-dependency-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import metalPurityService from "@/redux/services/metalPurityService"
import type { MetalPurity } from "@/redux/services/metalPurityService"

export function MetalPurityContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector(
    (state) => state.metalPurity
  )

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedMetalPurity, setSelectedMetalPurity] = useState<MetalPurity | null>(null)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MetalPurity | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.METAL_PURITY.CREATE)
  const canUpdate = has(PERMISSIONS.METAL_PURITY.UPDATE)
  const canDelete = has(PERMISSIONS.METAL_PURITY.DELETE)

  // Fetch metal purities on mount
  useEffect(() => {
    dispatch(fetchMetalPurities())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: MetalPurity) => {
    if (!canUpdate) return
    setSelectedMetalPurity(item)
    setIsEditDrawerOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (item: MetalPurity) => {
    setDeleteTarget(item)
    setIsDeleteDialogOpen(true)
  }

  // Check dependency
  const handleCheckDependency = () => {
    return metalPurityService.checkDependency(deleteTarget!.id)
  }

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const result = await metalPurityService.delete(deleteTarget.id)
      toast.success(result.message)
      dispatch(fetchMetalPurities())
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
          <h1 className="text-2xl font-bold tracking-tight">Metal Purities</h1>
          <p className="text-muted-foreground">
            Manage purity levels for metal types
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Metal Purity
          </Button>
        )}
      </div>

      {/* Metal Purities Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <MetalPurityTable
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
        <MetalPurityAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <MetalPurityEditDrawer
          metalPurity={selectedMetalPurity}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}

      {/* Delete Dependency Dialog */}
      {canDelete && deleteTarget && (
        <DeleteDependencyDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          entityType="Metal Purity"
          entityName={deleteTarget.name}
          checkDependency={handleCheckDependency}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
