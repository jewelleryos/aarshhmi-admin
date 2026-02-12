import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService, { User, LoginCredentials } from '@/redux/services/authService'

// Auth state interface
interface AuthState {
  user: User | null
  permissions: number[]
  isLoading: boolean
  isInitialized: boolean
  isAuthenticated: boolean
  error: string | null
}

// Initial state
const initialState: AuthState = {
  user: null,
  permissions: [],
  isLoading: false,
  isInitialized: false,
  isAuthenticated: false,
  error: null,
}

// Login async thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return {
        user: response.data.user,
        permissions: response.data.permissions,
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed. Please try again.'
      )
    }
  }
)

// Fetch current user async thunk (replaces initializeAuth)
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.me()
      return {
        user: response.data.user,
        permissions: response.data.permissions,
      }
    } catch (error: any) {
      // 401 means not authenticated - this is expected, not an error
      return rejectWithValue(null)
    }
  }
)

// Logout async thunk
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return null
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Logout failed'
      )
    }
  }
)

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Reset auth state (for manual logout without API call)
    resetAuth: (state) => {
      state.user = null
      state.permissions = []
      state.isAuthenticated = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.permissions = action.payload.permissions
        state.isAuthenticated = true
        state.isInitialized = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.permissions = []
        state.isAuthenticated = false
        state.error = (action.payload as string) || 'Login failed'
      })
      // Fetch current user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.permissions = action.payload.permissions
        state.isAuthenticated = true
        state.isInitialized = true
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.permissions = []
        state.isAuthenticated = false
        state.isInitialized = true
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.permissions = []
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        // Still clear user data even if logout API fails
        state.user = null
        state.permissions = []
        state.isAuthenticated = false
        state.error = (action.payload as string) || 'Logout failed'
      })
  },
})

// Export actions
export const { clearError, resetAuth } = authSlice.actions

// Export reducer
export default authSlice.reducer
