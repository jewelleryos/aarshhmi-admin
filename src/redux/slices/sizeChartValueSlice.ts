import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import sizeChartValueService, {
  SizeChartValue,
  SizeChartGroupDropdownItem,
  CreateSizeChartValueData,
  UpdateSizeChartValueData,
} from '@/redux/services/sizeChartValueService'

// Size Chart Value state interface
interface SizeChartValueState {
  items: SizeChartValue[]
  selectedItem: SizeChartValue | null
  groupsDropdown: SizeChartGroupDropdownItem[]
  groupFilter: string | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: SizeChartValueState = {
  items: [],
  selectedItem: null,
  groupsDropdown: [],
  groupFilter: null,
  isLoading: false,
  error: null,
}

// Fetch all size chart values
export const fetchSizeChartValues = createAsyncThunk(
  'sizeChartValue/fetchAll',
  async (groupId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await sizeChartValueService.list(groupId)
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch size chart values'
      )
    }
  }
)

// Fetch groups dropdown
export const fetchSizeChartGroupsDropdown = createAsyncThunk(
  'sizeChartValue/fetchGroupsDropdown',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sizeChartValueService.getGroupsDropdown()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch size chart groups'
      )
    }
  }
)

// Create size chart value
export const createSizeChartValue = createAsyncThunk(
  'sizeChartValue/create',
  async (data: CreateSizeChartValueData, { rejectWithValue }) => {
    try {
      const response = await sizeChartValueService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create size chart value'
      )
    }
  }
)

// Update size chart value
export const updateSizeChartValue = createAsyncThunk(
  'sizeChartValue/update',
  async ({ id, data }: { id: string; data: UpdateSizeChartValueData }, { rejectWithValue }) => {
    try {
      const response = await sizeChartValueService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update size chart value'
      )
    }
  }
)

// Make size chart value default
export const makeDefaultSizeChartValue = createAsyncThunk(
  'sizeChartValue/makeDefault',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await sizeChartValueService.makeDefault(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to set default size chart value'
      )
    }
  }
)

// Delete size chart value
export const deleteSizeChartValue = createAsyncThunk(
  'sizeChartValue/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await sizeChartValueService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete size chart value'
      )
    }
  }
)

// Create the size chart value slice
const sizeChartValueSlice = createSlice({
  name: 'sizeChartValue',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<SizeChartValue | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
    // Set group filter
    setGroupFilter: (state, action: PayloadAction<string | null>) => {
      state.groupFilter = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch size chart values cases
      .addCase(fetchSizeChartValues.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSizeChartValues.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchSizeChartValues.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch size chart values'
      })
      // Fetch groups dropdown cases
      .addCase(fetchSizeChartGroupsDropdown.fulfilled, (state, action) => {
        state.groupsDropdown = action.payload
      })
      // Create size chart value cases
      .addCase(createSizeChartValue.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createSizeChartValue.fulfilled, (state, action) => {
        state.isLoading = false
        // Add new item with group name from dropdown
        const groupInfo = state.groupsDropdown.find(
          (g) => g.id === action.payload.size_chart_group_id
        )
        const newItem = {
          ...action.payload,
          size_chart_group_name: groupInfo?.name || '',
        }
        state.items.unshift(newItem)
        state.error = null
      })
      .addCase(createSizeChartValue.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create size chart value'
      })
      // Update size chart value cases
      .addCase(updateSizeChartValue.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateSizeChartValue.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          // Preserve group name
          const existingGroupName = state.items[index].size_chart_group_name
          state.items[index] = {
            ...action.payload,
            size_chart_group_name: existingGroupName,
          }
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateSizeChartValue.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update size chart value'
      })
      // Make default cases
      .addCase(makeDefaultSizeChartValue.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(makeDefaultSizeChartValue.fulfilled, (state, action) => {
        state.isLoading = false
        // Update items: unset previous default in same group, set new default
        const newDefaultGroupId = action.payload.size_chart_group_id
        state.items = state.items.map((item) => {
          if (item.size_chart_group_id === newDefaultGroupId) {
            if (item.id === action.payload.id) {
              return { ...item, is_default: true }
            }
            return { ...item, is_default: false }
          }
          return item
        })
        state.error = null
      })
      .addCase(makeDefaultSizeChartValue.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to set default size chart value'
      })
      // Delete size chart value cases
      .addCase(deleteSizeChartValue.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteSizeChartValue.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.error = null
      })
      .addCase(deleteSizeChartValue.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to delete size chart value'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem, setGroupFilter } =
  sizeChartValueSlice.actions

// Export reducer
export default sizeChartValueSlice.reducer
