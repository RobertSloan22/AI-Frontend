export type SessionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED";

export interface ToolParameterProperty {
  type: string;
  description?: string;
  enum?: string[];
  pattern?: string;
  properties?: Record<string, ToolParameterProperty>;
  required?: string[];
  additionalProperties?: boolean;
  items?: ToolParameterProperty;
}

export interface ToolParameters {
  type: string;
  properties: Record<string, ToolParameterProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface Tool {
  type: "function";
  name: string;
  description: string;
  parameters: ToolParameters;
}

export interface AgentConfig {
  name: string;
  publicDescription: string; // gives context to agent transfer tool
  instructions: string;
  tools: Tool[];
  toolLogic?: Record<
    string,
    (args: any, transcriptLogsFiltered: TranscriptItem[]) => Promise<any> | any
  >;
  downstreamAgents?: AgentConfig[] | { name: string; publicDescription: string }[];
}

export type AllAgentConfigsType = Record<string, AgentConfig[]>;

export interface TranscriptItem {
  itemId: string;
  type: "MESSAGE" | "BREADCRUMB";
  role?: "user" | "assistant";
  title?: string;
  data?: Record<string, any>;
  expanded: boolean;
  timestamp: string;
  createdAtMs: number;
  status: "IN_PROGRESS" | "DONE";
  isHidden: boolean;
}

export interface Log {
  id: number;
  timestamp: string;
  direction: string;
  eventName: string;
  data: any;
  expanded: boolean;
  type: string;
}

export interface ServerEventContent {
  type?: string;
  transcript?: string | null;
  text?: string;
}

export interface ServerEventItem {
  id?: string;
  object?: string;
  type?: string;
  status?: string;
  name?: string;
  arguments?: string;
  role?: "user" | "assistant";
  content?: ServerEventContent[];
}

export interface ServerEventOutput {
  type?: string;
  name?: string;
  arguments?: any;
  call_id?: string;
}

export interface ServerEvent {
  type: string;
  event_id?: string;
  item_id?: string;
  transcript?: string;
  delta?: string;
  session?: {
    id?: string;
  };
  item?: ServerEventItem;
  response?: {
    output?: ServerEventOutput[];
    status_details?: {
      error?: any;
    };
  };
}

export interface LoggedEvent {
  id: number;
  direction: "client" | "server";
  expanded: boolean;
  timestamp: string;
  eventName: string;
  eventData: Record<string, any>; // can have arbitrary objects logged
}

// Add this interface with your other interfaces
interface CustomerEntry {
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

// Add this helper function near the top of the file, after the interfaces
const formatCustomerResponse = (data: any) => {
  try {
    // If it's an array of customers
    if (Array.isArray(data)) {
      return data.map(customer => ({
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email || '',
        phoneNumber: customer.phoneNumber || '',
        workphoneNumber: customer.workphoneNumber,
        address: customer.address || '',
        city: customer.city || '',
        zipCode: customer.zipCode || '',
        notes: customer.notes || '',
        preferredContact: customer.preferredContact || 'email',
        vehicles: customer.vehicles?.map((vehicle: any) => ({
          id: vehicle._id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          trim: vehicle.trim,
          vin: vehicle.vin,
          licensePlate: vehicle.licensePlate,
          color: vehicle.color,
          mileage: vehicle.mileage,
          engine: vehicle.engine,
          transmission: vehicle.transmission,
          fuelType: vehicle.fuelType,
          turbocharged: vehicle.turbocharged,
          isAWD: vehicle.isAWD,
          is4x4: vehicle.is4x4,
          status: vehicle.status,
          notes: vehicle.notes
        })) || []
      }));
    }
    
    // If it's a single customer object
    return {
      id: data._id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || '',
      phoneNumber: data.phoneNumber || '',
      workphoneNumber: data.workphoneNumber,
      address: data.address || '',
      city: data.city || '',
      zipCode: data.zipCode || '',
      notes: data.notes || '',
      preferredContact: data.preferredContact || 'email',
      vehicles: data.vehicles?.map((vehicle: any) => ({
        id: vehicle._id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim,
        vin: vehicle.vin,
        licensePlate: vehicle.licensePlate,
        color: vehicle.color,
        mileage: vehicle.mileage,
        engine: vehicle.engine,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        turbocharged: vehicle.turbocharged,
        isAWD: vehicle.isAWD,
        is4x4: vehicle.is4x4,
        status: vehicle.status,
        notes: vehicle.notes
      })) || []
    };
  } catch (error) {
    console.error('Error formatting customer response:', error);
    throw new Error('Failed to format customer data');
  }
};

interface CustomerCreateParams {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  notes?: string;
  vin?: string;
  licensePlate?: string;
  make?: string;
  model?: string;
  trim?: string;
  engine?: string;
  transmission?: string;
  fuelType?: string;
}

// Add this interface near your other interfaces
interface ImageSearchResult {
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  source: string;
  link: string;
}

// First, add or update these interfaces
interface ItemType {
  id: string;
  type: string;
  role: 'user' | 'assistant' | 'system';
  status:  'pending' | 'completed' | 'error' | 'in_progress';  // Added status field
  metadata?: Record<string, any>;
  formatted: {
    text?: string;
    transcript?: string;
    tool?: any;
    audio?: any;
    file?: any;
  };
}

// Update the initial state with proper type checking
const defaultItem: ItemType = {
  id: '',
  type: 'text',
  role: 'user',
  status: 'pending',
  metadata: {},
  formatted: {
    text: '',
    transcript: '',
    tool: null,
    audio: null,
    file: null
  }
};

// Add proper type definitions
interface MemoryKV {
  customerData?: {
    id: string;
    firstName: string;
    lastName: string;
    vehicleVin: string;
    vehicleMake: string;
    email: string;
    phoneNumber: string;
    workphoneNumber?: string;
    address: string;
    city: string;
    zipCode: string;
    notes: string;
    preferredContact: string;
    vehicles: Vehicle[];
  };
  vehicleData?: Vehicle;
  customerFullName?: string;
  customerContact?: string;
  [key: string]: any;
}

interface CustomerDataToolArgs {
  action: 'search' | 'details' | 'vehicles' | 'history';
  params: {
    searchTerm?: string;
    customerId?: string;
    vehicles?: Vehicle[];
  };
}

interface Vehicle {
  _id?: string;  // Optional since it's auto-generated by MongoDB
  year: number;  // Changed from string to number to match backend
  make: string;
  model: string;
  trim?: string;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: number;
  engine: string;
  transmission: 'automatic' | 'manual' | 'cvt';  // Added enum values
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';  // Added enum values
  turbocharged: boolean;
  isAWD: boolean;
  is4x4: boolean;
  status: 'active' | 'inactive' | 'in-service';  // Added enum values
  notes?: string;
}
interface VehicleData {
  _id?: string;  // Optional since it's auto-generated by MongoDB
  year: number;  // Changed from string to number to match backend
  make: string;
  model: string;
  trim?: string;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: number;
  engine: string;
  transmission: 'automatic' | 'manual' | 'cvt';  // Added enum values
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';  // Added enum values
  turbocharged: boolean;
  isAWD: boolean;
  is4x4: boolean;
  status: 'active' | 'inactive' | 'in-service';  // Added enum values
  notes?: string;
}

interface CustomerInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  workphoneNumber?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  notes?: string;
  preferredContact?: string;
  vehicles: Vehicle[];
}
