"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchStoneShapes } from "@/redux/slices/stoneShapeSlice"
import { StoneShapeTable } from "./stone-shape-table"
import { StoneShapeAddDrawer } from "./stone-shape-add-drawer"
import { StoneShapeEditDrawer } from "./stone-shape-edit-drawer"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import type { StoneShape } from "@/redux/services/stoneShapeService"

export function StoneShapeContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector(
    (state) => state.stoneShape
  )

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedStoneShape, setSelectedStoneShape] = useState<StoneShape | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.STONE_SHAPE.CREATE)
  const canUpdate = has(PERMISSIONS.STONE_SHAPE.UPDATE)

  // Fetch stone shapes on mount
  useEffect(() => {
    dispatch(fetchStoneShapes())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: StoneShape) => {
    if (!canUpdate) return
    setSelectedStoneShape(item)
    setIsEditDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diamond Shapes</h1>
          <p className="text-muted-foreground">
            Manage diamond shapes for jewellery products
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Shape
          </Button>
        )}
      </div>

      {/* Stone Shapes Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <StoneShapeTable
              items={items}
              onEdit={handleEdit}
              canUpdate={canUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      {canCreate && (
        <StoneShapeAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <StoneShapeEditDrawer
          stoneShape={selectedStoneShape}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}
    </div>
  )
}
