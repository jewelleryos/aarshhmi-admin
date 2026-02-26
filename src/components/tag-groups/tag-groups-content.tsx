"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchTagGroups } from "@/redux/slices/tagGroupSlice"
import { TagGroupsTable } from "./tag-groups-table"
import { toast } from "sonner"
import { TagGroupAddDrawer } from "./tag-group-add-drawer"
import { TagGroupEditDrawer } from "./tag-group-edit-drawer"
import { TagGroupSeoDrawer } from "./tag-group-seo-drawer"
import { DeleteDependencyDialog } from "@/components/ui/delete-dependency-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import tagGroupService from "@/redux/services/tagGroupService"
import type { TagGroup } from "@/redux/services/tagGroupService"

export function TagGroupsContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector(
    (state) => state.tagGroup
  )

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isSeoDrawerOpen, setIsSeoDrawerOpen] = useState(false)
  const [selectedTagGroup, setSelectedTagGroup] = useState<TagGroup | null>(null)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TagGroup | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.TAG_GROUP.CREATE)
  const canUpdate = has(PERMISSIONS.TAG_GROUP.UPDATE)
  const canDelete = has(PERMISSIONS.TAG_GROUP.DELETE)

  // Fetch tag groups on mount
  useEffect(() => {
    dispatch(fetchTagGroups())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: TagGroup) => {
    if (!canUpdate) return
    setSelectedTagGroup(item)
    setIsEditDrawerOpen(true)
  }

  // Handle edit SEO
  const handleEditSeo = (item: TagGroup) => {
    if (!canUpdate) return
    setSelectedTagGroup(item)
    setIsSeoDrawerOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (item: TagGroup) => {
    setDeleteTarget(item)
    setIsDeleteDialogOpen(true)
  }

  // Check dependency
  const handleCheckDependency = () => {
    return tagGroupService.checkDependency(deleteTarget!.id)
  }

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const result = await tagGroupService.delete(deleteTarget.id)
      toast.success(result.message)
      dispatch(fetchTagGroups())
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || "Something went wrong")
      throw err
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tag Groups</h1>
          <p className="text-muted-foreground">
            Manage tag groups for organizing product tags
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tag Group
          </Button>
        )}
      </div>

      {/* Tag Groups Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TagGroupsTable
              items={items}
              onEdit={handleEdit}
              onEditSeo={handleEditSeo}
              onDelete={handleDeleteClick}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      {canCreate && (
        <TagGroupAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <TagGroupEditDrawer
          tagGroup={selectedTagGroup}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
        />
      )}

      {/* SEO Drawer */}
      {canUpdate && (
        <TagGroupSeoDrawer
          tagGroup={selectedTagGroup}
          open={isSeoDrawerOpen}
          onOpenChange={setIsSeoDrawerOpen}
        />
      )}

      {/* Delete Dependency Dialog */}
      {canDelete && deleteTarget && (
        <DeleteDependencyDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          entityType="Tag Group"
          entityName={deleteTarget.name}
          checkDependency={handleCheckDependency}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
