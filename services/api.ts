import { ApiConfig, ChatResponse } from '../types';

const BASE_URL = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';

export const sendMessageToApi = async (
  message: string,
  userId: string,
  sessionId: string,
  config: ApiConfig
): Promise<string> => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
      },
      body: JSON.stringify({
        user_id: userId,
        agent_id: config.agentId,
        session_id: sessionId,
        message: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data: ChatResponse = await response.json();
    
    // Handle Lyzr response format
    // Sometimes it returns { "response": "text" } or just the text if configured differently
    return data.response || data.message || JSON.stringify(data);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
