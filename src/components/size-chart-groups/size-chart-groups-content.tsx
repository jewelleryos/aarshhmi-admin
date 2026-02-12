"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchSizeChartGroups } from "@/redux/slices/sizeChartGroupSlice"
import { SizeChartGroupsTable } from "./size-chart-groups-table"
import { SizeChartGroupAddDrawer } from "./size-chart-group-add-drawer"
import { SizeChartGroupEditDrawer } from "./size-chart-group-edit-drawer"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import type { SizeChartGroup } from "@/redux/services/sizeChartGroupService"

export function SizeChartGroupsContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.sizeChartGroup)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<SizeChartGroup | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.SIZE_CHART_GROUP.CREATE)
  const canUpdate = has(PERMISSIONS.SIZE_CHART_GROUP.UPDATE)

  // Fetch size chart groups on mount
  useEffect(() => {
    dispatch(fetchSizeChartGroups())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: SizeChartGroup) => {
    if (!canUpdate) return
    setSelectedGroup(item)
    setIsEditDrawerOpen(true)
  }

  // Handle add drawer close - refetch data
  const handleAddDrawerClose = (open: boolean) => {
    setIsAddDrawerOpen(open)
    if (!open) {
      dispatch(fetchSizeChartGroups())
    }
  }

  // Handle edit drawer close - refetch data
  const handleEditDrawerClose = (open: boolean) => {
    setIsEditDrawerOpen(open)
    if (!open) {
      dispatch(fetchSizeChartGroups())
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Size Chart Groups</h1>
          <p className="text-muted-foreground">
            Manage size chart groups for products
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Size Chart Group
          </Button>
        )}
      </div>

      {/* Size Chart Groups Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SizeChartGroupsTable
              items={items}
              onEdit={handleEdit}
              canUpdate={canUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      {canCreate && (
        <SizeChartGroupAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={handleAddDrawerClose}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <SizeChartGroupEditDrawer
          group={selectedGroup}
          open={isEditDrawerOpen}
          onOpenChange={handleEditDrawerClose}
        />
      )}
    </div>
  )
}
