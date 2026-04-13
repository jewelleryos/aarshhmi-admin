import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

export interface OrderListItem {
  id: string
  order_number: string
  customer_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  subtotal: number
  coupon_discount: number
  total_amount: number
  total_quantity: number
  stage: number
  payment_status: string
  payment_gateway: string
  coupon_code: string | null
  created_at: string
  item_count: number
  item_stages: { stage: number; count: number }[] | null
}

const orderService = {
  list: async () => {
    const response = await apiService.get(API_ENDPOINTS.ORDER.LIST)
    return response.data
  },
  getById: async (id: string) => {
    const response = await apiService.get(API_ENDPOINTS.ORDER.GET(id))
    return response.data
  },
  updateItemStage: async (orderId: string, itemId: string, data: {
    stage: number
    note?: string
    refund_id?: string
    is_weight_same?: boolean
    actual_metal_weight?: number
    tracking_id?: string
    courier_name?: string
    is_full_refund?: boolean
    return_refund_amount?: number
  }) => {
    const response = await apiService.patch(API_ENDPOINTS.ORDER.UPDATE_ITEM_STAGE(orderId, itemId), data)
    return response.data
  },
  generateInvoice: async (orderId: string, itemId: string) => {
    const response = await apiService.post(API_ENDPOINTS.ORDER.GENERATE_INVOICE(orderId, itemId), {})
    return response.data
  },
}

export default orderService
