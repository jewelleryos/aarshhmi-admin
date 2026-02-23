"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchDiamondClarityColors } from "@/redux/slices/diamondClarityColorSlice"
import { DiamondClarityColorTable } from "./diamond-clarity-color-table"
import { DiamondClarityColorAddDrawer } from "./diamond-clarity-color-add-drawer"
import { DiamondClarityColorEditDrawer } from "./diamond-clarity-color-edit-drawer"
import { DeleteDependencyDialog } from "@/components/ui/delete-dependency-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import diamondClarityColorService from "@/redux/services/diamondClarityColorService"
import type { DiamondClarityColor } from "@/redux/services/diamondClarityColorService"

export function DiamondClarityColorContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.diamondClarityColor)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedDiamondClarityColor, setSelectedDiamondClarityColor] = useState<DiamondClarityColor | null>(null)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DiamondClarityColor | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.DIAMOND_CLARITY_COLOR.CREATE)
  const canUpdate = has(PERMISSIONS.DIAMOND_CLARITY_COLOR.UPDATE)
  const canDelete = has(PERMISSIONS.DIAMOND_CLARITY_COLOR.DELETE)

  // Fetch diamond clarity/colors on mount
  useEffect(() => {
    dispatch(fetchDiamondClarityColors())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: DiamondClarityColor) => {
    if (!canUpdate) return
    setSelectedDiamondClarityColor(item)
    setIsEditDrawerOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (item: DiamondClarityColor) => {
    setDeleteTarget(item)
    setIsDeleteDialogOpen(true)
  }

  // Check dependency
  const handleCheckDependency = () => {
    return diamondClarityColorService.checkDependency(deleteTarget!.id)
  }

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const result = await diamondClarityColorService.delete(deleteTarget.id)
      toast.success(result.message)
      dispatch(fetchDiamondClarityColors())
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
          <h1 className="text-2xl font-bold tracking-tight">Diamond Clarity/Color</h1>
          <p className="text-muted-foreground">
            Manage clarity and color grades for lab-grown diamond products
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Diamond Clarity/Color
          </Button>
        )}
      </div>

      {/* Diamond Clarity/Colors Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DiamondClarityColorTable
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
        <DiamondClarityColorAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <DiamondClarityColorEditDrawer
          diamondClarityColor={selectedDiamondClarityColor}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}

      {/* Delete Dependency Dialog */}
      {canDelete && deleteTarget && (
        <DeleteDependencyDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          entityType="Diamond Clarity/Color"
          entityName={deleteTarget.name}
          checkDependency={handleCheckDependency}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
