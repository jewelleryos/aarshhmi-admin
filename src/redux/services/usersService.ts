import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// User interface - matches backend response
export interface UserData {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  is_active: boolean
  permissions: number[]
  last_login_at: string | null
  created_at: string
  updated_at: string
}

// List users response
interface UsersListResponse {
  success: boolean
  message: string
  data: {
    users: UserData[]
    total: number
  }
}

// Create user request
export interface CreateUserRequest {
  email: string
  first_name: string
  last_name: string
  phone?: string
  password: string
  permissions: number[]
}

// Update user request
export interface UpdateUserRequest {
  first_name: string
  last_name: string
  phone?: string | null
  permissions: number[]
}

// Single user response
interface UserResponse {
  success: boolean
  message: string
  data: UserData
}

// Delete user response
interface DeleteUserResponse {
  success: boolean
  message: string
}

// Users service with API calls
const usersService = {
  // Get all users
  getList: async (): Promise<UsersListResponse> => {
    const response = await apiService.get(API_ENDPOINTS.USERS.LIST)
    return response.data
  },

  // Create user
  create: async (data: CreateUserRequest): Promise<UserResponse> => {
    const response = await apiService.post(API_ENDPOINTS.USERS.CREATE, data)
    return response.data
  },

  // Update user
  update: async (id: string, data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await apiService.put(API_ENDPOINTS.USERS.UPDATE(id), data)
    return response.data
  },

  // Delete user
  delete: async (id: string): Promise<DeleteUserResponse> => {
    const response = await apiService.delete(API_ENDPOINTS.USERS.DELETE(id))
    return response.data
  },
}

export default usersService

// Export types
export type { UsersListResponse }
