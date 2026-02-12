'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Loader2, MoreVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type FAQItem, type FAQContent } from '@/redux/services/cmsService'
import { FAQAddDrawer } from './faq-add-drawer'
import { FAQEditDrawer } from './faq-edit-drawer'

export function FAQContentComponent() {
  const [items, setItems] = useState<FAQItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FAQItem | null>(null)

  // Fetch items on mount
  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getFAQ()
      const content = response.data?.content as FAQContent | undefined
      setItems(content?.items || [])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch FAQ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async (item: Omit<FAQItem, 'id'>) => {
    try {
      const newItem: FAQItem = {
        ...item,
        id: `faq_${Date.now()}`,
      }
      const updatedItems = [...items, newItem]
      const response = await cmsService.updateFAQ({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add item')
    }
  }

  const handleEditItem = async (item: FAQItem) => {
    try {
      const updatedItems = items.map((i) => (i.id === item.id ? item : i))
      const response = await cmsService.updateFAQ({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
      setIsEditDrawerOpen(false)
      setSelectedItem(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedItems = items.filter((i) => i.id !== itemId)
      const response = await cmsService.updateFAQ({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  const handleToggleStatus = async (itemId: string) => {
    try {
      const updatedItems = items.map((i) =>
        i.id === itemId ? { ...i, status: !i.status } : i
      )
      const response = await cmsService.updateFAQ({ items: updatedItems })
      toast.success(response.message)
      setItems(updatedItems)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (item: FAQItem) => {
    setSelectedItem(item)
    setIsEditDrawerOpen(true)
  }

  // Sort items by rank for display
  const sortedItems = [...items].sort((a, b) => a.rank - b.rank)

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
          <h1 className="text-2xl font-semibold">FAQ</h1>
          <p className="text-sm text-muted-foreground">
            Manage homepage frequently asked questions
          </p>
        </div>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {/* FAQ Accordion */}
      <Card>
        <CardContent className="pt-6">
          {sortedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No FAQ items yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click &quot;Add FAQ&quot; to create your first question
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {sortedItems.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <div className="flex items-center">
                    <AccordionTrigger className="flex-1 text-left hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-normal">
                          #{item.rank}
                        </span>
                        <span>{item.question}</span>
                        <Badge variant={item.status ? 'default' : 'secondary'}>
                          {item.status ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="mr-2">
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
                  </div>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <FAQAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddItem}
      />

      {/* Edit Drawer */}
      <FAQEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        item={selectedItem}
        onSave={handleEditItem}
      />
    </div>
  )
}
