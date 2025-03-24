import { ResearchResponse } from '../../context/ResearchContext';
import axiosInstance from '../../utils/axiosConfig';

interface VehicleInfo {
  year: number;
  make: string;
  model: string;
  vin: string;
}

export class VectorStorageService {
  constructor() {
    console.log('Initializing vector storage service');
  }

  async storeResearchData(researchData: ResearchResponse, vehicleInfo: VehicleInfo, problem: string) {
    try {
      if (!researchData || !vehicleInfo || !problem) {
        throw new Error('Missing required data for storage');
      }

      const response = await axiosInstance.post('/vector-store/store', {
        researchData,
        vehicleInfo,
        problem
      });

      return response.data.success;
    } catch (error) {
      console.error('Error storing research data in vector store:', error);
      throw error;
    }
  }

  async queryVectorStore(query: string, limit: number = 5) {
    try {
      const response = await axiosInstance.post('/vector-store/query', {
        query,
        limit
      });

      return response.data.results;
    } catch (error) {
      console.error('Error querying vector store:', error);
      throw error;
    }
  }

  async testConnections() {
    try {
      console.log('Testing vector store connection...');
      // First test OpenAI connection
      console.log('Testing OpenAI connection...');
      const openaiResponse = await axiosInstance.get('/embeddings/test');
      if (openaiResponse.data.success) {
        console.log('OpenAI connection successful');
      }

      // Then test Supabase connection
      console.log('Testing Supabase connection...');
      const supabaseResponse = await axiosInstance.get('/vector-store/test');
      if (supabaseResponse.data.success) {
        console.log('Supabase connection successful');
      }
      return supabaseResponse.data.success;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  }
}

export const vectorStorageService = new VectorStorageService(); 