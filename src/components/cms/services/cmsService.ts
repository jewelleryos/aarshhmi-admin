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

// Types - Product Range (Shop by Category)
export interface ProductRangeItem {
  id: string
  title: string
  image_url: string
  image_alt_text: string
  redirect_url: string
  rank: number
  status: boolean
}

export interface ProductRangeContent {
  categories: ProductRangeItem[]
}

// Types - Shop by Shape
export interface ShopByShapeItem {
  id: string
  image_url: string
  image_alt_text: string
  redirect_url: string
  rank: number
  status: boolean
}

export interface ShopByShapeContent {
  description: string
  shapes: ShopByShapeItem[]
}

// Types - Collections
export interface CollectionsItem {
  id: string
  image_url: string
  image_alt_text: string
  redirect_url: string
  rank: number
  status: boolean
}

export interface CollectionsContent {
  description?: string
  collections: CollectionsItem[]
  button_text?: string
  button_redirect_url?: string
}

// Types - Gift Guide
export interface GiftSectionItem {
  id: string
  image_url: string
  image_alt_text: string
  redirect_url: string
}

export interface GiftGuideContent {
  description?: string
  gift_section_one: GiftSectionItem[]
  gift_section_two: GiftSectionItem[]
  button_text?: string
  button_redirect_url?: string
}

// Types - Engagement
export interface EngagementContent {
  image_url: string
  image_alt_text: string
  button_text: string
  redirect_url: string
}

// Types - Muse
export interface MuseItem {
  id: string
  image_url: string
  image_alt_text: string
  redirect_url: string
  rank: number
  status: boolean
}

export interface MuseContent {
  items: MuseItem[]
}

// Types - Assurance
export interface AssuranceItem {
  id: string
  image_url: string
  image_alt_text: string
  text_one: string
  text_two: string
}

export interface AssuranceContent {
  items: AssuranceItem[]
}

// Types - Experience
export interface ExperienceContent {
  image_url: string
  image_alter_text: string
  redirect_url: string
  description: string
  second_section_title: string
}

// Types - Instagram
export interface InstagramItem {
  id: string
  video_url: string
  video_alt_text: string
  main_title: string
  product_skus: string[]
}

// Types - Shop From Our Bestsellers
export interface ShopFromBestsellersContent {
  product_skus: string[]
  button_text: string
  button_redirect_url: string
}


export interface InstagramContent {
  items: InstagramItem[]
  button_text?: string
  button_redirect_url?: string
}

// Types - Policy Pages
export interface PolicyPageContent {
  html_content: string
}

// Types - Partner With Us
export interface PartnerWithUsContent {
  section1_image_url: string
  section1_image_alt_text: string

  section2_title: string
  section2_description1: string
  section2_description2: string
  section2_image_url: string
  section2_image_alt_text: string
  section2_button_text: string
  section2_redirect_url: string

  section3_title: string
  section3_description1: string
  section3_description2: string
  section3_description3: string
  section3_image_url: string
  section3_image_alt_text: string
  section3_button_text: string
  section3_redirect_url: string

  section4_title: string
  section4_description1: string
  section4_description2: string
  section4_description3: string
  section4_image_url: string
  section4_image_alt_text: string
  section4_button_text: string
  section4_redirect_url: string
}

// Types - About Us
export interface AboutUsSection1 {
  title1: string
  title2: string
  description: string
  name: string
  designation: string
  image_url: string
  image_alt_text: string
}

export interface AboutUsSection2Item {
  title: string
  description: string
  image_url: string
  image_alt_text: string
}

export interface AboutUsSection3SubSection {
  sub_title: string
  description: string
  image_url: string
  image_alt_text: string
}

export interface AboutUsSection3 {
  title: string
  sub_sections: AboutUsSection3SubSection[]
}

export interface AboutUsSection4SubSection {
  sub_title: string
  description: string
  image_url: string
  image_alt_text: string
}

export interface AboutUsSection4 {
  title: string
  sub_sections: AboutUsSection4SubSection[]
}

export interface AboutUsSection5Item {
  title: string
  description1: string
  description2: string
  image_url: string
  image_alt_text: string
}

export interface AboutUsSection6 {
  title: string
  description1: string
  description2: string
  image_url: string
  image_alt_text: string
}

export interface AboutUsContent {
  section1: AboutUsSection1
  section2: AboutUsSection2Item[]
  section3: AboutUsSection3
  section4: AboutUsSection4
  section5: AboutUsSection5Item[]
  section6: AboutUsSection6
}

// Types - Jewellery Care Guide
export interface JewelleryCareGuideSection2To5Item {
  image_url: string
  image_alt_text: string
  title: string
  description: string[]
}

export interface JewelleryCareGuideSection6Item {
  image_url: string
  image_alt_text: string
  title: string
  description: string[]
  sub_title: string
}

export interface JewelleryCareGuideSection7Item {
  image_url: string
  image_alt_text: string
  redirect_url: string
}

export interface JewelleryCareGuideSection9Item {
  image_url: string
  image_alt_text: string
  title: string
  description: string[]
  sub_title: string
}

export interface JewelleryCareGuideContent {
  section1: {
    title: string
    description: string
  }
  section2: JewelleryCareGuideSection2To5Item[]
  section3: JewelleryCareGuideSection2To5Item[]
  section4: JewelleryCareGuideSection2To5Item[]
  section5: JewelleryCareGuideSection2To5Item[]
  section6: JewelleryCareGuideSection6Item[]
  section7: JewelleryCareGuideSection7Item[]
  section8: {
    title: string
    description: string
  }
  section9: JewelleryCareGuideSection9Item[]
}

// Types - Navbar
export interface FilterChild {
  id: string
  name: string
  redirectLink: string
  imageUrl: string
  imageAltText: string
  rank: number
}

export interface FilterGroup {
  id: string
  name: string
  rank: number
  imageType: string
  children: FilterChild[]
}

export interface RightSideBanner {
  imageUrl: string
  imageAltText: string
  mainText: string
}


export interface MegaMenuData {
  filterData: FilterGroup[]
  rightSideBanner: RightSideBanner
}

export interface NavItem {
  id: string
  name: string
  link: string
  rank: number
  status: boolean
  isMegaMenu: boolean
  megaMenuData: MegaMenuData | null
}

export interface NavbarContent {
  items: NavItem[]
}

// Types - Product for CMS selection
export interface ProductForSelection {
  id: string
  name: string
  base_sku: string
}

export interface CmsSectionResponse {
  id: string
  name: string
  slug: string
  content: HeroDesktopBannerContent | ProductRangeContent | ShopByShapeContent | CollectionsContent | GiftGuideContent| ShopFromBestsellersContent | InstagramContent | ExperienceContent | AssuranceContent | MuseContent | EngagementContent | PolicyPageContent | PartnerWithUsContent | AboutUsContent
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
  // Navbar
  getNavbar: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.NAVBAR)
    return response.data
  },

  updateNavbar: async (
    content: NavbarContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.NAVBAR, { content })
    return response.data
  },

  // Hero Desktop Banner
  getHeroDesktopBanners: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.HERO_DESKTOP_BANNER)
    return response.data
  },

  updateHeroDesktopBanners: async (
    content: HeroDesktopBannerContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.HERO_DESKTOP_BANNER, { content })
    return response.data
  },

  // Hero Mobile Banner
  getHeroMobileBanners: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.HERO_MOBILE_BANNER)
    return response.data
  },

  updateHeroMobileBanners: async (
    content: HeroMobileBannerContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.HERO_MOBILE_BANNER, { content })
    return response.data
  },

  // Product Range
  getProductRange: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.PRODUCT_RANGE)
    return response.data
  },

  updateProductRange: async (
    content: ProductRangeContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.PRODUCT_RANGE, { content })
    return response.data
  },

  // Shop From Our Bestsellers
  getShopFromBestsellers: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.SHOP_FROM_BESTSELLERS)
    return response.data
  },

  updateShopFromBestsellers: async (
    content: ShopFromBestsellersContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.SHOP_FROM_BESTSELLERS, { content })
    return response.data
  },

  // Products for Selection (shared)
  getProductsForSelection: async (): Promise<ApiResponse<{ items: ProductForSelection[] }>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.PRODUCTS_FOR_SELECTION)
    return response.data
  },

  // Shop by Shape
  getShopByShape: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.SHOP_BY_SHAPE)
    return response.data
  },

  updateShopByShape: async (
    content: ShopByShapeContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.SHOP_BY_SHAPE, { content })
    return response.data
  },

  // Collections
  getCollections: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.COLLECTIONS)
    return response.data
  },

  updateCollections: async (
    content: CollectionsContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.COLLECTIONS, { content })
    return response.data
  },

  // Gift Guide
  getGiftGuide: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.GIFT_GUIDE)
    return response.data
  },

  updateGiftGuide: async (
    content: GiftGuideContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.GIFT_GUIDE, { content })
    return response.data
  },

  // Engagement
  getEngagement: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.ENGAGEMENT)
    return response.data
  },

  updateEngagement: async (
    content: EngagementContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.ENGAGEMENT, { content })
    return response.data
  },

  // Muse
  getMuse: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.MUSE)
    return response.data
  },

  updateMuse: async (
    content: MuseContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.MUSE, { content })
    return response.data
  },

  // Assurance
  getAssurance: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.ASSURANCE)
    return response.data
  },

  updateAssurance: async (
    content: AssuranceContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.ASSURANCE, { content })
    return response.data
  },

  // Instagram
  getInstagram: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.INSTAGRAM)
    return response.data
  },

  updateInstagram: async (
    content: InstagramContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.INSTAGRAM, { content })
    return response.data
  },

  // Experience
  getExperience: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.EXPERIENCE)
    return response.data
  },

  updateExperience: async (
    content: ExperienceContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.EXPERIENCE, { content })
    return response.data
  },

  // Privacy Policy
  getPrivacyPolicy: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.POLICY_PAGES.PRIVACY_POLICY)
    return response.data
  },

  updatePrivacyPolicy: async (
    content: PolicyPageContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.POLICY_PAGES.PRIVACY_POLICY, { content })
    return response.data
  },

  // Terms & Conditions
  getTermsConditions: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.POLICY_PAGES.TERMS_CONDITIONS)
    return response.data
  },

  updateTermsConditions: async (
    content: PolicyPageContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.POLICY_PAGES.TERMS_CONDITIONS, { content })
    return response.data
  },

  // Shipping Policy
  getShippingPolicy: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.POLICY_PAGES.SHIPPING_POLICY)
    return response.data
  },

  updateShippingPolicy: async (
    content: PolicyPageContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.POLICY_PAGES.SHIPPING_POLICY, { content })
    return response.data
  },

  // Return, Refund & Exchange Policy
  getReturnRefundExchange: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.POLICY_PAGES.RETURN_REFUND_EXCHANGE)
    return response.data
  },

  updateReturnRefundExchange: async (
    content: PolicyPageContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.POLICY_PAGES.RETURN_REFUND_EXCHANGE, { content })
    return response.data
  },

  // Lifetime Exchange & Buyback Policy
  getLifetimeExchangeBuyback: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.POLICY_PAGES.LIFETIME_EXCHANGE_BUYBACK)
    return response.data
  },

  updateLifetimeExchangeBuyback: async (
    content: PolicyPageContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.POLICY_PAGES.LIFETIME_EXCHANGE_BUYBACK, { content })
    return response.data
  },

  // Partner With Us
  getPartnerWithUs: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PARTNER_WITH_US)
    return response.data
  },

  updatePartnerWithUs: async (
    content: PartnerWithUsContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PARTNER_WITH_US, { content })
    return response.data
  },

  // About Us
  getAboutUs: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.ABOUT_US)
    return response.data
  },

  updateAboutUs: async (
    content: AboutUsContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.ABOUT_US, { content })
    return response.data
  },

  // Jewellery Care Guide
  getJewelleryCareGuide: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.JEWELLERY_CARE_GUIDE)
    return response.data
  },

  updateJewelleryCareGuide: async (
    content: JewelleryCareGuideContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.JEWELLERY_CARE_GUIDE, { content })
    return response.data
  },

  // Promotional Banner 1
  getBanner1: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PROMOTIONAL_BANNERS.BANNER_1)
    return response.data
  },

  updateBanner1: async (
    content: PromotionalBannerContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PROMOTIONAL_BANNERS.BANNER_1, { content })
    return response.data
  },

  // Promotional Banner 2
  getBanner2: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PROMOTIONAL_BANNERS.BANNER_2)
    return response.data
  },

  updateBanner2: async (
    content: PromotionalBannerContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PROMOTIONAL_BANNERS.BANNER_2, { content })
    return response.data
  },

  // Promotional Banner 3
  getBanner3: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PROMOTIONAL_BANNERS.BANNER_3)
    return response.data
  },

  updateBanner3: async (
    content: PromotionalBannerContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PROMOTIONAL_BANNERS.BANNER_3, { content })
    return response.data
  },

  // Promotional Banner 4
  getBanner4: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PROMOTIONAL_BANNERS.BANNER_4)
    return response.data
  },

  updateBanner4: async (
    content: PromotionalBannerContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PROMOTIONAL_BANNERS.BANNER_4, { content })
    return response.data
  },

  // Promotional Banner 5
  getBanner5: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PROMOTIONAL_BANNERS.BANNER_5)
    return response.data
  },

  updateBanner5: async (
    content: PromotionalBannerContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PROMOTIONAL_BANNERS.BANNER_5, { content })
    return response.data
  },

  // Product List Details
  getProductListDetails: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PRODUCT_LIST_DETAILS)
    return response.data
  },

  updateProductListDetails: async (
    content: ProductListDetailsContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PRODUCT_LIST_DETAILS, { content })
    return response.data
  },
}

// Types - Promotional Banner
export interface PromotionalBannerItem {
  id: string
  image_url: string
  image_alt_text: string
  redirect_url: string
  // title: string
  // subtitle: string
  // button_text: string
  // button_redirect_url: string
  rank: number
  status: boolean
}

export interface PromotionalBannerContent {
  items: PromotionalBannerItem[]
}

// Types - Product List Details
export interface ProductListImage {
  image_url: string
  image_alt_text: string
}

export interface ProductListDetailsContent {
  title1: string
  description1: string
  title2: string
  description2: string
  images: ProductListImage[]
}
