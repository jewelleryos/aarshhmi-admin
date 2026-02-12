import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import makingChargeService, {
  MakingCharge,
  CreateMakingChargeData,
  UpdateMakingChargeData,
} from '@/redux/services/makingChargeService'

// Making Charge state interface
interface MakingChargeState {
  items: MakingCharge[]
  selectedItem: MakingCharge | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: MakingChargeState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all making charges
export const fetchMakingCharges = createAsyncThunk(
  'makingCharge/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await makingChargeService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch making charges'
      )
    }
  }
)

// Create making charge
export const createMakingCharge = createAsyncThunk(
  'makingCharge/create',
  async (data: CreateMakingChargeData, { rejectWithValue }) => {
    try {
      const response = await makingChargeService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create making charge'
      )
    }
  }
)

// Update making charge
export const updateMakingCharge = createAsyncThunk(
  'makingCharge/update',
  async ({ id, data }: { id: string; data: UpdateMakingChargeData }, { rejectWithValue }) => {
    try {
      const response = await makingChargeService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update making charge'
      )
    }
  }
)

// Create the making charge slice
const makingChargeSlice = createSlice({
  name: 'makingCharge',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<MakingCharge | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch making charges cases
      .addCase(fetchMakingCharges.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMakingCharges.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchMakingCharges.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch making charges'
      })
      // Create making charge cases
      .addCase(createMakingCharge.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createMakingCharge.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createMakingCharge.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create making charge'
      })
      // Update making charge cases
      .addCase(updateMakingCharge.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateMakingCharge.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateMakingCharge.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update making charge'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = makingChargeSlice.actions

// Export reducer
export default makingChargeSlice.reducer
