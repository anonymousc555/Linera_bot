import { ApiConfig } from '../types';

/**
 * Sends a message to the Lyzr Agent API.
 * 
 * Endpoint: POST /v3/inference/chat/
 * Headers: 
 *  - Content-Type: application/json
 *  - x-api-key: <api_key>
 * 
 * Body:
 * {
 *   "user_id": string,
 *   "agent_id": string,
 *   "session_id": string,
 *   "message": string
 * }
 */
export const sendMessageToApi = async (
  message: string,
  config: ApiConfig,
  sessionId: string,
  userId: string
): Promise<string> => {
  const { baseUrl, apiKey, agentId } = config;

  if (!baseUrl || !apiKey || !agentId) {
    throw new Error("Missing API configuration (URL, Key, or Agent ID)");
  }

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        user_id: userId,
        agent_id: agentId,
        session_id: sessionId,
        message: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Lyzr response usually contains a 'response' field with the text
    return data.response || JSON.stringify(data);
  } catch (error) {
    console.error("Failed to send message", error);
    throw error;
  }
};