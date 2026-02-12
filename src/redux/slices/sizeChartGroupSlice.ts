import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import sizeChartGroupService, {
  SizeChartGroup,
  CreateSizeChartGroupData,
  UpdateSizeChartGroupData,
} from '@/redux/services/sizeChartGroupService'

// Size Chart Group state interface
interface SizeChartGroupState {
  items: SizeChartGroup[]
  selectedItem: SizeChartGroup | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: SizeChartGroupState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all size chart groups
export const fetchSizeChartGroups = createAsyncThunk(
  'sizeChartGroup/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sizeChartGroupService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch size chart groups'
      )
    }
  }
)

// Create size chart group
export const createSizeChartGroup = createAsyncThunk(
  'sizeChartGroup/create',
  async (data: CreateSizeChartGroupData, { rejectWithValue }) => {
    try {
      const response = await sizeChartGroupService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create size chart group'
      )
    }
  }
)

// Update size chart group
export const updateSizeChartGroup = createAsyncThunk(
  'sizeChartGroup/update',
  async ({ id, data }: { id: string; data: UpdateSizeChartGroupData }, { rejectWithValue }) => {
    try {
      const response = await sizeChartGroupService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update size chart group'
      )
    }
  }
)

// Create the size chart group slice
const sizeChartGroupSlice = createSlice({
  name: 'sizeChartGroup',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<SizeChartGroup | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch size chart groups cases
      .addCase(fetchSizeChartGroups.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSizeChartGroups.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchSizeChartGroups.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch size chart groups'
      })
      // Create size chart group cases
      .addCase(createSizeChartGroup.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createSizeChartGroup.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createSizeChartGroup.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create size chart group'
      })
      // Update size chart group cases
      .addCase(updateSizeChartGroup.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateSizeChartGroup.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateSizeChartGroup.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update size chart group'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = sizeChartGroupSlice.actions

// Export reducer
export default sizeChartGroupSlice.reducer
