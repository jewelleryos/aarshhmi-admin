"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchTags } from "@/redux/slices/tagSlice"
import { fetchTagGroups } from "@/redux/slices/tagGroupSlice"
import { TagsTable } from "./tags-table"
import { TagAddDrawer } from "./tag-add-drawer"
import { TagEditDrawer } from "./tag-edit-drawer"
import { TagSeoDrawer } from "./tag-seo-drawer"
import { usePermissions } from "@/hooks/usePermissions"
import PERMISSIONS from "@/configs/permissions.json"
import type { Tag } from "@/redux/services/tagService"

export function TagsContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.tag)
  const { items: tagGroups } = useAppSelector((state) => state.tagGroup)

  // Drawer state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isSeoDrawerOpen, setIsSeoDrawerOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)

  // Permissions
  const { has } = usePermissions()
  const canCreate = has(PERMISSIONS.TAG.CREATE)
  const canUpdate = has(PERMISSIONS.TAG.UPDATE)

  // Fetch tags and tag groups on mount
  useEffect(() => {
    dispatch(fetchTags())
    dispatch(fetchTagGroups())
  }, [dispatch])

  // Handle edit
  const handleEdit = (item: Tag) => {
    if (!canUpdate) return
    setSelectedTag(item)
    setIsEditDrawerOpen(true)
  }

  // Handle edit SEO
  const handleEditSeo = (item: Tag) => {
    if (!canUpdate) return
    setSelectedTag(item)
    setIsSeoDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">
            Manage tags for organizing and filtering products
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        )}
      </div>

      {/* Tags Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TagsTable
              items={items}
              onEdit={handleEdit}
              onEditSeo={handleEditSeo}
              canUpdate={canUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      {canCreate && (
        <TagAddDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
          tagGroups={tagGroups}
        />
      )}

      {/* Edit Drawer */}
      {canUpdate && (
        <TagEditDrawer
          tag={selectedTag}
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
          tagGroups={tagGroups}
        />
      )}

      {/* SEO Drawer */}
      {canUpdate && (
        <TagSeoDrawer
          tag={selectedTag}
          open={isSeoDrawerOpen}
          onOpenChange={setIsSeoDrawerOpen}
        />
      )}
    </div>
  )
}
