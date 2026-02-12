import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// SEO interface
export interface TagGroupSeo {
  meta_title?: string | null
  meta_keywords?: string | null
  meta_description?: string | null
  meta_robots?: string | null
  meta_canonical?: string | null
  og_title?: string | null
  og_site_name?: string | null
  og_description?: string | null
  og_url?: string | null
  og_image_url?: string | null
  twitter_card_title?: string | null
  twitter_card_site_name?: string | null
  twitter_card_description?: string | null
  twitter_url?: string | null
  twitter_media?: string | null
}

// Tag Group interface - matches backend response
export interface TagGroup {
  id: string
  name: string
  slug: string
  description: string | null
  media_url: string | null
  media_alt_text: string | null
  seo: TagGroupSeo
  is_system_generated: boolean
  is_filterable: boolean
  filter_display_name: string | null
  rank: number
  status: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Create Tag Group request
export interface CreateTagGroupData {
  name: string
  slug?: string
  description?: string | null
  media_url?: string | null
  media_alt_text?: string | null
  is_filterable?: boolean
  filter_display_name?: string | null
  rank?: number
  status?: boolean
  metadata?: Record<string, unknown>
}

// Update Tag Group request
export interface UpdateTagGroupData {
  name?: string
  slug?: string
  description?: string | null
  media_url?: string | null
  media_alt_text?: string | null
  is_filterable?: boolean
  filter_display_name?: string | null
  rank?: number
  status?: boolean
  metadata?: Record<string, unknown>
}

// Update SEO request
export interface UpdateTagGroupSeoData {
  meta_title?: string | null
  meta_keywords?: string | null
  meta_description?: string | null
  meta_robots?: string | null
  meta_canonical?: string | null
  og_title?: string | null
  og_site_name?: string | null
  og_description?: string | null
  og_url?: string | null
  og_image_url?: string | null
  twitter_card_title?: string | null
  twitter_card_site_name?: string | null
  twitter_card_description?: string | null
  twitter_url?: string | null
  twitter_media?: string | null
}

// List response
interface TagGroupListResponse {
  success: boolean
  message: string
  data: {
    items: TagGroup[]
  }
}

// Single item response
interface TagGroupResponse {
  success: boolean
  message: string
  data: TagGroup
}

// Tag Group service with API calls
const tagGroupService = {
  // List all tag groups
  list: async (): Promise<TagGroupListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.TAG_GROUP.LIST)
    return response.data
  },

  // Get single tag group by ID
  getById: async (id: string): Promise<TagGroupResponse> => {
    const response = await apiService.get(API_ENDPOINTS.TAG_GROUP.GET(id))
    return response.data
  },

  // Create tag group
  create: async (data: CreateTagGroupData): Promise<TagGroupResponse> => {
    const response = await apiService.post(API_ENDPOINTS.TAG_GROUP.CREATE, data)
    return response.data
  },

  // Update tag group
  update: async (id: string, data: UpdateTagGroupData): Promise<TagGroupResponse> => {
    const response = await apiService.put(API_ENDPOINTS.TAG_GROUP.UPDATE(id), data)
    return response.data
  },

  // Update tag group SEO
  updateSeo: async (id: string, data: UpdateTagGroupSeoData): Promise<TagGroupResponse> => {
    const response = await apiService.put(API_ENDPOINTS.TAG_GROUP.UPDATE_SEO(id), data)
    return response.data
  },
}

export default tagGroupService
