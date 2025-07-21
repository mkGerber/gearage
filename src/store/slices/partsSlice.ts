import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Part } from '@/types'

interface PartsState {
  parts: Part[]
  currentPart: Part | null
  loading: boolean
  error: string | null
}

const initialState: PartsState = {
  parts: [],
  currentPart: null,
  loading: false,
  error: null,
}

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    setParts: (state, action: PayloadAction<Part[]>) => {
      state.parts = action.payload
    },
    addPart: (state, action: PayloadAction<Part>) => {
      state.parts.push(action.payload)
    },
    updatePart: (state, action: PayloadAction<Part>) => {
      const index = state.parts.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.parts[index] = action.payload
      }
      if (state.currentPart?.id === action.payload.id) {
        state.currentPart = action.payload
      }
    },
    deletePart: (state, action: PayloadAction<string>) => {
      state.parts = state.parts.filter(p => p.id !== action.payload)
      if (state.currentPart?.id === action.payload) {
        state.currentPart = null
      }
    },
    setCurrentPart: (state, action: PayloadAction<Part | null>) => {
      state.currentPart = action.payload
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
  setParts, 
  addPart, 
  updatePart, 
  deletePart, 
  setCurrentPart,
  setLoading, 
  setError 
} = partsSlice.actions

export default partsSlice.reducer 