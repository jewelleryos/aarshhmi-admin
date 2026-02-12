import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import tagGroupService, {
  TagGroup,
  CreateTagGroupData,
  UpdateTagGroupData,
  UpdateTagGroupSeoData,
} from '@/redux/services/tagGroupService'

// Tag Group state interface
interface TagGroupState {
  items: TagGroup[]
  selectedItem: TagGroup | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: TagGroupState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
}

// Fetch all tag groups
export const fetchTagGroups = createAsyncThunk(
  'tagGroup/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tagGroupService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch tag groups'
      )
    }
  }
)

// Create tag group
export const createTagGroup = createAsyncThunk(
  'tagGroup/create',
  async (data: CreateTagGroupData, { rejectWithValue }) => {
    try {
      const response = await tagGroupService.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create tag group'
      )
    }
  }
)

// Update tag group
export const updateTagGroup = createAsyncThunk(
  'tagGroup/update',
  async ({ id, data }: { id: string; data: UpdateTagGroupData }, { rejectWithValue }) => {
    try {
      const response = await tagGroupService.update(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update tag group'
      )
    }
  }
)

// Update tag group SEO
export const updateTagGroupSeo = createAsyncThunk(
  'tagGroup/updateSeo',
  async ({ id, data }: { id: string; data: UpdateTagGroupSeoData }, { rejectWithValue }) => {
    try {
      const response = await tagGroupService.updateSeo(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update tag group SEO'
      )
    }
  }
)

// Create the tag group slice
const tagGroupSlice = createSlice({
  name: 'tagGroup',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Set selected item for editing
    setSelectedItem: (state, action: PayloadAction<TagGroup | null>) => {
      state.selectedItem = action.payload
    },
    // Clear selected item
    clearSelectedItem: (state) => {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tag groups cases
      .addCase(fetchTagGroups.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTagGroups.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchTagGroups.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch tag groups'
      })
      // Create tag group cases
      .addCase(createTagGroup.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createTagGroup.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createTagGroup.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to create tag group'
      })
      // Update tag group cases
      .addCase(updateTagGroup.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateTagGroup.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateTagGroup.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update tag group'
      })
      // Update tag group SEO cases
      .addCase(updateTagGroupSeo.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateTagGroupSeo.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.selectedItem = null
        state.error = null
      })
      .addCase(updateTagGroupSeo.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to update tag group SEO'
      })
  },
})

// Export actions
export const { clearError, setSelectedItem, clearSelectedItem } = tagGroupSlice.actions

// Export reducer
export default tagGroupSlice.reducer
