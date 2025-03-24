// Customer related types
export interface CustomerEntry {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  vin: string;
  licensePlate: string;
  make: string;
  model: string;
  trim: string;
  engine: string;
  transmission: string;
  fuelType: string;
  vehicles: Vehicle[];
}

export interface Vehicle {
  _id?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: number;
  engine: string;
  transmission: 'automatic' | 'manual' | 'cvt';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  turbocharged: boolean;
  isAWD: boolean;
  is4x4: boolean;
  status: 'active' | 'inactive' | 'in-service';
  notes?: string;
}

export interface CustomerInfo extends Omit<CustomerEntry, 'vehicles'> {
  workphoneNumber?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  notes?: string;
  preferredContact?: string;
  vehicles: Vehicle[];
} 