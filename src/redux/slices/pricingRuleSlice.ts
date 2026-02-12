import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import pricingRuleService, {
  PricingRule,
  CreatePricingRuleData,
  UpdatePricingRuleData,
} from '@/redux/services/pricingRuleService'

// Pricing Rule state interface
interface PricingRuleState {
  items: PricingRule[]
  selectedItem: PricingRule | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: PricingRuleState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all pricing rules
export const fetchPricingRules = createAsyncThunk(
  'pricingRule/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pricingRuleService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch pricing rules'
      )
    }
  }
)

// Fetch single pricing rule
export const fetchPricingRuleById = createAsyncThunk(
  'pricingRule/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await pricingRuleService.getById(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch pricing rule'
      )
    }
  }
)

// Create pricing rule
export const createPricingRule = createAsyncThunk(
  'pricingRule/create',
  async (data: CreatePricingRuleData, { rejectWithValue }) => {
    try {
      const response = await pricingRuleService.create(data)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create pricing rule'
      )
    }
  }
)

// Update pricing rule
export const updatePricingRule = createAsyncThunk(
  'pricingRule/update',
  async ({ id, data }: { id: string; data: UpdatePricingRuleData }, { rejectWithValue }) => {
    try {
      const response = await pricingRuleService.update(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update pricing rule'
      )
    }
  }
)

// Delete pricing rule
export const deletePricingRule = createAsyncThunk(
  'pricingRule/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await pricingRuleService.delete(id)
      return { id, message: response.message }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete pricing rule'
      )
    }
  }
)

// Create the pricing rule slice
const pricingRuleSlice = createSlice({
  name: 'pricingRule',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<PricingRule | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pricing rules cases
      .addCase(fetchPricingRules.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPricingRules.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchPricingRules.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch pricing rules'
      })
      // Fetch single pricing rule cases
      .addCase(fetchPricingRuleById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPricingRuleById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedItem = action.payload
        state.error = null
      })
      .addCase(fetchPricingRuleById.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch pricing rule'
      })
      // Create pricing rule cases
      .addCase(createPricingRule.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPricingRule.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(createPricingRule.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create pricing rule'
      })
      // Update pricing rule cases
      .addCase(updatePricingRule.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePricingRule.fulfilled, (state) => {
        state.isLoading = false
        state.selectedItem = null
        state.error = null
      })
      .addCase(updatePricingRule.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update pricing rule'
      })
      // Delete pricing rule cases
      .addCase(deletePricingRule.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePricingRule.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter((item) => item.id !== action.payload.id)
        state.error = null
      })
      .addCase(deletePricingRule.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to delete pricing rule'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = pricingRuleSlice.actions

// Export reducer
export default pricingRuleSlice.reducer
