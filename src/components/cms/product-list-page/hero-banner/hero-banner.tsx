'use client'

import { cmsService } from '@/components/cms/services/cmsService'
import { PromotionalBannerContentComponent } from '../../promotional-banner/promotional-banner-content'

export function ProductListPageHeroBanner() {
  return (
    <PromotionalBannerContentComponent
      title="Hero Banner"
      description="Manage hero banner items for the product list page"
      getContent={() => cmsService.getProductListPageHeroBanner()}
      updateContent={(content) => cmsService.updateProductListPageHeroBanner(content)}
    />
  )
}
