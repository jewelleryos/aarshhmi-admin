"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { PriceRangesTable } from "./price-ranges-table"
import { PriceRangeAddDrawer } from "./price-range-add-drawer"
import { PriceRangeEditDrawer } from "./price-range-edit-drawer"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import storefrontFiltersService from "@/redux/services/storefrontFiltersService"
import type { PriceFilterRange } from "@/redux/services/storefrontFiltersService"

export function PriceRangesContent() {
  // State
  const [items, setItems] = useState<PriceFilterRange[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<PriceFilterRange | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canUpdate = has(PERMISSIONS.STOREFRONT_FILTER.UPDATE)

  // Fetch price ranges
  const fetchPriceRanges = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await storefrontFiltersService.listPriceRanges()
      setItems(response.data.items)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to load price ranges"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchPriceRanges()
  }, [fetchPriceRanges])

  // Handle edit
  const handleEdit = (item: PriceFilterRange) => {
    if (!canUpdate) return
    setSelectedRange(item)
    setIsEditDrawerOpen(true)
  }

  // Handle delete
  const handleDelete = async (item: PriceFilterRange) => {
    try {
      const response = await storefrontFiltersService.deletePriceRange(item.id)
      toast.success(response.message)
      fetchPriceRanges()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to delete price range"
      toast.error(message)
    }
  }

  // Handle add drawer close - refetch data
  const handleAddDrawerClose = (open: boolean) => {
    setIsAddDrawerOpen(open)
    if (!open) {
      fetchPriceRanges()
    }
  }

  // Handle edit drawer close - refetch data
  const handleEditDrawerClose = (open: boolean) => {
    setIsEditDrawerOpen(open)
    if (!open) {
      setSelectedRange(null)
      fetchPriceRanges()
    }
  }

  return (
    <>
      {/* Add Button */}
      {canUpdate && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Price Range
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PriceRangesTable
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canUpdate={canUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      {canUpdate && (
        <PriceRangeAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={handleAddDrawerClose}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <PriceRangeEditDrawer
          priceRange={selectedRange}
          open={isEditDrawerOpen}
          onOpenChange={handleEditDrawerClose}
        />
      )}
    </>
  )
}
