export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ApiConfig {
  apiKey: string;
  agentId: string;
}

export interface ChatResponse {
  response?: string;
  message?: string;
  // Lyzr sometimes returns strictly text or a nested object depending on the agent config
  [key: string]: any; 
}
