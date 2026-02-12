"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchBadges } from "@/redux/slices/badgeSlice"
import { BadgesTable } from "./badges-table"
import { BadgeAddDrawer } from "./badge-add-drawer"
import { BadgeEditDrawer } from "./badge-edit-drawer"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import type { Badge } from "@/redux/services/badgeService"

export function BadgesContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.badge)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.BADGE.CREATE)
  const canUpdate = has(PERMISSIONS.BADGE.UPDATE)

  // Fetch badges on mount
  useEffect(() => {
    dispatch(fetchBadges())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: Badge) => {
    if (!canUpdate) return
    setSelectedBadge(item)
    setIsEditDrawerOpen(true)
  }

  // Handle add drawer close - refetch data
  const handleAddDrawerClose = (open: boolean) => {
    setIsAddDrawerOpen(open)
    if (!open) {
      dispatch(fetchBadges())
    }
  }

  // Handle edit drawer close - refetch data
  const handleEditDrawerClose = (open: boolean) => {
    setIsEditDrawerOpen(open)
    if (!open) {
      dispatch(fetchBadges())
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Badges</h1>
          <p className="text-muted-foreground">
            Manage product badges displayed on product images
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Badge
          </Button>
        )}
      </div>

      {/* Badges Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <BadgesTable
              items={items}
              onEdit={handleEdit}
              canUpdate={canUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      {canCreate && (
        <BadgeAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={handleAddDrawerClose}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <BadgeEditDrawer
          badge={selectedBadge}
          open={isEditDrawerOpen}
          onOpenChange={handleEditDrawerClose}
        />
      )}
    </div>
  )
}
