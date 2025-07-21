export interface User {
  id: string
  email: string
  name: string
  subscription: 'free' | 'premium'
  createdAt: string
}

export interface Vehicle {
  id: string
  userId: string
  name: string
  make: string
  model: string
  year: number
  vin?: string
  mileage: number
  color: string
  image?: string
  description?: string
  totalSpent: number
  createdAt: string
  updatedAt: string
}

export interface Part {
  id: string
  vehicleId: string
  name: string
  category: PartCategory
  brand?: string
  partNumber?: string
  cost: number
  installationCost?: number
  totalCost: number
  mileage: number
  date: string
  description?: string
  images: string[]
  links: string[]
  warranty?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type PartCategory = 
  | 'engine'
  | 'exhaust'
  | 'suspension'
  | 'wheels'
  | 'tires'
  | 'brakes'
  | 'interior'
  | 'exterior'
  | 'electronics'
  | 'audio'
  | 'performance'
  | 'maintenance'
  | 'other'

export interface PartCategoryInfo {
  value: PartCategory
  label: string
  icon: string
  color: string
}

export interface Analytics {
  totalSpent: number
  totalParts: number
  averagePartCost: number
  spendingByCategory: Record<PartCategory, number>
  spendingByMonth: Array<{
    month: string
    amount: number
  }>
  partsByCategory: Record<PartCategory, number>
}

export interface Subscription {
  plan: 'free' | 'premium'
  status: 'active' | 'cancelled' | 'expired'
  currentPeriodEnd?: string
  maxVehicles: number
  features: string[]
} 