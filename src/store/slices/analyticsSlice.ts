import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Analytics } from '@/types'

interface AnalyticsState {
  data: Analytics | null
  loading: boolean
  error: string | null
}

const initialState: AnalyticsState = {
  data: null,
  loading: false,
  error: null,
}

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setAnalytics: (state, action: PayloadAction<Analytics>) => {
      state.data = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
    clearAnalytics: (state) => {
      state.data = null
      state.error = null
    },
  },
})

export const { setAnalytics, setLoading, setError, clearAnalytics } = analyticsSlice.actions
export default analyticsSlice.reducer 