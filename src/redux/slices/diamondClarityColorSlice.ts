import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import diamondClarityColorService, {
  DiamondClarityColor,
  CreateDiamondClarityColorData,
  UpdateDiamondClarityColorData,
} from '@/redux/services/diamondClarityColorService'

// Diamond Clarity/Color state interface
interface DiamondClarityColorState {
  items: DiamondClarityColor[]
  selectedItem: DiamondClarityColor | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: DiamondClarityColorState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all diamond clarity/colors
export const fetchDiamondClarityColors = createAsyncThunk(
  'diamondClarityColor/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await diamondClarityColorService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch diamond clarity/colors'
      )
    }
  }
)

// Create diamond clarity/color
export const createDiamondClarityColor = createAsyncThunk(
  'diamondClarityColor/create',
  async (data: CreateDiamondClarityColorData, { rejectWithValue }) => {
    try {
      const response = await diamondClarityColorService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create diamond clarity/color'
      )
    }
  }
)

// Update diamond clarity/color
export const updateDiamondClarityColor = createAsyncThunk(
  'diamondClarityColor/update',
  async ({ id, data }: { id: string; data: UpdateDiamondClarityColorData }, { rejectWithValue }) => {
    try {
      const response = await diamondClarityColorService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update diamond clarity/color'
      )
    }
  }
)

// Create the diamond clarity/color slice
const diamondClarityColorSlice = createSlice({
  name: 'diamondClarityColor',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<DiamondClarityColor | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch diamond clarity/colors cases
      .addCase(fetchDiamondClarityColors.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDiamondClarityColors.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchDiamondClarityColors.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch diamond clarity/colors'
      })
      // Create diamond clarity/color cases
      .addCase(createDiamondClarityColor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createDiamondClarityColor.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createDiamondClarityColor.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create diamond clarity/color'
      })
      // Update diamond clarity/color cases
      .addCase(updateDiamondClarityColor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateDiamondClarityColor.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateDiamondClarityColor.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update diamond clarity/color'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = diamondClarityColorSlice.actions

// Export reducer
export default diamondClarityColorSlice.reducer
