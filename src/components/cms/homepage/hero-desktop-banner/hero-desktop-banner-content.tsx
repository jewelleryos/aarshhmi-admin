'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cmsService, type HeroDesktopBannerItem, type HeroDesktopBannerContent } from '@/redux/services/cmsService'
import { HeroDesktopBannerTable } from './hero-desktop-banner-table'
import { HeroDesktopBannerAddDrawer } from './hero-desktop-banner-add-drawer'
import { HeroDesktopBannerEditDrawer } from './hero-desktop-banner-edit-drawer'

export function HeroDesktopBannerContentComponent() {
  const [banners, setBanners] = useState<HeroDesktopBannerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<HeroDesktopBannerItem | null>(null)

  // Fetch banners on mount
  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getHeroDesktopBanners()
      const content = response.data?.content as HeroDesktopBannerContent | undefined
      setBanners(content?.banners || [])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch banners')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBanner = async (banner: Omit<HeroDesktopBannerItem, 'id'>) => {
    try {
      const newBanner: HeroDesktopBannerItem = {
        ...banner,
        id: `banner_${Date.now()}`,
      }
      const updatedBanners = [...banners, newBanner]
      const response = await cmsService.updateHeroDesktopBanners({ banners: updatedBanners })
      toast.success(response.message)
      setBanners(updatedBanners)
      setIsAddDrawerOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add banner')
    }
  }

  const handleEditBanner = async (banner: HeroDesktopBannerItem) => {
    try {
      const updatedBanners = banners.map((b) => (b.id === banner.id ? banner : b))
      const response = await cmsService.updateHeroDesktopBanners({ banners: updatedBanners })
      toast.success(response.message)
      setBanners(updatedBanners)
      setIsEditDrawerOpen(false)
      setSelectedBanner(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update banner')
    }
  }

  const handleDeleteBanner = async (bannerId: string) => {
    try {
      const updatedBanners = banners.filter((b) => b.id !== bannerId)
      const response = await cmsService.updateHeroDesktopBanners({ banners: updatedBanners })
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
      const response = await cmsService.updateHeroDesktopBanners({ banners: updatedBanners })
      toast.success(response.message)
      setBanners(updatedBanners)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const openEditDrawer = (banner: HeroDesktopBannerItem) => {
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
          <h1 className="text-2xl font-semibold">Hero Desktop Banner</h1>
          <p className="text-sm text-muted-foreground">
            Manage homepage hero banners for desktop view
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
          <HeroDesktopBannerTable
            banners={banners}
            onEdit={openEditDrawer}
            onDelete={handleDeleteBanner}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Add Drawer */}
      <HeroDesktopBannerAddDrawer
        open={isAddDrawerOpen}
        onOpenChange={setIsAddDrawerOpen}
        onSave={handleAddBanner}
      />

      {/* Edit Drawer */}
      <HeroDesktopBannerEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        banner={selectedBanner}
        onSave={handleEditBanner}
      />
    </div>
  )
}
