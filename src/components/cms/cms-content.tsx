'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { HeroDesktopBannerContentComponent } from './homepage/hero-desktop-banner'
import { HeroMobileBannerContentComponent } from './homepage/hero-mobile-banner'
import { ShopByCategoryContentComponent } from './homepage/shop-by-category'
import { MediaGridContentComponent } from './homepage/media-grid'
import { LuminiqueCollectionContentComponent } from './homepage/luminique-collection'
import { AboutLuminiqueContentComponent } from './homepage/about-luminique'
import { LuminiqueTrustContentComponent } from './homepage/luminique-trust'
import { FAQContentComponent } from './homepage/faq'
import { LifetimeExchangeContentComponent } from './policy-pages/lifetime-exchange'
import { ReturnPolicyContentComponent } from './policy-pages/return-policy'
import { ResizeRepairContentComponent } from './policy-pages/resize-repair'
import { CancellationPolicyContentComponent } from './policy-pages/cancellation-policy'
import { ShippingPolicyContentComponent } from './policy-pages/shipping-policy'
import { PrivacyPolicyContentComponent } from './policy-pages/privacy-policy'
import { TermsConditionsContentComponent } from './policy-pages/terms-conditions'
import { FAQsContentComponent } from './faqs'
import { AboutUsContentComponent } from './about-us'

interface CmsSection {
  id: string
  label: string
  children?: CmsSection[]
}

const cmsSections: CmsSection[] = [
  { id: 'navbar', label: 'Navbar' },
  {
    id: 'homepage',
    label: 'Homepage',
    children: [
      { id: 'hero-desktop-banner', label: 'Hero Desktop Banner' },
      { id: 'hero-mobile-banner', label: 'Hero Mobile Banner' },
      { id: 'shop-by-category', label: 'Shop by Category' },
      { id: 'media-grid', label: 'Media Grid' },
      { id: 'luminique-collection', label: 'Luminique Collection' },
      { id: 'about-luminique', label: 'About Luminique' },
      { id: 'luminique-trust', label: 'Luminique Trust' },
      { id: 'faq', label: 'FAQ' },
    ],
  },
  {
    id: 'policy-pages',
    label: 'Policy Pages',
    children: [
      { id: 'lifetime-exchange', label: 'Lifetime Exchange' },
      { id: 'return-policy', label: 'Return Policy' },
      { id: 'resize-repair', label: 'Resize and Repair' },
      { id: 'cancellation-policy', label: 'Cancellation Policy' },
      { id: 'shipping-policy', label: 'Shipping Policy' },
      { id: 'privacy-policy', label: 'Privacy Policy' },
      { id: 'terms-conditions', label: 'Terms and Conditions' },
    ],
  },
  { id: 'faqs', label: 'FAQs' },
  { id: 'about-us', label: 'About Us' },
]

export function CmsContent() {
  const [activeSection, setActiveSection] = useState('navbar')
  const [expandedSections, setExpandedSections] = useState<string[]>(['homepage'])

  const toggleExpanded = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleSectionClick = (section: CmsSection) => {
    if (section.children && section.children.length > 0) {
      toggleExpanded(section.id)
    } else {
      setActiveSection(section.id)
    }
  }

  const getActiveLabel = (): string => {
    for (const section of cmsSections) {
      if (section.id === activeSection) return section.label
      if (section.children) {
        const child = section.children.find((c) => c.id === activeSection)
        if (child) return child.label
      }
    }
    return ''
  }

  const renderSection = (section: CmsSection, depth = 0) => {
    const hasChildren = section.children && section.children.length > 0
    const isExpanded = expandedSections.includes(section.id)
    const isActive = activeSection === section.id

    return (
      <div key={section.id}>
        <button
          onClick={() => handleSectionClick(section)}
          className={cn(
            'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
            depth > 0 && 'pl-6',
            isActive && !hasChildren
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          )}
        >
          <span>{section.label}</span>
          {hasChildren && (
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
            hasChildren && isExpanded ? 'mt-1 max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="space-y-1">
            {section.children?.map((child) => renderSection(child, depth + 1))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* CMS Sidebar */}
      <div className="w-56 max-h-175 overflow-y-auto rounded-lg bg-muted/30 p-4">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">CMS Sections</h2>
        <nav className="space-y-1">
          {cmsSections.map((section) => renderSection(section))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6">
        {activeSection === 'hero-desktop-banner' ? (
          <HeroDesktopBannerContentComponent />
        ) : activeSection === 'hero-mobile-banner' ? (
          <HeroMobileBannerContentComponent />
        ) : activeSection === 'shop-by-category' ? (
          <ShopByCategoryContentComponent />
        ) : activeSection === 'media-grid' ? (
          <MediaGridContentComponent />
        ) : activeSection === 'luminique-collection' ? (
          <LuminiqueCollectionContentComponent />
        ) : activeSection === 'about-luminique' ? (
          <AboutLuminiqueContentComponent />
        ) : activeSection === 'luminique-trust' ? (
          <LuminiqueTrustContentComponent />
        ) : activeSection === 'faq' ? (
          <FAQContentComponent />
        ) : activeSection === 'lifetime-exchange' ? (
          <LifetimeExchangeContentComponent />
        ) : activeSection === 'return-policy' ? (
          <ReturnPolicyContentComponent />
        ) : activeSection === 'resize-repair' ? (
          <ResizeRepairContentComponent />
        ) : activeSection === 'cancellation-policy' ? (
          <CancellationPolicyContentComponent />
        ) : activeSection === 'shipping-policy' ? (
          <ShippingPolicyContentComponent />
        ) : activeSection === 'privacy-policy' ? (
          <PrivacyPolicyContentComponent />
        ) : activeSection === 'terms-conditions' ? (
          <TermsConditionsContentComponent />
        ) : activeSection === 'faqs' ? (
          <FAQsContentComponent />
        ) : activeSection === 'about-us' ? (
          <AboutUsContentComponent />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-muted-foreground">Coming Soon</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {getActiveLabel()} section is under development.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
