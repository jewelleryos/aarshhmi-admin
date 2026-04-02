import { cmsService } from "@/components/cms/services/cmsService";
import { PromotionalBannerContentComponent } from "../promotional-banner-content";

export function Banner4() {
    return (
        <PromotionalBannerContentComponent
            title="Promotional Banner 4"
            description="Manage items for the fourth promotional banner section"
            getContent={() => cmsService.getBanner4()}
            updateContent={(content) => cmsService.updateBanner4(content)}
        />
    )
}
