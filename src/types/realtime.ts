// Realtime related types
export interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

export interface ItemType {
  id: string;
  type: string;
  role: 'user' | 'assistant' | 'system';
  status: 'pending' | 'completed' | 'error';
  metadata?: Record<string, any>;
  formatted: {
    text?: string;
    transcript?: string;
    tool?: any;
    audio?: any;
    file?: any;
  };
} 