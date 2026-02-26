import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// Badge interface - matches backend response
export interface Badge {
  id: string
  name: string
  slug: string
  bg_color: string
  font_color: string
  position: number
  status: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Create Badge request - all fields required except status and metadata
export interface CreateBadgeData {
  name: string
  slug: string
  bg_color: string
  font_color: string
  position: number
  status?: boolean
  metadata?: Record<string, unknown>
}

// Update Badge request
export interface UpdateBadgeData {
  name?: string
  slug?: string
  bg_color?: string
  font_color?: string
  position?: number
  status?: boolean
  metadata?: Record<string, unknown>
}

// List response
interface BadgeListResponse {
  success: boolean
  message: string
  data: {
    items: Badge[]
  }
}

// Single item response
interface BadgeResponse {
  success: boolean
  message: string
  data: Badge
}

// Badge service with API calls
const badgeService = {
  // List all badges
  list: async (): Promise<BadgeListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.BADGE.LIST)
    return response.data
  },

  // Get single badge by ID
  getById: async (id: string): Promise<BadgeResponse> => {
    const response = await apiService.get(API_ENDPOINTS.BADGE.GET(id))
    return response.data
  },

  // Create badge
  create: async (data: CreateBadgeData): Promise<BadgeResponse> => {
    const response = await apiService.post(API_ENDPOINTS.BADGE.CREATE, data)
    return response.data
  },

  // Update badge
  update: async (id: string, data: UpdateBadgeData): Promise<BadgeResponse> => {
    const response = await apiService.put(API_ENDPOINTS.BADGE.UPDATE(id), data)
    return response.data
  },

  // Check dependency before delete
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.BADGE.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete badge
  delete: async (id: string): Promise<BadgeResponse> => {
    const response = await apiService.delete(API_ENDPOINTS.BADGE.DELETE(id))
    return response.data
  },
}

export default badgeService
