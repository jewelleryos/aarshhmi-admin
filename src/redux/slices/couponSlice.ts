import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import couponService from '../services/couponService'
import type { CouponListItem } from '@/components/coupons/types'

interface CouponState {
  items: CouponListItem[]
  isLoading: boolean
  error: string | null
}

const initialState: CouponState = {
  items: [],
  isLoading: false,
  error: null,
}

export const fetchCoupons = createAsyncThunk(
  'coupon/fetchAll',
  async (filters: { type?: string; is_active?: string; search?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await couponService.list(filters)
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupons')
    }
  }
)

export const createCoupon = createAsyncThunk(
  'coupon/create',
  async (data: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await couponService.create(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create coupon')
    }
  }
)

export const updateCoupon = createAsyncThunk(
  'coupon/update',
  async ({ id, data }: { id: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const response = await couponService.update(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update coupon')
    }
  }
)

export const deleteCoupon = createAsyncThunk(
  'coupon/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await couponService.delete(id)
      return { id, ...response }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete coupon')
    }
  }
)

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.items = action.payload
        state.isLoading = false
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.error = action.payload as string
        state.isLoading = false
      })

    // Delete
    builder
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload.id)
      })
  },
})

export const { clearError } = couponSlice.actions
export default couponSlice.reducer
