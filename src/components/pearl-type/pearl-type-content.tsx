"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchPearlTypes } from "@/redux/slices/pearlTypeSlice"
import { PearlTypeTable } from "./pearl-type-table"
import { PearlTypeAddDrawer } from "./pearl-type-add-drawer"
import { PearlTypeEditDrawer } from "./pearl-type-edit-drawer"
import { DeleteDependencyDialog } from "@/components/ui/delete-dependency-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import pearlTypeService from "@/redux/services/pearlTypeService"
import type { PearlType } from "@/redux/services/pearlTypeService"

export function PearlTypeContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.pearlType)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedPearlType, setSelectedPearlType] = useState<PearlType | null>(null)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PearlType | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.PEARL_TYPE.CREATE)
  const canUpdate = has(PERMISSIONS.PEARL_TYPE.UPDATE)
  const canDelete = has(PERMISSIONS.PEARL_TYPE.DELETE)

  // Fetch pearl types on mount
  useEffect(() => {
    dispatch(fetchPearlTypes())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: PearlType) => {
    if (!canUpdate) return
    setSelectedPearlType(item)
    setIsEditDrawerOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (item: PearlType) => {
    setDeleteTarget(item)
    setIsDeleteDialogOpen(true)
  }

  // Check dependency
  const handleCheckDependency = () => {
    return pearlTypeService.checkDependency(deleteTarget!.id)
  }

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const result = await pearlTypeService.delete(deleteTarget.id)
      toast.success(result.message)
      dispatch(fetchPearlTypes())
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
          <h1 className="text-2xl font-bold tracking-tight">Pearl Types</h1>
          <p className="text-muted-foreground">
            Manage pearl types for jewellery products
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Pearl Type
          </Button>
        )}
      </div>

      {/* Pearl Types Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PearlTypeTable
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
        <PearlTypeAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <PearlTypeEditDrawer
          pearlType={selectedPearlType}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}

      {/* Delete Dependency Dialog */}
      {canDelete && deleteTarget && (
        <DeleteDependencyDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          entityType="Pearl Type"
          entityName={deleteTarget.name}
          checkDependency={handleCheckDependency}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
