import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

export interface SeoData {
    title?: string | null
    author?: string | null
    og_url?: string | null
    robots?: string | null
    keywords?: string[] | null
    og_title?: string | null
    description?: string | null
    twitter_url?: string | null
    og_image?: string | null
    og_site_name?: string | null
    twitter_site?: string | null
    canonical_url?: string | null
    twitter_image?: string | null
    twitter_title?: string | null
    og_description?: string | null
    twitter_description?: string | null
}

export interface SEOListItem {
    id: string
    name: string
    slug: string
    seo_data: SeoData
    created_at: string
    updated_at: string
}

export interface SeoPageListResponse {
    success: boolean
    message: string
    data: {
        items: SEOListItem[]
    }
}

export interface SeoPageUpdateResponse {
    success: boolean
    message: string
    data: SEOListItem
}

export interface SeoPageUpdateRequest {
    name: string
    seo_data: SeoData
}

const seoService = {
    // Get all seo pages
    getList: async (): Promise<SeoPageListResponse> => {
        const response = await apiService.get(API_ENDPOINTS.SEO_PAGES.LIST)
        return response.data
    },

    // Update seo page
    update: async (id: string, data: SeoPageUpdateRequest): Promise<SeoPageUpdateResponse> => {
        const response = await apiService.put(API_ENDPOINTS.SEO_PAGES.UPDATE(id), data)
        return response.data
    }
}

export default seoService
