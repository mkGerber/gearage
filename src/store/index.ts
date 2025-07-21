import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import vehiclesReducer from './slices/vehiclesSlice'
import partsReducer from './slices/partsSlice'
import analyticsReducer from './slices/analyticsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehiclesReducer,
    parts: partsReducer,
    analytics: analyticsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 