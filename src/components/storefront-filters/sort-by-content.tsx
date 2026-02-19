"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { SortByTable } from "./sort-by-table"
import { SortByEditDrawer } from "./sort-by-edit-drawer"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import storefrontFiltersService from "@/redux/services/storefrontFiltersService"
import type { SortByOption } from "@/redux/services/storefrontFiltersService"

export function SortByContent() {
  // State
  const [items, setItems] = useState<SortByOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Drawer state
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<SortByOption | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canUpdate = has(PERMISSIONS.STOREFRONT_FILTER.UPDATE)

  // Fetch sort-by options
  const fetchSortByOptions = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await storefrontFiltersService.listSortByOptions()
      setItems(response.data.items)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to load sort-by options"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchSortByOptions()
  }, [fetchSortByOptions])

  // Handle edit
  const handleEdit = (item: SortByOption) => {
    if (!canUpdate) return
    setSelectedOption(item)
    setIsEditDrawerOpen(true)
  }

  // Handle edit drawer close - refetch data
  const handleEditDrawerClose = (open: boolean) => {
    setIsEditDrawerOpen(open)
    if (!open) {
      setSelectedOption(null)
      fetchSortByOptions()
    }
  }

  return (
    <>
      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SortByTable
              items={items}
              onEdit={handleEdit}
              canUpdate={canUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Drawer */}
      {canUpdate && (
        <SortByEditDrawer
          sortByOption={selectedOption}
          open={isEditDrawerOpen}
          onOpenChange={handleEditDrawerClose}
        />
      )}
    </>
  )
}
