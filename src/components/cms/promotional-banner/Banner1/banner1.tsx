import { cmsService } from "@/components/cms/services/cmsService";
import { PromotionalBannerContentComponent } from "../promotional-banner-content";

export function Banner1() {
    return (
        <PromotionalBannerContentComponent
            title="Promotional Banner 1"
            description="Manage items for the first promotional banner section"
            getContent={() => cmsService.getBanner1()}
            updateContent={(content) => cmsService.updateBanner1(content)}
        />
    )
}
