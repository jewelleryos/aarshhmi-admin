"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchMetalColors } from "@/redux/slices/metalColorSlice"
import { MetalColorTable } from "./metal-color-table"
import { MetalColorAddDrawer } from "./metal-color-add-drawer"
import { MetalColorEditDrawer } from "./metal-color-edit-drawer"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import type { MetalColor } from "@/redux/services/metalColorService"

export function MetalColorContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector(
    (state) => state.metalColor
  )

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedMetalColor, setSelectedMetalColor] = useState<MetalColor | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.METAL_COLOR.CREATE)
  const canUpdate = has(PERMISSIONS.METAL_COLOR.UPDATE)

  // Fetch metal colors on mount
  useEffect(() => {
    dispatch(fetchMetalColors())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: MetalColor) => {
    if (!canUpdate) return
    setSelectedMetalColor(item)
    setIsEditDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Metal Colors</h1>
          <p className="text-muted-foreground">
            Manage metal colors for jewellery products
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Metal Color
          </Button>
        )}
      </div>

      {/* Metal Colors Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <MetalColorTable
              items={items}
              onEdit={handleEdit}
              canUpdate={canUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      {canCreate && (
        <MetalColorAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <MetalColorEditDrawer
          metalColor={selectedMetalColor}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}
    </div>
  )
}
