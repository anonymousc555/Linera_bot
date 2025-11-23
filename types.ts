export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: Message[];
}

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  agentId?: string;
}

export type ThemeMode = 'light' | 'dark';