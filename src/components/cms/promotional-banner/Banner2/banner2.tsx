import { cmsService } from "@/components/cms/services/cmsService";
import { PromotionalBannerContentComponent } from "../promotional-banner-content";

export function Banner2() {
    return (
        <PromotionalBannerContentComponent
            title="Promotional Banner 2"
            description="Manage items for the second promotional banner section"
            getContent={() => cmsService.getBanner2()}
            updateContent={(content) => cmsService.updateBanner2(content)}
        />
    )
}
