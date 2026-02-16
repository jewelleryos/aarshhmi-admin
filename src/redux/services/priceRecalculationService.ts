import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

export interface RecalculationJob {
  id: string
  status: 'pending' | 'running' | 'completed' | 'cancelled' | 'failed'
  trigger_source: string
  triggered_by: string | null
  total_products: number
  processed_products: number
  failed_products: number
  error_details: Array<{ productId: string; productName: string; error: string }>
  started_at: string | null
  completed_at: string | null
  created_at: string
}

interface ListResponse {
  success: boolean
  message: string
  data: { items: RecalculationJob[] }
}

interface TriggerResponse {
  success: boolean
  message: string
  data: null
}

const priceRecalculationService = {
  listJobs: async (): Promise<ListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.PRICE_RECALCULATION.JOBS)
    return response.data
  },

  trigger: async (): Promise<TriggerResponse> => {
    const response = await apiService.post(API_ENDPOINTS.PRICE_RECALCULATION.TRIGGER)
    return response.data
  },
}

export default priceRecalculationService
