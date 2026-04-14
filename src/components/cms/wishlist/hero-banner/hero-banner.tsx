'use client'

import { cmsService } from '@/components/cms/services/cmsService'
import { PromotionalBannerContentComponent } from '../../promotional-banner/promotional-banner-content'

export function WishlistHeroBanner() {
  return (
    <PromotionalBannerContentComponent
      title="Hero Banner"
      description="Manage hero banner items for the wishlist page"
      getContent={() => cmsService.getWishlistHeroBanner()}
      updateContent={(content) => cmsService.updateWishlistHeroBanner(content)}
    />
  )
}
