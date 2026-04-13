"use client"

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CMSSection } from "./types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CMSProductRange } from "./homepage/product-range/cms-product-range";
import { CMSAssurance } from "./homepage/assurance/cms-assurance";
import { cmsSections } from "./cms-section-enum";
import { CMSHeroDesktopBanner } from "./homepage/hero-desktop-banner/cms-hero-desktop-banner"
import { CMSHeroMobileBanner } from "./homepage/hero-mobile-banner/cms-hero-mobile-banner";
import { CMSShopFromBestsellers } from "./homepage/bestsellers/cms-shop-from-bestsellers";
import { CMSShopByShape } from "./homepage/shop-by-shape/cms-shop-by-shape";
import { CMSCollections } from "./homepage/collections/cms-collections";
import { CMSGiftGuide } from "./homepage/gift-guide/cms-gift-guide";
import { CMSEngagement } from "./homepage/engagement/cms-engagement";
import { CMSMuse } from "./homepage/muse/cms-muse";
import { CMSInstagram } from "./homepage/instagram/cms-instagram";
import { CMSExperience } from "./homepage/experience/cms-experience";
import CMSPrivacyPolicy from "./policypage/privacy/cms-privacy-policy";
import CMSLifetimeExchangeBuybackPolicy from "./policypage/lifetimeExchangeBuyback/cms-lifetime-exchange-buyback-policy";
import CMSReturnRefundPolicy from "./policypage/returnRefund/return-refund-policy";
import CMSTermsCondition from "./policypage/termsCondition/terms-condition-policy";
import CMSShoppingPolicy from "./policypage/shipping/shipping-policy";
import CMSPartnerWithUs from "./partnerWithUsPage/partner-with-us";
import CMSAboutUs from "./aboutUsPage/about-us";
import { NavbarContentComponent } from "./navbar";
import CMSJewelleryCareGuide from "./jewelleryCareGuide/jewellery-care-guide";
import { Banner1 } from "./promotional-banner/Banner1/banner1";
import { Banner2 } from "./promotional-banner/Banner2/banner2";
import { Banner3 } from "./promotional-banner/Banner3/banner3";
import { Banner4 } from "./promotional-banner/Banner4/banner4";
import { Banner5 } from "./promotional-banner/Banner5/banner5";
import { ProductListDetailsComponent } from "./product-list-details/product-list-details";
import { JewelleryCareComponent } from "./product-description-page/jewellery-care";
import { WhatsInTheBoxComponent } from "./product-description-page/whats-in-the-box";
import { GeneralContentComponent } from "./general/general-content";
import { BlogContentComponent } from "./blog/blog-content";
import { DiamondEducationContent } from "./guide/diamond-education/diamond-education-content";
import { MetalGuideContent } from "./guide/metal-guide/metal-guide-content";
import { cmsService } from "./services/cmsService";

export function CMSContent() {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([]));
    const [activeSection, setActiveSection] = useState<string>('navbar');

    const hasChildren = (section: CMSSection) => {
        return section.children && section.children.length > 0;
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    const handleSectionClick = (section: CMSSection) => {
        if (hasChildren(section)) {
            toggleSection(section.id);
        } else {
            setActiveSection(section.id);
        }
    };

    const renderSection = (section: CMSSection, depth: number = 0) => {
        const isExpanded = expandedSections.has(section.id);
        const isActive = activeSection === section.id;

        return (
            <div key={section.id}>
                <button
                    onClick={() => handleSectionClick(section)}
                    className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                        depth > 0 && 'pl-6',
                        isActive && !hasChildren(section)
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                    )}
                >
                    <span>{section.label}</span>
                    {hasChildren(section) && (
                        isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )
                    )}
                </button>
                    <div
                        className={cn(
                            'overflow-hidden transition-all duration-200 ease-in-out',
                            hasChildren(section) && isExpanded ? 'mt-1 max-h-160 opacity-100' : 'max-h-0 opacity-0'
                        )}
                    >
                        <div className="space-y-1">
                            {section.children.map((child) => renderSection(child, depth + 1))}
                        </div>
                    </div>
            </div>
        );
    };

    const allLeaves = cmsSections.flatMap(s => s.children.length > 0 ? s.children.flatMap(c => c.children.length > 0 ? c.children : [c]) : [s])
    const sectionLabel = allLeaves.find(c => c.id === activeSection)?.label ?? activeSection

    return <div className="flex h-full">
        {/* CMS Sidebar */}
        <div className="w-64 max-h-225 overflow-y-auto rounded-lg bg-muted/30 p-4">
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">CMS Sections</h2>
            <nav className="space-y-1">
                {cmsSections.map((section) => renderSection(section))}
            </nav>
        </div>
        {/* Content Area */}
         <div className="flex-1 p-6">
        {
            activeSection === "navbar" ? <NavbarContentComponent/> :
            activeSection === "hero-desktop-banner" ? <CMSHeroDesktopBanner /> :
            activeSection === "hero-mobile-banner" ? <CMSHeroMobileBanner /> :
            activeSection === "product-range" ? <CMSProductRange /> :
            activeSection === "shop-from-bestsellers" ? <CMSShopFromBestsellers /> :
            activeSection === "shop-by-shape" ? <CMSShopByShape /> :
            activeSection === "collections" ? <CMSCollections /> :
            activeSection === "gift-guide" ? <CMSGiftGuide /> :
            activeSection === "engagement" ? <CMSEngagement /> :
            activeSection === "muse" ? <CMSMuse /> :
            activeSection === "assurance" ? <CMSAssurance /> :
            activeSection === "instagram" ? <CMSInstagram /> :
            activeSection === "experience" ? <CMSExperience /> :
            activeSection === "privacy-policy" ? <CMSPrivacyPolicy/> :
            activeSection === "lifetime-exchange-buyback-policy" ?    <CMSLifetimeExchangeBuybackPolicy/> :
            activeSection === "return-refund-exchange-policy" ? <CMSReturnRefundPolicy/> :
            activeSection === "terms-conditions" ? <CMSTermsCondition/>:
            activeSection === "shipping-policy" ? <CMSShoppingPolicy/> :
            activeSection === "partner-with-us" ? <CMSPartnerWithUs/> :
            activeSection === "about-us" ? <CMSAboutUs/> :
            activeSection === "jewellery-care-guide" ? <CMSJewelleryCareGuide/> :
            activeSection === "promotional-banner-1" ? <Banner1/> :
            activeSection === "promotional-banner-2" ? <Banner2/> :
            activeSection === "promotional-banner-3" ? <Banner3/> :
            activeSection === "promotional-banner-4" ? <Banner4/> :
            activeSection === "promotional-banner-5" ? <Banner5/> :
            activeSection === "product-list-details" ? <ProductListDetailsComponent title="Product List Details" description="Manage product list details content" getContent={() => cmsService.getProductListDetails()} updateContent={(content) => cmsService.updateProductListDetails(content)}/> :
            activeSection === "jewellery-care" ? <JewelleryCareComponent getContent={() => cmsService.getProductDescriptionPage()} updateContent={(content) => cmsService.updateProductDescriptionPage(content)}/> :
            activeSection === "whats-in-the-box" ? <WhatsInTheBoxComponent getContent={() => cmsService.getProductDescriptionPage()} updateContent={(content) => cmsService.updateProductDescriptionPage(content)}/> :
            activeSection === "general" ? <GeneralContentComponent /> :
            activeSection === "blog" ? <BlogContentComponent /> :
            activeSection === "diamond-education" ? <DiamondEducationContent /> :
            activeSection === "metal-guide" ? <MetalGuideContent /> :
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-muted-foreground">Coming Soon</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {sectionLabel} section is under development.
                    </p>
                </div>
            </div>
        }
        </div>
    </div>
}