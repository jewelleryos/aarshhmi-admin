import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Types - Hero Desktop Banner
export interface HeroDesktopBannerItem {
  id: string
  image_url: string
  image_alt_text: string
  redirect_url: string
  rank: number
  status: boolean
}

export interface HeroDesktopBannerContent {
  banners: HeroDesktopBannerItem[]
}

// Types - Hero Mobile Banner
export interface HeroMobileBannerItem {
  id: string
  image_url: string
  image_alt_text: string
  redirect_url: string
  rank: number
  status: boolean
}

export interface HeroMobileBannerContent {
  banners: HeroMobileBannerItem[]
}

// Types - Shop by Category
export interface ShopByCategoryItem {
  id: string
  title: string
  image_url: string
  image_alt_text: string
  redirect_url: string
  rank: number
  status: boolean
}

export interface ShopByCategoryContent {
  categories: ShopByCategoryItem[]
}

// Types - Media Grid
export interface MediaGridItem {
  id: string
  media_url: string
  media_alt_text: string
  redirect_url: string
  rank: number
  status: boolean
}

export interface MediaGridContent {
  items: MediaGridItem[]
}

// Types - Luminique Collection
export interface LuminiqueCollectionItem {
  id: string
  image_url: string
  image_alt_text: string
  redirect_url: string
  rank: number
  status: boolean
}

export interface LuminiqueCollectionContent {
  items: LuminiqueCollectionItem[]
}

// Types - About Luminique (static - no array)
export interface AboutLuminiqueContent {
  image_url: string
  image_alt_text: string
  description: string
  button_text: string
  redirect_url: string
}

// Types - Luminique Trust (static fields + fixed 6 items array)
export interface LuminiqueTrustItem {
  id: string
  image_url: string
  image_alt_text: string
  text_one: string
  text_two: string
}

export interface LuminiqueTrustContent {
  title: string
  subtext: string
  trusts: LuminiqueTrustItem[]
}

// Types - FAQ
export interface FAQItem {
  id: string
  question: string
  answer: string
  rank: number
  status: boolean
}

export interface FAQContent {
  items: FAQItem[]
}

// Types - Policy Pages - Lifetime Exchange
export interface LifetimeExchangeContent {
  htmlText: string
}

// Types - Policy Pages - Return Policy
export interface ReturnPolicyContent {
  htmlText: string
}

// Types - Policy Pages - Resize and Repair
export interface ResizeRepairContent {
  htmlText: string
}

// Types - Policy Pages - Cancellation Policy
export interface CancellationPolicyContent {
  htmlText: string
}

// Types - Policy Pages - Shipping Policy
export interface ShippingPolicyContent {
  htmlText: string
}

// Types - Policy Pages - Privacy Policy
export interface PrivacyPolicyContent {
  htmlText: string
}

// Types - Policy Pages - Terms and Conditions
export interface TermsConditionsContent {
  htmlText: string
}

// Types - FAQs Section
export type FAQType = 'orders' | 'shipping' | 'productions' | 'returns' | 'repairs' | 'sizing'

export interface FAQsSectionItem {
  id: string
  type: FAQType
  question: string
  answer: string
  rank: number
  status: boolean
}

export interface FAQsSectionContent {
  items: FAQsSectionItem[]
}

// Types - About Us
export interface AboutUsContent {
  // Main Image at the top
  main_image_url: string
  main_image_alt_text: string

  // Section 1
  section1_title: string
  section1_text: string
  section1_first_image_url: string
  section1_first_image_alt_text: string
  section1_second_image_url: string
  section1_second_image_alt_text: string
  section1_third_image_url: string
  section1_third_image_alt_text: string

  // Section 2
  section2_title: string
  section2_text: string
  section2_first_image_url: string
  section2_first_image_alt_text: string
  section2_second_image_url: string
  section2_second_image_alt_text: string
  section2_third_image_url: string
  section2_third_image_alt_text: string

  // Last Section
  last_section_title: string
  last_section_text: string
}

export interface CmsSection {
  id: string
  name: string
  slug: string
  content: HeroDesktopBannerContent | HeroMobileBannerContent | ShopByCategoryContent | MediaGridContent | LuminiqueCollectionContent | AboutLuminiqueContent | LuminiqueTrustContent | FAQContent | LifetimeExchangeContent | ReturnPolicyContent | ResizeRepairContent | CancellationPolicyContent | ShippingPolicyContent | PrivacyPolicyContent | TermsConditionsContent | FAQsSectionContent | AboutUsContent
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// CMS APIs
export const cmsService = {
  // Hero Desktop Banner
  getHeroDesktopBanners: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.HERO_DESKTOP_BANNER)
    return response.data
  },

  updateHeroDesktopBanners: async (
    content: HeroDesktopBannerContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.HERO_DESKTOP_BANNER, { content })
    return response.data
  },

  // Hero Mobile Banner
  getHeroMobileBanners: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.HERO_MOBILE_BANNER)
    return response.data
  },

  updateHeroMobileBanners: async (
    content: HeroMobileBannerContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.HERO_MOBILE_BANNER, { content })
    return response.data
  },

  // Shop by Category
  getShopByCategory: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.SHOP_BY_CATEGORY)
    return response.data
  },

  updateShopByCategory: async (
    content: ShopByCategoryContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.SHOP_BY_CATEGORY, { content })
    return response.data
  },

  // Media Grid
  getMediaGrid: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.MEDIA_GRID)
    return response.data
  },

  updateMediaGrid: async (
    content: MediaGridContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.MEDIA_GRID, { content })
    return response.data
  },

  // Luminique Collection
  getLuminiqueCollection: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.LUMINIQUE_COLLECTION)
    return response.data
  },

  updateLuminiqueCollection: async (
    content: LuminiqueCollectionContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.LUMINIQUE_COLLECTION, { content })
    return response.data
  },

  // About Luminique
  getAboutLuminique: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.ABOUT_LUMINIQUE)
    return response.data
  },

  updateAboutLuminique: async (
    content: AboutLuminiqueContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.ABOUT_LUMINIQUE, { content })
    return response.data
  },

  // Luminique Trust
  getLuminiqueTrust: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.LUMINIQUE_TRUST)
    return response.data
  },

  updateLuminiqueTrust: async (
    content: LuminiqueTrustContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.LUMINIQUE_TRUST, { content })
    return response.data
  },

  // FAQ
  getFAQ: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.FAQ)
    return response.data
  },

  updateFAQ: async (
    content: FAQContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.FAQ, { content })
    return response.data
  },

  // Policy Pages - Lifetime Exchange
  getLifetimeExchange: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.POLICY_PAGES.LIFETIME_EXCHANGE)
    return response.data
  },

  updateLifetimeExchange: async (
    content: LifetimeExchangeContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.POLICY_PAGES.LIFETIME_EXCHANGE, { content })
    return response.data
  },

  // Policy Pages - Return Policy
  getReturnPolicy: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.POLICY_PAGES.RETURN_POLICY)
    return response.data
  },

  updateReturnPolicy: async (
    content: ReturnPolicyContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.POLICY_PAGES.RETURN_POLICY, { content })
    return response.data
  },

  // Policy Pages - Resize and Repair
  getResizeRepair: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.POLICY_PAGES.RESIZE_REPAIR)
    return response.data
  },

  updateResizeRepair: async (
    content: ResizeRepairContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.POLICY_PAGES.RESIZE_REPAIR, { content })
    return response.data
  },

  // Policy Pages - Cancellation Policy
  getCancellationPolicy: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.POLICY_PAGES.CANCELLATION_POLICY)
    return response.data
  },

  updateCancellationPolicy: async (
    content: CancellationPolicyContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.POLICY_PAGES.CANCELLATION_POLICY, { content })
    return response.data
  },

  // Policy Pages - Shipping Policy
  getShippingPolicy: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.POLICY_PAGES.SHIPPING_POLICY)
    return response.data
  },

  updateShippingPolicy: async (
    content: ShippingPolicyContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.POLICY_PAGES.SHIPPING_POLICY, { content })
    return response.data
  },

  // Policy Pages - Privacy Policy
  getPrivacyPolicy: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.POLICY_PAGES.PRIVACY_POLICY)
    return response.data
  },

  updatePrivacyPolicy: async (
    content: PrivacyPolicyContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.POLICY_PAGES.PRIVACY_POLICY, { content })
    return response.data
  },

  // Policy Pages - Terms and Conditions
  getTermsConditions: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.POLICY_PAGES.TERMS_CONDITIONS)
    return response.data
  },

  updateTermsConditions: async (
    content: TermsConditionsContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.POLICY_PAGES.TERMS_CONDITIONS, { content })
    return response.data
  },

  // FAQs Section
  getFAQsSection: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.FAQS)
    return response.data
  },

  updateFAQsSection: async (
    content: FAQsSectionContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.FAQS, { content })
    return response.data
  },

  // About Us
  getAboutUs: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.ABOUT_US)
    return response.data
  },

  updateAboutUs: async (
    content: AboutUsContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.ABOUT_US, { content })
    return response.data
  },
}
