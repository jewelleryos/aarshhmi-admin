import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import mrpMarkupService, {
  MrpMarkup,
  UpdateMrpMarkupData,
} from '@/redux/services/mrpMarkupService'

// MRP Markup state interface
interface MrpMarkupState {
  data: MrpMarkup | null
  isLoading: boolean
  isUpdating: boolean
  error: string | null
}

// Initial state
const initialState: MrpMarkupState = {
  data: null,
  isLoading: false,
  isUpdating: false,
  error: null,
}

// Fetch MRP markup
export const fetchMrpMarkup = createAsyncThunk(
  'mrpMarkup/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mrpMarkupService.get()
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch MRP markup'
      )
    }
  }
)

// Update MRP markup
export const updateMrpMarkup = createAsyncThunk(
  'mrpMarkup/update',
  async (data: UpdateMrpMarkupData, { rejectWithValue }) => {
    try {
      const response = await mrpMarkupService.update(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update MRP markup'
      )
    }
  }
)

// Create the MRP markup slice
const mrpMarkupSlice = createSlice({
  name: 'mrpMarkup',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch MRP markup cases
      .addCase(fetchMrpMarkup.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMrpMarkup.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
        state.error = null
      })
      .addCase(fetchMrpMarkup.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch MRP markup'
      })
      // Update MRP markup cases
      .addCase(updateMrpMarkup.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateMrpMarkup.fulfilled, (state, action) => {
        state.isUpdating = false
        state.data = action.payload
        state.error = null
      })
      .addCase(updateMrpMarkup.rejected, (state, action) => {
        state.isUpdating = false
        state.error = (action.payload as string) || 'Failed to update MRP markup'
      })
  },
})

// Export actions
export const { clearError } = mrpMarkupSlice.actions

// Export reducer
export default mrpMarkupSlice.reducer
