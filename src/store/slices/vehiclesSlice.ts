import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Vehicle } from '@/types'

interface VehiclesState {
  vehicles: Vehicle[]
  currentVehicle: Vehicle | null
  loading: boolean
  error: string | null
}

const initialState: VehiclesState = {
  vehicles: [],
  currentVehicle: null,
  loading: false,
  error: null,
}

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setVehicles: (state, action: PayloadAction<Vehicle[]>) => {
      state.vehicles = action.payload
    },
    addVehicle: (state, action: PayloadAction<Vehicle>) => {
      state.vehicles.push(action.payload)
    },
    updateVehicle: (state, action: PayloadAction<Vehicle>) => {
      const index = state.vehicles.findIndex(v => v.id === action.payload.id)
      if (index !== -1) {
        state.vehicles[index] = action.payload
      }
      if (state.currentVehicle?.id === action.payload.id) {
        state.currentVehicle = action.payload
      }
    },
    deleteVehicle: (state, action: PayloadAction<string>) => {
      state.vehicles = state.vehicles.filter(v => v.id !== action.payload)
      if (state.currentVehicle?.id === action.payload) {
        state.currentVehicle = null
      }
    },
    setCurrentVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.currentVehicle = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
  },
})

export const { 
  setVehicles, 
  addVehicle, 
  updateVehicle, 
  deleteVehicle, 
  setCurrentVehicle,
  setLoading, 
  setError 
} = vehiclesSlice.actions

export default vehiclesSlice.reducer 