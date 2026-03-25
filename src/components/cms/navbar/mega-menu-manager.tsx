'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Plus, MoreVertical, Pencil, Trash2, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService } from '../services/cmsService'
import type { NavItem, FilterGroup, FilterChild } from '../services/cmsService'
import { FilterGroupAddDrawer } from './filter-group-add-drawer'
import { FilterGroupEditDrawer } from './filter-group-edit-drawer'
import { FilterChildAddDrawer } from './filter-child-add-drawer'
import { FilterChildEditDrawer } from './filter-child-edit-drawer'
import { getCdnUrl } from '@/utils/cdn'

interface MegaMenuManagerProps {
  item: NavItem
  allItems: NavItem[]
  onBack: () => void
  onItemsChange: (items: NavItem[]) => void
}

export function MegaMenuManager({ item, allItems, onBack, onItemsChange }: MegaMenuManagerProps) {
  const filterData = item.megaMenuData?.filterData || []

  // Filter group drawers
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false)
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<FilterGroup | null>(null)

  // Filter child drawers
  const [isAddChildOpen, setIsAddChildOpen] = useState(false)
  const [isEditChildOpen, setIsEditChildOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<FilterChild | null>(null)
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0)

  // Delete dialogs
  const [deleteGroupDialog, setDeleteGroupDialog] = useState<{ open: boolean; groupId: string | null }>({ open: false, groupId: null })
  const [deleteChildDialog, setDeleteChildDialog] = useState<{ open: boolean; groupIndex: number; childId: string | null }>({ open: false, groupIndex: 0, childId: null })

  // Helper to save updated items
  const saveItems = async (updatedItems: NavItem[]) => {
    try {
      const response = await cmsService.updateNavbar({ items: updatedItems })
      toast.success(response.message)
      onItemsChange(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update')
    }
  }

  // Get updated item with new filterData
  const getUpdatedItems = (newFilterData: FilterGroup[]): NavItem[] => {
    return allItems.map((i) =>
      i.id === item.id
        ? { ...i, megaMenuData: { ...i.megaMenuData!, filterData: newFilterData } }
        : i
    )
  }

  // Filter Group handlers
  const handleAddGroup = async (group: Omit<FilterGroup, 'id' | 'children'>) => {
    const newGroup: FilterGroup = {
      ...group,
      id: `fd_${Date.now()}`,
      children: [],
    }
    const newFilterData = [...filterData, newGroup]
    await saveItems(getUpdatedItems(newFilterData))
    setIsAddGroupOpen(false)
  }

  const handleEditGroup = async (group: FilterGroup) => {
    const newFilterData = filterData.map((g) => (g.id === group.id ? group : g))
    await saveItems(getUpdatedItems(newFilterData))
    setIsEditGroupOpen(false)
    setSelectedGroup(null)
  }

  const handleDeleteGroup = async (groupId: string) => {
    const newFilterData = filterData.filter((g) => g.id !== groupId)
    await saveItems(getUpdatedItems(newFilterData))
    setDeleteGroupDialog({ open: false, groupId: null })
  }

  // Filter Child handlers
  const handleAddChild = async (child: Omit<FilterChild, 'id'>) => {
    const newChild: FilterChild = {
      ...child,
      id: `fc_${Date.now()}`,
    }
    const newFilterData = filterData.map((g, i) =>
      i === activeGroupIndex
        ? { ...g, children: [...g.children, newChild] }
        : g
    )
    await saveItems(getUpdatedItems(newFilterData))
    setIsAddChildOpen(false)
  }

  const handleEditChild = async (child: FilterChild) => {
    const newFilterData = filterData.map((g, i) =>
      i === activeGroupIndex
        ? { ...g, children: g.children.map((c) => (c.id === child.id ? child : c)) }
        : g
    )
    await saveItems(getUpdatedItems(newFilterData))
    setIsEditChildOpen(false)
    setSelectedChild(null)
  }

  const handleDeleteChild = async (groupIndex: number, childId: string) => {
    const newFilterData = filterData.map((g, i) =>
      i === groupIndex
        ? { ...g, children: g.children.filter((c) => c.id !== childId) }
        : g
    )
    await saveItems(getUpdatedItems(newFilterData))
    setDeleteChildDialog({ open: false, groupIndex: 0, childId: null })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Mega Menu — {item.name}</h1>
          <p className="text-sm text-muted-foreground">
            Manage filter groups and their items
          </p>
        </div>
      </div>

      {/* Filter Groups */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filter Groups</h2>
        <Button onClick={() => setIsAddGroupOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Filter Group
        </Button>
      </div>

      {filterData.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No filter groups</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Click &quot;Add Filter Group&quot; to create your first group (e.g. Category, Price)
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {[...filterData]
            .sort((a, b) => a.rank - b.rank)
            .map((group) => {
              // Find original index for operations
              const originalIndex = filterData.findIndex((g) => g.id === group.id)
              return (
                <Card key={group.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{group.rank}</Badge>
                        <CardTitle className="text-base">{group.name}</CardTitle>
                        <Badge variant="secondary">{group.children.length} items</Badge>
                        <Badge variant="outline" className="capitalize">{group.imageType || 'box'}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveGroupIndex(originalIndex)
                            setIsAddChildOpen(true)
                          }}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Item
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedGroup(group)
                                setIsEditGroupOpen(true)
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Group
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteGroupDialog({ open: true, groupId: group.id })}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {group.children.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No items yet. Click &quot;Add Item&quot; to add one.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {[...group.children]
                          .sort((a, b) => a.rank - b.rank)
                          .map((child) => (
                            <div
                              key={child.id}
                              className="group relative rounded-lg border p-2 hover:bg-muted/50 transition-colors"
                            >
                              {/* Image */}
                              {child.imageUrl ? (
                                <img
                                  src={getCdnUrl(child.imageUrl)}
                                  alt={child.imageAltText || child.name}
                                  className="h-16 w-full rounded object-cover mb-2"
                                />
                              ) : (
                                <div className="h-16 w-full rounded bg-muted flex items-center justify-center mb-2">
                                  <span className="text-xs text-muted-foreground">No image</span>
                                </div>
                              )}
                              <p className="text-xs font-medium truncate">{child.name}</p>
                              <p className="text-xs text-muted-foreground">Rank: {child.rank}</p>

                              {/* Actions overlay */}
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="icon" className="h-6 w-6">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setActiveGroupIndex(originalIndex)
                                        setSelectedChild(child)
                                        setIsEditChildOpen(true)
                                      }}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() =>
                                        setDeleteChildDialog({ open: true, groupIndex: originalIndex, childId: child.id })
                                      }
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}

      {/* Filter Group Drawers */}
      <FilterGroupAddDrawer
        open={isAddGroupOpen}
        onOpenChange={setIsAddGroupOpen}
        onSave={handleAddGroup}
      />
      <FilterGroupEditDrawer
        open={isEditGroupOpen}
        onOpenChange={setIsEditGroupOpen}
        group={selectedGroup}
        onSave={handleEditGroup}
      />

      {/* Filter Child Drawers */}
      <FilterChildAddDrawer
        open={isAddChildOpen}
        onOpenChange={setIsAddChildOpen}
        groupName={filterData[activeGroupIndex]?.name || ''}
        onSave={handleAddChild}
      />
      <FilterChildEditDrawer
        open={isEditChildOpen}
        onOpenChange={setIsEditChildOpen}
        child={selectedChild}
        groupName={filterData[activeGroupIndex]?.name || ''}
        onSave={handleEditChild}
      />

      {/* Delete Group Dialog */}
      <AlertDialog
        open={deleteGroupDialog.open}
        onOpenChange={(open) => setDeleteGroupDialog({ open, groupId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Filter Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will also delete all items within this group. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGroupDialog.groupId && handleDeleteGroup(deleteGroupDialog.groupId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Child Dialog */}
      <AlertDialog
        open={deleteChildDialog.open}
        onOpenChange={(open) => setDeleteChildDialog({ open, groupIndex: 0, childId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteChildDialog.childId &&
                handleDeleteChild(deleteChildDialog.groupIndex, deleteChildDialog.childId)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
