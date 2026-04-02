'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { type PromotionalBannerItem, type PromotionalBannerContent, type CmsSection, type ApiResponse } from '../services/cmsService'
import { PromotionalBannerTable } from './promotional-banner-table'
import { PromotionalBannerAddDrawer } from './promotional-banner-add-drawer'
import { PromotionalBannerEditDrawer } from './promotional-banner-edit-drawer'

interface PromotionalBannerContentComponentProps {
  title: string
  description: string
  getContent: () => Promise<ApiResponse<CmsSection | null>>
  updateContent: (content: PromotionalBannerContent) => Promise<ApiResponse<CmsSection>>
}

export function PromotionalBannerContentComponent({
  title,
  description,
  getContent,
  updateContent,
}: PromotionalBannerContentComponentProps) {
  const [banners, setBanners] = useState<PromotionalBannerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<PromotionalBannerItem | null>(null)

  // Fetch banners on mount
  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setIsLoading(true)
      const response = await getContent()
      const content = response.data?.content as PromotionalBannerContent | undefined
      setBanners(content?.items || [])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch banners')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBanner = async (banner: Omit<PromotionalBannerItem, 'id'>) => {
    try {
      const newBanner: PromotionalBannerItem = {
        ...banner,
        id: `banner_${Date.now()}`,
      }
      const updatedBanners = [...banners, newBanner]
      const response = await updateContent({ items: updatedBanners })
      toast.success(response.message)
      setBanners(updatedBanners)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add banner')
      throw err // Re-throw to handle in drawer
    }
  }

  const handleEditBanner = async (banner: PromotionalBannerItem) => {
    try {
      const updatedBanners = banners.map((b) => (b.id === banner.id ? banner : b))
      const response = await updateContent({ items: updatedBanners })
      toast.success(response.message)
      setBanners(updatedBanners)
      setIsEditDrawerOpen(false)
      setSelectedBanner(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update banner')
      throw err // Re-throw to handle in drawer
    }
  }

  const handleDeleteBanner = async (bannerId: string) => {
    try {
      const updatedBanners = banners.filter((b) => b.id !== bannerId)
      const response = await updateContent({ items: updatedBanners })
      toast.success(response.message)
      setBanners(updatedBanners)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete banner')
    }
  }

  const handleToggleStatus = async (bannerId: string) => {
    try {
      const updatedBanners = banners.map((b) =>
        b.id === bannerId ? { ...b, status: !b.status } : b
      )
      const response = await updateContent({ items: updatedBanners })
      toast.success(response.message)
      setBanners(updatedBanners)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (banner: PromotionalBannerItem) => {
    setSelectedBanner(banner)
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
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <PromotionalBannerTable
            banners={banners}
            onEdit={openEditDrawer}
            onDelete={handleDeleteBanner}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <PromotionalBannerAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddBanner}
      />

      {/* Edit Drawer */}
      <PromotionalBannerEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        banner={selectedBanner}
        onSave={handleEditBanner}
      />
    </div>
  )
}
