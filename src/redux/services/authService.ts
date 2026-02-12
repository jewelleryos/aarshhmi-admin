import apiService from '@/configs/axios'
import API_ENDPOINTS from '@/redux/api/endpoints'

// Login credentials interface
interface LoginCredentials {
  email: string
  password: string
}

// User interface - matches backend response
interface User {
  id: string
  email: string
  first_name: string
  last_name: string
}

// Login response interface - token is NOT in response (only in HTTP-only cookie)
interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: User
    permissions: number[]
  }
}

// Me response interface
interface MeResponse {
  success: boolean
  message: string
  data: {
    user: User
    permissions: number[]
  }
}

// Logout response interface
interface LogoutResponse {
  success: boolean
  message: string
  data: null
}

// Forgot password response interface
interface ForgotPasswordResponse {
  success: boolean
  message: string
  data: null
}

// Validate reset token response interface
interface ValidateResetTokenResponse {
  success: boolean
  message: string
  data: {
    valid: boolean
  }
}

// Reset password response interface
interface ResetPasswordResponse {
  success: boolean
  message: string
  data: null
}

// Auth service with API calls
const authService = {
  // Login API call
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    return response.data
  },

  // Get current user
  me: async (): Promise<MeResponse> => {
    const response = await apiService.get(API_ENDPOINTS.AUTH.ME)
    return response.data
  },

  // Logout
  logout: async (): Promise<LogoutResponse> => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.LOGOUT)
    return response.data
  },

  // Forgot Password
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
    return response.data
  },

  // Validate Reset Token
  validateResetToken: async (token: string): Promise<ValidateResetTokenResponse> => {
    const response = await apiService.get(
      `${API_ENDPOINTS.AUTH.VALIDATE_RESET_TOKEN}?token=${token}`
    )
    return response.data
  },

  // Reset Password
  resetPassword: async (token: string, password: string): Promise<ResetPasswordResponse> => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      password,
    })
    return response.data
  },
}

export default authService

// Export types
export type {
  User,
  LoginCredentials,
  LoginResponse,
  MeResponse,
  LogoutResponse,
  ForgotPasswordResponse,
  ValidateResetTokenResponse,
  ResetPasswordResponse,
}
