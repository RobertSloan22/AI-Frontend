import axiosInstance from './../../../utils/axiosConfig'


export async function createSession() {
  try {
    const response = await axiosInstance.get('/agent/session');
    const sessionData = response.data;
    
    if (!sessionData?.client_secret?.value) {
      throw new Error('No client secret received from session creation');
    }

    return sessionData;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}