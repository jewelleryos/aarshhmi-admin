"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchGemstoneColors } from "@/redux/slices/gemstoneColorSlice"
import { GemstoneColorTable } from "./gemstone-color-table"
import { GemstoneColorAddDrawer } from "./gemstone-color-add-drawer"
import { GemstoneColorEditDrawer } from "./gemstone-color-edit-drawer"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import { GemstoneColor } from "@/redux/services/gemstoneColorService"

export function GemstoneColorContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.gemstoneColor)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedGemstoneColor, setSelectedGemstoneColor] = useState<GemstoneColor | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.GEMSTONE_COLOR.CREATE)
  const canUpdate = has(PERMISSIONS.GEMSTONE_COLOR.UPDATE)

  // Fetch gemstone colors on mount
  useEffect(() => {
    dispatch(fetchGemstoneColors())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: GemstoneColor) => {
    if (!canUpdate) return
    setSelectedGemstoneColor(item)
    setIsEditDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gemstone Colors</h1>
          <p className="text-muted-foreground">
            Manage color options for gemstone products
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Gemstone Color
          </Button>
        )}
      </div>

      {/* Gemstone Colors Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <GemstoneColorTable
              items={items}
              onEdit={handleEdit}
              canUpdate={canUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      {canCreate && (
        <GemstoneColorAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <GemstoneColorEditDrawer
          gemstoneColor={selectedGemstoneColor}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}
    </div>
  )
}
