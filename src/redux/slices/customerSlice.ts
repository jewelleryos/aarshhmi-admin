import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import customerService from '../services/customerService'
import type { CustomerListItem } from '../services/customerService'

interface CustomerState {
  items: CustomerListItem[]
  isLoading: boolean
  error: string | null
}

const initialState: CustomerState = {
  items: [],
  isLoading: false,
  error: null,
}

export const fetchCustomers = createAsyncThunk(
  'customer/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers')
    }
  }
)

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.items = action.payload
        state.isLoading = false
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.error = action.payload as string
        state.isLoading = false
      })
  },
})

export const { clearError } = customerSlice.actions
export default customerSlice.reducer
