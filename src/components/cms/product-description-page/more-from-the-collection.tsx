'use client'

import { cmsService } from '@/components/cms/services/cmsService'
import { MoreFromTheCollectionContent } from './more-from-the-collection/more-from-the-collection-content'

export function MoreFromTheCollectionComponent() {
  return (
    <MoreFromTheCollectionContent
      getContent={() => cmsService.getMoreFromTheCollection()}
      updateContent={(content) => cmsService.updateMoreFromTheCollection(content)}
    />
  )
}
