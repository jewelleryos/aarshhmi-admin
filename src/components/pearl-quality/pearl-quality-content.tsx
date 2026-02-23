"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchPearlQualities } from "@/redux/slices/pearlQualitySlice"
import { PearlQualityTable } from "./pearl-quality-table"
import { toast } from "sonner"
import { PearlQualityAddDrawer } from "./pearl-quality-add-drawer"
import { PearlQualityEditDrawer } from "./pearl-quality-edit-drawer"
import { DeleteDependencyDialog } from "@/components/ui/delete-dependency-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import pearlQualityService from "@/redux/services/pearlQualityService"
import type { PearlQuality } from "@/redux/services/pearlQualityService"

export function PearlQualityContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.pearlQuality)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedPearlQuality, setSelectedPearlQuality] = useState<PearlQuality | null>(null)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PearlQuality | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.PEARL_QUALITY.CREATE)
  const canUpdate = has(PERMISSIONS.PEARL_QUALITY.UPDATE)
  const canDelete = has(PERMISSIONS.PEARL_QUALITY.DELETE)

  // Fetch pearl qualities on mount
  useEffect(() => {
    dispatch(fetchPearlQualities())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: PearlQuality) => {
    if (!canUpdate) return
    setSelectedPearlQuality(item)
    setIsEditDrawerOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (item: PearlQuality) => {
    setDeleteTarget(item)
    setIsDeleteDialogOpen(true)
  }

  // Check dependency
  const handleCheckDependency = () => {
    return pearlQualityService.checkDependency(deleteTarget!.id)
  }

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const result = await pearlQualityService.delete(deleteTarget.id)
      toast.success(result.message)
      dispatch(fetchPearlQualities())
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
          <h1 className="text-2xl font-bold tracking-tight">Pearl Qualities</h1>
          <p className="text-muted-foreground">
            Manage quality grades for pearl products
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Pearl Quality
          </Button>
        )}
      </div>

      {/* Pearl Qualities Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PearlQualityTable
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
        <PearlQualityAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <PearlQualityEditDrawer
          pearlQuality={selectedPearlQuality}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}

      {/* Delete Dependency Dialog */}
      {canDelete && deleteTarget && (
        <DeleteDependencyDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          entityType="Pearl Quality"
          entityName={deleteTarget.name}
          checkDependency={handleCheckDependency}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
