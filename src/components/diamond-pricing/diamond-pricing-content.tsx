"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import {
  fetchDiamondPrices,
  fetchShapes,
  fetchQualities,
  setFilters,
} from "@/redux/slices/diamondPricingSlice"
import { DiamondPricingTable } from "./diamond-pricing-table"
import { DiamondPricingFilters } from "./diamond-pricing-filters"
import { DiamondPricingAddDrawer } from "./diamond-pricing-add-drawer"
import { DiamondPricingEditDrawer } from "./diamond-pricing-edit-drawer"
import { DiamondPricingBulkCreateMenu } from "./diamond-pricing-bulk-create-menu"
import { DiamondPricingBulkUpdateMenu } from "./diamond-pricing-bulk-update-menu"
import { DeleteDependencyDialog } from "@/components/ui/delete-dependency-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import diamondPricingService from "@/redux/services/diamondPricingService"
import type { DiamondPrice, DiamondPriceFilters } from "@/redux/services/diamondPricingService"

export function DiamondPricingContent() {
  const dispatch = useAppDispatch()
  const { items, shapes, qualities, filters, isLoading } = useAppSelector(
    (state) => state.diamondPricing
  )

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<DiamondPrice | null>(null)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DiamondPrice | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.DIAMOND_PRICING.CREATE)
  const canUpdate = has(PERMISSIONS.DIAMOND_PRICING.UPDATE)
  const canDelete = has(PERMISSIONS.DIAMOND_PRICING.DELETE)

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchShapes())
    dispatch(fetchQualities())
    dispatch(fetchDiamondPrices(filters))
  }, [dispatch])

  // Refetch when filters change
  useEffect(() => {
    dispatch(fetchDiamondPrices(filters))
  }, [dispatch, filters])

  // Handle filter change
  const handleFilterChange = useCallback(
    (newFilters: DiamondPriceFilters) => {
      dispatch(setFilters(newFilters))
    },
    [dispatch]
  )

  // Handle edit
  const handleEdit = (item: DiamondPrice) => {
    if (!canUpdate) return
    setSelectedPrice(item)
    setIsEditDrawerOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (item: DiamondPrice) => {
    setDeleteTarget(item)
    setIsDeleteDialogOpen(true)
  }

  // Check dependency
  const handleCheckDependency = () => {
    return diamondPricingService.checkDependency(deleteTarget!.id)
  }

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const result = await diamondPricingService.delete(deleteTarget.id)
      toast.success(result.message)
      dispatch(fetchDiamondPrices(filters))
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
          <h1 className="text-2xl font-bold tracking-tight">Diamond Pricing</h1>
          <p className="text-muted-foreground">
            Manage pricing for lab-grown diamonds by shape, clarity/color, and carat range
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && <DiamondPricingBulkCreateMenu />}
          {canUpdate && <DiamondPricingBulkUpdateMenu />}
          {canCreate && (
            <Button onClick={() => setIsAddDrawerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Price
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <DiamondPricingFilters
        shapes={shapes}
        qualities={qualities}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DiamondPricingTable
              items={items}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Drawers */}
      {canCreate && (
        <DiamondPricingAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
          shapes={shapes}
          qualities={qualities}
        />
      )}

      {canUpdate && (
        <DiamondPricingEditDrawer
          diamondPrice={selectedPrice}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
          shapes={shapes}
          qualities={qualities}
        />
      )}

      {/* Delete Dependency Dialog */}
      {canDelete && deleteTarget && (
        <DeleteDependencyDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          entityType="Diamond Pricing"
          entityName={`${deleteTarget.shape_name || "Unknown"} - ${deleteTarget.quality_name || "Unknown"} (${deleteTarget.ct_from}–${deleteTarget.ct_to} ct)`}
          checkDependency={handleCheckDependency}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
