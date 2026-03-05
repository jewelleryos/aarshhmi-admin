import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

const couponService = {
  list: async (filters?: { type?: string; is_active?: string; search?: string }) => {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.is_active) params.append('is_active', filters.is_active)
    if (filters?.search) params.append('search', filters.search)
    const query = params.toString()
    const url = query ? `${API_ENDPOINTS.COUPON.LIST}?${query}` : API_ENDPOINTS.COUPON.LIST
    const response = await apiService.get(url)
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.GET(id))
    return response.data
  },

  create: async (data: Record<string, unknown>) => {
    const response = await apiService.post(API_ENDPOINTS.COUPON.CREATE, data)
    return response.data
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const response = await apiService.put(API_ENDPOINTS.COUPON.UPDATE(id), data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await apiService.delete(API_ENDPOINTS.COUPON.DELETE(id))
    return response.data
  },

  getTypes: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.TYPES)
    return response.data
  },

  checkDependency: async (id: string) => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.CHECK_DEPENDENCY(id))
    return response.data
  },

  // Dropdown data for condition builder (create)
  getCategories: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.CATEGORIES)
    return response.data
  },
  getMetalTypes: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.METAL_TYPES)
    return response.data
  },
  getMetalColors: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.METAL_COLORS)
    return response.data
  },
  getMetalPurities: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.METAL_PURITIES)
    return response.data
  },
  getDiamondClarityColors: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.DIAMOND_CLARITY_COLORS)
    return response.data
  },
  getGemstoneColors: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.GEMSTONE_COLORS)
    return response.data
  },
  getTags: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.TAGS)
    return response.data
  },

  // Customer dropdown data (for customer targeting)
  getCustomers: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.CUSTOMERS)
    return response.data
  },

  // Dropdown data for condition builder (edit)
  getCategoriesForEdit: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.CATEGORIES_EDIT)
    return response.data
  },
  getMetalTypesForEdit: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.METAL_TYPES_EDIT)
    return response.data
  },
  getMetalColorsForEdit: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.METAL_COLORS_EDIT)
    return response.data
  },
  getMetalPuritiesForEdit: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.METAL_PURITIES_EDIT)
    return response.data
  },
  getDiamondClarityColorsForEdit: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.DIAMOND_CLARITY_COLORS_EDIT)
    return response.data
  },
  getGemstoneColorsForEdit: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.GEMSTONE_COLORS_EDIT)
    return response.data
  },
  getTagsForEdit: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.TAGS_EDIT)
    return response.data
  },
  getCustomersForEdit: async () => {
    const response = await apiService.get(API_ENDPOINTS.COUPON.CUSTOMERS_EDIT)
    return response.data
  },
}

export default couponService
