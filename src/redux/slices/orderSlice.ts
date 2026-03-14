import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import orderService from '../services/orderService'
import type { OrderListItem } from '../services/orderService'

interface OrderState {
  items: OrderListItem[]
  isLoading: boolean
  error: string | null
}

const initialState: OrderState = {
  items: [],
  isLoading: false,
  error: null,
}

export const fetchOrders = createAsyncThunk(
  'order/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.list()
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.items = action.payload
        state.isLoading = false
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.error = action.payload as string
        state.isLoading = false
      })
  },
})

export const { clearError } = orderSlice.actions
export default orderSlice.reducer
