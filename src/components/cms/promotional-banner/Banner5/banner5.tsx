import { cmsService } from "@/components/cms/services/cmsService";
import { PromotionalBannerContentComponent } from "../promotional-banner-content";

export function Banner5() {
    return (
        <PromotionalBannerContentComponent
            title="Promotional Banner 5"
            description="Manage items for the fifth promotional banner section"
            getContent={() => cmsService.getBanner5()}
            updateContent={(content) => cmsService.updateBanner5(content)}
        />
    )
}
