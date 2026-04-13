'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle ,CardDescription} from '@/components/ui/card'
import { Plus, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type NavItem, type NavbarContent } from '../services/cmsService'
import { NavbarTable } from './navbar-table'
import { NavbarAddDrawer } from './navbar-add-drawer'
import { NavbarEditDrawer } from './navbar-edit-drawer'
import { MegaMenuManager } from './mega-menu-manager'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

export function NavbarContentComponent() {
  const [items, setItems] = useState<NavItem[]>([])
  const [headerDescription, setHeaderDescription] = useState<string>('')
  const [isSavingDescription, setIsSavingDescription] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<NavItem | null>(null)
  const [managingMegaMenu, setManagingMegaMenu] = useState<NavItem | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getNavbar()
      const content = response.data?.content as NavbarContent | undefined
      setItems(content?.items || [])
      setHeaderDescription(content?.headerDescription || '')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch navbar items')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveHeaderDescription = async () => {
    try {
      setIsSavingDescription(true)
      const response = await cmsService.updateNavbar({ items, headerDescription })
      toast.success(response.message)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save header description')
    } finally {
      setIsSavingDescription(false)
    }
  }

  const handleAddItem = async (item: Omit<NavItem, 'id'>) => {
    try {
      const newItem: NavItem = {
        ...item,
        id: `nav_${Date.now()}`,
      }
      const updatedItems = [...items, newItem]
      const response = await cmsService.updateNavbar({ items: updatedItems, headerDescription })
      toast.success(response.message)
      setItems(updatedItems)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add nav item')
    }
  }

  const handleEditItem = async (item: NavItem) => {
    try {
      const updatedItems = items.map((i) => (i.id === item.id ? item : i))
      const response = await cmsService.updateNavbar({ items: updatedItems, headerDescription })
      toast.success(response.message)
      setItems(updatedItems)
      setIsEditDrawerOpen(false)
      setSelectedItem(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update nav item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedItems = items.filter((i) => i.id !== itemId)
      const response = await cmsService.updateNavbar({ items: updatedItems, headerDescription })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete nav item')
    }
  }

  const handleToggleStatus = async (itemId: string) => {
    try {
      const updatedItems = items.map((i) =>
        i.id === itemId ? { ...i, status: !i.status } : i
      )
      const response = await cmsService.updateNavbar({ items: updatedItems, headerDescription })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (item: NavItem) => {
    setSelectedItem(item)
    setIsEditDrawerOpen(true)
  }

  const openMegaMenuManager = (item: NavItem) => {
    setManagingMegaMenu(item)
  }

  // Keep managingMegaMenu in sync with items when items change
  const currentManagedItem = managingMegaMenu
    ? items.find((i) => i.id === managingMegaMenu.id) || null
    : null

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show mega menu manager view
  if (currentManagedItem) {
    return (
      <MegaMenuManager
        item={currentManagedItem}
        allItems={items}
        onBack={() => setManagingMegaMenu(null)}
        onItemsChange={setItems}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Navbar</h1>
          <p className="text-sm text-muted-foreground">
            Manage navigation links and mega menus
          </p>
        </div>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Nav Link
        </Button>
      </div>

      {/* Header Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Header Description</CardTitle>
          <CardDescription>
            
            Announcement text displayed in the top banner of the storefront. Use the placeholder{' '}
            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
              {'{{metal_price:PURITY_SLUG}}'}
            </code>{' '}
            to insert live metal prices — e.g.{' '}
            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
              {"Today's Gold Rate: ₹{{metal_price:gold-24k}} / 1g"}
            </code>
            . The slug must match a purity slug in the Metal Purities master data.
          </CardDescription>

          <div className="flex justify-end">
            <Button onClick={handleSaveHeaderDescription} disabled={isSavingDescription}>
              {isSavingDescription ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Description
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={headerDescription}
            onChange={setHeaderDescription}
            placeholder="Enter header description... Use 'Insert Variable' to add dynamic metal price values."
            mediaRootPath="cms/navbar"
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <NavbarTable
            items={items}
            onEdit={openEditDrawer}
            onDelete={handleDeleteItem}
            onToggleStatus={handleToggleStatus}
            onManageMegaMenu={openMegaMenuManager}
          />
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <NavbarAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddItem}
      />

      {/* Edit Drawer */}
      <NavbarEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        item={selectedItem}
        onSave={handleEditItem}
      />
    </div>
  )
}
