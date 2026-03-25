'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type ShopByShapeContent, type ShopByShapeItem } from '@/components/cms/services/cmsService'
import { ShopByShapeTable } from './shop-by-shape-table'
import { ShopByShapeAddDrawer } from './shop-by-shape-add-drawer'
import { ShopByShapeEditDrawer } from './shop-by-shape-edit-drawer'

export function CMSShopByShape() {
  const [description, setDescription] = useState('')
  const [shapes, setShapes] = useState<ShopByShapeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{ description?: string }>({})
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedShape, setSelectedShape] = useState<ShopByShapeItem | null>(null)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getShopByShape()
      const content = response.data?.content as ShopByShapeContent | undefined
      if (content) {
        setDescription(content.description || '')
        setShapes(content.shapes || [])
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch content')
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async (updatedDescription: string, updatedShapes: ShopByShapeItem[]) => {
    const response = await cmsService.updateShopByShape({
      description: updatedDescription,
      shapes: updatedShapes,
    })
    return response
  }

  const handleSaveDescription = async () => {
    const newErrors: typeof errors = {}
    if (!description) {
      newErrors.description = 'Description is required'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in all required fields')
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const response = await saveContent(description, shapes)
      toast.success(response.message)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddShape = async (shape: Omit<ShopByShapeItem, 'id'>) => {
    try {
      const newShape: ShopByShapeItem = {
        ...shape,
        id: `shape_${Date.now()}`,
      }
      const updatedShapes = [...shapes, newShape]
      const response = await saveContent(description, updatedShapes)
      toast.success(response.message)
      setShapes(updatedShapes)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add shape')
    }
  }

  const handleEditShape = async (shape: ShopByShapeItem) => {
    try {
      const updatedShapes = shapes.map((s) => (s.id === shape.id ? shape : s))
      const response = await saveContent(description, updatedShapes)
      toast.success(response.message)
      setShapes(updatedShapes)
      setIsEditDrawerOpen(false)
      setSelectedShape(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update shape')
    }
  }

  const handleDeleteShape = async (shapeId: string) => {
    try {
      const updatedShapes = shapes.filter((s) => s.id !== shapeId)
      const response = await saveContent(description, updatedShapes)
      toast.success(response.message)
      setShapes(updatedShapes)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete shape')
    }
  }

  const handleToggleStatus = async (shapeId: string) => {
    try {
      const updatedShapes = shapes.map((s) =>
        s.id === shapeId ? { ...s, status: !s.status } : s
      )
      const response = await saveContent(description, updatedShapes)
      toast.success(response.message)
      setShapes(updatedShapes)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (shape: ShopByShapeItem) => {
    setSelectedShape(shape)
    setIsEditDrawerOpen(true)
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
          <h1 className="text-2xl font-semibold">Shop by Shape</h1>
          <p className="text-sm text-muted-foreground">
            Manage the shop by shape section on homepage
          </p>
        </div>
        <Button onClick={handleSaveDescription} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Section Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Input
              id="description"
              placeholder="Enter section description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (e.target.value) setErrors((prev) => ({ ...prev, description: undefined }))
              }}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shapes Table */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Shapes</h2>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Shape
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ShopByShapeTable
            shapes={shapes}
            onEdit={openEditDrawer}
            onDelete={handleDeleteShape}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <ShopByShapeAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddShape}
      />

      {/* Edit Drawer */}
      <ShopByShapeEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        shape={selectedShape}
        onSave={handleEditShape}
      />
    </div>
  )
}
