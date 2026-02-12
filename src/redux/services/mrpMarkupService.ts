import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// MRP Markup interface - matches backend response
export interface MrpMarkup {
  id: string
  diamond: number
  gemstone: number
  pearl: number
  making_charge: number
}

// Update MRP Markup request
export interface UpdateMrpMarkupData {
  diamond?: number
  gemstone?: number
  pearl?: number
  making_charge?: number
}

// Single item response
interface MrpMarkupResponse {
  success: boolean
  message: string
  data: MrpMarkup
}

// MRP Markup service with API calls
const mrpMarkupService = {
  // Get MRP markup values
  get: async (): Promise<MrpMarkupResponse> => {
    const response = await apiService.get(API_ENDPOINTS.MRP_MARKUP.GET)
    return response.data
  },

  // Update MRP markup values
  update: async (data: UpdateMrpMarkupData): Promise<MrpMarkupResponse> => {
    const response = await apiService.put(API_ENDPOINTS.MRP_MARKUP.UPDATE, data)
    return response.data
  },
}

export default mrpMarkupService
