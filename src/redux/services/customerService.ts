import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

export interface CustomerListItem {
  id: string
  email: string | null
  phone: string | null
  first_name: string | null
  last_name: string | null
  is_active: boolean
  last_login_at: string | null
  last_login_method: string | null
  created_at: string
}

const customerService = {
  list: async () => {
    const response = await apiService.get(API_ENDPOINTS.CUSTOMER.LIST)
    return response.data
  },
}

export default customerService
