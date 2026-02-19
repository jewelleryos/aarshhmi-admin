"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { StorefrontFiltersTable } from "./storefront-filters-table"
import { FilterGroupEditDrawer } from "./filter-group-edit-drawer"
import { FilterValueEditDrawer } from "./filter-value-edit-drawer"
import { PriceRangesContent } from "./price-ranges-content"
import { SortByContent } from "./sort-by-content"
import { GroupConfigContent } from "./group-config-content"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import storefrontFiltersService from "@/redux/services/storefrontFiltersService"
import type {
  FilterGroup,
  FilterValue,
  UpdateFilterGroupData,
  UpdateFilterValueData,
} from "@/redux/services/storefrontFiltersService"

// Re-export types for use in child components
export type { FilterGroup, FilterValue }

export function StorefrontFiltersContent() {
  // State
  const [filters, setFilters] = useState<FilterGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Drawer state
  const [isGroupEditDrawerOpen, setIsGroupEditDrawerOpen] = useState(false)
  const [isValueEditDrawerOpen, setIsValueEditDrawerOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<FilterGroup | null>(null)
  const [selectedValue, setSelectedValue] = useState<FilterValue | null>(null)
  const [selectedGroupForValue, setSelectedGroupForValue] = useState<FilterGroup | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canUpdate = has(PERMISSIONS.STOREFRONT_FILTER.UPDATE)

  // Fetch filters
  const fetchFilters = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await storefrontFiltersService.list()
      setFilters(response.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to load filters"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchFilters()
  }, [fetchFilters])

  // Handle edit filter group
  const handleEditGroup = (group: FilterGroup) => {
    if (!canUpdate) return
    setSelectedGroup(group)
    setIsGroupEditDrawerOpen(true)
  }

  // Handle edit filter value
  const handleEditValue = (group: FilterGroup, value: FilterValue) => {
    if (!canUpdate) return
    setSelectedGroupForValue(group)
    setSelectedValue(value)
    setIsValueEditDrawerOpen(true)
  }

  // Handle group update from drawer
  const handleGroupUpdate = async (data: UpdateFilterGroupData) => {
    if (!selectedGroup) return

    try {
      const response = await storefrontFiltersService.updateGroup(selectedGroup.id, data)
      toast.success(response.message)
      setIsGroupEditDrawerOpen(false)
      setSelectedGroup(null)
      // Refresh the list
      fetchFilters()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to update filter group"
      toast.error(message)
      throw err // Re-throw to let the drawer handle loading state
    }
  }

  // Handle value update from drawer
  const handleValueUpdate = async (data: UpdateFilterValueData) => {
    if (!selectedGroupForValue || !selectedValue) return

    try {
      const response = await storefrontFiltersService.updateValue(
        selectedGroupForValue.id,
        selectedValue.id,
        data
      )
      toast.success(response.message)
      setIsValueEditDrawerOpen(false)
      setSelectedValue(null)
      setSelectedGroupForValue(null)
      // Refresh the list
      fetchFilters()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to update filter value"
      toast.error(message)
      throw err // Re-throw to let the drawer handle loading state
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Storefront Filters</h1>
          <p className="text-muted-foreground">
            Manage how filters appear on your store
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tag-groups">
        <TabsList>
          <TabsTrigger value="tag-groups">Tag Group Filters</TabsTrigger>
          <TabsTrigger value="price-ranges">Price Ranges</TabsTrigger>
          <TabsTrigger value="sort-by">Sort By</TabsTrigger>
          <TabsTrigger value="group-config">Group Settings</TabsTrigger>
        </TabsList>

        {/* Tab 1: Tag Group Filters (existing) */}
        <TabsContent value="tag-groups">
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <StorefrontFiltersTable
                  filters={filters}
                  isLoading={false}
                  canUpdate={canUpdate}
                  onEditGroup={handleEditGroup}
                  onEditValue={handleEditValue}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Price Ranges */}
        <TabsContent value="price-ranges">
          <PriceRangesContent />
        </TabsContent>

        {/* Tab 3: Sort By */}
        <TabsContent value="sort-by">
          <SortByContent />
        </TabsContent>

        {/* Tab 4: Group Settings */}
        <TabsContent value="group-config">
          <GroupConfigContent />
        </TabsContent>
      </Tabs>

      {/* Edit Group Drawer */}
      {canUpdate && (
        <FilterGroupEditDrawer
          group={selectedGroup}
          open={isGroupEditDrawerOpen}
          onOpenChange={setIsGroupEditDrawerOpen}
          onUpdate={handleGroupUpdate}
        />
      )}

      {/* Edit Value Drawer */}
      {canUpdate && (
        <FilterValueEditDrawer
          group={selectedGroupForValue}
          value={selectedValue}
          open={isValueEditDrawerOpen}
          onOpenChange={setIsValueEditDrawerOpen}
          onUpdate={handleValueUpdate}
        />
      )}
    </div>
  )
}
