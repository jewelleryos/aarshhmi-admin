import { cmsService } from "@/components/cms/services/cmsService";
import { PromotionalBannerContentComponent } from "../promotional-banner-content";

export function Banner3() {
    return (
        <PromotionalBannerContentComponent
            title="Promotional Banner 3"
            description="Manage items for the third promotional banner section (2 row and 2 column)"
            getContent={() => cmsService.getBanner3()}
            updateContent={(content) => cmsService.updateBanner3(content)}
        />
    )
}
