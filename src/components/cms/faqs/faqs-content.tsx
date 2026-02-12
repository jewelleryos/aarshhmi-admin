'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Loader2, MoreVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type FAQsSectionItem, type FAQsSectionContent, type FAQType } from '@/redux/services/cmsService'
import { FAQsAddDrawer } from './faqs-add-drawer'
import { FAQsEditDrawer } from './faqs-edit-drawer'

const FAQ_TABS: { value: FAQType; label: string }[] = [
  { value: 'orders', label: 'Orders' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'productions', label: 'Productions' },
  { value: 'returns', label: 'Returns' },
  { value: 'repairs', label: 'Repairs' },
  { value: 'sizing', label: 'Sizing' },
]

export function FAQsContentComponent() {
  const [items, setItems] = useState<FAQsSectionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FAQsSectionItem | null>(null)
  const [activeTab, setActiveTab] = useState<FAQType>('orders')

  // Fetch items on mount
  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getFAQsSection()
      const content = response.data?.content as FAQsSectionContent | undefined
      setItems(content?.items || [])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch FAQs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async (item: Omit<FAQsSectionItem, 'id'>) => {
    try {
      const newItem: FAQsSectionItem = {
        ...item,
        id: `faq_${Date.now()}`,
      }
      const updatedItems = [...items, newItem]
      const response = await cmsService.updateFAQsSection({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add FAQ')
    }
  }

  const handleEditItem = async (item: FAQsSectionItem) => {
    try {
      const updatedItems = items.map((i) => (i.id === item.id ? item : i))
      const response = await cmsService.updateFAQsSection({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsEditDrawerOpen(false)
      setSelectedItem(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update FAQ')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedItems = items.filter((i) => i.id !== itemId)
      const response = await cmsService.updateFAQsSection({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete FAQ')
    }
  }

  const handleToggleStatus = async (itemId: string) => {
    try {
      const updatedItems = items.map((i) =>
        i.id === itemId ? { ...i, status: !i.status } : i
      )
      const response = await cmsService.updateFAQsSection({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (item: FAQsSectionItem) => {
    setSelectedItem(item)
    setIsEditDrawerOpen(true)
  }

  // Filter and sort items by type
  const getItemsByType = (type: FAQType): FAQsSectionItem[] => {
    return items
      .filter((item) => item.type === type)
      .sort((a, b) => a.rank - b.rank)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">FAQs</h1>
          <p className="text-sm text-muted-foreground">
            Manage frequently asked questions by category
          </p>
        </div>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FAQType)}>
            <TabsList className="grid w-full grid-cols-6">
              {FAQ_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                  <Badge variant="secondary" className="ml-2">
                    {getItemsByType(tab.value).length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {FAQ_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-6">
                {getItemsByType(tab.value).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">No FAQs found for {tab.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click &quot;Add FAQ&quot; to create your first question
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead className="w-16">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getItemsByType(tab.value).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-muted-foreground">
                            {item.rank}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.question}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.status ? 'default' : 'secondary'}>
                              {item.status ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDrawer(item)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(item.id)}>
                                  {item.status ? (
                                    <>
                                      <EyeOff className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <FAQsAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddItem}
        defaultType={activeTab}
      />

      {/* Edit Drawer */}
      <FAQsEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        item={selectedItem}
        onSave={handleEditItem}
      />
    </div>
  )
}
