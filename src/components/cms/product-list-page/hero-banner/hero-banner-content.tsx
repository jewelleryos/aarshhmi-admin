'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type HeroBannerItem, type CategoryWithChildrenForSelect } from '../../services/cmsService'
import { HeroBannerTable } from './hero-banner-table'
import { HeroBannerAddDrawer } from './hero-banner-add-drawer'
import { HeroBannerEditDrawer } from './hero-banner-edit-drawer'

export function ProductListPageHeroBannerContent() {
  const [banners, setBanners] = useState<HeroBannerItem[]>([])
  const [categories, setCategories] = useState<CategoryWithChildrenForSelect[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<HeroBannerItem | null>(null)

  // Fetch banners and categories on mount
  useEffect(() => {
    fetchBanners()
    fetchCategories()
  }, [])

  const fetchBanners = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getProductListPageHeroBanner()
      const content = response.data?.content as { items: HeroBannerItem[] } | undefined
      setBanners(content?.items || [])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch banners')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await cmsService.getCategoriesTree()
      const allCategories = response.data?.items || []
      setCategories(allCategories.filter((c) => c.status))
    } catch {
      // silently fail
    }
  }

  const handleAddBanner = async (banner: Omit<HeroBannerItem, 'id'>) => {
    try {
      const newBanner: HeroBannerItem = {
        ...banner,
        id: `hb_${Date.now()}`,
      }
      const updatedBanners = [...banners, newBanner]
      const response = await cmsService.updateProductListPageHeroBanner({ items: updatedBanners })
      toast.success(response.message)
      setBanners(updatedBanners)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add banner')
      throw err
    }
  }

  const handleEditBanner = async (banner: HeroBannerItem) => {
    try {
      const updatedBanners = banners.map((b) => (b.id === banner.id ? banner : b))
      const response = await cmsService.updateProductListPageHeroBanner({ items: updatedBanners })
      toast.success(response.message)
      setBanners(updatedBanners)
      setIsEditDrawerOpen(false)
      setSelectedBanner(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update banner')
      throw err
    }
  }

  const handleDeleteBanner = async (bannerId: string) => {
    try {
      const updatedBanners = banners.filter((b) => b.id !== bannerId)
      const response = await cmsService.updateProductListPageHeroBanner({ items: updatedBanners })
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
      const response = await cmsService.updateProductListPageHeroBanner({ items: updatedBanners })
      toast.success(response.message)
      setBanners(updatedBanners)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (banner: HeroBannerItem) => {
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
          <h1 className="text-2xl font-semibold">Hero Banner</h1>
          <p className="text-sm text-muted-foreground">
            Manage hero banner items for the product list page. Banners can be assigned to specific categories or shown globally.
          </p>
        </div>
        <Button onClick={() => setIsAddDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <HeroBannerTable
            banners={banners}
            categories={categories}
            onEdit={openEditDrawer}
            onDelete={handleDeleteBanner}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <HeroBannerAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddBanner}
      />

      {/* Edit Drawer */}
      <HeroBannerEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        item={selectedBanner}
        onSave={handleEditBanner}
      />
    </div>
  )
}
