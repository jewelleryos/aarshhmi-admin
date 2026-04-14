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
  mobile_view_image_url?: string
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
  mobile_view_image_url?: string
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
  mobile_view_image_url?: string
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
export interface GiftSectionSubItem {
  image_url?: string
  image_alt_text?: string
  redirect_url?: string
  title_1: string
  title_2: string
}

export interface GiftSectionItem {
  id: string
  image_url: string
  mobile_view_image_url?: string
  image_alt_text: string
  redirect_url: string
  sub_items?: GiftSectionSubItem[]
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
  mobile_view_image_url?: string
  image_alt_text: string
  button_text: string
  redirect_url: string
}

// Types - Muse
export interface SparkleItem {
  product_sku: string
  x_coordinate: number
  y_coordinate: number
  is_active: boolean
}

export interface MuseItem {
  id: string
  image_url: string
  mobile_view_image_url?: string
  image_alt_text: string
  redirect_url: string
  rank: number
  status: boolean
  sparkle: SparkleItem[]
}

export interface MuseContent {
  items: MuseItem[]
}

// Types - Assurance
export interface AssuranceItem {
  id: string
  image_url: string
  mobile_view_image_url?: string
  image_alt_text: string
  text_one: string
  text_two: string
}

export interface AssuranceContent {
  items: AssuranceItem[]
}

// Types - Experience
export interface ExperienceImageItem {
  image_url: string
  mobile_view_image_url?: string
  image_alter_text: string
  redirect_url?: string
}

export interface ExperienceContent {
  images: ExperienceImageItem[]
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
export interface PartnerWithUsAssuranceItem {
  id: string
  image_url: string
  mobile_view_image_url?: string
  image_alt_text: string
  text_one: string
  text_two?: string
}

export interface PartnerWithUsContent {
  assurance: PartnerWithUsAssuranceItem[]
  section1_image_url: string
  section1_mobile_view_image_url?: string
  section1_image_alt_text: string

  section2_title: string
  section2_description1: string
  section2_description2: string
  section2_image_url: string
  section2_mobile_view_image_url?: string
  section2_image_alt_text: string
  section2_button_text: string
  section2_redirect_url: string

  section3_title: string
  section3_description1: string
  section3_description2: string
  section3_description3: string
  section3_image_url: string
  section3_mobile_view_image_url?: string
  section3_image_alt_text: string
  section3_button_text: string
  section3_redirect_url: string

  section4_title: string
  section4_description1: string
  section4_description2: string
  section4_description3: string
  section4_image_url: string
  section4_mobile_view_image_url?: string
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
  mobile_view_image_url?: string
  image_alt_text: string
}

export interface AboutUsSection2Item {
  title: string
  description: string
  image_url: string
  mobile_view_image_url?: string
  image_alt_text: string
}

export interface AboutUsSection3SubSection {
  sub_title: string
  description: string
  image_url: string
  mobile_view_image_url?: string
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
  mobile_view_image_url?: string
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
  mobile_view_image_url?: string
  image_alt_text: string
}

export interface AboutUsSection6 {
  title: string
  description1: string
  description2: string
  image_url: string
  mobile_view_image_url?: string
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
  mobile_view_image_url?: string
  image_alt_text: string
  title: string
  description: string[]
}

export interface JewelleryCareGuideSection6Item {
  image_url: string
  mobile_view_image_url?: string
  image_alt_text: string
  title: string
  description: string[]
  sub_title: string
}

export interface JewelleryCareGuideSection7Item {
  image_url: string
  mobile_view_image_url?: string
  image_alt_text: string
  redirect_url: string
}

export interface JewelleryCareGuideSection9Item {
  image_url: string
  mobile_view_image_url?: string
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
  mobileViewImageUrl?: string
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
  mobileViewImageUrl?: string
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
  headerDescription?: string
}

// Types - Blog
export interface BlogButton {
  id: string
  button_text: string
  redirection_url: string
}

export interface BlogItem {
  id: string
  title: string
  description: string
  image_url: string
  mobile_image_url: string
  redirect_url: string
  image_alt_text: string
  blog_description: string
  rank: number
  status: boolean
}

export interface BlogContent {
  title: string
  description: string
  button_data: BlogButton[]
  blogs: BlogItem[]
}

// Types - Diamond Education
export interface DiamondEducationSection1Item {
  id: string
  image_url: string
  mobile_image_url: string
  redirect_url?: string
  image_alt_text: string
  rank: number
}

export interface DiamondEducationSection2Item {
  id: string
  title: string
  description: string[]
}

// Section 3 — same structure as section 2 (text items)
export type DiamondEducationSection3Item = DiamondEducationSection2Item

// Section 4 — feature image (was section 3)
export interface DiamondEducationSection4 {
  image_url: string
  mobile_image_url: string
  redirect_url?: string
  image_alt_text: string
}

// Section 5 — rich content (was section 4)
export interface DiamondEducationSection5 {
  title: string
  content: string
}

// Section 6 — detailed sub-sections (was section 5)
export interface DiamondEducationSection6SubSection {
  id: string
  title: string
  description: string[]
  image_url: string
  mobile_image_url: string
  redirect_url?: string
  image_alt_text: string
}

export interface DiamondEducationSection6 {
  title: string
  sub_sections: DiamondEducationSection6SubSection[]
}

export interface DiamondEducationContent {
  title: string
  section1: DiamondEducationSection1Item[]
  section2: DiamondEducationSection2Item[]
  section3: DiamondEducationSection3Item[]
  section4: DiamondEducationSection4
  section5: DiamondEducationSection5
  section6: DiamondEducationSection6
}

// Types - Metal Guide
export interface MetalGuideSection1Item {
  id: string
  image_url: string
  mobile_image_url: string
  redirect_url: string
  image_alt_text: string
  rank: number
}

export interface MetalGuideSection2Item {
  id: string
  title: string
  description: string[]
}

export interface MetalGuideSubSectionItem {
  id: string
  title: string
  description: string[]
  image_url: string
  mobile_image_url: string
  redirect_url: string
  image_alt_text: string
}

export interface MetalGuideSection3 {
  title: string
  sub_sections: MetalGuideSubSectionItem[]
}

export interface MetalGuideSection4 {
  title: string
  sub_sections: MetalGuideSubSectionItem[]
}

export interface MetalGuideSection5 {
  title: string
  description: string[]
  content: string
}

export interface MetalGuideSection6 {
  title: string
  description: string[]
}

export interface MetalGuideSection7 {
  title: string
  content: string
}

export interface MetalGuideSection8 {
  title: string
  description: string[]
}

export interface MetalGuideContent {
  title: string
  section1: MetalGuideSection1Item[]
  section2: MetalGuideSection2Item[]
  section3: MetalGuideSection3
  section4: MetalGuideSection4
  section5: MetalGuideSection5
  section6: MetalGuideSection6
  section7: MetalGuideSection7
  section8: MetalGuideSection8
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

  // Product List Page - Hero Banner
  getProductListPageHeroBanner: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PRODUCT_LIST_PAGE_BANNERS.HERO_BANNER)
    return response.data
  },

  updateProductListPageHeroBanner: async (
    content: PromotionalBannerContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PRODUCT_LIST_PAGE_BANNERS.HERO_BANNER, { content })
    return response.data
  },

  // Product List Page - Mid Size Banners
  getProductListPageMidSizeBanners: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PRODUCT_LIST_PAGE_BANNERS.MID_SIZE_BANNERS)
    return response.data
  },

  updateProductListPageMidSizeBanners: async (
    content: MidSizeBannersContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PRODUCT_LIST_PAGE_BANNERS.MID_SIZE_BANNERS, { content })
    return response.data
  },

  // Categories tree for banner pickers
  getCategoriesTree: async (): Promise<ApiResponse<{ items: CategoryWithChildrenForSelect[] }>> => {
    const response = await apiService.get(API_ENDPOINTS.CATEGORY.LIST)
    return response.data
  },

  // Product List Page - Large Size Banners
  getProductListPageLargeSizeBanners: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PRODUCT_LIST_PAGE_BANNERS.LARGE_SIZE_BANNERS)
    return response.data
  },

  updateProductListPageLargeSizeBanners: async (
    content: LargeSizeBannersContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PRODUCT_LIST_PAGE_BANNERS.LARGE_SIZE_BANNERS, { content })
    return response.data
  },

  // Wishlist - Hero Banner
  getWishlistHeroBanner: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.WISHLIST.HERO_BANNER)
    return response.data
  },

  updateWishlistHeroBanner: async (
    content: PromotionalBannerContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.WISHLIST.HERO_BANNER, { content })
    return response.data
  },

  // Product Description Page - More From The Collection
  getMoreFromTheCollection: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PRODUCT_DESCRIPTION_PAGE.MORE_FROM_THE_COLLECTION)
    return response.data
  },

  updateMoreFromTheCollection: async (
    content: PromotionalBannerContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PRODUCT_DESCRIPTION_PAGE.MORE_FROM_THE_COLLECTION, { content })
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

  // Product Description Page - Jewellery Care
  getJewelleryCareSection: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PRODUCT_DESCRIPTION_PAGE.JEWELLERY_CARE)
    return response.data
  },

  updateJewelleryCareSection: async (
    content: JewelleryCareSectionContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PRODUCT_DESCRIPTION_PAGE.JEWELLERY_CARE, { content })
    return response.data
  },

  // Product Description Page - What's In The Box
  getWhatsInTheBoxSection: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.PRODUCT_DESCRIPTION_PAGE.WHATS_IN_THE_BOX)
    return response.data
  },

  updateWhatsInTheBoxSection: async (
    content: WhatsInBoxSectionContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.PRODUCT_DESCRIPTION_PAGE.WHATS_IN_THE_BOX, { content })
    return response.data
  },

  getGeneral: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.GENERAL)
    return response.data
  },

  updateGeneral: async (
    content: GeneralContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.GENERAL, { content })
    return response.data
  },

  // Blog
  getBlog: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.BLOG)
    return response.data
  },

  updateBlog: async (
    content: BlogContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.BLOG, { content })
    return response.data
  },

  getDiamondEducation: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.GUIDE.DIAMOND_EDUCATION)
    return response.data
  },

  updateDiamondEducation: async (
    content: DiamondEducationContent
  ): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.GUIDE.DIAMOND_EDUCATION, { content })
    return response.data
  },

  getMetalGuide: async (): Promise<ApiResponse<CmsSectionResponse | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.GUIDE.METAL_GUIDE)
    return response.data
  },

  updateMetalGuide: async (content: MetalGuideContent): Promise<ApiResponse<CmsSectionResponse>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.GUIDE.METAL_GUIDE, { content })
    return response.data
  },
}

// Types - General
export interface GeneralContent {
  phone_no: string
  email: string
  address: string
  social_links: {
    instagram: string
    facebook: string
    twitter: string
    youtube: string
    pinterest: string
    linkedin: string
    reddit: string
  }
}

// Types - Promotional Banner
export interface PromotionalBannerItem {
  id: string
  image_url: string
  mobile_view_image_url?: string
  image_alt_text: string
  redirect_url?: string
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

// Types - Mid Size Banners (Product List Page)
export interface MidSizeBannersItem {
  id: string
  image_url: string
  mobile_view_image_url?: string
  image_alt_text?: string
  redirect_url?: string
  category_ids?: string[]
  sub_category_ids?: string[]
  rank: number
  status: boolean
}

export interface MidSizeBannersContent {
  items: MidSizeBannersItem[]
}

export interface LargeSizeBannersItem {
  id: string
  image_url: string
  mobile_view_image_url?: string
  image_alt_text?: string
  redirect_url?: string
  category_ids?: string[]
  sub_category_ids?: string[]
  rank: number
  status: boolean
}

export interface LargeSizeBannersContent {
  items: LargeSizeBannersItem[]
}

// Types - Category (for pickers)
export interface CategoryForSelect {
  id: string
  name: string
  parent_category_id: string | null
  status: boolean
  rank: number
}

export interface CategoryWithChildrenForSelect extends CategoryForSelect {
  children: CategoryForSelect[]
}

// Types - Product List Details
export interface ProductListImage {
  image_url: string
  mobile_view_image_url?: string
  image_alt_text: string
  redirect_url: string
}

export interface ProductListDetailsContent {
  images: ProductListImage[]
}

// Types - Product Description Page
export interface JewelleryCareItem {
  image_url: string
  mobile_view_image_url?: string
  image_alt_text?: string
  redirect_url?: string
}

export interface WhatsInBoxItem {
  image_url: string
  mobile_view_image_url?: string
  image_alt_text?: string
  redirect_url?: string
}

export interface JewelleryCareSectionContent {
  jewellery_care: JewelleryCareItem[]
  button_text: string
  button_redirect_url: string
}

export interface WhatsInBoxSectionContent {
  whats_in_box: WhatsInBoxItem[]
}
