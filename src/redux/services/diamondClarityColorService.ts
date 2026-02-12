import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Diamond Clarity/Color interface - matches backend response
export interface DiamondClarityColor {
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

// Create Diamond Clarity/Color request
export interface CreateDiamondClarityColorData {
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  status?: boolean
}

// Update Diamond Clarity/Color request
export interface UpdateDiamondClarityColorData {
  name?: string
  slug?: string
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
}

// List response
interface DiamondClarityColorListResponse {
  success: boolean
  message: string
  data: {
    items: DiamondClarityColor[]
  }
}

// Single item response
interface DiamondClarityColorResponse {
  success: boolean
  message: string
  data: DiamondClarityColor
}

// Diamond Clarity/Color service with API calls
const diamondClarityColorService = {
  // List all diamond clarity/colors
  list: async (): Promise<DiamondClarityColorListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.DIAMOND_CLARITY_COLOR.LIST)
    return response.data
  },

  // Get single diamond clarity/color by ID
  getById: async (id: string): Promise<DiamondClarityColorResponse> => {
    const response = await apiService.get(API_ENDPOINTS.DIAMOND_CLARITY_COLOR.GET(id))
    return response.data
  },

  // Create diamond clarity/color
  create: async (data: CreateDiamondClarityColorData): Promise<DiamondClarityColorResponse> => {
    const response = await apiService.post(API_ENDPOINTS.DIAMOND_CLARITY_COLOR.CREATE, data)
    return response.data
  },

  // Update diamond clarity/color
  update: async (id: string, data: UpdateDiamondClarityColorData): Promise<DiamondClarityColorResponse> => {
    const response = await apiService.put(API_ENDPOINTS.DIAMOND_CLARITY_COLOR.UPDATE(id), data)
    return response.data
  },
}

export default diamondClarityColorService
