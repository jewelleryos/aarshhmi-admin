'use client'

import { cmsService } from '@/components/cms/services/cmsService'
import { LargeSizeBannersContentComponent } from './large-size-banners-content'

export function ProductListPageLargeSizeBanners() {
  return (
    <LargeSizeBannersContentComponent
      getContent={() => cmsService.getProductListPageLargeSizeBanners()}
      updateContent={(content) => cmsService.updateProductListPageLargeSizeBanners(content)}
    />
  )
}
