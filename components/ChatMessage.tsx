import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';

  return (
    <div className={`flex gap-4 w-full ${isBot ? 'bg-transparent' : 'bg-transparent'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isBot ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
      }`}>
        {isBot ? <Bot size={18} /> : <User size={18} />}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="font-medium text-sm mb-1 text-gray-900 dark:text-white">
          {isBot ? 'Linera AI' : 'You'}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;