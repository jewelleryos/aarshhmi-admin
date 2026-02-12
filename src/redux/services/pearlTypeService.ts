import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Pearl Type interface - matches backend response
export interface PearlType {
  id: string
  stone_group_id: string
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

// Create Pearl Type request
export interface CreatePearlTypeData {
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  status?: boolean
}

// Update Pearl Type request
export interface UpdatePearlTypeData {
  name?: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  status?: boolean
}

// List response
interface PearlTypeListResponse {
  success: boolean
  message: string
  data: {
    items: PearlType[]
  }
}

// Single item response
interface PearlTypeResponse {
  success: boolean
  message: string
  data: PearlType
}

// Pearl Type service with API calls
const pearlTypeService = {
  // List all pearl types
  list: async (): Promise<PearlTypeListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PEARL_TYPE.LIST)
    return response.data
  },

  // Get single pearl type by ID
  getById: async (id: string): Promise<PearlTypeResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PEARL_TYPE.GET(id))
    return response.data
  },

  // Create pearl type
  create: async (data: CreatePearlTypeData): Promise<PearlTypeResponse> => {
    const response = await apiService.post(API_ENDPOINTS.PEARL_TYPE.CREATE, data)
    return response.data
  },

  // Update pearl type
  update: async (id: string, data: UpdatePearlTypeData): Promise<PearlTypeResponse> => {
    const response = await apiService.put(API_ENDPOINTS.PEARL_TYPE.UPDATE(id), data)
    return response.data
  },
}

export default pearlTypeService
