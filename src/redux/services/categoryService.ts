import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// SEO interface
export interface CategorySeo {
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

// Category interface
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_category_id: string | null
  mpath: string
  media_url: string | null
  media_alt_text: string | null
  seo: CategorySeo
  is_filterable: boolean
  filter_display_name: string | null
  rank: number
  status: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Category with children (for hierarchical display)
export interface CategoryWithChildren extends Category {
  children: Category[]
}

// Flattened category for table display
export interface FlattenedCategory extends Category {
  level: number
  hasChildren: boolean
}

// Create request
export interface CreateCategoryData {
  name: string
  slug?: string
  description?: string | null
  parent_category_id?: string | null
  media_url?: string | null
  media_alt_text?: string | null
  is_filterable?: boolean
  filter_display_name?: string | null
  rank?: number
  status?: boolean
  metadata?: Record<string, unknown>
}

// Update request
export interface UpdateCategoryData {
  name?: string
  slug?: string
  description?: string | null
  parent_category_id?: string | null
  media_url?: string | null
  media_alt_text?: string | null
  is_filterable?: boolean
  filter_display_name?: string | null
  rank?: number
  status?: boolean
  metadata?: Record<string, unknown>
}

// Update SEO request
export interface UpdateCategorySeoData {
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

// List response (hierarchical)
interface CategoryListResponse {
  success: boolean
  message: string
  data: {
    items: CategoryWithChildren[]
  }
}

// Flat list response
interface CategoryFlatListResponse {
  success: boolean
  message: string
  data: {
    items: Category[]
  }
}

// Single item response
interface CategoryResponse {
  success: boolean
  message: string
  data: Category
}

// Category service with API calls
const categoryService = {
  // List all categories (hierarchical)
  list: async (): Promise<CategoryListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.CATEGORY.LIST)
    return response.data
  },

  // List all categories (flat - for dropdowns)
  listFlat: async (): Promise<CategoryFlatListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.CATEGORY.LIST_FLAT)
    return response.data
  },

  // Get single category by ID
  getById: async (id: string): Promise<CategoryResponse> => {
    const response = await apiService.get(API_ENDPOINTS.CATEGORY.GET(id))
    return response.data
  },

  // Create category
  create: async (data: CreateCategoryData): Promise<CategoryResponse> => {
    const response = await apiService.post(API_ENDPOINTS.CATEGORY.CREATE, data)
    return response.data
  },

  // Update category
  update: async (id: string, data: UpdateCategoryData): Promise<CategoryResponse> => {
    const response = await apiService.put(API_ENDPOINTS.CATEGORY.UPDATE(id), data)
    return response.data
  },

  // Update category SEO
  updateSeo: async (id: string, data: UpdateCategorySeoData): Promise<CategoryResponse> => {
    const response = await apiService.put(API_ENDPOINTS.CATEGORY.UPDATE_SEO(id), data)
    return response.data
  },

  // Check dependency before delete
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.CATEGORY.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete category
  delete: async (id: string): Promise<CategoryResponse> => {
    const response = await apiService.delete(API_ENDPOINTS.CATEGORY.DELETE(id))
    return response.data
  },
}

export default categoryService
