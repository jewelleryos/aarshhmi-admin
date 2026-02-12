"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import {
  fetchSizeChartValues,
  fetchSizeChartGroupsDropdown,
  makeDefaultSizeChartValue,
  deleteSizeChartValue,
  setGroupFilter,
} from "@/redux/slices/sizeChartValueSlice"
import { SizeChartValuesTable } from "./size-chart-values-table"
import { SizeChartValueAddDrawer } from "./size-chart-value-add-drawer"
import { SizeChartValueEditDrawer } from "./size-chart-value-edit-drawer"
import { SizeChartValueDeleteDialog } from "./size-chart-value-delete-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import { toast } from "sonner"
import type { SizeChartValue } from "@/redux/services/sizeChartValueService"

export function SizeChartValuesContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading, groupsDropdown, groupFilter } = useAppSelector(
    (state) => state.sizeChartValue
  )

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<SizeChartValue | null>(null)

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    item: SizeChartValue | null
    countdown: number
  }>({ open: false, item: null, countdown: 3 })

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.SIZE_CHART_VALUE.CREATE)
  const canUpdate = has(PERMISSIONS.SIZE_CHART_VALUE.UPDATE)
  const canDelete = has(PERMISSIONS.SIZE_CHART_VALUE.DELETE)

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchSizeChartGroupsDropdown())
  }, [dispatch])

  // Fetch values when group filter changes
  useEffect(() => {
    dispatch(fetchSizeChartValues(groupFilter || undefined))
  }, [dispatch, groupFilter])

  // Handle group filter change
  const handleGroupFilterChange = (value: string) => {
    dispatch(setGroupFilter(value === "all" ? null : value))
  }

  // Handle edit
  const handleEdit = (item: SizeChartValue) => {
    if (!canUpdate) return
    setSelectedValue(item)
    setIsEditDrawerOpen(true)
  }

  // Handle make default
  const handleMakeDefault = async (item: SizeChartValue) => {
    if (!canUpdate || item.is_default) return
    try {
      await dispatch(makeDefaultSizeChartValue(item.id)).unwrap()
      toast.success("Default size value updated successfully")
    } catch (err) {
      toast.error(err as string)
    }
  }

  // Handle delete
  const handleDelete = (item: SizeChartValue) => {
    if (!canDelete) return
    if (item.is_default) {
      toast.error("Cannot delete the default size value")
      return
    }
    setDeleteDialog({ open: true, item, countdown: 3 })
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteDialog.item || deleteDialog.countdown > 0) return

    try {
      await dispatch(deleteSizeChartValue(deleteDialog.item.id)).unwrap()
      toast.success("Size chart value deleted successfully")
      setDeleteDialog({ open: false, item: null, countdown: 3 })
    } catch (err) {
      toast.error(err as string)
    }
  }

  // Handle add drawer close - refetch data
  const handleAddDrawerClose = (open: boolean) => {
    setIsAddDrawerOpen(open)
    if (!open) {
      dispatch(fetchSizeChartValues(groupFilter || undefined))
    }
  }

  // Handle edit drawer close - refetch data
  const handleEditDrawerClose = (open: boolean) => {
    setIsEditDrawerOpen(open)
    if (!open) {
      dispatch(fetchSizeChartValues(groupFilter || undefined))
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Size Chart Values</h1>
          <p className="text-muted-foreground">
            Manage size values for each size chart group
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Size Chart Value
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="w-[250px]">
          <Select
            value={groupFilter || "all"}
            onValueChange={handleGroupFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {groupsDropdown.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Size Chart Values Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SizeChartValuesTable
              items={items}
              onEdit={handleEdit}
              onMakeDefault={handleMakeDefault}
              onDelete={handleDelete}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      {canCreate && (
        <SizeChartValueAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={handleAddDrawerClose}
          groups={groupsDropdown}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <SizeChartValueEditDrawer
          value={selectedValue}
          open={isEditDrawerOpen}
          onOpenChange={handleEditDrawerClose}
        />
      )}

      {/* Delete Dialog */}
      {canDelete && (
        <SizeChartValueDeleteDialog
          open={deleteDialog.open}
          item={deleteDialog.item}
          countdown={deleteDialog.countdown}
          onOpenChange={(open) => {
            if (!open) setDeleteDialog({ open: false, item: null, countdown: 3 })
          }}
          onConfirm={confirmDelete}
          setCountdown={(countdown) =>
            setDeleteDialog((prev) => ({ ...prev, countdown }))
          }
        />
      )}
    </div>
  )
}
