import React, { useState, useRef, useEffect } from 'react';
import { Send, PlusCircle, Settings, MessageSquare, Bot } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { ChatMessage } from './components/ChatMessage';
import { SettingsModal } from './components/SettingsModal';
import { sendMessageToApi } from './services/api';
import { Message, ApiConfig, ThemeMode } from './types';

// Default configuration based on the provided requirements
const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/',
  apiKey: 'sk-default-arGdBKzYMu1pzGzjIdEpldMrGhqGhEFx',
  agentId: '692067259f8444041740065c'
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState<ApiConfig>(DEFAULT_CONFIG);
  const [theme, setTheme] = useState<ThemeMode>('light');
  
  // Session management
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  // Generate a random user ID for this browser session instance
  const [userId] = useState<string>(() => `guest_${Math.floor(Math.random() * 1000000)}@linera.user`);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Apply theme to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNewChat = () => {
    if (messages.length > 0 && window.confirm("Start a new chat? This will clear current history.")) {
      setMessages([]);
      setInputValue('');
      setSessionId(crypto.randomUUID()); // Rotate session ID
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToApi(userMsg.content, config, sessionId, userId);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `Error: Could not connect to the Linera AI. ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Bot className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Linera <span className="text-primary-600">AI</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
            onClick={handleNewChat}
            className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20"
            title="New Chat"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
          
          <ThemeToggle mode={theme} onToggle={toggleTheme} />
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 opacity-80 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 rounded-full"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl flex items-center justify-center shadow-xl">
                  <Bot className="w-10 h-10" />
                </div>
              </div>
              <div className="space-y-2 max-w-lg">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Hello! I’m your Linera Ecosystem Assistant.
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  I can answer questions about the protocol, guide you through the whitepaper, or help you write and debug Linera smart contracts in Rust.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-8">
                 {[
                   "How does Linera achieve scalability?",
                   "Show me a 'Hello World' contract in Rust",
                   "Explain the FastPay consensus",
                   "Help me debug a Wasm execution error"
                 ].map((suggestion, i) => (
                   <button 
                    key={i}
                    onClick={() => setInputValue(suggestion)}
                    className="text-sm p-3 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-left transition-all text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400"
                   >
                     {suggestion}
                   </button>
                 ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6 animate-pulse">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                        <Bot size={16} className="text-gray-400" />
                      </div>
                      <div className="bg-gray-100 dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm border border-transparent dark:border-zinc-700">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
                        </div>
                      </div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 sticky bottom-0 z-20">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Linera protocol or Rust contracts..."
            className="w-full pl-5 pr-14 py-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none shadow-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
            rows={1}
            style={{ minHeight: '60px', maxHeight: '200px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-3 bottom-3 p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-all shadow-md shadow-primary-600/20"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="text-center mt-2">
           <p className="text-[10px] text-gray-400 dark:text-zinc-600">
             Session ID: {sessionId.slice(0, 8)}... • Powered by Lyzr
           </p>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={setConfig}
      />
    </div>
  );
}