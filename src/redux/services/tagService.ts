import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// SEO interface (same as tag groups)
export interface TagSeo {
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

// Tag interface - matches backend response (includes tag_group_name from join)
export interface Tag {
  id: string
  tag_group_id: string
  tag_group_name: string
  name: string
  slug: string
  description: string | null
  media_url: string | null
  media_alt_text: string | null
  seo: TagSeo
  is_system_generated: boolean
  is_filterable: boolean
  filter_display_name: string | null
  rank: number
  status: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Create Tag request
export interface CreateTagData {
  tag_group_id: string
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

// Update Tag request
export interface UpdateTagData {
  tag_group_id?: string
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
export interface UpdateTagSeoData {
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
interface TagListResponse {
  success: boolean
  message: string
  data: {
    items: Tag[]
  }
}

// Single item response
interface TagResponse {
  success: boolean
  message: string
  data: Tag
}

// Tag service with API calls
const tagService = {
  // List all tags (with optional group filter)
  list: async (tagGroupId?: string): Promise<TagListResponse> => {
    const url = tagGroupId
      ? `${API_ENDPOINTS.TAG.LIST}?tag_group_id=${tagGroupId}`
      : API_ENDPOINTS.TAG.LIST
    const response = await apiService.get(url)
    return response.data
  },

  // Get single tag by ID
  getById: async (id: string): Promise<TagResponse> => {
    const response = await apiService.get(API_ENDPOINTS.TAG.GET(id))
    return response.data
  },

  // Create tag
  create: async (data: CreateTagData): Promise<TagResponse> => {
    const response = await apiService.post(API_ENDPOINTS.TAG.CREATE, data)
    return response.data
  },

  // Update tag
  update: async (id: string, data: UpdateTagData): Promise<TagResponse> => {
    const response = await apiService.put(API_ENDPOINTS.TAG.UPDATE(id), data)
    return response.data
  },

  // Update tag SEO
  updateSeo: async (id: string, data: UpdateTagSeoData): Promise<TagResponse> => {
    const response = await apiService.put(API_ENDPOINTS.TAG.UPDATE_SEO(id), data)
    return response.data
  },

  // Check dependency before delete
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.TAG.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete tag
  delete: async (id: string): Promise<TagResponse> => {
    const response = await apiService.delete(API_ENDPOINTS.TAG.DELETE(id))
    return response.data
  },
}

export default tagService
