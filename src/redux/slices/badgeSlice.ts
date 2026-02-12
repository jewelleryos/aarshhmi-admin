import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import badgeService, {
  Badge,
  CreateBadgeData,
  UpdateBadgeData,
} from '@/redux/services/badgeService'

// Badge state interface
interface BadgeState {
  items: Badge[]
  selectedItem: Badge | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: BadgeState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all badges
export const fetchBadges = createAsyncThunk(
  'badge/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await badgeService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch badges'
      )
    }
  }
)

// Create badge
export const createBadge = createAsyncThunk(
  'badge/create',
  async (data: CreateBadgeData, { rejectWithValue }) => {
    try {
      const response = await badgeService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create badge'
      )
    }
  }
)

// Update badge
export const updateBadge = createAsyncThunk(
  'badge/update',
  async ({ id, data }: { id: string; data: UpdateBadgeData }, { rejectWithValue }) => {
    try {
      const response = await badgeService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update badge'
      )
    }
  }
)

// Create the badge slice
const badgeSlice = createSlice({
  name: 'badge',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<Badge | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch badges cases
      .addCase(fetchBadges.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBadges.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchBadges.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch badges'
      })
      // Create badge cases
      .addCase(createBadge.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBadge.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createBadge.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create badge'
      })
      // Update badge cases
      .addCase(updateBadge.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateBadge.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateBadge.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update badge'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = badgeSlice.actions

// Export reducer
export default badgeSlice.reducer
