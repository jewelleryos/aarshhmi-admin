import { createSlice } from '@reduxjs/toolkit'

// App state interface
interface AppState {
  isInitializing: boolean
  isAppReady: boolean
}

// Initial state
const initialState: AppState = {
  isInitializing: true,
  isAppReady: false,
}

// Create the app slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setInitializing: (state, action) => {
      state.isInitializing = action.payload
    },
    setAppReady: (state) => {
      state.isInitializing = false
      state.isAppReady = true
    },
  },
})

// Export actions
export const { setInitializing, setAppReady } = appSlice.actions

// Export reducer
export default appSlice.reducer
