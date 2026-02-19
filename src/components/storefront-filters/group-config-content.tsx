"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { GroupConfigTable } from "./group-config-table"
import { GroupConfigEditDrawer } from "./group-config-edit-drawer"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import storefrontFiltersService from "@/redux/services/storefrontFiltersService"
import type { StorefrontFilterGroupConfig } from "@/redux/services/storefrontFiltersService"

export function GroupConfigContent() {
  // State
  const [items, setItems] = useState<StorefrontFilterGroupConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Drawer state
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<StorefrontFilterGroupConfig | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canUpdate = has(PERMISSIONS.STOREFRONT_FILTER.UPDATE)

  // Fetch group configs
  const fetchGroupConfigs = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await storefrontFiltersService.listGroupConfigs()
      setItems(response.data.items)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || "Failed to load group configs"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchGroupConfigs()
  }, [fetchGroupConfigs])

  // Handle edit
  const handleEdit = (item: StorefrontFilterGroupConfig) => {
    if (!canUpdate) return
    setSelectedConfig(item)
    setIsEditDrawerOpen(true)
  }

  // Handle edit drawer close - refetch data
  const handleEditDrawerClose = (open: boolean) => {
    setIsEditDrawerOpen(open)
    if (!open) {
      setSelectedConfig(null)
      fetchGroupConfigs()
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
            <GroupConfigTable
              items={items}
              onEdit={handleEdit}
              canUpdate={canUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Drawer */}
      {canUpdate && (
        <GroupConfigEditDrawer
          groupConfig={selectedConfig}
          open={isEditDrawerOpen}
          onOpenChange={handleEditDrawerClose}
        />
      )}
    </>
  )
}
