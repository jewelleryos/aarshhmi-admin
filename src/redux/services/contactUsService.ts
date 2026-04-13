import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

export interface ContactInquiryListItem {
  id: string
  name: string
  email: string | null
  phone: string | null
  message: string
  is_consent_given: boolean
  created_at: string
  updated_at: string
}

export interface ContactInquiry extends ContactInquiryListItem {}

interface ListResponse {
  success: boolean
  message: string
  data: {
    items: ContactInquiryListItem[]
    total: number
  }
}

interface SingleResponse {
  success: boolean
  message: string
  data: ContactInquiry
}

const contactUsService = {
  list: async (limit?: number, offset?: number): Promise<ListResponse> => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())

    const response = await apiService.get(
      `${API_ENDPOINTS.CONTACT_US.LIST}?${params.toString()}`
    )
    return response.data
  },

  getById: async (id: string): Promise<SingleResponse> => {
    const response = await apiService.get(API_ENDPOINTS.CONTACT_US.GET(id))
    return response.data
  },
}

export default contactUsService
