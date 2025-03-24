import { useEffect, useRef, useCallback, useState } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import type { ItemType as RealtimeItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from './lib/wavtools/index.js';
import { instructions } from './utils/conversation_config.js';
import { WavRenderer } from './utils/wav_renderer';
import { X, Edit, Zap, ArrowUp, ArrowDown, Search, Save, History as HistoryIcon, ExternalLink } from 'lucide-react';
import { Button } from './components/button/Button';
import { Toggle } from './components/toggle/Toggle';
import axiosInstance from '../../utils/axiosConfig.js';
import { CustomerDataTool } from './services/CustomerDataTool';
import { ConversationService } from './services/ConversationService';
import { Imagemodal } from './Imagemodal';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { InvoiceServiceTool } from './services/InvoiceService';
import { toast } from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import { LogService, LogQueryParams } from './services/LogService';
import { LogViewer } from './components/LogViewer';
import { buildCustomerContext } from './utils/customerContextBuilder';
import { baseInstructions, customerToolInstructions } from './utils/conversation_config';
import { ImageSearchResults } from './ImageSearchResults';
import { ImageSearchModal } from './ImageSearchModal';
import { useResearch } from '../../context/ResearchContext';
import { Notes } from './components/notes/Notes';
import { getImageUrl } from '../../utils/imageUtils';


// ---------- Styled Components ----------
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

// ---------- Interfaces & Types ----------
interface NoteEntry {
  id?: string;
  timestamp: string;
  topic: string;
  tags: string[];
  keyPoints: string[];
  codeExamples?: { language: string; code: string }[];
  resources?: string[];
  images?: string[];
}

interface Coordinates {
  lat: number;
  lng: number;
  location?: string;
  temperature?: { value: number; units: string };
  wind_speed?: { value: number; units: string };
}

interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

interface DiagramAnnotation {
  x: number;
  y: number;
  text: string;
}

interface InputTextContentType {
  type: 'input_text';
  text: string;
  metadata?: { 
    is_context?: boolean; 
    note_id?: string;
    timestamp?: string;
  };
}

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

interface SaveNoteRequest {
  content: {
    timestamp: string;
    topic: string;
    tags: string[];
    keyPoints: string[];
    codeExamples?: { language: string; code: string }[];
    resources?: string[];
    images?: string[];
  };
  conversationId: string;
}

const formatCustomerResponse = (data: any) => {
  try {
    if (Array.isArray(data)) {
      return data.map((customer) => ({
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
          notes: vehicle.notes,
        })) || [],
      }));
    }
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
        notes: vehicle.notes,
      })) || [],
    };
  } catch (error) {
    console.error('Error formatting customer response:', error);
    throw new Error('Failed to format customer data');
  }
};

interface Vehicle {
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

interface MemoryKV {
  customerData?: any;
  vehicleData?: any;
  [key: string]: any;
}

interface ImageSearchResult {
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  source: string;
  link: string;
  relevanceScore?: number;
}

interface SavedImage extends ImageSearchResult {
  timestamp: string;
}

const defaultConfig = {
  apiKey: 'import.meta.env.VITE_OPENAI_API_KEY',
  relayServerUrl: import.meta.env.VITE_LOCAL_RELAY_SERVER_URL || 'http://localhost:8081',
  conversation: {
    id: undefined,
    history: [],
    context: {},
    metadata: { source: 'saved_conversation' },
  },
  audioEnabled: true,
  turnDetectionType: 'none' as const,
};

interface ImageModalProps {
  open: boolean;
  onClose: () => void;
  src?: string;
  alt?: string;
}

// ---------- Main Component ----------
export function AppointmentsPage() {
  // ----- Refs for audio & realtime client
  const wavRecorderRef = useRef<WavRecorder>(new WavRecorder({ sampleRate: 24000 }));
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(new WavStreamPlayer({ sampleRate: 24000 }));
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient({
      url: import.meta.env.VITE_LOCAL_RELAY_SERVER_URL || 'http://localhost:8081',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowAPIKeyInBrowser: true,
    })
  );
  const invoiceServiceToolRef = useRef<InvoiceServiceTool>(new InvoiceServiceTool());
  const conversationServiceRef = useRef(new ConversationService());
  const customerDataToolRef = useRef(new CustomerDataTool());
  const disconnectRef = useRef<(() => Promise<void>) | null>(null);

  // ----- Refs for canvas and scrolling
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const eventsScrollHeightRef = useRef(0);
  const startTimeRef = useRef<string>(new Date().toISOString());

  // ----- State for realtime and conversation
  const [items, setItems] = useState<RealtimeItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [memoryKv, setMemoryKv] = useState<MemoryKV>({});

  // ----- State for UI & Data
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [searchResults, setSearchResults] = useState<ImageSearchResult[]>([]);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  // State for the selected image (for the view modal)
  const [selectedDiagram, setSelectedDiagram] = useState<{
    url: string;
    title: string;
    thumbnail?: string;
    sourceUrl?: string;
    fileType: string;
    link?: string;
  } | null>(null);
  // State to control image search modal visibility
  const [isImageSearchModalOpen, setIsImageSearchModalOpen] = useState(false);
  const [showLogViewer, setShowLogViewer] = useState(false);
  const [showSavedImages, setShowSavedImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);

  // ----- Map / Diagram States
  const [coords, setCoords] = useState<Coordinates | null>({ lat: 37.775593, lng: -122.418137 });
  const [marker, setMarker] = useState<Coordinates | null>(null);
  const [activeDiagram, setActiveDiagram] = useState<string>('engine_overview');
  const [diagramAnnotations, setDiagramAnnotations] = useState<DiagramAnnotation[]>([]);
  const [diagramUrl, setDiagramUrl] = useState<string | undefined>(undefined);

  // ----- Customer Data (from context and local state)
  const [customers, setCustomers] = useState<CustomerEntry[]>([]);
  const { selectedCustomer, selectedVehicle, setSelectedVehicle } = useCustomer();
  const { researchData, problem, setProblem, isLoading } = useResearch();
  // Add loading state for notes
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // ---------- 1) Load Customers ----------
  const loadCustomers = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/customers/all');
      console.log('📚 Customers from DB:', response.data);

      const parsedCustomers = (response.data || [])
        .filter((c: any) => c && typeof c === 'object')
        .map((customer: any) => ({
          _id: customer._id || '',
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          email: customer.email || '',
          phoneNumber: customer.phoneNumber || '',
          vin: customer.vin || '',
          licensePlate: customer.licensePlate || '',
          make: customer.make || '',
          model: customer.model || '',
          trim: customer.trim || '',
          engine: customer.engine || '',
          transmission: customer.transmission || '',
          fuelType: customer.fuelType || '',
          vehicles: customer.vehicles || [],
        }));
      console.log('📝 Parsed customers:', parsedCustomers);
      setCustomers(parsedCustomers);
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast.error('Failed to load customers');
    }
  }, []);

  // ---------- 2) Load Notes When Component Mounts ----------
  useEffect(() => {
    loadNotes();
  }, []); // Load notes when component mounts

  // ---------- 3) Load Notes When Notes Section is Shown ----------
  useEffect(() => {
    if (showNotes) {
      loadNotes();
    }
  }, [showNotes]);

  // ---------- 4) Utility: Format Log Time ----------
  const formatTime = useCallback((timestamp: string) => {
    const t0 = new Date(startTimeRef.current).valueOf();
    const t1 = new Date(timestamp).valueOf();
    const delta = t1 - t0;
    const hs = Math.floor(delta / 10) % 100;
    const s = Math.floor(delta / 1000) % 60;
    const m = Math.floor(delta / 60000) % 60;
    const pad = (n: number) => (n + '').padStart(2, '0');
    return `${pad(m)}:${pad(s)}.${pad(hs)}`;
  }, []);

  // ---------- 4) Disconnect & Reset ----------
  const disconnectConversation = useCallback(async () => {
    try {
      setIsConnected(false);
      setIsRecording(false);
      setRealtimeEvents([]);
      setItems([]);
      setMemoryKv({});

      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      const wavStreamPlayer = wavStreamPlayerRef.current;
      if (client) {
        client.disconnect();
      }
      if (wavRecorder && wavRecorder.getStatus() !== 'ended') {
        await wavRecorder.end().catch(console.error);
      }
      if (wavStreamPlayer) {
        await wavStreamPlayer.interrupt();
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }, []);

  useEffect(() => {
    disconnectRef.current = disconnectConversation;
  }, [disconnectConversation]);

  // ---------- 5) Connect to Conversation ----------
  const connectConversation = useCallback(
    async (config = defaultConfig) => {
      try {
        const client = clientRef.current;
        if (!client) {
          console.error('Realtime client not initialized.');
          return;
        }
        if (!import.meta.env.VITE_OPENAI_API_KEY) {
          throw new Error('No API key provided');
        }
        console.log('Attempting connection...');

        try {
          await wavRecorderRef.current.begin();
          await wavStreamPlayerRef.current.connect();
        } catch (error: any) {
          console.error('Audio initialization failed:', error);
          if (error.message.includes('audioWorklet')) {
            throw new Error('AudioWorklet initialization failed. Please check browser settings.');
          }
          throw new Error('Failed to initialize audio components.');
        }

        await client.connect();
        console.log('Connected successfully');
        startTimeRef.current = new Date().toISOString();
        setIsConnected(true);
        setRealtimeEvents([]);
        setItems(client.conversation.getItems() as any);

        const vehicle = selectedCustomer?.vehicles?.[0];

        // Build research context
        const researchContext = researchData ? 
          `\nResearch Context:
           Problem: ${problem || 'No specific problem identified'}
           Research Findings: ${JSON.stringify(researchData, null, 2)}` : '';

        // Build customer context using the utility function
        const customerContext = selectedCustomer ? buildCustomerContext(selectedCustomer) : '\nNo customer selected.';

        // Combine all instructions
        const combinedInstructions = `${baseInstructions}

${customerToolInstructions}

${customerContext}
${researchContext}

Tool Success Handling:
- When a tool returns a success status, the results are immediately available
- For image searches:
  * When you receive a success response, the images are already displayed to the user
  * Do not say you failed to retrieve images if you receive a success response
  * Instead, describe the images that were found and ask if they're helpful
- For customer data:
  * When you receive a success response, the customer data is loaded
  * Reference the data directly instead of saying you're trying to retrieve it
- For diagnostic data:
  * When you receive a success response, proceed with analyzing the data
  * Don't ask for confirmation that the data was retrieved`;

        client.updateSession({ instructions: combinedInstructions });

        // Update memory with research data
        if (researchData) {
          setMemoryKv((prev) => ({
            ...prev,
            research: {
              problem,
              findings: researchData
            }
          }));
        }

        // Send initial greeting
        const greeting = selectedCustomer
          ? `Hello! I'm here to help with ${selectedCustomer.firstName} ${selectedCustomer.lastName}'s appointment${
              vehicle ? ` for their ${vehicle.year} ${vehicle.make} ${vehicle.model}` : ''
            }${researchData ? `. I see there's been some research done regarding: ${problem}` : ''}.`
          : 'Hello! Please select a customer to begin.';
        client.sendUserMessageContent([{ type: 'input_text', text: greeting }]);

        if (client.getTurnDetectionType() === 'server_vad') {
          await wavRecorderRef.current.record((data) => {
            client.appendInputAudio(data.mono);
          });
        }
      } catch (error) {
        console.error('Connection failed:', error);
        if (disconnectRef.current) {
          await disconnectRef.current();
        }
        throw error;
      }
    },
    [selectedCustomer, researchData, problem]
  );

  // ---------- 6) Toggle Connect/Disconnect ----------
  const handleConnect = useCallback(async () => {
    try {
      if (isConnected) {
        console.log('Disconnecting...');
        await disconnectConversation();
      } else {
        console.log('Connecting...');
        await connectConversation();
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect/disconnect');
    }
  }, [isConnected, disconnectConversation, connectConversation]);

  // ---------- 7) Start/Stop Recording ----------
  const startRecording = useCallback(async () => {
    try {
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      const wavStreamPlayer = wavStreamPlayerRef.current;
      if (!client?.isConnected()) {
        console.log('Client not connected, attempting to connect...');
        await connectConversation();
      }
      if (!client?.isConnected()) throw new Error('Failed to establish connection');
      setIsRecording(true);
      if (wavRecorder.getStatus() === 'ended') await wavRecorder.begin();
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
      await wavRecorder.record((data: any) => {
        if (client.isConnected()) {
          client.appendInputAudio(data.mono);
        } else {
          wavRecorder.pause().catch(console.error);
          setIsRecording(false);
          throw new Error('Connection lost during recording');
        }
      });
    } catch (error) {
      console.error('Start recording error:', error);
      setIsRecording(false);
      toast.error('Failed to start recording.');
    }
  }, [connectConversation]);

  const stopRecording = useCallback(async () => {
    try {
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      if (!client?.isConnected()) {
        console.log('Client disconnected, reconnecting...');
        await connectConversation();
      }
      if (wavRecorder.getStatus() === 'recording') await wavRecorder.pause();
      setIsRecording(false);
      if (client?.isConnected()) {
        await client.createResponse();
      } else {
        throw new Error('Client disconnected');
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      setIsRecording(false);
      try {
        if (wavRecorderRef.current.getStatus() === 'recording') {
          await wavRecorderRef.current.pause();
        }
      } catch (e) {
        console.error('Error stopping recorder:', e);
      }
      toast.error('Error processing voice input.');
    }
  }, [connectConversation]);

  // ---------- 8) Auto-reconnect on Disconnect ----------
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
        console.error('Reconnect failed:', e);
        toast.error('Lost connection. Please reconnect manually.');
      }
    };
    client.on('disconnect', handleDisconnect);
    return () => {
      client.off('disconnect', handleDisconnect);
    };
  }, [isRecording, connectConversation]);

  // ---------- 9) Notes: Save, Load, Export, Context ----------
  // Validate note before saving
  const validateNote = (note: NoteEntry): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!note.topic?.trim()) {
      errors.push('Topic is required');
    }
    
    if (!Array.isArray(note.keyPoints) || note.keyPoints.length === 0) {
      errors.push('At least one key point is required');
    }
    
    if (note.tags && note.tags.length > 20) {
      errors.push('Maximum 20 tags allowed');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const saveNote = async (note: NoteEntry) => {
    try {
      const validation = validateNote(note);
      if (!validation.isValid) {
        toast.error(`Validation failed: ${validation.errors.join(', ')}`);
        return null;
      }

      setIsLoadingNotes(true);
      
      // Structure the note data with a content field as required by the server
      const formattedNote: SaveNoteRequest = {
        content: {
          timestamp: new Date().toISOString(),
          topic: note.topic.trim(),
          tags: (note.tags || []).map(tag => tag.trim()).filter(Boolean),
          keyPoints: (note.keyPoints || []).map(point => point.trim()).filter(Boolean),
          codeExamples: note.codeExamples || [],
          resources: (note.resources || []).map(resource => resource.trim()).filter(Boolean),
          images: note.images || []
        },
        conversationId: 'default'
      };

      console.log('Sending note to server:', formattedNote); // Debug log

      const response = await axiosInstance.post('/notes', formattedNote);
      
      console.log('Server response:', response.data); // Debug log
      
      // Reload notes from server to ensure consistency
      await loadNotes();
      
      toast.success('Note saved successfully');
      return response.data;
    } catch (error: unknown) {
      console.error('Save note error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if ('response' in (error as any)) {
        console.error('Error response:', (error as any).response.data);
      }
      toast.error(`Failed to save note: ${errorMessage}`);
      throw error;
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const loadNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const response = await axiosInstance.get('/notes');
      
      console.log('Raw notes response:', response.data); // Debug log
      
      const parsedNotes = response.data
        .map((note: any) => {
          try {
            // Handle both direct and nested content formats
            const noteData = note.content || note;
            const content = typeof noteData === 'string' ? JSON.parse(noteData) : noteData;
            
            const parsedNote = {
              id: note._id,
              timestamp: content.timestamp || note.timestamp || new Date().toISOString(),
              topic: content.topic || 'Untitled Note',
              tags: Array.isArray(content.tags) ? content.tags : [],
              keyPoints: Array.isArray(content.keyPoints) ? content.keyPoints : [],
              codeExamples: Array.isArray(content.codeExamples) ? content.codeExamples : [],
              resources: Array.isArray(content.resources) ? content.resources : [],
              images: Array.isArray(content.images) ? content.images : [],
            };

            console.log('Parsed note:', parsedNote); // Debug log
            return parsedNote;
          } catch (e) {
            console.error('Note parse error:', e, note);
            return null;
          }
        })
        .filter(Boolean);
        
      console.log('Final parsed notes:', parsedNotes); // Debug log
      setNotes(parsedNotes);
      toast.success(`Loaded ${parsedNotes.length} notes`);
    } catch (error: unknown) {
      console.error('Load notes error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to load notes: ${errorMessage}`);
    } finally {
      setIsLoadingNotes(false);
    }
  };

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

  const loadNoteContext = useCallback(
    async (noteId: string) => {
      const selectedNote = notes.find((note) => (note.id || note.timestamp) === noteId);
      if (!selectedNote || !clientRef.current) return;
      const contextMessage = `Previous conversation context:
Topic: ${selectedNote.topic}
Key Points:
${selectedNote.keyPoints.join('\n')}`;
      clientRef.current.sendUserMessageContent([{ type: 'input_text', text: contextMessage }]);
    },
    [notes]
  );

  const handleDeleteNote = async (noteId: string) => {
    try {
      await axiosInstance.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error: unknown) {
      console.error('Delete note error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to delete note: ${errorMessage}`);
    }
  };

  const handleSearchNotes = async (query: string, filter: string) => {
    try {
      setIsLoadingNotes(true);
      const response = await axiosInstance.get('/notes/search', {
        params: { query, filter }
      });
      
      const parsedNotes = response.data
        .map((note: any) => {
          try {
            const content = typeof note.content === 'string' ? JSON.parse(note.content) : note.content;
            return {
              id: note._id,
              timestamp: content.timestamp || note.timestamp || new Date().toISOString(),
              topic: content.topic || 'Untitled Note',
              tags: Array.isArray(content.tags) ? content.tags : [],
              keyPoints: Array.isArray(content.keyPoints) ? content.keyPoints : [],
              codeExamples: Array.isArray(content.codeExamples) ? content.codeExamples : [],
              resources: Array.isArray(content.resources) ? content.resources : [],
              images: Array.isArray(content.images) ? content.images : [],
            };
          } catch (e) {
            console.error('Note parse error:', e, note);
            return null;
          }
        })
        .filter(Boolean);
      
      setNotes(parsedNotes);
    } catch (error: unknown) {
      console.error('Search notes error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to search notes: ${errorMessage}`);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // ---------- 10) Visualization Canvas Rendering ----------
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
      if (clientCanvas) {
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
          WavRenderer.drawBars(clientCanvas, clientCtx, result.values, '#0099ff', 20, 0, 8);
        }
      }
      if (serverCanvas) {
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
          WavRenderer.drawBars(serverCanvas, serverCtx, result.values, '#009900', 20, 0, 8);
        }
      }
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();
    return () => {
      isLoaded = false;
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ---------- 11) Tools & Realtime Events Setup ----------
  useEffect(() => {
    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    client.updateSession({ instructions });
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    // Add tools (set_memory, logs_service, invoice_service, search_images, etc.)
    client.addTool(
      {
        name: 'set_memory',
        description: 'Saves customer data into memory.',
        parameters: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Memory key.' },
            value: { type: ['string', 'object'], description: 'Memory value.' },
          },
          required: ['key', 'value'],
        },
      },
      async ({ key, value }: { key: string; value: any }) => {
        setMemoryKv((prev) => ({
          ...prev,
          [key]: typeof value === 'string' ? value : JSON.stringify(value),
        }));
        return { ok: true };
      }
    );

    const logService = new LogService();
    client.addTool(
      {
        name: 'logs_service',
        description: 'Access system logs.',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['get_logs', 'get_latest', 'get_stats', 'get_by_id'],
              description: 'Log action',
            },
            params: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                startDate: { type: 'string' },
                endDate: { type: 'string' },
                logId: { type: 'string' },
              },
            },
          },
          required: ['action'],
        },
      },
      async ({ action, params }: { action: string; params?: LogQueryParams }) => {
        try {
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
        } catch (error: any) {
          console.error('logs_service error:', error);
          return { error: error.message || 'Unknown error' };
        }
      }
    );

    client.addTool(
      {
        name: 'invoice_service',
        description: 'Manage invoices.',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'get', 'list', 'search', 'vehicles'],
              description: 'Invoice action',
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
                  enum: ['Car', 'Truck', 'Van', 'SUV', 'Other'],
                },
              },
            },
          },
          required: ['action', 'params'],
        },
      },
      async (input: { action: string; params: Record<string, any> }) => {
        try {
          return await invoiceServiceToolRef.current._call(input);
        } catch (error: any) {
          console.error('Invoice service error:', error);
          return `Error: ${error.message || 'Unknown error'}`;
        }
      }
    );

    client.addTool(
      {
        name: 'notes_service',
        description: 'Manage notes for the conversation.',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'get', 'list', 'delete', 'search'],
              description: 'Note action to perform',
            },
            params: {
              type: 'object',
              properties: {
                noteId: { type: 'string' },
                topic: { type: 'string' },
                tags: { 
                  type: 'array',
                  items: { type: 'string' }
                },
                keyPoints: {
                  type: 'array',
                  items: { type: 'string' }
                },
                codeExamples: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      language: { type: 'string' },
                      code: { type: 'string' }
                    }
                  }
                },
                resources: {
                  type: 'array',
                  items: { type: 'string' }
                },
                images: {
                  type: 'array',
                  items: { type: 'string' }
                },
                searchQuery: { type: 'string' },
                searchFilter: { type: 'string' }
              }
            }
          },
          required: ['action'],
        },
      },
      async ({ action, params }: { action: string; params?: any }) => {
        try {
          switch (action) {
            case 'create':
              const savedNote = await saveNote(params);
              return {
                status: 'success',
                message: 'Note created successfully',
                note: savedNote
              };
            
            case 'get':
              if (!params?.noteId) {
                throw new Error('Note ID is required');
              }
              const note = notes.find(n => n.id === params.noteId);
              return {
                status: 'success',
                note: note || null
              };
            
            case 'list':
              await loadNotes();
              return {
                status: 'success',
                notes: notes
              };
            
            case 'delete':
              if (!params?.noteId) {
                throw new Error('Note ID is required');
              }
              await handleDeleteNote(params.noteId);
              return {
                status: 'success',
                message: 'Note deleted successfully'
              };
            
            case 'search':
              if (!params?.searchQuery) {
                throw new Error('Search query is required');
              }
              await handleSearchNotes(params.searchQuery, params.searchFilter || 'all');
              return {
                status: 'success',
                notes: notes
              };
            
            default:
              throw new Error(`Unknown action: ${action}`);
          }
        } catch (error: any) {
          console.error('Notes service error:', error);
          return {
            status: 'error',
            message: error.message || 'Unknown error occurred'
          };
        }
      }
    );

    client.addTool(
      {
        name: 'search_images',
        description: 'Search for images using Serper API.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Image search query' },
            num: { type: 'number', description: 'Number of results to return (optional, defaults to 5)' },
            type: {
              type: 'string',
              enum: ['diagram', 'part', 'repair'],
              description: 'Image type',
            },
          },
          required: ['query'],
        },
      },
      async ({ query, num = 5, type = 'diagram' }: { query: string; num?: number; type?: string }) => {
        try {
          setMemoryKv((prev) => ({
            ...prev,
            last_tool_execution: {
              tool: 'search_images',
              status: 'in_progress',
              timestamp: new Date().toISOString(),
              query,
            }
          }));

          // Format the search request
          const searchRequest: any = {
            query,
            num: num || 5
          };

          // Add vehicle info if available
          if (selectedVehicle?.year && selectedVehicle?.make && selectedVehicle?.model) {
            searchRequest.vehicleInfo = {
              year: selectedVehicle.year.toString(),
              make: selectedVehicle.make,
              model: selectedVehicle.model,
              engine: selectedVehicle.engine || undefined
            };
          }

          console.log('Sending image search request:', searchRequest);
          
          const response = await axiosInstance.post('/serper/images', searchRequest);

          console.log('Image search response:', response.data);

          if (response.data?.images?.length > 0) {
            // Transform the data to match the expected format
            const formattedResults = response.data.images.map((img: any) => ({
              title: img.title || 'Untitled',
              imageUrl: img.link || img.imageUrl,
              thumbnailUrl: img.thumbnail || img.link || '',
              source: img.source || '',
              link: img.link || '',
              relevanceScore: img.relevanceScore || 0
            }));

            console.log('Formatted image results:', formattedResults);

            // Automatically save all images
            const savedImages = await Promise.all(
              formattedResults.map(async (image: ImageSearchResult) => {
                try {
                  const response = await axiosInstance.post('/images', {
                    ...image,
                    timestamp: new Date().toISOString(),
                  });
                  return response.data;
                } catch (error) {
                  console.error('Failed to auto-save image:', error);
                  return null;
                }
              })
            );

            const successfullySaved = savedImages.filter(Boolean).length;
            if (successfullySaved > 0) {
              toast.success(`Automatically saved ${successfullySaved} images`);
            }

            // Set results only if they're different from current results
            setSearchResults(prev => {
              const areResultsDifferent = JSON.stringify(prev) !== JSON.stringify(formattedResults);
              return areResultsDifferent ? formattedResults : prev;
            });
            
            const executionStatus = {
              success: true,
              timestamp: new Date().toISOString(),
              resultCount: formattedResults.length,
              toolName: 'search_images',
              savedCount: successfullySaved
            };

            setMemoryKv(prev => {
              const lastSearch = prev.last_image_search;
              if (lastSearch?.query === query && 
                  JSON.stringify(lastSearch?.results) === JSON.stringify(formattedResults)) {
                return prev;
              }
              return {
                ...prev,
                last_image_search: {
                  query,
                  results: formattedResults,
                  executionStatus
                },
                last_tool_execution: {
                  tool: 'search_images',
                  status: 'success',
                  timestamp: new Date().toISOString(),
                  query,
                  resultCount: formattedResults.length,
                  savedCount: successfullySaved
                }
              };
            });

            const contextMessage = selectedVehicle 
              ? `Found ${formattedResults.length} images for "${query}" related to ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}. Automatically saved ${successfullySaved} images.`
              : `Found ${formattedResults.length} general images for "${query}". Automatically saved ${successfullySaved} images. Note: No vehicle selected, so results may be less specific.`;

            client.sendUserMessageContent([
              {
                type: 'input_text',
                text: `System: Image search successful. ${contextMessage} The images have been loaded and are ready for viewing.`
              }
            ]);

            return {
              status: 'success',
              executionStatus,
              message: contextMessage,
              results: formattedResults
            };
          } 
          
          const noResultsStatus = {
            success: false,
            timestamp: new Date().toISOString(),
            reason: 'no_images_found',
            toolName: 'search_images'
          };

          setMemoryKv((prev) => ({
            ...prev,
            last_tool_execution: {
              tool: 'search_images',
              status: 'no_results',
              timestamp: new Date().toISOString(),
              query
            }
          }));

          const noResultsMessage = selectedVehicle
            ? `No images found for "${query}" related to ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}. Please try a different search term or refine your query.`
            : `No images found for "${query}". Note: No vehicle is currently selected. Selecting a vehicle may help find more relevant results.`;

          client.sendUserMessageContent([
            {
              type: 'input_text',
              text: `System: ${noResultsMessage}`
            }
          ]);

          return {
            status: 'no_results',
            executionStatus: noResultsStatus,
            message: noResultsMessage
          };
        } catch (error: any) {
          console.error('Image search error:', error);
          
          const errorStatus = {
            success: false,
            timestamp: new Date().toISOString(),
            error: error.message || 'Unknown error',
            reason: 'request_failed',
            toolName: 'search_images'
          };

          setMemoryKv((prev) => ({
            ...prev,
            last_tool_execution: {
              tool: 'search_images',
              status: 'error',
              timestamp: new Date().toISOString(),
              query,
              error: error.message || 'Unknown error'
            }
          }));

          const errorMessage = selectedVehicle
            ? `Error searching for images: ${error.message}. Vehicle context: ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
            : `Error searching for images: ${error.message}. Note: No vehicle is currently selected.`;

          client.sendUserMessageContent([
            {
              type: 'input_text',
              text: `System: Image search failed. ${errorMessage}`
            }
          ]);

          return {
            status: 'error',
            executionStatus: errorStatus,
            message: errorMessage
          };
        }
      }
    );

    // Real-time event listener for tool outputs:
    client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
      if (realtimeEvent.event.type === 'function_call_output') {
        const toolName = realtimeEvent.event.name;
        const output = realtimeEvent.event.output;

        setMemoryKv((prev) => {
          const toolAttempts = prev[`${toolName}_attempts`] || 0;
          return {
            ...prev,
            [`last_${toolName}_result`]: output,
            [`${toolName}_attempts`]: toolAttempts + 1,
          };
        });

        if (output.status === 'success') {
          setMemoryKv((prev) => ({
            ...prev,
            [`${toolName}_attempts`]: 0,
          }));

          client.sendUserMessageContent([
            {
              type: 'input_text',
              text: `System: The tool "${toolName}" returned successfully. Data: ${JSON.stringify(output)}`
            }
          ]);
        } else {
          client.sendUserMessageContent([
            {
              type: 'input_text',
              text: `System: The tool "${toolName}" reported an error or no results. Reason: "${output.message}"`
            }
          ]);
        }
      }
    });

    client.on('error', (event: any) => console.error(event));
    client.on('conversation.interrupted', async () => {
      try {
        await wavStreamPlayer.interrupt();
      } catch (error) {
        console.error('Interrupt error:', error);
      }
    });
    client.on('conversation.updated', async ({ item, delta }: any) => {
      try {
        const items = client.conversation.getItems();
        if (delta?.audio) {
          await wavStreamPlayer.add16BitPCM(delta.audio, item.id);
        }
        if (item.status === 'completed' && item.formatted.audio?.length) {
          const wavFile = await WavRecorder.decode(item.formatted.audio, 24000, 24000);
          item.formatted.file = wavFile;
        }
        setItems(items);
      } catch (error) {
        console.error('Error in conversation update:', error);
        // Prevent the error from crashing the application
        toast.error('Error processing audio response');
      }
    });
    setItems(client.conversation.getItems() as RealtimeItemType[]);
    return () => {
      client.reset();
    };
  }, []);

  // ---------- 12) Vehicle Selection Handler ----------
  const handleVehicleSelect = useCallback(
    async (vehicle: Vehicle) => {
      setSelectedVehicle(vehicle);
      setMemoryKv((prev) => ({
        ...prev,
        vehicle: {
          vin: vehicle.vin,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          trim: vehicle.trim,
          engine: vehicle.engine,
          transmission: vehicle.transmission,
          fuelType: vehicle.fuelType,
        },
      }));
      if (clientRef.current?.isConnected()) {
        const vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
        await clientRef.current.sendUserMessageContent([
          {
            type: 'input_text',
            text: `System: Customer has selected a different vehicle: ${vehicleInfo}. Please continue with this new vehicle context.`
          }
        ]);
      }
    },
    [setSelectedVehicle]
  );

  // ---------- 13) Image Handling ----------
  const handleImageClick = (image: ImageSearchResult) => {
    // When an image from the search modal is clicked,
    // set the selected diagram and close the search modal.
    setSelectedDiagram({
      url: image.imageUrl || image.link,
      title: image.title,
      thumbnail: image.thumbnailUrl,
      sourceUrl: image.link,
      fileType: 'image',
      link: image.link,
    });
    setIsImageSearchModalOpen(false);
  };

  const handleSaveImage = async (image: ImageSearchResult) => {
    try {
      const response = await axiosInstance.post('/images', {
        ...image,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('Image save error:', error);
      throw error;
    }
  };

  // Add function to fetch saved images
  const fetchSavedImages = async () => {
    try {
      const response = await axiosInstance.get('/images');
      setSavedImages(response.data);
    } catch (error) {
      console.error('Error fetching saved images:', error);
      toast.error('Failed to load saved images');
    }
  };

  // Add useEffect to load saved images on component mount
  useEffect(() => {
    fetchSavedImages();
  }, []);

  // Add toggle button for saved images
  const toggleSavedImages = () => {
    setShowSavedImages(!showSavedImages);
    if (!showSavedImages) {
      fetchSavedImages();
    }
  };

  // ---------- 14) TSX Return Block ----------
  return (
    <div className="p-4 bg-gray-900 bg-opacity-75 rounded-lg shadow-lg h-[55vh]">
      {/* Controls and Visualization Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">AI Assistant</h2>
        </div>

        {/* Visualization Section */}
        <div className="mb-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg border-l-4 border-blue-500">
          <div className="visualization-section">
            <div className="visualization-entry client">
              <canvas ref={clientCanvasRef} className="w-full h-[5vh]" />
            </div>
            <div className="visualization-entry server">
              <canvas ref={serverCanvasRef} className="w-full h-[12vh]" />
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-section p-4 bg-gray-800 bg-opacity-50 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <Toggle
              defaultValue={false}
              labels={['manual', 'vad']}
              values={['none', 'server_vad']}
              onChange={(_, value) => {
                /* Add your changeTurnEndType logic here */
              }}
            />
            <div className="flex-grow" />
            {isConnected && (
              <Button
                label={isRecording ? 'Release to Send' : 'Push to Talk'}
                buttonStyle={isRecording ? 'alert' : 'regular'}
                disabled={!isConnected}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                icon={isRecording ? X : Zap}
                iconPosition="start"
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
              label={showNotes ? 'Hide Notes' : 'Show Notes'}
              onClick={() => setShowNotes(!showNotes)}
              icon={Edit}
              buttonStyle="regular"
            />
            <Button
              label="Images"
              icon={Search}
              onClick={() => setIsImageSearchModalOpen(true)}
              buttonStyle="regular"
            />
            <Button
              label={showSavedImages ? 'Hide Saved' : 'Show Saved'}
              icon={Save}
              onClick={toggleSavedImages}
              buttonStyle="regular"
            />
            <Button
              label={showLogViewer ? 'Hide Logs' : 'Show Logs'}
              icon={showLogViewer ? X : Search}
              onClick={() => setShowLogViewer(!showLogViewer)}
              buttonStyle="regular"
            />
          </div>
        </div>
      </div>

      {/* Image Search Results Section */}
      <div className="mt-6">
        <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border-l-4 border-purple-500 max-h-[500px] overflow-y-auto">
          <h3 className="text-2xl font-semibold text-white mb-4 sticky top-0 bg-gray-800 bg-opacity-90 backdrop-blur-sm py-2 z-10">Image Search Results</h3>
          <div className="space-y-4">
            {!showSavedImages && searchResults.map((result, index) => (
              <div 
                key={index}
                className="bg-gray-900 rounded-lg p-2 cursor-pointer hover:bg-gray-800"
                onClick={() => {
                  setCurrentImageIndex(index);
                  setSelectedDiagram({
                    url: result.imageUrl,
                    title: result.title,
                    thumbnail: result.thumbnailUrl,
                    sourceUrl: result.link,
                    fileType: 'image',
                    link: result.link
                  });
                }}
              >
                <div className="relative w-full h-48">
                  <img
                    src={getImageUrl(result.imageUrl || result.thumbnailUrl || '')}
                    alt={result.title}
                    className="w-full h-full object-contain rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (result.thumbnailUrl) {
                        target.src = getImageUrl(result.thumbnailUrl);
                      }
                    }}
                  />
                </div>
                <p className="mt-2 text-white text-sm truncate">{result.title}</p>
                <div className="flex justify-end gap-2 mt-2">
                  {result.link && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(result.link, '_blank');
                      }}
                      className="p-1 text-white hover:bg-gray-700 rounded"
                      title="View Source"
                    >
                      <ExternalLink size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {showSavedImages && savedImages.map((image, index) => (
              <div 
                key={index}
                className="bg-gray-900 rounded-lg p-2 cursor-pointer hover:bg-gray-800"
                onClick={() => handleImageClick(image)}
              >
                <div className="relative w-full h-48">
                  <img
                    src={getImageUrl(image.imageUrl)}
                    alt={image.title}
                    className="w-full h-full object-contain rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (image.thumbnailUrl) {
                        target.src = getImageUrl(image.thumbnailUrl);
                      }
                    }}
                  />
                </div>
                <p className="mt-2 text-white text-sm truncate">{image.title}</p>
                <p className="text-gray-400 text-xs">Saved: {new Date(image.timestamp).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Component */}
      <Notes
        notes={notes}
        onSaveNote={saveNote}
        onDeleteNote={handleDeleteNote}
        onSearchNotes={handleSearchNotes}
        onExportNotes={exportNotes}
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        isLoading={isLoadingNotes}
      />

      {/* Image Search Modal */}
      {isImageSearchModalOpen && (
        <ImageSearchModal
          isOpen={isImageSearchModalOpen}
          onClose={() => setIsImageSearchModalOpen(false)}
          searchResults={searchResults}
          onImageClick={handleImageClick}
          onSaveImage={handleSaveImage}
        />
      )}

      {/* Image View Modal */}
      {selectedDiagram && (
        <Imagemodal
          open={!!selectedDiagram}
          onClose={() => setSelectedDiagram(null)}
        >
          <div className="flex flex-col items-center">
            <img 
              src={getImageUrl(selectedDiagram.url ?? selectedDiagram.thumbnail ?? '')}
              alt={selectedDiagram.title}
              className="max-w-[100vw] max-h-[100vh] object-contain cursor-pointer"
              onClick={() => {
                if (window.electron) {
                  const imageUrl = selectedDiagram.url || selectedDiagram.thumbnail || selectedDiagram.link || '';
                  const proxiedUrl = getImageUrl(imageUrl);
                  window.open(proxiedUrl, '_blank', 'nodeIntegration=no,width=1200,height=900');
                }
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (selectedDiagram.thumbnail) {
                  target.src = getImageUrl(selectedDiagram.thumbnail);
                } else if (selectedDiagram.link) {
                  target.src = getImageUrl(selectedDiagram.link);
                } else {
                  target.style.display = 'none';
                  const placeholder = document.createElement('div');
                  placeholder.className = 'h-96 flex items-center justify-center bg-gray-700';
                  placeholder.innerHTML = '<div class="text-white">[Image Unavailable]</div>';
                  target.parentElement?.appendChild(placeholder);
                }
              }}
            />
            <p className="mt-4 text-xl">{selectedDiagram.title}</p>
          </div>
        </Imagemodal>
      )}

      {/* Log Viewer */}
      {showLogViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">System Logs</h3>
              <button
                onClick={() => setShowLogViewer(false)}
                className="text-gray-400 hover:text-white text-3xl"
              >
                ×
              </button>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <LogViewer logService={new LogService()} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;
