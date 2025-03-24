import axiosInstance from './../../../utils/axiosConfig'


export interface Message {
  role: string;
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
}

export async function createChatCompletion(request: ChatCompletionRequest) {
  try {
    const response = await axiosInstance.post('/agent/chat/completions', request);
    return response.data;
  } catch (error) {
    console.error('Error creating chat completion:', error);
    throw error;
  }
} 