import axios from 'axios';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import axiosInstance from '../../../utils/axiosConfig';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface SavedConversation {
  _id: string;
  timestamp: string;
  title: string;
  items: Array<{
    id?: string;
    type?: string;
    role?: 'user' | 'assistant' | 'system';
    status?: 'pending' | 'completed' | 'error';
    metadata?: Record<string, any>;
    formatted?: {
      text?: string;
      transcript?: string;
      tool?: any;
      audio?: any;
      file?: any;
    };
  }>;
  realtimeEvents: RealtimeEvent[];
  lastExchange: {
    userMessage: string;
    assistantMessage: string;
  };
  keyPoints: string[];
}

export class ConversationService {
  async saveConversation(conversationData: Partial<SavedConversation>) {
    try {
      const response = await axiosInstance.post('/conversations', conversationData);
      return response.data;
    } catch (error) {
      console.error('Failed to save conversation:', error);
      throw error;
    }
  }

  async getRecentConversations(limit = 10) {
    try {
      const response = await axiosInstance.get(`/conversations/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get recent conversations:', error);
      throw error;
    }
  }

  async getConversationById(id: string) {
    try {
      const response = await axiosInstance.get(`/conversations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get conversation:', error);
      throw error;
    }
  }

  async getNotes() {
    try {
      const response = await axiosInstance.get('/notes');
      return response.data;
    } catch (error) {
      console.error('Failed to get notes:', error);
      throw error;
    }
  }

  async exportNotes() {
    try {
      const response = await axiosInstance.get('/notes/export');
      return response.data;
    } catch (error) {
      console.error('Failed to export notes:', error);
      throw error;
    }
  }
}
