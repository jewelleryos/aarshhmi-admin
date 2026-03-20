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

export interface CmsSection {
  id: string
  name: string
  slug: string
  content: HeroDesktopBannerContent | ProductRangeContent
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

  // Product Range
  getProductRange: async (): Promise<ApiResponse<CmsSection | null>> => {
    const response = await apiService.get(API_ENDPOINTS.CMS.HOMEPAGE.PRODUCT_RANGE)
    return response.data
  },

  updateProductRange: async (
    content: ProductRangeContent
  ): Promise<ApiResponse<CmsSection>> => {
    const response = await apiService.put(API_ENDPOINTS.CMS.HOMEPAGE.PRODUCT_RANGE, { content })
    return response.data
  },
}
