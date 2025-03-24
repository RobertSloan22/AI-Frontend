import { ipcMain } from 'electron';
import OpenAI from 'openai';

const openai = new OpenAI();

export function setupApiHandlers() {
  // Handle chat completions
  ipcMain.handle('chat-completions', async (_, { model, messages }) => {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages,
      });
      return completion;
    } catch (error: any) {
      console.error("Error in chat completions:", error);
      throw error;
    }
  });

  // Handle session creation
  ipcMain.handle('create-session', async () => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/realtime/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-realtime-preview-2024-12-17",
          }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in session creation:", error);
      throw error;
    }
  });
} 