import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'
import type { DependencyCheckResult } from '@/components/ui/delete-dependency-dialog'

// Stone Shape interface - matches backend response
export interface StoneShape {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  image_alt_text: string | null
  status: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Create Stone Shape request
export interface CreateStoneShapeData {
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  status?: boolean
}

// Update Stone Shape request
export interface UpdateStoneShapeData {
  name?: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  status?: boolean
}

// List response
interface StoneShapeListResponse {
  success: boolean
  message: string
  data: {
    items: StoneShape[]
  }
}

// Single item response
interface StoneShapeResponse {
  success: boolean
  message: string
  data: StoneShape
}

// Stone Shape service with API calls
const stoneShapeService = {
  // List all stone shapes
  list: async (): Promise<StoneShapeListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.STONE_SHAPE.LIST)
    return response.data
  },

  // Get single stone shape by ID
  getById: async (id: string): Promise<StoneShapeResponse> => {
    const response = await apiService.get(API_ENDPOINTS.STONE_SHAPE.GET(id))
    return response.data
  },

  // Create stone shape
  create: async (data: CreateStoneShapeData): Promise<StoneShapeResponse> => {
    const response = await apiService.post(API_ENDPOINTS.STONE_SHAPE.CREATE, data)
    return response.data
  },

  // Update stone shape
  update: async (id: string, data: UpdateStoneShapeData): Promise<StoneShapeResponse> => {
    const response = await apiService.put(API_ENDPOINTS.STONE_SHAPE.UPDATE(id), data)
    return response.data
  },

  // Check dependencies before deletion
  checkDependency: async (id: string): Promise<DependencyCheckResult> => {
    const response = await apiService.get(API_ENDPOINTS.STONE_SHAPE.CHECK_DEPENDENCY(id))
    return response.data.data
  },

  // Delete stone shape
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiService.delete(API_ENDPOINTS.STONE_SHAPE.DELETE(id))
    return response.data
  },
}

export default stoneShapeService
