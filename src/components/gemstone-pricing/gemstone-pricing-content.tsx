"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import {
  fetchGemstonePrices,
  fetchDropdowns,
  setFilters,
} from "@/redux/slices/gemstonePricingSlice"
import { GemstonePricingTable } from "./gemstone-pricing-table"
import { GemstonePricingFilters } from "./gemstone-pricing-filters"
import { GemstonePricingAddDrawer } from "./gemstone-pricing-add-drawer"
import { GemstonePricingEditDrawer } from "./gemstone-pricing-edit-drawer"
import { GemstonePricingBulkCreateMenu } from "./gemstone-pricing-bulk-create-menu"
import { GemstonePricingBulkUpdateMenu } from "./gemstone-pricing-bulk-update-menu"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import { GemstonePrice, GemstonePriceFilters } from "@/redux/services/gemstonePricingService"

export function GemstonePricingContent() {
  const dispatch = useAppDispatch()
  const { items, gemstoneTypes, shapes, qualities, colors, filters, isLoading } = useAppSelector(
    (state) => state.gemstonePricing
  )

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<GemstonePrice | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.GEMSTONE_PRICING.CREATE)
  const canUpdate = has(PERMISSIONS.GEMSTONE_PRICING.UPDATE)

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchDropdowns())
    dispatch(fetchGemstonePrices(filters))
  }, [dispatch])

  // Refetch when filters change
  useEffect(() => {
    dispatch(fetchGemstonePrices(filters))
  }, [dispatch, filters])

  // Handle filter change
  const handleFilterChange = useCallback(
    (newFilters: GemstonePriceFilters) => {
      dispatch(setFilters(newFilters))
    },
    [dispatch]
  )

  // Handle edit
  const handleEdit = (item: GemstonePrice) => {
    if (!canUpdate) return
    setSelectedPrice(item)
    setIsEditDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gemstone Pricing</h1>
          <p className="text-muted-foreground">
            Manage pricing for gemstones by type, shape, quality, color, and carat range
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && <GemstonePricingBulkCreateMenu />}
          {canUpdate && <GemstonePricingBulkUpdateMenu />}
          {canCreate && (
            <Button onClick={() => setIsAddDrawerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Price
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <GemstonePricingFilters
        gemstoneTypes={gemstoneTypes}
        shapes={shapes}
        qualities={qualities}
        colors={colors}
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
            <GemstonePricingTable
              items={items}
              onEdit={handleEdit}
              canUpdate={canUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Drawers */}
      {canCreate && (
        <GemstonePricingAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
          gemstoneTypes={gemstoneTypes}
          shapes={shapes}
          qualities={qualities}
          colors={colors}
        />
      )}

      {canUpdate && (
        <GemstonePricingEditDrawer
          gemstonePrice={selectedPrice}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
          gemstoneTypes={gemstoneTypes}
          shapes={shapes}
          qualities={qualities}
          colors={colors}
        />
      )}
    </div>
  )
}
