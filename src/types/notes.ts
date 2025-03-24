import type { ItemType as RealtimeItemType } from "@openai/realtime-api-beta/dist/lib/client";
import { RealtimeEvent } from "./realtime";

// Note related types
export interface NoteEntry {
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
  images?: string[];
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

export interface Note {
  id?: string;
  timestamp: number;
  topic: string;
  keyPoints: string[];
  codeExamples?: { code: string }[];
}