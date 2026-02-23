"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchGemstoneQualities } from "@/redux/slices/gemstoneQualitySlice"
import { GemstoneQualityTable } from "./gemstone-quality-table"
import { GemstoneQualityAddDrawer } from "./gemstone-quality-add-drawer"
import { GemstoneQualityEditDrawer } from "./gemstone-quality-edit-drawer"
import { DeleteDependencyDialog } from "@/components/ui/delete-dependency-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import gemstoneQualityService from "@/redux/services/gemstoneQualityService"
import type { GemstoneQuality } from "@/redux/services/gemstoneQualityService"

export function GemstoneQualityContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.gemstoneQuality)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedGemstoneQuality, setSelectedGemstoneQuality] = useState<GemstoneQuality | null>(null)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GemstoneQuality | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.GEMSTONE_QUALITY.CREATE)
  const canUpdate = has(PERMISSIONS.GEMSTONE_QUALITY.UPDATE)
  const canDelete = has(PERMISSIONS.GEMSTONE_QUALITY.DELETE)

  // Fetch gemstone qualities on mount
  useEffect(() => {
    dispatch(fetchGemstoneQualities())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: GemstoneQuality) => {
    if (!canUpdate) return
    setSelectedGemstoneQuality(item)
    setIsEditDrawerOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (item: GemstoneQuality) => {
    setDeleteTarget(item)
    setIsDeleteDialogOpen(true)
  }

  // Check dependency
  const handleCheckDependency = () => {
    return gemstoneQualityService.checkDependency(deleteTarget!.id)
  }

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const result = await gemstoneQualityService.delete(deleteTarget.id)
      toast.success(result.message)
      dispatch(fetchGemstoneQualities())
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
          <h1 className="text-2xl font-bold tracking-tight">Gemstone Qualities</h1>
          <p className="text-muted-foreground">
            Manage quality grades for gemstone products
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Gemstone Quality
          </Button>
        )}
      </div>

      {/* Gemstone Qualities Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <GemstoneQualityTable
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
        <GemstoneQualityAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <GemstoneQualityEditDrawer
          gemstoneQuality={selectedGemstoneQuality}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}

      {/* Delete Dependency Dialog */}
      {canDelete && deleteTarget && (
        <DeleteDependencyDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          entityType="Gemstone Quality"
          entityName={deleteTarget.name}
          checkDependency={handleCheckDependency}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
