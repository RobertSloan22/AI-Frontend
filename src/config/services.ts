export const SERVICES = {
  // Main API Services
  MAIN_API: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  ELIZA_CHAT: import.meta.env.VITE_ELIZA_URL || 'http://localhost:3500',
  AGENT_SERVICE: import.meta.env.VITE_AGENT_URL || 'http://localhost:3001',
  
  // Real-time Services
  RELAY_SERVER: import.meta.env.VITE_RELAY_SERVER || 'http://localhost:8081',
  OPENAI_REALTIME: 'https://api.openai.com/v1/realtime',
  
  // Logging and Monitoring
  LOG_SERVICE: import.meta.env.VITE_LOG_URL || 'http://localhost:3005',
  LOG_API: import.meta.env.VITE_LOG_API_URL || 'http://localhost:4000',
  
  // AI and ML Services
  LLM_SERVICE: import.meta.env.VITE_LLM_URL || 'http://192.168.56.1:1234',
  OPENAI_API: 'https://api.openai.com',
  
  // Development
  DEV_SERVER: 'http://localhost:5173',
  
  // External APIs
  GOOGLE_API: 'https://www.googleapis.com',
  CARMD_API: 'https://api.carmd.com',
  GOOGLE_IMAGES_API: 'https://google-images5.p.rapidapi.com'
} as const;

// Websocket URLs
export const WS_ENDPOINTS = {
  RELAY: (url = SERVICES.RELAY_SERVER) => url.replace('http', 'ws'),
  OPENAI: (url = SERVICES.OPENAI_API) => url.replace('http', 'wss'),
} as const;

// API Endpoints for specific services
export const API_ENDPOINTS = {
  ELIZA: {
    SEND_MESSAGE: (agentId: string) => `${SERVICES.ELIZA_CHAT}/api/${agentId}/message`,
    CHECK_STATUS: () => `${SERVICES.ELIZA_CHAT}/status`,
  },
  OPENAI: {
    CREATE_SESSION: `${SERVICES.OPENAI_API}/v1/realtime/sessions`,
    CHAT_COMPLETION: `${SERVICES.OPENAI_API}/v1/chat/completions`,
  },
  LOGS: {
    GET_LOGS: `${SERVICES.LOG_SERVICE}/api/logs`,
    LATEST: `${SERVICES.LOG_API}/api/latest-log`,
  },
  AGENT: {
    MESSAGE: `${SERVICES.AGENT_SERVICE}/agent/message`,
  }
} as const;

// CSP (Content Security Policy) Sources
export const CSP_SOURCES = {
  DEFAULT: ["'self'"],
  CONNECT: [
    "'self'",
    SERVICES.RELAY_SERVER,
    SERVICES.ELIZA_CHAT,
    SERVICES.AGENT_SERVICE,
    SERVICES.LOG_SERVICE,
    SERVICES.LOG_API,
    SERVICES.OPENAI_API,
    "ws://localhost:*",
    "wss://localhost:*",
    "http://localhost:*",
    "https://localhost:*",
    "http://127.0.0.1:*",
    "https://127.0.0.1:*",
    "https://*.openai.com",
    "wss://*.openai.com",
  ],
  SCRIPT: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:", "'wasm-unsafe-eval'"],
  STYLE: ["'self'", "'unsafe-inline'"],
  IMG: ["'self'", "data:", "blob:", "https://*", "http://*"],
  MEDIA: ["'self'", "blob:", "mediastream:"],
  WORKER: ["'self'", "blob:"],
  CHILD: ["'self'", "blob:"],
} as const;

// CORS Configuration
export const CORS_CONFIG = {
  ORIGINS: [
    SERVICES.DEV_SERVER,
    SERVICES.ELIZA_CHAT,
    'app://*',
    'file://*',
    'electron://*'
  ],
  METHODS: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
  CREDENTIALS: true,
} as const; 