'use client'

import { cmsService } from '@/components/cms/services/cmsService'
import { MidSizeBannersContentComponent } from './mid-size-banners-content'

export function ProductListPageMidSizeBanners() {
  return (
    <MidSizeBannersContentComponent
      getContent={() => cmsService.getProductListPageMidSizeBanners()}
      updateContent={(content) => cmsService.updateProductListPageMidSizeBanners(content)}
    />
  )
}
