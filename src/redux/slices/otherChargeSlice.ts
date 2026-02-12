import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import otherChargeService, {
  OtherCharge,
  CreateOtherChargeData,
  UpdateOtherChargeData,
} from '@/redux/services/otherChargeService'

// Other Charge state interface
interface OtherChargeState {
  items: OtherCharge[]
  selectedItem: OtherCharge | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: OtherChargeState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all other charges
export const fetchOtherCharges = createAsyncThunk(
  'otherCharge/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await otherChargeService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch other charges'
      )
    }
  }
)

// Create other charge
export const createOtherCharge = createAsyncThunk(
  'otherCharge/create',
  async (data: CreateOtherChargeData, { rejectWithValue }) => {
    try {
      const response = await otherChargeService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create other charge'
      )
    }
  }
)

// Update other charge
export const updateOtherCharge = createAsyncThunk(
  'otherCharge/update',
  async ({ id, data }: { id: string; data: UpdateOtherChargeData }, { rejectWithValue }) => {
    try {
      const response = await otherChargeService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update other charge'
      )
    }
  }
)

// Delete other charge
export const deleteOtherCharge = createAsyncThunk(
  'otherCharge/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await otherChargeService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete other charge'
      )
    }
  }
)

// Create the other charge slice
const otherChargeSlice = createSlice({
  name: 'otherCharge',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<OtherCharge | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch other charges cases
      .addCase(fetchOtherCharges.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOtherCharges.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchOtherCharges.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch other charges'
      })
      // Create other charge cases
      .addCase(createOtherCharge.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createOtherCharge.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createOtherCharge.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create other charge'
      })
      // Update other charge cases
      .addCase(updateOtherCharge.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateOtherCharge.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateOtherCharge.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update other charge'
      })
      // Delete other charge cases
      .addCase(deleteOtherCharge.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteOtherCharge.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.error = null
      })
      .addCase(deleteOtherCharge.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to delete other charge'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = otherChargeSlice.actions

// Export reducer
export default otherChargeSlice.reducer
