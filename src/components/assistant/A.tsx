import React from 'react';
import { useEffect, useRef, useCallback, useState } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import type { ItemType as RealtimeItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from './lib/wavtools/index.js';
import { instructions } from './utils/conversation_config.js';
import { WavRenderer } from './utils/wav_renderer';
//import { InvoiceList } from '../../pages/invoice/InvoiceList'
import { X, Edit, Zap, ArrowUp, ArrowDown, Search, Save, History as HistoryIcon } from 'lucide-react';
import { Button } from './components/button/Button';
import { Toggle } from './components/toggle/Toggle';
//import { EngineDiagram } from '../components/EngineDiagram/EngineDiagram';
//import { carmdService } from './services/carmd';
import axiosInstance from '../../utils/axiosConfig.js';
import { CustomerDataTool } from './services/CustomerDataTool';
import { Notes } from './components/notes/Notes';
import { ConversationService } from './services/ConversationService';
import Invoice from '../../pages/invoice/invoice';
//import { DiagramViewer } from './components/DiagramViewer';
//import { GoogleSearchService } from './services/CustomGoogleSearch';
import { ImageSearchModal } from './ImageSearchModal';
import InvoiceList from '../../pages/invoice/InvoiceList';
//import InvoiceCreate from '../../components/invoice/InvoiceCreate';
import { Imagemodal } from './Imagemodal'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { InvoiceServiceTool } from './services/InvoiceService';
import { SavedConversationsModal } from './components/SavedConversationsModal';
import { toast } from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import { LogService, LogQueryParams } from './services/LogService';
import { LogViewer } from './components/LogViewer';
import { ElizaChat } from '../ElizaChat';
import VehicleResearch from '../vehicle/VehicleResearch';
import  ForumDTCAnalyzer  from '../dtc/ForumDTCAnalyzer';
import DTCQueryInterface from '../dtc/DTCQueryInterface';
import InvoicePage from '../../pages/invoice/InvoicePage';
import { CustomerContextDisplay } from '../customer/CustomerContextDisplay.js';
import { buildCustomerContext } from './utils/customerContextBuilder';
import { 
  baseInstructions, 
  customerToolInstructions, 

} from './utils/conversation_config';
import { ImageSearchResults } from './ImageSearchResults';

const Item2 = styled(Paper)(({ theme }) => ({
  backgroundColor: 'transparent',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.primary,
  position: 'relative',
  '& .dtc-container': {
    position: 'relative',
    zIndex: 9999,
  },
  '& .console-container': {
    position: 'relative',
    zIndex: 1,
  },
}));

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
      backgroundColor: '#1A2027',
    }),
  }));

// Add interfaces after imports
interface ImportMetaEnv {
  VITE_OPENAI_API_KEY: string;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface NoteEntry {
  id?: string;
  timestamp: string;
  topic: string;
  tags: string[];
  keyPoints: string[];
  codeExamples?: {
    language: string;
    code: string;
  }[];
  resources?: string[];
}
// Replace hardcoded values with environment variables
const LOCAL_RELAY_SERVER_URL: string = import.meta.env.VITE_LOCAL_RELAY_SERVER_URL || 'http://localhost:8081';
const OPENAI_API_KEY: string = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Missing VITE_OPENAI_API_KEY environment variable');
}

/**
 * Type for result from get_weather() function call
 */
interface Coordinates {
  lat: number;
  lng: number;
  location?: string;
  temperature?: {
    value: number;
    units: string;
  };
  wind_speed?: {
    value: number;
    units: string;
  };
}

/**
 * Type for all event logs
 */
interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

interface RepairEntry {
  timestamp: string;
  repair_type: string;
  description: string;
  mileage?: number;
}

interface RepairHistoryParams {
  vehicle_id: string;
  repair_type: string;
  description: string;
  mileage?: number;
}

interface GetRepairHistoryParams {
  vehicle_id: string;
}

interface DiagramAnnotation {
  x: number;
  y: number;
  text: string;
}
interface LogViewerProps {
  logService: LogService;
}
interface ShowComponentDiagramParams {
  component_id: string;
  annotations?: DiagramAnnotation[];
}

interface DiagramSearchParams {
  search_query: string;
  type: 'repair' | 'parts' | 'wiring' | 'system';
  year?: string;
  make?: string;
  model?: string;
}

// Add this interface near the top with other interfaces
interface InputTextContentType {
  type: 'input_text';
  text: string;
  metadata?: {
    is_context?: boolean;
    note_id?: string;
    timestamp?: string;
  };
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

export interface SavedConversation {
  _id: string;
  timestamp: string;
  title: string;
  items: RealtimeItemType[];  // Add this to store conversation items
  realtimeEvents: RealtimeEvent[];  // Add this to store event logs
  lastExchange: {
    userMessage: string;
    assistantMessage: string;
  };
  keyPoints: string[];
  notes: {
    timestamp: Date;
    topic: string;
    tags: string[];
    keyPoints: string[];
    codeExamples?: {
      language: string;
      code: string;
    }[];
    resources?: string[];
  }[];
}

const defaultConfig = {
  apiKey: OPENAI_API_KEY,
  relayServerUrl: LOCAL_RELAY_SERVER_URL,
  conversation: {
    id: undefined,
    history: [],
    context: {},
    metadata: {
      source: 'saved_conversation'
    }
  },
  audioEnabled: true,
  turnDetectionType: 'none' as const
};

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

export function A() {
  const { selectedCustomer } = useCustomer();
  
  /**
   * Instantiate:
   * - WavRecorder (speech input)
   * - WavStreamPlayer (speech output)
   * - RealtimeClient (API client)
   */
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ 
      sampleRate: 24000
    })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient({
      url: LOCAL_RELAY_SERVER_URL,
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowAPIKeyInBrowser: true
    })
  );

  /**
   * References for
   * - Rendering audio visualization (canvas)
   * - Autoscrolling event logs
   * - Timing delta for event log displays
   */
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);
  const eventsScrollHeightRef = useRef(0);
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<string>(new Date().toISOString());

  /**
   * All of our variables for displaying application state
   * - items are all conversation items (dialog)
   * - realtimeEvents are event logs, which can be expanded
   * - memoryKv is for set_memory() function
   * - coords, marker are for get_weather() function
   */
  const [items, setItems] = useState<RealtimeItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [memoryKv, setMemoryKv] = useState<MemoryKV>({
    customerData: undefined,
    vehicleData: undefined,
    customerFullName: undefined,
    customerContact: undefined,
    vehicleVin: undefined,
    vehicleModel: undefined,
    vehicleYear: undefined,
    vehicleMake: undefined,
    vehicleTrim: undefined,
    vehicleEngine: undefined,
    vehicleTransmission: undefined,
    vehicleFuelType: undefined,
    vehicleTurbocharged: undefined,
    vehicleIsAWD: undefined,
    vehicleIs4x4: undefined,
  });
  const [coords, setCoords] = useState<Coordinates | null>({
    lat: 37.775593,
    lng: -122.418137,
  });
  const [marker, setMarker] = useState<Coordinates | null>(null);
  // log service viewer
  const [showLogViewer, setShowLogViewer] = useState(false);

  const [activeDiagram, setActiveDiagram] = useState<string>('engine_overview');
  const [diagramAnnotations, setDiagramAnnotations] = useState<DiagramAnnotation[]>([]);

  const [diagramUrl, setDiagramUrl] = useState<string | undefined>(undefined);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  // Create a ref to hold the disconnect function
  const disconnectRef = useRef<(() => Promise<void>) | null>(null);

  // Add state for notes array
  const [notes, setNotes] = useState<NoteEntry[]>([]);

  // Add state for modal
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  // Add state for notes visibility
  const [isNotesVisible, setIsNotesVisible] = useState(false);

  const [searchResults, setSearchResults] = useState<ImageSearchResult[]>([]);

  // Add this ref with other refs
  const invoiceServiceToolRef = useRef<InvoiceServiceTool>(new InvoiceServiceTool());

  // Add this state near other useState declarations
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Add this state near other useState declarations
  const [activeContextId, setActiveContextId] = useState<string | null>(null);

  // Add state for customer data
  const [customers, setCustomers] = useState<CustomerEntry[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const conversationServiceRef = useRef(new ConversationService());
  const customerDataToolRef = useRef(new CustomerDataTool());
// Add near the top with other state declarations
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [apiLogs, setApiLogs] = useState<Array<{
    timestamp: string;
    type: string;
    data: any;
  }>>([]);

  // Add/update these state variables near your other useState declarations
  const [selectedDiagram, setSelectedDiagram] = useState<{
    url: string;
    title: string;
    thumbnail?: string;
    sourceUrl?: string;
    fileType: string;
  } | null>(null);

  // Add this state near your other useEffect hooks
  useEffect(() => {
    if (isNotesModalOpen) {
      loadNotes();
    }
  }, [isNotesModalOpen]);

  /**
   * Utility for formatting the timing of logs
   */
  const formatTime = useCallback((timestamp: string) => {
    const startTime = startTimeRef.current;
    const t0 = new Date(startTime).valueOf();
    const t1 = new Date(timestamp).valueOf();
    const delta = t1 - t0;
    const hs = Math.floor(delta / 10) % 100;
    const s = Math.floor(delta / 1000) % 60;
    const m = Math.floor(delta / 60_000) % 60;
    const pad = (n: number) => {
      let s = n + '';
      while (s.length < 2) {
        s = '0' + s;
      }
      return s;
    };
    return `${pad(m)}:${pad(s)}.${pad(hs)}`;
  }, []);

  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {
    try {
            // First reset state
      setIsConnected(false);
      setIsRecording(false);
      setRealtimeEvents([]);
      setItems([]);
      setMemoryKv({
        customerData: undefined,
        vehicleData: undefined,
        customerFullName: undefined,
        customerContact: undefined,
        vehicleVin: undefined
      });
   
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      const wavStreamPlayer = wavStreamPlayerRef.current;
      // Then cleanup resources
      // Disconnect client if it exists
      if (client) {
        client.disconnect();
      }

      // End recording if active
      if (wavRecorder && wavRecorder.getStatus() !== 'ended') {
        await wavRecorder.end().catch(console.error);
      }

      // Interrupt any playing audio
      if (wavStreamPlayer) {
        await wavStreamPlayer.interrupt();
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }, []);

  // Store the disconnect function in the ref
  useEffect(() => {
    disconnectRef.current = disconnectConversation;
  }, [disconnectConversation]);

  /**
   * Connect to conversation
   */
  const connectConversation = useCallback(async (config = defaultConfig) => {
    try {
      const client = clientRef.current;
      if (!OPENAI_API_KEY) {
        throw new Error('No API key provided');
      }
  
      console.log('Attempting connection...');
  
      // Initialize audio components
      try {
        await wavRecorderRef.current.begin();
        await wavStreamPlayerRef.current.connect();
      } catch (error: any) {
        console.error('Audio initialization failed:', error);
        if (error.message.includes('audioWorklet')) {
          throw new Error('AudioWorklet initialization failed. Please check browser settings and reload.');
        }
        throw new Error('Failed to initialize audio components. Please check browser permissions.');
      }
  
      await client.connect();
      console.log('Connected successfully');
  
      // Update state
      startTimeRef.current = new Date().toISOString();
      setIsConnected(true);
      setRealtimeEvents([]);
      setItems(client.conversation.getItems() as any);
  
      // Add customer and vehicle context to initial instructions
      const vehicle = selectedCustomer?.vehicles?.[0];
      const customerContext = selectedCustomer 
        ? `\nCurrently assisting customer: ${selectedCustomer.firstName} ${selectedCustomer.lastName}
           Email: ${selectedCustomer.email || 'Not provided'}
           Phone: ${selectedCustomer.phoneNumber || 'Not provided'}
           Vehicle: ${vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin})` : 'No vehicle information'}
           Please keep this customer's information in context for our conversation.`
        : '\nNo customer currently selected. You can help select a customer using the customer_data tool.';
  
      client.updateSession({
        instructions: instructions + customerContext
      });
  
      // Send initial greeting
      const greeting = selectedCustomer
        ? `Hello! I'm here to help with ${selectedCustomer.firstName} ${selectedCustomer.lastName}'s appointment${vehicle ? ` for their ${vehicle.year} ${vehicle.make} ${vehicle.model}` : ''}.`
        : 'Hello! Please select a customer to begin.';
  
      client.sendUserMessageContent([
        { type: 'input_text', text: greeting }
      ]);
  
      // Start VAD if needed
      if (client.getTurnDetectionType() === 'server_vad') {
        await wavRecorderRef.current.record((data) => client.appendInputAudio(data.mono));
      }
    } catch (error) {
      console.error('Connection failed:', error);
      if (disconnectRef.current) {
        await disconnectRef.current();
      }
      throw error;
    }
  }, [selectedCustomer]);



  // Update the handleConnect callback
  const handleConnect = useCallback(async () => {
    try {
      if (isConnected) {
        console.log('Disconnecting...');
        await disconnectConversation();
      } else {
        console.log('Connecting...');
        await connectConversation(); // Use connectConversation instead of connect
      }
    } catch (error) {
      console.error('Connection handling error:', error);
      toast.error('Failed to connect/disconnect');
    }
  }, [isConnected, disconnectConversation, connectConversation]);

  const deleteConversationItem = useCallback(async (id: string) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

 // ... existing code ...
// ... existing code ...

const startRecording = useCallback(async () => {
  try {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // Check connection state first
    if (!client.isConnected()) {
      console.log('Client not connected, attempting to connect...');
      await connectConversation();
    }

    // Double check connection after potential reconnect
    if (!client.isConnected()) {
      throw new Error('Failed to establish connection');
    }

    setIsRecording(true);

    // Ensure recorder is initialized
    if (wavRecorder.getStatus() === 'ended') {
      await wavRecorder.begin();
    }

    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    
    await wavRecorder.record((data) => {
      if (client.isConnected()) {
        client.appendInputAudio(data.mono);
      } else {
        // Stop recording if connection is lost
        wavRecorder.pause().catch(console.error);
        setIsRecording(false);
        throw new Error('Connection lost during recording');
      }
    });
  } catch (error) {
    console.error('Failed to start recording:', error);
    setIsRecording(false);
    toast.error('Failed to start recording. Please try again.');
  }
}, [connectConversation]);

const stopRecording = useCallback(async () => {
  try {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    
    // Check connection state
    if (!client.isConnected()) {
      console.log('Client disconnected, attempting to reconnect...');
      await connectConversation();
    }

    // Stop recording first
    if (wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }
    
    setIsRecording(false);

    // Only create response if still connected
    if (client.isConnected()) {
      await client.createResponse();
    } else {
      throw new Error('Client disconnected');
    }
  } catch (error) {
    console.error('Failed to stop recording:', error);
    setIsRecording(false);
    
    // Ensure recorder is stopped even if there's an error
    try {
      if (wavRecorderRef.current.getStatus() === 'recording') {
        await wavRecorderRef.current.pause();
      }
    } catch (e) {
      console.error('Failed to stop recorder after error:', e);
    }
    
    toast.error('Error processing voice input. Please try again.');
  }
}, [connectConversation]);

// Add this useEffect to monitor connection status
useEffect(() => {
  const client = clientRef.current;
  if (!client) return;

  const handleDisconnect = async () => {
    console.log('Disconnected, attempting to reconnect...');
    setIsConnected(false);
    if (isRecording) {
      setIsRecording(false);
      try {
        await wavRecorderRef.current.pause();
      } catch (e) {
        console.error('Error stopping recorder:', e);
      }
    }
    try {
      await connectConversation();
    } catch (e) {
      console.error('Failed to reconnect:', e);
      toast.error('Lost connection. Please try reconnecting manually.');
    }
  };

  client.on('disconnect', handleDisconnect);

  return () => {
    client.off('disconnect', handleDisconnect);
  };
}, [isRecording, connectConversation]);

// ... rest of the code ...

/*
Notes from conversation tool
*/ 
useEffect(() => {
  const wavStreamPlayer = wavStreamPlayerRef.current;
  const client = clientRef.current;

  client.updateSession({ instructions });
  client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

  // Add note-taking tool
  client.addTool(
    {
      name: 'save_note',
      description: 'Saves important discussion points and code examples as a note.',
      parameters: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'Main topic of the note',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Relevant tags for categorizing the note',
          },
          keyPoints: {
            type: 'array',
            items: { type: 'string' },
            description: 'Key points discussed',
          },
          codeExamples: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                language: { type: 'string' },
                code: { type: 'string' },
              },
            },
            description: 'Code examples discussed',
          },
          resources: {
            type: 'array',
            items: { type: 'string' },
            description: 'Relevant documentation or resource links',
          },
        },
        required: ['topic', 'tags', 'keyPoints'],
      },
    },
    async (params: {
      topic: string;
      tags: string[];
      keyPoints: string[];
      codeExamples?: { language: string; code: string; }[];
      resources?: string[];
    }) => {
      const note = {
        timestamp: new Date().toISOString(),
        ...params,
      };
      saveNote(note);
      return { status: 'saved', noteId: notes.length };
    }
  );
}, []); // Add empty dependency array

// Add this near your other useEffect hooks
 // Empty dependency array since we're using refs

// write the function for creating a new customer through the realtime api




// Add customer data loading function
const loadCustomerData = async () => {
  try {
    const response = await axiosInstance.get('/customers/all');
    console.log('📚 Customers from DB:', response.data);
    
    const parsedCustomers = response.data.map((customer: any) => {
      try {
        return {
          id: customer._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          vehicles: customer.vehicles,
           
        };
      } catch (e) {
        console.error('Failed to parse customer:', e, customer);
        return null;
      }
    }).filter(Boolean);

    console.log('📝 Parsed customers:', parsedCustomers);
    setCustomers(parsedCustomers);
  } catch (error) {
    console.error('❌ Failed to load customers:', error);
  }
};

// Load customer data on component mount
useEffect(() => {
  loadCustomerData();
  }, []);

  /**
   * Switch between Manual <> VAD mode for communication
   */
  const changeTurnEndType = useCallback(async (value: string) => {
    try {
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;

      // Stop any ongoing recording
      if (wavRecorder.getStatus() === 'recording') {
        await wavRecorder.pause();
      }

      // If recorder is not initialized, initialize it
      if (wavRecorder.getStatus() === 'ended') {
        await wavRecorder.begin();
      }

      client.updateSession({
        turn_detection: value === 'none' ? null : { type: 'server_vad' },
      });

      if (value === 'server_vad' && client.isConnected()) {
        await wavRecorder.record((data) => client.appendInputAudio(data.mono));
      }

      setCanPushToTalk(value === 'none');
    } catch (error) {
      console.error('Failed to change turn end type:', error);
      setCanPushToTalk(true); // Reset to manual mode on error
      // Optionally show error to user
    }
  }, []);

  /**
   * Auto-scroll the event logs
   */ 
  useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      // Only scroll if height has just changed
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [realtimeEvents]);

  /**
   * Auto-scroll the conversation logs
   */
  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);

  /**
   * Set up render loops for the visualization canvas
   */
  useEffect(() => {
    let isLoaded = true;
    let animationFrameId: number;

    const wavRecorder = wavRecorderRef.current;
    const clientCanvas = clientCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;

    const wavStreamPlayer = wavStreamPlayerRef.current;
    const serverCanvas = serverCanvasRef.current;
    let serverCtx: CanvasRenderingContext2D | null = null;

    const render = () => {
      if (!isLoaded) return;

      // Handle client (input) visualization
      if (clientCanvas) {
        // Set canvas dimensions based on display size
        const clientRect = clientCanvas.parentElement?.getBoundingClientRect();
        if (clientRect) {
          clientCanvas.width = clientRect.width;
          clientCanvas.height = clientRect.height;
        }
        
        clientCtx = clientCtx || clientCanvas.getContext('2d');
        if (clientCtx) {
          clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
          const result = wavRecorder.recording
            ? wavRecorder.getFrequencies('voice')
            : { values: new Float32Array([0]) };
          WavRenderer.drawBars(
            clientCanvas,
            clientCtx,
            result.values,
            '#0099ff',
            20,
            0,
            8
          );
        }
      }

      // Handle server (output) visualization
      if (serverCanvas) {
        // Set canvas dimensions based on display size
        const serverRect = serverCanvas.parentElement?.getBoundingClientRect();
        if (serverRect) {
          serverCanvas.width = serverRect.width;
          serverCanvas.height = serverRect.height;
        }
        
        serverCtx = serverCtx || serverCanvas.getContext('2d');
        if (serverCtx) {
          serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
          const result = wavStreamPlayer.analyser
            ? wavStreamPlayer.getFrequencies('voice')
            : { values: new Float32Array([0]) };
          WavRenderer.drawBars(
            serverCanvas,
            serverCtx,
            result.values,
            '#009900',
            20,
            0,
            8
          );
        }
      }

      // Request next frame
      animationFrameId = window.requestAnimationFrame(render);
    };

    // Start the render loop
    render();

    // Cleanup function
    return () => {
      isLoaded = false;
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); // Empty dependency array since we're using refs

  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // Set instructions
    client.updateSession({ 
      instructions: instructions + `
You can access the conversation database using these tools:
- search_conversation_history: Search for specific topics or content
- get_conversation_details: Get full details of a specific conversation
- get_recent_conversations: List recent conversations
- get_notes: Get notes from the conversation database
- set_memory: Save important data about the user into memory
- log_repair_history: Record repair and maintenance history for a vehicle
- get_repair_history: Retrieve repair history for a specific vehicle
- search_automotive_diagram: Search and display relevant automotive diagrams
- get_customers: Get a list of customers from the database
- customer_data: Access and manage customer information. Can search, view details, and create new customers.
- get_diagrams: Get diagrams for a vehicles system




When users ask about previous conversations, use these tools to:
1. Search for relevant conversations
2. Get specific details when needed
3. Reference and summarize previous discussions
4. Help users find specific information from past conversations
5. Get customer details when needed

Example queries you can handle:
- "fetch_latest_log"
- "Show me recent conversations about databases"
- "Get customers with this last name"
- "how many customers do we have?"
- "Save this note for me"
- "Get diagrams for a vehicles system"
`
    });
    // Set transcription, otherwise we don't get user transcriptions back.
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    // Add tools
    client.addTool(
      {
        name: 'set_memory',
        description: 'Saves the customers data into memory for use helping the technician.',
        parameters: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'The key of the memory value. Always use lowercase and underscores.',
            },
            value: {
              type: ['string', 'object'],
              description: 'Value can be a string or an object containing conversation data',
            },
          },
          required: ['key', 'value'],
        },
      },
      async ({ key, value }: { key: string; value: any }) => {
        setMemoryKv((memoryKv) => ({
          ...memoryKv,
          [key]: typeof value === 'string' ? value : JSON.stringify(value)
        }));
        return { ok: true };
      }
    );
    client.addTool(
      {
        name: 'customer_data',
        description: 'Access and manage customer information. Can search, view details, and create new customers.',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['search', 'get_customer_details', 'get_customer_vehicles', 'get_customer_history', 'create_customer'],
              description: 'Action to perform (search/get_customer_details/get_customer_vehicles/get_customer_history/create_customer)'
            },
            params: {
              type: 'object',
              properties: {
                searchTerm: { type: 'string' },
                customerId: { type: 'string' },
                firstName: { 
                  type: 'string',
                  description: 'Customer\'s first name'
                },
                lastName: { 
                  type: 'string',
                  description: 'Customer\'s last name'
                },
                email: { 
                  type: 'string',
                  description: 'Customer\'s email address'
                },
                phoneNumber: { 
                  type: 'string',
                  description: 'Customer\'s phone number'
                },
                notes: { 
                  type: 'string',
                  description: 'Additional notes about the customer'
                }
              }
            }
          },
          required: ['action', 'params']
        }
      },
      async (input: { action: string; params: Record<string, any> }) => {
        const logEntry = {
          timestamp: new Date().toISOString(),
          type: `Customer Data Tool - ${input.action}`,
          data: { params: input.params }
        };
        
        setApiLogs(prev => [...prev, logEntry]);
        
        try {
          switch (input.action) {
            case 'search':
              const searchResponse = await axiosInstance.get('/customers/search', {
                params: { term: input.params.searchTerm }
              });
              
              setApiLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                type: 'Search Response',
                data: searchResponse.data
              }]);
              
              return formatCustomerResponse(searchResponse.data);
              
            case 'details':
              console.log('📝 Fetching details for customer:', input.params.customerId);
              const detailsResponse = await axiosInstance.get(`/customers/${input.params.customerId}`);
              console.log('👤 Customer Details Response:', detailsResponse.data);
              return formatCustomerResponse(detailsResponse.data);
              
            case 'create':
              console.log('📝 Starting customer creation process');
              try {
                // Validate required fields
                if (!input.params.firstName || !input.params.lastName) {
                  throw new Error('First name and last name are required');
                }
  
                // Format the request body
                const customerData = {
                  customerData: {
                    firstName: input.params.firstName,
                    lastName: input.params.lastName,
                    email: input.params.email || '',
                    phoneNumber: input.params.phoneNumber || '',
                    address: input.params.address || '',
                    city: input.params.city || '',
                    zipCode: input.params.zipCode || '',
                    notes: input.params.notes || ''
                  },
                  vehicleData: {}
                };
  
                console.log('📦 Formatted request data:', customerData);
  
                const createResponse = await axiosInstance.post('/customers', customerData);
                console.log('✅ Customer creation successful:', createResponse.data);
                
                // Format the response
                const formattedResponse = formatCustomerResponse(createResponse.data.customer || createResponse.data);
                
                return {
                  status: 'success',
                  message: 'Customer created successfully',
                  customer: formattedResponse
                };
  
              } catch (error: any) {
                console.error('❌ Customer creation error:', {
                  error,
                  params: input.params,
                  message: error.message
                });
                
                return {
                  status: 'error',
                  message: error.response?.data?.error || 'Failed to create customer',
                  details: error.message
                };
              }
            default:
              console.warn('⚠️ Unhandled action type:', input.action);
              return {
                status: 'error',
                message: `Unhandled action type: ${input.action}`
              };
          }
        } catch (error) {
          setApiLogs(prev => [...prev, {
            timestamp: new Date().toISOString(),
            type: 'Error',
            data: error instanceof Error ? error.message : 'Unknown error'
          }]);
          throw error;
        }
      }
    );
// Live Log Tool from running engine
    client.addTool(
      {
        name: 'fetch_latest_log',
        description: 'Fetches the latest vehicle log data from the server, including columns, data, file name, and timestamp.',
        parameters: {
          type: 'object',
          properties: {
            responseSchema: {
              type: 'object',
              description: 'The expected structure of the response from the server.',
              properties: {
                columns: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'An array of column names for the vehicle log data.',
                },
                data: {
                  type: 'array',
                  items: {
                    type: 'array',
                    items: { type: 'number' },
                  },
                  description: 'An array of rows, each containing numerical values corresponding to the columns.',
                },
                file: {
                  type: 'string',
                  description: 'The name of the CSV log file.',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'The timestamp when the log file was last updated.',
                },
              },
              required: ['columns', 'data', 'file', 'timestamp'],
            },
          },
          required: [],
        },
      },
      async () => {
        try {
          const response = await fetch('http://localhost:4000/api/latest-log');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
    
          const logData = await response.json();
    
          // Transform data into a more usable format if needed
          const formattedLog = {
            timestamp: logData.timestamp,
            file: logData.file,
            columns: logData.columns,
            data: logData.data.map((row: number[]) =>
              logData.columns.reduce((acc: Record<string, any>, col: string, i: number) => {
                acc[col] = row[i];
                return acc;
              }, {} as Record<string, any>)
            ),
          };
    
          console.log('Fetched Log Data:', formattedLog);
          return formattedLog;
        } catch (error) {
          console.error('Error fetching latest log:', error);
          return { error: 'Failed to fetch the latest log.' };
        }
      }
    );
    
      async ({ vehicle_id, repair_type, description, mileage }: RepairHistoryParams) => {
        setMemoryKv((prevState) => {
          const newState = { ...prevState };
          if (!newState[vehicle_id]) {
            newState[vehicle_id] = [];
          }
          newState[vehicle_id].push({
            timestamp: new Date().toISOString(),
            repair_type,
            description,
            mileage,
          });
          return newState;
        });
        return { status: 'recorded' };
      }
        
    client.addTool(
      {
        name: 'search_notes',
        description: 'Search through saved notes by topic, tags, or content',
        parameters: {
          type: 'object',
          properties: {
            query: { 
              type: 'string', 
              description: 'Search term to find in notes' 
            },
            filter: { 
              type: 'string',
              enum: ['topic', 'tags', 'content', 'all'],
              description: 'Type of search to perform'
            }
          },
          required: ['query']
        }
      },
      async ({ query, filter = 'all' }: { query: string; filter?: 'topic' | 'tags' | 'content' | 'all' }) => {
        try {
          const response = await axiosInstance.get('/notes/search', {
            params: { query, filter }
          });
          return { status: 'success', results: response.data };
        } catch (error) {
          console.error('Failed to search notes:', error);
          return { status: 'error', message: 'Failed to search notes' };
        }
      }
    );
    
    client.addTool(
      {
        name: 'get_recent_notes',
        description: 'Get a list of recent notes',
        parameters: {
          type: 'object',
          properties: {
            limit: { 
              type: 'number', 
              description: 'Number of notes to retrieve (default: 10)' 
            }
          }
        }
      },
      async ({ limit = 10 }) => {
        try {
          const response = await axiosInstance.get('/notes/recent', {
            params: { limit }
          });
          return { status: 'success', notes: response.data };
        } catch (error) {
          console.error('Failed to get recent notes:', error);
          return { status: 'error', message: 'Failed to retrieve recent notes' };
        }
      }
    );
    // Inside useEffect where tools are added


  // Add the Serper search tool
  client.addTool(
    {
      name: 'search_images',
      description: 'Search for images and diagrams using Serper API',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for images or diagrams'
          },
          type: {
            type: 'string',
            enum: ['diagram', 'part', 'repair'],
            description: 'Type of image to search for'
          }
        },
        required: ['query']
      }
    },
    async ({ query, type = 'diagram' }: { query: string; type?: string }) => {
      try {
        const response = await axiosInstance.post('/serper/images', {
          query: `${query} ${type}`,
          num: 5
        });

        if (response.data.images?.length > 0) {
          const results = response.data.images;
          
          // Store in memory
          setMemoryKv(prev => ({
            ...prev,
            last_image_search: {
              query,
              results: results.map((img: any) => ({
                title: img.title,
                url: img.link,
                thumbnail: img.thumbnail
              }))
            }
          }));

          // Update search results state to display in ImageSearchResults
          setSearchResults(results);

          // Send confirmation message
          setTimeout(() => {
            client.sendUserMessageContent([{
              type: 'input_text',
              text: `✓ Found ${results.length} images for "${query}". The images are now displayed in the results panel. You can click on any image to view it in detail or save it.`
            }]);
          }, 100);

          return {
            status: 'success',
            message: `Found ${results.length} images`,
            results: results.map((img: any) => ({
              title: img.title,
              url: img.link,
              thumbnail: img.thumbnail
            }))
          };
        }

        // No results case
        await client.sendUserMessageContent([{
          type: 'input_text',
          text: `No images found for "${query}". Please try a different search term or type.`
        }]);

        return {
          status: 'error',
          message: 'No images found'
        };
      } catch (error) {
        await client.sendUserMessageContent([{
          type: 'input_text',
          text: `Failed to search for images: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]);

        console.error('Image search error:', error);
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to search for images'
        };
      }
    }
  );

  // ... rest of your useEffect code ...
// Add any necessary dependencies

    // handle realtime events from client + server for event logging
    client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents((realtimeEvents) => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });

      // Enhanced tool execution feedback with attempt tracking
      if (realtimeEvent.event.type === 'function_call_output') {
        const output = realtimeEvent.event.output;
        const toolName = realtimeEvent.event.name;
        
        // Update tool attempts in memory
        setMemoryKv(prev => {
          const toolAttempts = prev[`${toolName}_attempts`] || 0;
          return {
            ...prev,
            [`last_${toolName}_result`]: output,
            [`${toolName}_attempts`]: toolAttempts + 1
          };
        });

        // Send explicit feedback about tool execution with attempt count
        client.sendUserMessageContent([{
          type: 'input_text',
          text: `Tool ${toolName} execution attempt ${memoryKv[`${toolName}_attempts`] || 1}: ${output.status === 'success' ? 'Succeeded' : 'Failed'}. ${JSON.stringify(output)}`
        }]);

        // Reset attempts if successful
        if (output.status === 'success') {
          setMemoryKv(prev => ({
            ...prev,
            [`${toolName}_attempts`]: 0
          }));
        }
      }
    });
    client.on('error', (event: any) => console.error(event));
    client.on('conversation.interrupted', async () => {
      try {
        await wavStreamPlayer.interrupt();
      } catch (error) {
        console.error('Failed to interrupt audio playback:', error);
      }
    });
    client.on('conversation.updated', async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === 'completed' && item.formatted.audio?.length) {
        const wavFile = await WavRecorder.decode(
          item.formatted.audio,
          24000,
          24000
        );
        item.formatted.file = wavFile;
      }
      setItems(items);
    });

    setItems(client.conversation.getItems() as RealtimeItemType[]);

    return () => {
      // cleanup; resets to defaults
      client.reset();
    };
  }, []);

  useEffect(() => {    // Core RealtimeClient and audio capture setup
    const cleanup = async () => {
      if (disconnectRef.current) {
        await disconnectRef.current();
      }
    };

    return () => {
      cleanup().catch(console.error);    };
  }, []);

  // Modify the saveNote function
  const saveNote = async (note: NoteEntry) => {
    try {
      const formattedNote = {
        content: {
          timestamp: new Date().toISOString(),
          topic: note.topic,
          tags: note.tags || [],
          keyPoints: note.keyPoints || [],
          codeExamples: note.codeExamples || [],
          resources: note.resources || []
        }
      };

      console.log('📤 Sending note to server:', JSON.stringify(formattedNote, null, 2));

      const response = await axiosInstance.post('/notes', formattedNote);
      console.log('📥 Server response:', JSON.stringify(response.data, null, 2));
      
      setNotes(prev => [...prev, formattedNote.content as NoteEntry]);
      return response.data;
    } catch (error: any) {
      console.error(' Failed to save note:', error);
      if ('response' in error) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  };

  // Update the loadNotes function
  const loadNotes = async () => {
    try {
      const response = await axiosInstance.get('/notes');
      console.log('📚 Raw notes from DB:', response.data);
      
      // Parse the notes properly based on the DB structure
      const parsedNotes = response.data.map((note: any) => {
        try {
          // If content is a string, parse it, otherwise use it directly
          const content = typeof note.content === 'string' 
            ? JSON.parse(note.content) 
            : note.content;
            
          return {
            id: note._id,
            timestamp: content.timestamp || note.timestamp,
            topic: content.topic,
            tags: content.tags || [],
            keyPoints: content.keyPoints || [],
            codeExamples: content.codeExamples || [],
            resources: content.resources || []
          };
        } catch (e) {
          console.error('Failed to parse note:', e, note);
          return null;
        }
      }).filter(Boolean);

      console.log('📝 Parsed notes:', parsedNotes);
      setNotes(parsedNotes);
    } catch (error) {
      console.error('❌ Failed to load notes:', error);
    }
  };

  // Add useEffect to load notes on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  // Add export function
  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `notes-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    linkElement.remove();
  };

  // Update loadNoteContext function
  const loadNoteContext = useCallback(async (noteId: string) => {
    const selectedNote = notes.find(note => (note.id || note.timestamp) === noteId);
    if (!selectedNote || !clientRef.current) return;

    setActiveContextId(noteId); // Set active context
    const contextMessage = `Previous conversation context:
Topic: ${selectedNote.topic}
Key Points:
${selectedNote.keyPoints.join('\n')}`;

    // Send context to the API
    clientRef.current.sendUserMessageContent([
      { 
        type: 'input_text', 
        text: contextMessage
      }
    ]);
  }, [notes]);

  // Add this near other useEffect hooks


  // Add this callback near other useCallback definitions
  const updateClientInstructions = useCallback(() => {
    const client = clientRef.current;
    if (!client) return;

    const customerContext = buildCustomerContext(selectedCustomer);

    // Update session with instructions and memory
    client.updateSession({
      instructions: `${instructions}

${customerContext}

Current Session Context:
- Customer and vehicle information is loaded in memory
- Use memory context for customer and vehicle information
- All customer data tools have direct access to current customer context`
    });
  }, [selectedCustomer, instructions]);

  // Make sure to update instructions when customer changes
  useEffect(() => {
    updateClientInstructions();
  }, [selectedCustomer, updateClientInstructions]);


  // load customers
  const loadCustomers = async () => {
    try {
      const response = await axiosInstance.get('/customers/all');
      
      const parsedCustomers = (response.data || [])
        .filter((customer: any) => customer && typeof customer === 'object')
        .map((customer: any) => ({
          _id: customer._id || '',
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          email: customer.email || '',
          phoneNumber: customer.phoneNumber || '',
          vehicles: customer.vehicles || []

        }));

      setCustomers(parsedCustomers);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  // Add this effect to load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const updateCustomerContext = useCallback(() => {
    const client = clientRef.current;
    if (!client) return;

    const customersContext = customers.length > 0 
      ? `You have access to ${customers.length} customers. Use the customer_data tool to:
         - Search customers with 'search' action
         - Get customer details with 'details' action
         - Get customer vehicles with 'vehicles' action
         - Get service history with 'history' action` 
      : 'No customers available yet.';

    client.updateSession({ 
      instructions: `${instructions}
      
      ${customersContext}
      
      Available customer_data tool actions:
      - search: Find customers by name or email
      - details: Get detailed information about a specific customer
      - vehicles: Get vehicles owned by a customer
      - history: Get service history for a customer`
    });
  }, [customers, instructions]);



  useEffect(() => {
    updateCustomerContext();
  }, [customers, updateCustomerContext]);

  useEffect(() => {
    const client = clientRef.current;
    const invoiceServiceTool = invoiceServiceToolRef.current;

    if (!client || !invoiceServiceTool) return;

    // Add invoice service tool
    client.addTool(
      {
        name: 'invoice_service',
        description: 'Manage invoices including creation, updates, and retrieval of invoice information.',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'get', 'list', 'search', 'vehicles'],
              description: 'Action to perform on invoices'
            },
            params: {
              type: 'object',
              properties: {
                invoiceId: { type: 'string' },
                customerId: { type: 'string' },
                vehicleId: { type: 'string' },
                customerName: { type: 'string' },
                customerEmail: { type: 'string' },
                phoneNumber: { type: 'string' },
                address: { type: 'string' },
                invoiceDate: { type: 'string' },
                vehicleType: { 
                  type: 'string',
                  enum: ['Car', 'Truck', 'Van', 'SUV', 'Other']
                },
                // ... other properties ...
              }
            }
          },
          required: ['action', 'params']
        }
      },
      // Update the handler to pass the input directly
      async (input: { action: string; params: Record<string, any> }) => {
        try {
          // Pass the input object directly to the tool
          return await invoiceServiceTool._call(input);
        } catch (error) {
          console.error('Invoice service error:', error);
          return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
        }
      }
    );
  }, []);


  // Function to format customer data for the chat
  const formatCustomerData = (customer: CustomerInfo) => {
    const formattedVehicles = (customer.vehicles || []).map((vehicle: Vehicle) => ({
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
    }));

    return {
      id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || 'Not provided',
      phoneNumber: customer.phoneNumber || 'Not provided',
      workphoneNumber: customer.workphoneNumber || 'Not provided',
      address: customer.address || 'Not provided',
      city: customer.city || 'Not provided',
      zipCode: customer.zipCode || 'Not provided',
      notes: customer.notes || '',
      preferredContact: customer.preferredContact || 'email',
      vehicles: formattedVehicles
    };
  };

  // Update the connect function to initialize with customer data
  const connect = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      const client = clientRef.current;
      
      if (selectedCustomer) {
        console.log('Selected Customer:', selectedCustomer);
        const formattedCustomerData = formatCustomerData(selectedCustomer as CustomerInfo);
        console.log('Formatted Customer Data:', formattedCustomerData);
        
        // Initialize memory with customer and vehicle data
        const initialMemory = {
          customer: {
            id: formattedCustomerData.id,
            firstName: formattedCustomerData.firstName,
            lastName: formattedCustomerData.lastName,
            vehicleVin: formattedCustomerData.vehicles[0]?.vin || '',
            phoneNumber: formattedCustomerData.phoneNumber,
            fullName: `${formattedCustomerData.firstName} ${formattedCustomerData.lastName}`
          },
          vehicles: formattedCustomerData.vehicles || []
        };

        setMemoryKv(initialMemory);
        
        // Send initial context with both customer and vehicle info
        const vehicleInfo = formattedCustomerData.vehicles?.[0] 
          ? `${formattedCustomerData.vehicles[0].year} ${formattedCustomerData.vehicles[0].make} ${formattedCustomerData.vehicles[0].model}`
          : 'no vehicle information available';

        const messageContent = {
          type: 'input_text' as const,
          text: `System: Your first response must be exactly:
          "Hello, I'm Atlas. How can I assist you with ${formattedCustomerData.firstName} ${formattedCustomerData.lastName}'s appointment for their ${formattedCustomerData.vehicles[0]?.make || 'vehicle'}?"

          Available context:
          ${JSON.stringify(initialMemory, null, 2)}`,
                    metadata: {
            is_context: true
          }
        };

        client.sendUserMessageContent([messageContent]);
      }

      // Set up event handlers
      client.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to chat server');
      });

      client.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from chat server');
      });

      client.on('error', (error: Error) => {
        console.error('Chat connection error:', error);
      });

      // Connect to the server
      await client.connect();
      
      // Store disconnect function
      disconnectRef.current = async () => await client.disconnect();

    } catch (error) {
      console.error('Failed to connect:', error);
      setIsConnected(false);
    }
  }, [selectedCustomer]);

  // Update useEffect to reconnect when customer changes
  useEffect(() => {
    if (isConnected) {
      // Disconnect existing connection
      disconnectRef.current?.();
    }
    // Connect with new customer data
    connect();

    // Cleanup on unmount
    return () => {
      disconnectRef.current?.();
    };
  }, [connect, selectedCustomer]);

  // Remove the standalone tool setup
  // Add this with other refs
  const logServiceRef = useRef(new LogService());


  // Inside the useEffect where tools are added
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;
    const logService = logServiceRef.current;

    // Set instructions
    client.updateSession({ instructions });
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    // Add logs service tool
    client.addTool(
      {
        name: 'logs_service',
        description: 'Access and analyze system logs including sensor data, temperatures, battery levels, etc.',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['get_logs', 'get_latest', 'get_stats', 'get_by_id'],
              description: 'Action to perform on logs'
            },
            params: {
              type: 'object',
              properties: {
                page: { type: 'number', description: 'Page number for pagination' },
                limit: { type: 'number', description: 'Number of logs per page' },
                startDate: { type: 'string', description: 'Start date for filtering logs (ISO string)' },
                endDate: { type: 'string', description: 'End date for filtering logs (ISO string)' },
                logId: { type: 'string', description: 'ID of specific log to retrieve' }
              }
            }
          },
          required: ['action']
        }
      },
      async ({ action, params }: { action: string; params?: LogQueryParams }) => {
        try {
          const logService = logServiceRef.current;
          switch (action) {
            case 'get_logs':
              return await logService.getLogs(params);
            case 'get_latest':
              return await logService.getLogs({ limit: 1 });
            case 'get_stats':
              const logs = await logService.getLogs();
              return { totalLogs: logs.totalLogs };
            case 'get_by_id':
              return await logService.getLogs({ logId: params?.logId });
            default:
              throw new Error(`Unknown action: ${action}`);
          }
        } catch (error) {
          console.error('Logs service error:', error);
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    );


    // ... rest of your useEffect code ...
  }, []); // Add any necessary dependencies
  const handleImageClick = (image: ImageSearchResult) => {
    setSelectedDiagram({
      url: image.imageUrl,
      title: image.title,
      thumbnail: image.thumbnailUrl,
      sourceUrl: image.link,
      fileType: 'image'
    });
    setIsImageModalOpen(true);
  };
  
  const handleSaveImage = async (image: ImageSearchResult) => {
    try {
      const response = await axiosInstance.post('/images', {
        ...image,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to save image:', error);
      throw error;
    }
  };
  /**
   * Render the application
   */
  return (
  <>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gridTemplateRows: '15vh 10vh 10vh ',
      gap: 2,
      padding: 2,
      height: '100vh',
      overflow: 'hidden'
    }}>

      {/* Left side content */}
     
      {/* Right side content - Split into fixed and scrollable sections */}
     
        {/* Fixed section - Controls and Visualization */}
        <Box sx={{
          position: 'sticky', // Make this sticky
          top: 0,
          zIndex: 10,
          backgroundColor: '', // Match your background
          paddingBottom: 2
        }}>
          <div className="visualization-section w-full h-[5vh] flex flex-col">
            <div className="visualization-entry client flex-1">
              <canvas ref={clientCanvasRef} className="w-full h-[5vh]" />
            </div>
            <div className="visualization-entry server flex-1">
              <canvas ref={serverCanvasRef} className="w-full h-[12vh]" />
            </div>
          </div>

          {/* Controls */}
          <div className="controls-section w-full p-4 flex items-center gap-4 bg-gray-800 rounded-lg shadow-lg">
          <Toggle
                defaultValue={false}
                labels={['manual', 'vad']}
                values={['none', 'server_vad']}
                onChange={(_, value) => changeTurnEndType(value)}
              />
              <div className="spacer" />
              {isConnected && canPushToTalk && (
                <Button
                  label={isRecording ? 'release to send' : 'push to talk'}
                  buttonStyle={isRecording ? 'alert' : 'regular'}
                  disabled={!isConnected || !canPushToTalk}
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                />
            )}
            <Button
              label={isConnected ? 'Disconnect' : 'Connect'}
              iconPosition={isConnected ? 'end' : 'start'}
              icon={isConnected ? X : Zap}
              buttonStyle={isConnected ? 'alert' : 'action'}
              onClick={handleConnect}
            />
            <Button
              label="Notes"
              onClick={() => setIsNotesModalOpen(true)}
              icon={Edit}
              buttonStyle="regular"
            />
            <Button
              label="Images"
              icon={Search}
              onClick={() => setIsImageModalOpen(true)}
              buttonStyle="regular"
            />
            <Button
              label={showLogViewer ? "Hide Logs" : "Show Logs"}
              icon={showLogViewer ? X : Search}
              onClick={() => setShowLogViewer(!showLogViewer)}
              buttonStyle="regular"
            />
          </div>
        </Box>

  
          {/* Image search results */}
          <Box sx={{ marginBottom: 2 }}>
            <Item2>
              <div className="content-block">
                <div className="content-block-title text-2xl font-bold text-center sticky text-white">
                  IMAGE SEARCH RESULTS
                </div>
                {searchResults.length > 0 && (
                  <ImageSearchResults
                    searchResults={searchResults}
                    onImageClick={handleImageClick}
                    onSaveImage={handleSaveImage}
                  />
                )}
              </div>
            </Item2>
          </Box>

    

        </Box>

    {/* Modals */}
    {isNotesModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="notes-modal h-[75vh] relative z-50">
          <div className="notes-modal-content h-[75vh]">
            <div className="notes-modal-header sticky top-0 bg-slate-400">
              <h2>Saved Notes</h2>
              <button onClick={() => setIsNotesModalOpen(false)}>×</button>
            </div>
            <div className="notes-list">
              {notes.length === 0 ? (
                <p>No saved notes found.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id || note.timestamp} className="note-entry">
                    <div className="note-topic">
                      <h3>{note.topic}</h3>
                      <span className="timestamp">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="note-details">
                      <h4>Key Points:</h4>
                      <ul>
                        {note.keyPoints.map((point, i) => (
                          <li key={`${note.id || note.timestamp}-point-${i}`}>{point}</li>
                        ))}
                      </ul>
                      {note.codeExamples && note.codeExamples.length > 0 && (
                        <div className="code-examples">
                          <h4>Code Examples:</h4>
                          {note.codeExamples.map((codeExample, i) => (
                            <pre key={`${note.id || note.timestamp}-code-${i}`}>
                              {codeExample.code}
                            </pre>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {selectedDiagram && (
      <Imagemodal
        isOpen={!!selectedDiagram}
        onClose={() => setSelectedDiagram(null)}
        imageUrl={selectedDiagram.url}
        title={selectedDiagram.title}
      />
    )}



    {showLogViewer && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="log-viewer-content bg-white rounded-lg w-full h-full flex flex-col overflow-hidden relative z-50">
          <div className="log-viewer-header" style={{
            padding: '1rem',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2>System Logs</h2>
            <button onClick={() => setShowLogViewer(false)} style={{
              border: 'none',
              background: 'none',
              fontSize: '3.5rem',
              cursor: 'pointer'
            }}>×</button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', padding: '1rem' }}>
            <LogViewer logService={logServiceRef.current} />
          </div>
        </div>
      </div>
    )}
  </>
);
}
export default A;

