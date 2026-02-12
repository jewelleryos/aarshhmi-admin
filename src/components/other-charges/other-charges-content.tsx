"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchOtherCharges, deleteOtherCharge } from "@/redux/slices/otherChargeSlice"
import { OtherChargesTable } from "./other-charges-table"
import { OtherChargesAddDrawer } from "./other-charges-add-drawer"
import { OtherChargesEditDrawer } from "./other-charges-edit-drawer"
import { DeleteDialogWithDelay } from "@/components/ui/delete-dialog-with-delay"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import { toast } from "sonner"
import type { OtherCharge } from "@/redux/services/otherChargeService"

export function OtherChargesContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector(
    (state) => state.otherCharge
  )

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedOtherCharge, setSelectedOtherCharge] = useState<OtherCharge | null>(null)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [chargeToDelete, setChargeToDelete] = useState<OtherCharge | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.OTHER_CHARGE.CREATE)
  const canUpdate = has(PERMISSIONS.OTHER_CHARGE.UPDATE)
  const canDelete = has(PERMISSIONS.OTHER_CHARGE.DELETE)

  // Fetch other charges on mount
  useEffect(() => {
    dispatch(fetchOtherCharges())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: OtherCharge) => {
    if (!canUpdate) return
    setSelectedOtherCharge(item)
    setIsEditDrawerOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (item: OtherCharge) => {
    if (!canDelete) return
    setChargeToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!chargeToDelete) return

    try {
      await dispatch(deleteOtherCharge(chargeToDelete.id)).unwrap()
      toast.success("Other charge deleted successfully")
    } catch (err) {
      toast.error(err as string)
      throw err // Re-throw to keep dialog open on error
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Other Charges</h1>
          <p className="text-muted-foreground">
            Manage miscellaneous charges for products
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Other Charge
          </Button>
        )}
      </div>

      {/* Other Charges Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <OtherChargesTable
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
        <OtherChargesAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <OtherChargesEditDrawer
          otherCharge={selectedOtherCharge}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}

      {/* Delete Dialog */}
      {canDelete && (
        <DeleteDialogWithDelay
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Delete Other Charge"
          description={`Are you sure you want to delete "${chargeToDelete?.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
