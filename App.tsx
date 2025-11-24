import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Plus, Settings } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import ThemeToggle from './components/ThemeToggle';
import SettingsModal from './components/SettingsModal';
import { sendMessageToApi } from './services/api';
import { Message, ApiConfig } from './types';

// Default configuration from prompt
const DEFAULT_CONFIG: ApiConfig = {
  apiKey: 'sk-default-arGdBKzYMu1pzGzjIdEpldMrGhqGhEFx',
  agentId: '692067259f8444041740065c',
};

// Welcome message from prompt
const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "**Hello! I’m your Linera Ecosystem Assistant.**\n\nI can answer questions about the protocol, guide you through the whitepaper, or help you write and debug Linera smart contracts in Rust.",
  timestamp: Date.now(),
};

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(DEFAULT_CONFIG);
  
  // Session management
  const [userId] = useState(() => `user_${generateId()}`);
  const [sessionId, setSessionId] = useState(() => `session_${generateId()}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToApi(
        userMessage.content,
        userId,
        sessionId,
        apiConfig
      );

      const botMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the Linera AI server. Please check your connection or try again later.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setSessionId(`session_${generateId()}`);
    setMessages([WELCOME_MESSAGE]);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950 overflow-hidden font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Gemini Style */}
      <aside 
        className={`
          fixed md:relative z-30 flex flex-col h-full w-[280px] flex-shrink-0
          bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 flex-none">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-3 w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full transition-colors text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            <Plus size={20} className="text-primary-600" />
            <span className="truncate">New chat</span>
          </button>
        </div>

        {/* Sidebar Content (Spacer for now) */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
           <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
             Session info
           </div>
           <div className="text-sm text-gray-600 dark:text-gray-400">
             Session ID: <span className="font-mono text-xs opacity-70 block truncate">{sessionId}</span>
           </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2">
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
             title="Settings"
           >
             <Settings size={20} />
           </button>
           <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full w-full relative">
        {/* Header (Mobile Only / Branding) */}
        <header className="flex-none h-14 md:h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800 md:border-none">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2 mx-auto md:ml-0">
             <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                Linera AI 
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-medium">
                  Beta
                </span>
             </span>
          </div>
          
          <div className="w-8 md:hidden" /> {/* Spacer for centering */}
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-primary-600/50 flex-shrink-0" />
                <div className="space-y-2 flex-1 pt-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-none p-4 w-full bg-white dark:bg-gray-950">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Linera protocol, smart contracts..."
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-shadow shadow-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-primary-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-all shadow-md"
              >
                <Send size={20} />
              </button>
            </form>
            <div className="text-center mt-2">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Linera AI can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSave={setApiConfig}
      />
    </div>
  );
}