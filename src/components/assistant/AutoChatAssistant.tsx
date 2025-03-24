import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  FC
} from 'react';
import { toast } from 'react-toastify';
import { RealtimeEvent } from '@your/realtime-sdk'; // example import, adjust as needed
import axios from 'axios';

// ---------------------------------------------------------------------------
//  Helper imports or placeholder definitions for code used within
//    (Make sure you adjust or replace these with your actual imports)
// ---------------------------------------------------------------------------
import { WavRecorder, WavRenderer } from './audioStuff'; // adjust as needed
import {
  RealtimeClient,
  RealtimeItemType,
  RealtimeEvent as RealtimeEventType
} from './realtimeClient'; // adjust as needed
import LogService, { LogQueryParams } from './LogService'; // custom log service
import { invoiceServiceToolRef } from './InvoiceService'; // custom invoice service
import { defaultConfig } from './defaultConfig'; // wherever you define your config

// Example axios instance if needed
const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Vehicle {
  _id?: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine?: string;
  transmission?: string;
  fuelType?: string;
  licensePlate?: string;
  color?: string;
  mileage?: number;
  turbocharged?: boolean;
  isAWD?: boolean;
  is4x4?: boolean;
  status?: string;
  notes?: string;
}

interface CustomerInfo {
  _id?: string;
  id?: string; // depending on your DB, you might only have _id
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  workphoneNumber?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  notes?: string;
  preferredContact?: 'email' | 'phone' | 'sms';
  vehicles: Vehicle[];
}

interface NoteEntry {
  id?: string;
  timestamp: string;
  topic: string;
  tags: string[];
  keyPoints: string[];
  codeExamples?: { language: string; code: string }[];
  resources?: string[];
}

// Used by various image calls
interface ImageSearchResult {
  title: string;
  link: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

// Basic shape of your usage logs
interface ApiLogEntry {
  timestamp: string;
  type: string;
  data: any;
}

// ---------------------------------------------------------------------------
// RefactoredConversationComponent
// ---------------------------------------------------------------------------
const AutoChatAssistant: FC = () => {
  // -------------------------------------------------------------------------
  //  State & Refs
  // -------------------------------------------------------------------------
  const [selectedDiagram, setSelectedDiagram] = useState<{
    url: string;
    title: string;
    thumbnail?: string;
    sourceUrl?: string;
    fileType: string;
  } | null>(null);

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  // Real-time events for logs
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEventType[]>([]);
  const [items, setItems] = useState<RealtimeItemType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(true);

  // Data references
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [memoryKv, setMemoryKv] = useState<Record<string, any>>({});
  const [activeContextId, setActiveContextId] = useState<string | null>(null);

  // Audio / Canvas references
  const clientCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const eventsScrollRef = useRef<HTMLDivElement | null>(null);
  const eventsScrollHeightRef = useRef(0);

  // Audio engine references
  const wavRecorderRef = useRef<any>(null);
  const wavStreamPlayerRef = useRef<any>(null);

  // The main RealtimeClient
  const clientRef = useRef<any>(null);
  const disconnectRef = useRef<() => Promise<void>>();
  const startTimeRef = useRef<string>('');

  // Tools references
  const logServiceRef = useRef(new LogService());

  // Synthetic instructions. Adjust as needed for your scenario.
  const instructions = `
You are an AI assistant named "Atlas" helping with automotive repairs. 
You have access to multiple tools for logging, searching notes, etc.
Keep your responses relevant and refer to the available tools if needed.
`;

  // -------------------------------------------------------------------------
  //  1. Load Customers (Consolidated)
  // -------------------------------------------------------------------------
  const loadCustomers = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/customers/all');
      console.log('📚 Customers from DB:', response.data);

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

      console.log('📝 Parsed customers:', parsedCustomers);
      setCustomers(parsedCustomers);
    } catch (error) {
      console.error('❌ Failed to load customers:', error);
      toast.error('Failed to load customers');
    }
  }, []);

  // Called on mount
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // -------------------------------------------------------------------------
  //  2. Update Session Instructions (Centralized)
  // -------------------------------------------------------------------------
  const updateSessionInstructions = useCallback(() => {
    const client = clientRef.current;
    if (!client) return;

    let customerContext = 'No customer selected.';
    if (selectedCustomer) {
      const first = selectedCustomer.firstName;
      const last = selectedCustomer.lastName;
      customerContext = `Currently assisting customer: ${first} ${last}`;
    }

    let vehicleContext = '';
    if (selectedVehicle) {
      vehicleContext = `Vehicle: ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`;
    }

    const mergedInstructions = `
${instructions}
${customerContext}
${vehicleContext}
    `;
    client.updateSession({ instructions: mergedInstructions });
  }, [selectedCustomer, selectedVehicle, instructions]);

  // Re-run instructions update whenever selection changes
  useEffect(() => {
    updateSessionInstructions();
  }, [selectedCustomer, selectedVehicle, updateSessionInstructions]);

  // -------------------------------------------------------------------------
  //  3. Connect/Disconnect Handling (Refactored)
  // -------------------------------------------------------------------------
  // This is the single function that does all "connect" logic
  const connectConversation = useCallback(
    async (config = defaultConfig) => {
      try {
        const client = clientRef.current;
        if (!client) {
          console.error('Client ref is not initialized.');
          return;
        }

        // Make sure you have your API key if needed
        const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_KEY || '';
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
            throw new Error(
              'AudioWorklet initialization failed. Please check browser settings and reload.'
            );
          }
          throw new Error(
            'Failed to initialize audio components. Please check browser permissions.'
          );
        }

        // Connect the realtime client
        await client.connect();
        console.log('Connected successfully');

        // Update state
        startTimeRef.current = new Date().toISOString();
        setIsConnected(true);
        setRealtimeEvents([]);
        setItems(client.conversation.getItems() as any);

        // If there's a selected customer, add context for them
        const vehicle = selectedCustomer?.vehicles?.[0];
        const customerContext = selectedCustomer
          ? `\nCurrently assisting customer: ${selectedCustomer.firstName} ${selectedCustomer.lastName}
             Email: ${selectedCustomer.email || 'Not provided'}
             Phone: ${selectedCustomer.phoneNumber || 'Not provided'}
             Vehicle: ${
               vehicle
                 ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin})`
                 : 'No vehicle information'
             }
             Please keep this customer's information in context for our conversation.`
          : '\nNo customer currently selected. You can help select a customer using the customer_data tool.';

        // Merge final instructions and update session
        client.updateSession({
          instructions: instructions + customerContext
        });

        // Send initial greeting
        const greeting = selectedCustomer
          ? `Hello! I'm here to help with ${selectedCustomer.firstName} ${selectedCustomer.lastName}'s appointment${
              vehicle
                ? ` for their ${vehicle.year} ${vehicle.make} ${vehicle.model}`
                : ''
            }.`
          : 'Hello! Please select a customer to begin.';

        client.sendUserMessageContent([
          { type: 'input_text', text: greeting }
        ]);

        // Start VAD if needed
        if (client.getTurnDetectionType() === 'server_vad') {
          await wavRecorderRef.current.record((data: any) => {
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
    [selectedCustomer, instructions]
  );

  // Disconnect (same as before)
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

  // Store the disconnect function in a ref
  useEffect(() => {
    disconnectRef.current = disconnectConversation;
  }, [disconnectConversation]);

  // A single callback to toggle connection on/off
  const handleConnect = useCallback(async () => {
    try {
      if (isConnected) {
        console.log('Disconnecting...');
        await disconnectConversation();
      } else {
        console.log('Connecting...');
        await connectConversation(); // Use our unified connect
      }
    } catch (error) {
      console.error('Connection handling error:', error);
      toast.error('Failed to connect/disconnect');
    }
  }, [isConnected, disconnectConversation, connectConversation]);

  // -------------------------------------------------------------------------
  //  4. Consolidated Vehicle Change Handling
  // -------------------------------------------------------------------------
  const handleVehicleSelect = useCallback(
    async (vehicle: Vehicle) => {
      setSelectedVehicle(vehicle);

      // Update memory
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
          fuelType: vehicle.fuelType
        }
      }));

      // Notify the AI about the vehicle change (only if connected)
      if (clientRef.current?.isConnected()) {
        const vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
        await clientRef.current.sendUserMessageContent([
          {
            type: 'input_text',
            text: `System: Customer has selected a different vehicle: ${vehicleInfo}. 
Please acknowledge this change and continue with the new vehicle context.`,
            metadata: {
              is_context: true
            }
          }
        ]);
      }
    },
    []
  );

  // -------------------------------------------------------------------------
  //  5. Recording Start / Stop
  // -------------------------------------------------------------------------
  const startRecording = useCallback(async () => {
    try {
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      const wavStreamPlayer = wavStreamPlayerRef.current;

      // Check connection
      if (!client.isConnected()) {
        console.log('Client not connected, attempting to connect...');
        await connectConversation();
      }
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

      await wavRecorder.record((data: any) => {
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

  // -------------------------------------------------------------------------
  // Auto-reconnect if disconnected
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  //  6. Notes: Saving & Loading
  // -------------------------------------------------------------------------
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

      setNotes((prev) => [...prev, formattedNote.content as NoteEntry]);
      return response.data;
    } catch (error: any) {
      console.error('Failed to save note:', error);
      if ('response' in error) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  };

  const loadNotes = async () => {
    try {
      const response = await axiosInstance.get('/notes');
      console.log('📚 Raw notes from DB:', response.data);

      // Parse the notes properly
      const parsedNotes = response.data
        .map((note: any) => {
          try {
            // If note.content is a string, parse it
            const content =
              typeof note.content === 'string'
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
        })
        .filter(Boolean);

      console.log('📝 Parsed notes:', parsedNotes);
      setNotes(parsedNotes);
    } catch (error) {
      console.error('❌ Failed to load notes:', error);
    }
  };

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

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

      setActiveContextId(noteId);
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
    },
    [notes]
  );

  // -------------------------------------------------------------------------
  //  7. Additional Tools & Effects Setup
  // -------------------------------------------------------------------------
  // This useEffect runs once to set up the RealtimeClient and tools
  useEffect(() => {
    // Initialize references
    wavRecorderRef.current = new WavRecorder({}); // pass your config
    wavStreamPlayerRef.current = new WavRenderer({}); // pass your config
    clientRef.current = new RealtimeClient({}); // pass your config

    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const logService = logServiceRef.current;

    // Provide default instructions & transcription
    client.updateSession({ instructions });
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    // Add various tools to the client. (These are mostly from your original code.)
    // -----------------------------------------------------------------------
    client.addTool(
      {
        name: 'set_memory',
        description: 'Saves the customers data into memory for use helping the technician.',
        parameters: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'The key of the memory value. Use lowercase and underscores.'
            },
            value: {
              type: ['string', 'object'],
              description: 'Value can be a string or an object containing conversation data'
            }
          },
          required: ['key', 'value']
        }
      },
      async ({ key, value }: { key: string; value: any }) => {
        setMemoryKv((prev) => ({
          ...prev,
          [key]: typeof value === 'string' ? value : JSON.stringify(value)
        }));
        return { ok: true };
      }
    );

    // Example: customer_data tool
    client.addTool(
      {
        name: 'customer_data',
        description:
          'Access and manage customer information. Can search, view details, and create new customers.',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'search',
                'get_customer_details',
                'get_customer_vehicles',
                'get_customer_history',
                'create_customer'
              ],
              description:
                'Action to perform (search/get_customer_details/get_customer_vehicles/get_customer_history/create_customer)'
            },
            params: {
              type: 'object',
              properties: {
                searchTerm: { type: 'string' },
                customerId: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                phoneNumber: { type: 'string' },
                notes: { type: 'string' }
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
        setApiLogs((prev) => [...prev, logEntry]);

        // Example minimal usage (adjust to match your server)
        try {
          switch (input.action) {
            case 'search':
              const searchResponse = await axiosInstance.get('/customers/search', {
                params: { term: input.params.searchTerm }
              });
              return { status: 'success', data: searchResponse.data };

            case 'get_customer_details':
              if (!input.params.customerId) {
                throw new Error('Missing customerId');
              }
              const detailsResponse = await axiosInstance.get(
                `/customers/${input.params.customerId}`
              );
              return { status: 'success', data: detailsResponse.data };

            case 'create_customer':
              if (!input.params.firstName || !input.params.lastName) {
                throw new Error('First and last name are required');
              }
              const customerData = {
                customerData: {
                  firstName: input.params.firstName,
                  lastName: input.params.lastName,
                  email: input.params.email || '',
                  phoneNumber: input.params.phoneNumber || '',
                  notes: input.params.notes || ''
                },
                vehicleData: {}
              };
              const createResponse = await axiosInstance.post('/customers', customerData);
              return { status: 'success', data: createResponse.data };

            default:
              return {
                status: 'error',
                message: `Unhandled action type: ${input.action}`
              };
          }
        } catch (error: any) {
          console.error('customer_data tool error:', error);
          return {
            status: 'error',
            message: error?.response?.data?.error || 'Failed to run customer_data',
            details: error.message
          };
        }
      }
    );

    // Example: logs_service tool
    client.addTool(
      {
        name: 'logs_service',
        description:
          'Access and analyze system logs including sensor data, temperatures, battery levels, etc.',
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
                page: { type: 'number' },
                limit: { type: 'number' },
                startDate: { type: 'string' },
                endDate: { type: 'string' },
                logId: { type: 'string' }
              }
            }
          },
          required: ['action']
        }
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
        } catch (error) {
          console.error('logs_service tool error:', error);
          return {
            error: error instanceof Error ? error.message : 'Unknown logs_service error'
          };
        }
      }
    );

    // Example: invoice_service tool
    client.addTool(
      {
        name: 'invoice_service',
        description: 'Manage invoices including creation, updates, and retrieval of invoice info.',
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
                }
              }
            }
          },
          required: ['action', 'params']
        }
      },
      async (input: { action: string; params: Record<string, any> }) => {
        try {
          // Forward to your invoiceServiceToolRef
          return await invoiceServiceToolRef.current._call(input);
        } catch (error) {
          console.error('Invoice service error:', error);
          return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }
    );

    // Example: search_images tool
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
            setMemoryKv((prev) => ({
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
              client.sendUserMessageContent([
                {
                  type: 'input_text',
                  text: `✓ Found ${results.length} images for "${query}". The images are now displayed in the results panel.`
                }
              ]);
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

          // No results
          await client.sendUserMessageContent([
            {
              type: 'input_text',
              text: `No images found for "${query}".`
            }
          ]);
          return { status: 'error', message: 'No images found' };
        } catch (error) {
          await client.sendUserMessageContent([
            {
              type: 'input_text',
              text: `Failed to search for images: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`
            }
          ]);
          console.error('Image search error:', error);
          return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Failed to search for images'
          };
        }
      }
    );

    // Handle real-time events from the client
    client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents((prev) => {
        const lastEvent = prev[prev.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          lastEvent.count = (lastEvent.count || 0) + 1;
          return [...prev.slice(0, -1), lastEvent];
        } else {
          return [...prev, realtimeEvent];
        }
      });

      if (realtimeEvent.event.type === 'function_call_output') {
        const output = realtimeEvent.event.output;
        const toolName = realtimeEvent.event.name;

        // Update tool attempts in memory
        setMemoryKv((prev) => {
          const toolAttempts = prev[`${toolName}_attempts`] || 0;
          return {
            ...prev,
            [`last_${toolName}_result`]: output,
            [`${toolName}_attempts`]: toolAttempts + 1
          };
        });

        // Send feedback about tool execution
        client.sendUserMessageContent([
          {
            type: 'input_text',
            text: `Tool ${toolName} execution attempt ${
              memoryKv[`${toolName}_attempts`] || 1
            }: ${output.status === 'success' ? 'Succeeded' : 'Failed'}. ${JSON.stringify(output)}`
          }
        ]);

        // Reset attempts if successful
        if (output.status === 'success') {
          setMemoryKv((prev) => ({
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
        const wavFile = await WavRecorder.decode(item.formatted.audio, 24000, 24000);
        item.formatted.file = wavFile;
      }
      setItems(items);
    });

    // Load the conversation items if any exist
    setItems(client.conversation.getItems() as RealtimeItemType[]);

    // Cleanup
    return () => {
      client.reset();
    };
  }, [instructions]);

  // -------------------------------------------------------------------------
  //  8. Visualization Canvas (unchanged from original)
  // -------------------------------------------------------------------------
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

      // Client (input) visualization
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

      // Server (output) visualization
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

  // -------------------------------------------------------------------------
  //  9. Additional UI / rendering
  // -------------------------------------------------------------------------
  // Example function for handling image click
  const handleImageClick = (image: ImageSearchResult) => {
    setSelectedDiagram({
      url: image.imageUrl || image.link,
      title: image.title,
      thumbnail: image.thumbnailUrl,
      sourceUrl: image.link,
      fileType: 'image'
    });
    // setIsImageModalOpen(true); // if you have a modal
  };

  // Example function for saving an image
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

  // -------------------------------------------------------------------------
  //  10. Render UI
  // -------------------------------------------------------------------------
  return (
    <div>
      <h1>Refactored Conversation Component</h1>
      <p>Connection status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleConnect}>
        {isConnected ? 'Disconnect' : 'Connect'}
      </button>

      <hr />

      <h2>Customer Selection</h2>
      <ul>
        {customers.map((customer) => {
          const isSelected =
            selectedCustomer?._id === customer._id ||
            selectedCustomer?.id === customer.id;
          return (
            <li
              key={customer._id || customer.id}
              style={{ fontWeight: isSelected ? 'bold' : 'normal' }}
              onClick={() => setSelectedCustomer(customer)}
            >
              {customer.firstName} {customer.lastName}
            </li>
          );
        })}
      </ul>

      {selectedCustomer && (
        <>
          <h3>Vehicles for {selectedCustomer.firstName}</h3>
          <ul>
            {selectedCustomer.vehicles.map((vehicle) => {
              const isSelected = vehicle.vin === selectedVehicle?.vin;
              return (
                <li
                  key={vehicle.vin}
                  style={{ fontWeight: isSelected ? 'bold' : 'normal' }}
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  {vehicle.year} {vehicle.make} {vehicle.model} (VIN: {vehicle.vin})
                </li>
              );
            })}
          </ul>
        </>
      )}

      <hr />

      <div>
        <button onClick={startRecording} disabled={!isConnected || isRecording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isConnected || !isRecording}>
          Stop Recording
        </button>
      </div>

      <hr />

      <h2>Notes</h2>
      <button onClick={() => setIsNotesModalOpen(true)}>View Notes</button>
      <button onClick={exportNotes}>Export Notes</button>

      <hr />

      <h2>Search Results</h2>
      {searchResults && searchResults.length > 0 && (
        <div>
          {searchResults.map((img: any, idx: number) => (
            <div key={idx} onClick={() => handleImageClick(img)}>
              <img
                src={img.thumbnail}
                alt={img.title}
                style={{ width: '100px', cursor: 'pointer' }}
              />
              <p>{img.title}</p>
            </div>
          ))}
        </div>
      )}

      {/* Example placeholder for canvases */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ width: '300px', height: '100px' }}>
          <canvas ref={clientCanvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
        <div style={{ width: '300px', height: '100px' }}>
          <canvas ref={serverCanvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>

      {/* Example: Notes modal or anything else you need */}
      {isNotesModalOpen && (
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h2>Notes</h2>
          <ul>
            {notes.map((note) => (
              <li key={note.id || note.timestamp}>
                <strong>{note.topic}</strong> - {note.timestamp}
                <button onClick={() => loadNoteContext(note.id || note.timestamp)}>
                  Load as Context
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => setIsNotesModalOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AutoChatAssistant;
